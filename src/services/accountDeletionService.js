import { auth, db, storage } from '../firebase';
import {
  collection, getDocs, deleteDoc, doc, query, where, limit, writeBatch
} from 'firebase/firestore';
import { ref as storageRef, listAll, deleteObject } from 'firebase/storage';
import {
  deleteUser, reauthenticateWithCredential, reauthenticateWithPopup,
  EmailAuthProvider, GoogleAuthProvider
} from 'firebase/auth';

// Subcollections written under users/{uid}/ by FirestoreService.
export const USER_SUBCOLLECTIONS = [
  'daily_logs', 'audiometry', 'meta', 'thi_scores', 'soundscapes',
  'progress_notes', 'voice_diary', 'predictions', 'devices', 'blockedUsers', 'hiddenContent'
];

// Local keys that are NOT health data and are kept (language preference only).
const KEEP_LOCAL_KEYS = ['tinnitoff_lang'];

const BATCH_SIZE = 400;

async function deleteCollectionDocs(colRef) {
  let deleted = 0;
  // Loop in pages so large collections do not exceed batch limits.
  for (;;) {
    const snap = await getDocs(query(colRef, limit(BATCH_SIZE)));
    if (snap.empty) break;
    const batch = writeBatch(db);
    snap.docs.forEach(d => batch.delete(d.ref));
    await batch.commit();
    deleted += snap.size;
    if (snap.size < BATCH_SIZE) break;
  }
  return deleted;
}

export async function deleteUserFirestoreData(uid) {
  for (const sub of USER_SUBCOLLECTIONS) {
    await deleteCollectionDocs(collection(db, 'users', uid, sub));
  }
  // Community posts authored by the user (best effort; see handoff on collection name in rules).
  try {
    await deleteCollectionDocs(query(collection(db, 'community_posts'), where('authorId', '==', uid)));
  } catch {
    console.warn('Community posts cleanup skipped');
  }
  await deleteDoc(doc(db, 'users', uid));
}

export async function deleteUserStorageData(uid) {
  try {
    const listing = await listAll(storageRef(storage, `avatars/${uid}`));
    await Promise.all(listing.items.map(i => deleteObject(i)));
  } catch {
    // No avatar or no permission: nothing else to remove.
  }
}

export function clearLocalUserData(storages = [localStorage, sessionStorage]) {
  storages.forEach(store => {
    try {
      Object.keys(store)
        .filter(k => !KEEP_LOCAL_KEYS.includes(k))
        .forEach(k => store.removeItem(k));
    } catch {
      // Storage unavailable: ignore.
    }
  });
}

export function getPrimaryProvider(user) {
  const ids = (user?.providerData || []).map(p => p.providerId);
  if (ids.includes('password')) return 'password';
  if (ids.includes('google.com')) return 'google';
  return 'other';
}

export async function reauthenticate(user, password) {
  const provider = getPrimaryProvider(user);
  if (provider === 'password') {
    const cred = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, cred);
  } else if (provider === 'google') {
    await reauthenticateWithPopup(user, new GoogleAuthProvider());
  }
}

/**
 * Permanently deletes the account: re-authenticates, wipes Firestore + Storage,
 * clears local data and finally deletes the Firebase Auth user.
 */
export async function deleteAccount(password) {
  const user = auth.currentUser;
  if (!user) throw new Error('not-authenticated');
  await reauthenticate(user, password);
  const uid = user.uid;
  await deleteUserFirestoreData(uid);
  await deleteUserStorageData(uid);
  await deleteUser(user);
  clearLocalUserData();
}
