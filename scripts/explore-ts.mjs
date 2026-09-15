import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
const sa = JSON.parse(readFileSync(process.env.FIREBASE_SA, 'utf8'));
initializeApp({ credential: cert(sa) });
const db = getFirestore();
const main = async () => {
  for (const u of ['fOtY0GgIYPSD9VhMAZ9im10xQE32']) {
    const thi = await db.collection('users').doc(u).collection('thi_scores').limit(1).get();
    if (!thi.empty) console.log('THI fields:', Object.keys(thi.docs[0].data()), '| createdAt=', thi.docs[0].data().createdAt);
    const aud = await db.collection('users').doc(u).collection('audiometry').limit(1).get();
    if (!aud.empty) console.log('AUD fields:', Object.keys(aud.docs[0].data()), '| measuredAt=', aud.docs[0].data().measuredAt);
  }
};
main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
