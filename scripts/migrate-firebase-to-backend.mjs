// Migración: Firebase/Firestore -> Backend Spring Boot (panel admin)
//
// Qué hace:
//   1. Lee TODOS los usuarios de Firestore (colección 'users').
//   2. Crea/actualiza cada paciente en el backend (POST /api/v1/clinical/patient).
//   3. Migra sus subcolecciones reales:
//        - thi_scores        -> /clinical/thi            (con createdAt real)
//        - audiometry        -> /clinical/audiometry     (con measuredAt real)
//        - daily_logs        -> /clinical/telemetry       (registro diario: sueño/estrés/tinnitus)
//        - predictions       -> /clinical/prediction      (riesgo ML)
//        - voice_diary       -> /clinical/voice-diary     (diario de voz)
//        - progress_notes    -> /clinical/progress-note   (notas de progreso)
//        - devices           -> /clinical/device
//
// Requisitos:
//   - Backend corriendo (PostgreSQL en prod, H2 en dev).
//   - Cuenta de servicio de Firebase en FIREBASE_SA.
//   - npm install firebase-admin
//
// Uso:
//   export FIREBASE_SA=/ruta/serviceAccount.json
//   export BACKEND_URL=http://localhost:8080
//   export CLINICAL_SYNC_TOKEN=dev-clinical-token
//   node scripts/migrate-firebase-to-backend.mjs
//
// Notas:
//   - Es incremental y NO idempotente: no corras dos veces sobre el mismo
//     backend persistente (PostgreSQL) sin limpiar, o duplicarás datos.
//   - Los timestamps originales SÍ se preservan (se envían createdAt/measuredAt).

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'node:fs';

const SERVICE_ACCOUNT = process.env.FIREBASE_SA || './serviceAccount.json';
const BACKEND_URL = (process.env.BACKEND_URL || 'http://localhost:8080').replace(/\/$/, '');
const SYNC_TOKEN = process.env.CLINICAL_SYNC_TOKEN || 'dev-clinical-token';

initializeApp({
  credential: cert(JSON.parse(readFileSync(SERVICE_ACCOUNT, 'utf8'))),
});

const db = getFirestore();

// Convierte Timestamp/Firestore/string/Date -> ISO 8601 (o null)
function tsToIso(v) {
  if (!v) return null;
  try {
    if (typeof v === 'string') return v;
    if (v && typeof v.toDate === 'function') return v.toDate().toISOString();
    if (v instanceof Date) return v.toISOString();
  } catch (_) { /* ignore */ }
  return null;
}

function jsonOrNull(v) {
  if (v === undefined || v === null) return null;
  if (typeof v === 'string') return v;
  try { return JSON.stringify(v); } catch (_) { return null; }
}

async function postForm(path, params) {
  const body = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') body.append(k, String(v));
  }
  const res = await fetch(`${BACKEND_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Clinical-Token': SYNC_TOKEN,
    },
    body,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.text();
}

async function migrateUser(uid, data) {
  const email = data.email || null;
  const username = data.displayName || email || uid;

  await postForm('/api/v1/clinical/patient', { patientId: uid, email, username });
  console.log(`  paciente: ${username} (${email || 'sin email'})`);

  // THI
  const thiSnap = await db.collection('users').doc(uid).collection('thi_scores').get();
  for (const doc of thiSnap.docs) {
    const t = doc.data();
    await postForm('/api/v1/clinical/thi', {
      patientId: uid, email, username,
      total: t.total, grade: t.grade,
      functional: t.functional, emotional: t.emotional, catastrophic: t.catastrophic,
      answers: typeof t.answers === 'string' ? t.answers : JSON.stringify(t.answers || {}),
      createdAt: tsToIso(t.createdAt),
    });
  }
  if (thiSnap.size) console.log(`    THI: ${thiSnap.size}`);

  // Audiometrías
  const audSnap = await db.collection('users').doc(uid).collection('audiometry').get();
  for (const doc of audSnap.docs) {
    const d = doc.data();
    await postForm('/api/v1/clinical/audiometry', {
      patientId: uid, email, username,
      type: d.type, frequency: d.frequency, volume: d.volume, ear: d.ear,
      measuredAt: tsToIso(d.measuredAt),
    });
  }
  if (audSnap.size) console.log(`    Audiometrías: ${audSnap.size}`);

  // Registro diario -> telemetría (evento daily_log)
  const dailySnap = await db.collection('users').doc(uid).collection('daily_logs').get();
  for (const doc of dailySnap.docs) {
    const d = doc.data();
    await postForm('/api/v1/clinical/telemetry', {
      patientId: uid, email, username,
      eventType: 'daily_log',
      platform: 'app',
      payload: jsonOrNull(d),
      timestamp: tsToIso(d.createdAt),
    });
  }
  if (dailySnap.size) console.log(`    Registro diario: ${dailySnap.size}`);

  // Predicciones de riesgo
  const predSnap = await db.collection('users').doc(uid).collection('predictions').get();
  for (const doc of predSnap.docs) {
    const p = doc.data();
    await postForm('/api/v1/clinical/prediction', {
      patientId: uid, email, username,
      firebaseId: doc.id,
      riskScore: p.riskScore, riskLevel: p.riskLevel, predictedWindow: p.predictedWindow,
      topFactors: jsonOrNull(p.topFactors), preventionActions: jsonOrNull(p.preventionActions),
      createdAt: tsToIso(p.createdAt),
    });
  }
  if (predSnap.size) console.log(`    Predicciones: ${predSnap.size}`);

  // Diario de voz
  const voiceSnap = await db.collection('users').doc(uid).collection('voice_diary').get();
  for (const doc of voiceSnap.docs) {
    const v = doc.data();
    await postForm('/api/v1/clinical/voice-diary', {
      patientId: uid, email, username,
      transcript: v.transcript, emotionalState: v.emotionalState, stressScore: v.stressScore,
      tinnitusWorseningRisk: v.tinnitusWorseningRisk, recommendedSound: v.recommendedSound,
      summary: v.summary, aiResponse: v.aiResponse,
      createdAt: tsToIso(v.createdAt),
    });
  }
  if (voiceSnap.size) console.log(`    Diario de voz: ${voiceSnap.size}`);

  // Notas de progreso
  const progSnap = await db.collection('users').doc(uid).collection('progress_notes').get();
  for (const doc of progSnap.docs) {
    const n = doc.data();
    await postForm('/api/v1/clinical/progress-note', {
      patientId: uid, email, username,
      text: n.text, mood: n.mood, date: tsToIso(n.date), aiAnalysis: jsonOrNull(n.aiAnalysis),
      createdAt: tsToIso(n.createdAt),
    });
  }
  if (progSnap.size) console.log(`    Notas de progreso: ${progSnap.size}`);

  // Dispositivos
  const devSnap = await db.collection('users').doc(uid).collection('devices').get();
  for (const doc of devSnap.docs) {
    const dv = doc.data();
    await postForm('/api/v1/clinical/device', {
      patientId: uid, email, username,
      platform: dv.platform, deviceId: dv.deviceId, appVersion: dv.appVersion,
    });
  }
  if (devSnap.size) console.log(`    Dispositivos: ${devSnap.size}`);
}

async function main() {
  console.log(`Migrando Firestore -> ${BACKEND_URL}`);
  const usersSnap = await db.collection('users').get();
  console.log(`Usuarios encontrados: ${usersSnap.size}`);

  let ok = 0;
  let fail = 0;
  for (const doc of usersSnap.docs) {
    try {
      await migrateUser(doc.id, doc.data());
      ok++;
    } catch (e) {
      fail++;
      console.error(`  ERROR en ${doc.id}: ${e.message}`);
    }
  }
  console.log(`\nHecho. OK=${ok}  Fallidos=${fail}`);
}

main().catch((e) => {
  console.error('Migración fallida:', e);
  process.exit(1);
});
