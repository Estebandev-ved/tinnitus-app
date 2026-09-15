import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

const sa = JSON.parse(readFileSync(process.env.FIREBASE_SA, 'utf8'));
initializeApp({ credential: cert(sa) });
const db = getFirestore();

const dump = async (uid, cols) => {
  console.log(`\n########## USER ${uid} ##########`);
  for (const col of cols) {
    const snap = await db.collection('users').doc(uid).collection(col).limit(2).get();
    console.log(`\n--- ${col} (${snap.size} muestreados) ---`);
    for (const d of snap.docs) {
      console.log('id=' + d.id + ' => ' + JSON.stringify(d.data(), (k, v) => (v && v.constructor && v.constructor.name === 'Timestamp') ? v.toDate().toISOString() : v, 2));
    }
  }
};

const main = async () => {
  await dump('fOtY0GgIYPSD9VhMAZ9im10xQE32', ['daily_logs', 'progress_notes', 'meta']);
  await dump('nyLKs2nr4gTKxMMzglz4ip0SJ4J2', ['daily_logs', 'predictions', 'voice_diary', 'progress_notes', 'meta']);
};

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
