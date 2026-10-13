// SEC-04 · Firestore security rules tests (run with `npm run test:rules`, needs the emulator).
// Not named *.test.js on purpose so the normal `vitest run` does not pick it up.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  addDoc,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  setDoc,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';

let env;

const ctx = (uid) => env.authenticatedContext(uid).firestore();
const anon = () => env.unauthenticatedContext().firestore();

// Seed data bypassing rules.
const seed = async (fn) => env.withSecurityRulesDisabled(async (c) => fn(c.firestore()));

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-tinnitoff',
    firestore: {
      rules: readFileSync(resolve(process.cwd(), 'firestore.rules'), 'utf8'),
      host: '127.0.0.1',
      port: 8089,
    },
  });
});

afterAll(async () => {
  await env?.cleanup();
});

beforeEach(async () => {
  await env.clearFirestore();
  await seed(async (db) => {
    await setDoc(doc(db, 'users/admin1'), { email: 'a@x.com', role: 'admin' });
    await setDoc(doc(db, 'users/alice'), { email: 'alice@x.com' });
    await setDoc(doc(db, 'users/bob'), { email: 'bob@x.com', role: 'user' });
    await setDoc(doc(db, 'users/alice/daily_logs/l1'), { level: 5 });
  });
});

describe('users/{uid} - SEC-01 / SEC-11', () => {
  it('normal user cannot make themselves admin (update)', async () => {
    await assertFails(updateDoc(doc(ctx('alice'), 'users/alice'), { role: 'admin' }));
    await assertFails(setDoc(doc(ctx('bob'), 'users/bob'), { role: 'admin' }, { merge: true }));
  });

  it('normal user cannot create their doc as admin', async () => {
    await assertFails(setDoc(doc(ctx('carol'), 'users/carol'), { email: 'c@x.com', role: 'admin' }));
  });

  it('client metadata write WITHOUT role (SEC-11 shape) succeeds, new and existing', async () => {
    const payload = { email: 'c@x.com', displayName: 'C', photoURL: null, lastActive: Timestamp.now() };
    await assertSucceeds(setDoc(doc(ctx('carol'), 'users/carol'), payload, { merge: true }));
    await assertSucceeds(setDoc(doc(ctx('alice'), 'users/alice'), payload, { merge: true }));
  });

  it('an existing admin keeps role when the client merges without role', async () => {
    await assertSucceeds(
      setDoc(doc(ctx('admin1'), 'users/admin1'), { email: 'a@x.com', lastActive: Timestamp.now() }, { merge: true }),
    );
    await seed(async (db) => {
      const snap = await getDoc(doc(db, 'users/admin1'));
      if (snap.data().role !== 'admin') throw new Error('admin role was lost');
    });
  });

  it('legacy client sending role:user still passes for normal users', async () => {
    await assertSucceeds(setDoc(doc(ctx('bob'), 'users/bob'), { role: 'user', email: 'b@x.com' }, { merge: true }));
  });

  it('cannot read another user root doc or subcollections', async () => {
    await assertFails(getDoc(doc(ctx('bob'), 'users/alice')));
    await assertFails(getDoc(doc(ctx('bob'), 'users/alice/daily_logs/l1')));
    await assertFails(setDoc(doc(ctx('bob'), 'users/alice/daily_logs/l2'), { level: 1 }));
    await assertFails(getDoc(doc(anon(), 'users/alice')));
  });

  it('owner can read/write own root doc and subcollections', async () => {
    await assertSucceeds(getDoc(doc(ctx('alice'), 'users/alice')));
    await assertSucceeds(getDoc(doc(ctx('alice'), 'users/alice/daily_logs/l1')));
    await assertSucceeds(setDoc(doc(ctx('alice'), 'users/alice/daily_logs/l2'), { level: 3 }));
    await assertSucceeds(setDoc(doc(ctx('alice'), 'users/alice/meta/profile'), { fullName: 'A' }, { merge: true }));
  });

  it('subcollection writes cannot be used to reach the root doc', async () => {
    await assertFails(setDoc(doc(ctx('bob'), 'users/alice'), { email: 'x' }));
  });

  it('admin can read users and promote another user', async () => {
    await assertSucceeds(getDoc(doc(ctx('admin1'), 'users/alice')));
    await assertSucceeds(getDocs(collection(ctx('admin1'), 'users')));
    await assertSucceeds(updateDoc(doc(ctx('admin1'), 'users/alice'), { role: 'admin' }));
  });

  it('normal user cannot list all users', async () => {
    await assertFails(getDocs(collection(ctx('alice'), 'users')));
  });

  it('owner can delete own account data (account deletion flow)', async () => {
    await assertSucceeds(deleteDoc(doc(ctx('alice'), 'users/alice/daily_logs/l1')));
    await assertSucceeds(deleteDoc(doc(ctx('alice'), 'users/alice')));
    await assertFails(deleteDoc(doc(ctx('bob'), 'users/alice')));
  });
});

describe('download_* collections - SEC-02', () => {
  const log = () => ({ referrer: 'directo', userAgent: 'UA', platform: 'Win32', timestamp: Timestamp.now() });

  it('anonymous can create a download_logs entry with the fields the client sends', async () => {
    await assertSucceeds(addDoc(collection(anon(), 'download_logs'), log()));
  });

  it('download_logs rejects extra fields, wrong types, huge values, update and delete', async () => {
    await assertFails(addDoc(collection(anon(), 'download_logs'), { ...log(), evil: 'x' }));
    await assertFails(addDoc(collection(anon(), 'download_logs'), { ...log(), userAgent: 'a'.repeat(501) }));
    await assertFails(addDoc(collection(anon(), 'download_logs'), { ...log(), timestamp: 'now' }));
    await seed((db) => setDoc(doc(db, 'download_logs/x'), log()));
    await assertFails(updateDoc(doc(anon(), 'download_logs/x'), { platform: 'hax' }));
    await assertFails(deleteDoc(doc(anon(), 'download_logs/x')));
  });

  it('download_logs readable only by admin', async () => {
    await seed((db) => setDoc(doc(db, 'download_logs/x'), log()));
    await assertFails(getDoc(doc(anon(), 'download_logs/x')));
    await assertFails(getDoc(doc(ctx('alice'), 'download_logs/x')));
    await assertSucceeds(getDoc(doc(ctx('admin1'), 'download_logs/x')));
    await assertSucceeds(getDocs(collection(ctx('admin1'), 'download_logs')));
  });

  it('download_analytics: increment(1) works for create and update (client shape)', async () => {
    const ref = doc(anon(), 'download_analytics/facebook');
    await assertSucceeds(setDoc(ref, { clicksCount: increment(1) }, { merge: true }));
    await assertSucceeds(setDoc(ref, { clicksCount: increment(1) }, { merge: true }));
  });

  it('download_analytics: no arbitrary values, extra fields or delete', async () => {
    await assertFails(setDoc(doc(anon(), 'download_analytics/a'), { clicksCount: 999 }));
    await assertFails(setDoc(doc(anon(), 'download_analytics/a'), { clicksCount: increment(1), x: 1 }, { merge: true }));
    await seed((db) => setDoc(doc(db, 'download_analytics/b'), { clicksCount: 5 }));
    await assertFails(setDoc(doc(anon(), 'download_analytics/b'), { clicksCount: increment(100) }, { merge: true }));
    await assertFails(setDoc(doc(anon(), 'download_analytics/b'), { clicksCount: 0 }, { merge: true }));
    await assertFails(deleteDoc(doc(anon(), 'download_analytics/b')));
  });

  it('download_analytics readable only by admin', async () => {
    await seed((db) => setDoc(doc(db, 'download_analytics/b'), { clicksCount: 5 }));
    await assertFails(getDoc(doc(anon(), 'download_analytics/b')));
    await assertSucceeds(getDocs(collection(ctx('admin1'), 'download_analytics')));
  });

  it('download_events: anonymous create in the public/download.html shape', async () => {
    await assertSucceeds(
      addDoc(collection(anon(), 'download_events'), {
        timestamp: Timestamp.now(),
        source: 'download_page',
        platform: 'Android',
        browser: 'Chrome',
        referrer: 'https://example.com/' + 'a'.repeat(400),
        userAgent: 'Mozilla/5.0 '.repeat(10),
      }),
    );
  });

  it('download_events: rejects junk fields, update, delete; only admin reads', async () => {
    await assertFails(addDoc(collection(anon(), 'download_events'), { timestamp: Timestamp.now(), source: 's', x: 1 }));
    await assertFails(addDoc(collection(anon(), 'download_events'), { source: 's' }));
    await seed((db) => setDoc(doc(db, 'download_events/e'), { timestamp: Timestamp.now(), source: 's' }));
    await assertFails(updateDoc(doc(anon(), 'download_events/e'), { source: 'hax' }));
    await assertFails(deleteDoc(doc(anon(), 'download_events/e')));
    await assertFails(getDoc(doc(ctx('alice'), 'download_events/e')));
    await assertSucceeds(getDocs(collection(ctx('admin1'), 'download_events')));
  });
});

describe('caregiverLinks - SEC-03', () => {
  it('a user can only create links where they are patient or caregiver', async () => {
    await assertSucceeds(setDoc(doc(ctx('alice'), 'caregiverLinks/l1'), { patientId: 'alice', caregiverId: 'bob' }));
    await assertSucceeds(setDoc(doc(ctx('bob'), 'caregiverLinks/l2'), { patientId: 'alice', caregiverId: 'bob' }));
    await assertFails(setDoc(doc(ctx('carol'), 'caregiverLinks/l3'), { patientId: 'alice', caregiverId: 'bob' }));
    await assertFails(setDoc(doc(ctx('alice'), 'caregiverLinks/l4'), { note: 'no ids' }));
  });

  it('only participants read/update/delete; the pair cannot be re-pointed', async () => {
    await seed((db) => setDoc(doc(db, 'caregiverLinks/l1'), { patientId: 'alice', caregiverId: 'bob', status: 'pending' }));
    await assertSucceeds(getDoc(doc(ctx('bob'), 'caregiverLinks/l1')));
    await assertFails(getDoc(doc(ctx('carol'), 'caregiverLinks/l1')));
    await assertSucceeds(updateDoc(doc(ctx('bob'), 'caregiverLinks/l1'), { status: 'accepted' }));
    await assertFails(updateDoc(doc(ctx('carol'), 'caregiverLinks/l1'), { status: 'accepted' }));
    await assertFails(updateDoc(doc(ctx('bob'), 'caregiverLinks/l1'), { caregiverId: 'carol' }));
    await assertFails(deleteDoc(doc(ctx('carol'), 'caregiverLinks/l1')));
    await assertSucceeds(deleteDoc(doc(ctx('alice'), 'caregiverLinks/l1')));
  });

  it('unauthenticated cannot create', async () => {
    await assertFails(setDoc(doc(anon(), 'caregiverLinks/l9'), { patientId: 'alice', caregiverId: 'bob' }));
  });
});

describe('community_posts (client collection name)', () => {
  const post = (uid) => ({
    text: 'hola',
    category: 'tips',
    authorId: uid,
    authorName: 'Anonimo',
    likes: 0,
    likedBy: [],
    replies: [],
    createdAt: Timestamp.now(),
  });

  it('authenticated users read; create requires own authorId', async () => {
    await assertSucceeds(addDoc(collection(ctx('alice'), 'community_posts'), post('alice')));
    await assertFails(addDoc(collection(ctx('alice'), 'community_posts'), post('bob')));
    await assertFails(addDoc(collection(anon(), 'community_posts'), post('alice')));
    await assertSucceeds(getDocs(collection(ctx('bob'), 'community_posts')));
    await assertFails(getDocs(collection(anon(), 'community_posts')));
  });

  it('others can like/reply (toggleLike/addReply shape) but not edit text or delete', async () => {
    await seed((db) => setDoc(doc(db, 'community_posts/p1'), post('alice')));
    const ref = doc(ctx('bob'), 'community_posts/p1');
    await assertSucceeds(updateDoc(ref, { likedBy: ['bob'], likes: 1 }));
    await assertSucceeds(
      updateDoc(ref, { replies: arrayUnion({ text: 'r', authorId: 'bob', authorName: 'A', createdAt: 'x' }) }),
    );
    await assertFails(updateDoc(ref, { text: 'hacked' }));
    await assertFails(updateDoc(ref, { authorId: 'bob' }));
    await assertFails(deleteDoc(ref));
  });

  it('author can edit and delete own post', async () => {
    await seed((db) => setDoc(doc(db, 'community_posts/p1'), post('alice')));
    await assertSucceeds(updateDoc(doc(ctx('alice'), 'community_posts/p1'), { text: 'edit' }));
    await assertSucceeds(deleteDoc(doc(ctx('alice'), 'community_posts/p1')));
  });

  it('legacy name communityPosts stays blocked', async () => {
    await assertFails(getDocs(collection(ctx('alice'), 'communityPosts')));
  });
});

describe('CMP-03 moderation: content_reports and blocks', () => {
  const report = (uid, extra = {}) => ({
    reporterId: uid,
    postId: 'p1',
    targetType: 'post',
    targetAuthorId: 'bob',
    reason: 'spam',
    createdAt: Timestamp.now(),
    ...extra,
  });

  it('authenticated user can create a report with exact fields', async () => {
    await assertSucceeds(addDoc(collection(ctx('alice'), 'content_reports'), report('alice')));
    await assertSucceeds(
      addDoc(collection(ctx('alice'), 'content_reports'), report('alice', { targetType: 'reply', replyKey: 'p1__bob__x' })),
    );
  });

  it('rejects spoofed reporter, extra fields, bad reason/type and anonymous', async () => {
    const col = (c) => collection(c, 'content_reports');
    await assertFails(addDoc(col(ctx('alice')), report('bob')));
    await assertFails(addDoc(col(ctx('alice')), report('alice', { extra: 1 })));
    await assertFails(addDoc(col(ctx('alice')), report('alice', { reason: 'nope' })));
    await assertFails(addDoc(col(ctx('alice')), report('alice', { targetType: 'user' })));
    await assertFails(addDoc(col(anon()), report('alice')));
  });

  it('reports are not readable, updatable or deletable by clients (even admin)', async () => {
    await seed((db) => setDoc(doc(db, 'content_reports/r1'), report('alice')));
    await assertFails(getDoc(doc(ctx('alice'), 'content_reports/r1')));
    await assertFails(getDoc(doc(ctx('admin1'), 'content_reports/r1')));
    await assertFails(getDocs(collection(ctx('alice'), 'content_reports')));
    await assertFails(updateDoc(doc(ctx('alice'), 'content_reports/r1'), { reason: 'other' }));
    await assertFails(deleteDoc(doc(ctx('alice'), 'content_reports/r1')));
  });

  it('blocked users / hidden content live in the owner subcollections only', async () => {
    await assertSucceeds(setDoc(doc(ctx('alice'), 'users/alice/blockedUsers/bob'), { createdAt: Timestamp.now() }));
    await assertSucceeds(setDoc(doc(ctx('alice'), 'users/alice/hiddenContent/post_p1'), { createdAt: Timestamp.now() }));
    await assertSucceeds(getDocs(collection(ctx('alice'), 'users/alice/blockedUsers')));
    await assertSucceeds(deleteDoc(doc(ctx('alice'), 'users/alice/blockedUsers/bob')));
    await assertFails(setDoc(doc(ctx('bob'), 'users/alice/blockedUsers/carol'), { createdAt: Timestamp.now() }));
    await assertFails(getDocs(collection(ctx('bob'), 'users/alice/blockedUsers')));
  });
});

describe('app_config and misc', () => {
  it('app_config: public read, only admin write', async () => {
    await assertSucceeds(getDoc(doc(anon(), 'app_config/version')));
    await assertFails(setDoc(doc(ctx('alice'), 'app_config/version'), { v: 1 }));
    await assertSucceeds(setDoc(doc(ctx('admin1'), 'app_config/version'), { v: 1 }));
  });

  it('unknown collections are denied', async () => {
    await assertFails(getDoc(doc(ctx('admin1'), 'caregiver_codes/ABC')));
    await assertFails(setDoc(doc(ctx('alice'), 'random/x'), { a: 1 }));
  });
});
