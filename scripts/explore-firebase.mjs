import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

const saPath = process.env.FIREBASE_SA || process.argv[2];
if (!saPath) { console.error('Uso: node explore-firebase.mjs <serviceAccount.json>'); process.exit(1); }

const sa = JSON.parse(readFileSync(saPath, 'utf8'));
initializeApp({ credential: cert(sa) });
const db = getFirestore();

const collCount = async (ref) => {
  const snap = await ref.get();
  return snap.size;
};

const describeDoc = (doc) => {
  const d = doc.data();
  const fields = Object.keys(d);
  const sample = {};
  for (const f of fields.slice(0, 12)) {
    const v = d[f];
    if (v && v.constructor && v.constructor.name === 'Timestamp') sample[f] = 'Timestamp';
    else if (Array.isArray(v)) sample[f] = `Array[${v.length}]`;
    else if (typeof v === 'object' && v !== null) sample[f] = 'object';
    else sample[f] = v;
  }
  return { id: doc.id, fields, sample };
};

const main = async () => {
  const rootCols = await db.listCollections();
  console.log('=== COLECCIONES RAÍZ ===');
  for (const c of rootCols) {
    const n = await collCount(c);
    console.log(`- ${c.id}  (docs: ${n})`);
  }

  for (const c of rootCols) {
    const snap = await c.limit(2).get();
    if (snap.empty) continue;
    console.log(`\n=== MUESTRA ${c.id} ===`);
    for (const doc of snap.docs) {
      const d = describeDoc(doc);
      console.log(`  id=${d.id}  campos=${d.fields.length}`);
      console.log('   ' + JSON.stringify(d.sample));
      const subs = await doc.ref.listCollections();
      if (subs.length) {
        console.log('   subcolecciones: ' + subs.map(s => s.id).join(', '));
        for (const s of subs) {
          const sn = await collCount(s);
          console.log(`     -> ${s.id} (docs: ${sn})`);
        }
      }
    }
  }

  const usersSnap = await db.collection('users').limit(5).get();
  console.log('\n=== USUARIOS (hasta 5) ===');
  for (const u of usersSnap.docs) {
    const subs = await u.ref.listCollections();
    let detail = '';
    for (const s of subs) {
      const sn = await collCount(s);
      detail += `  ${s.id}:${sn}`;
    }
    console.log(`  user ${u.id} -> subcols:${detail || ' ninguna'}`);
  }
};

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
