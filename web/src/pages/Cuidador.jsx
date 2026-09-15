import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FirestoreService } from '../services/firestoreService';
import { describeSubscription } from '../config/plans';
import DailyChart from '../components/DailyChart';
import Reveal from '../components/Reveal';
import { Loader2, Search, ShieldCheck, Flame, Activity, FileText, AlertCircle } from 'lucide-react';

function fmt(ts) {
  let d = null;
  if (!ts) return '—';
  if (typeof ts.toDate === 'function') d = ts.toDate();
  else if (ts.seconds) d = new Date(ts.seconds * 1000);
  else d = new Date(ts);
  return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function Cuidador() {
  const [params, setParams] = useSearchParams();
  const [code, setCode] = useState(params.get('c') || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [patient, setPatient] = useState(null);

  async function load(uid) {
    const [sub, streak, thi, logs, notes] = await Promise.all([
      FirestoreService.getSubscription(uid),
      FirestoreService.getStreak(uid),
      FirestoreService.getLastTHI(uid),
      FirestoreService.getWeeklyLogs(uid),
      FirestoreService.getProgressNotes(uid, 5),
    ]);
    const plan = describeSubscription(sub);
    const avg = (k) => (logs.length ? logs.reduce((a, c) => a + (c[k] || 0), 0) / logs.length : null);
    setPatient({
      plan,
      streak: streak?.count ?? 0,
      thi: thi?.total ?? null,
      thiGrade: thi?.grade ? String(thi.grade).charAt(0).toUpperCase() + String(thi.grade).slice(1) : null,
      logs,
      notes,
      avgStress: avg('stressLevel'),
      avgTinnitus: avg('tinnitusLevel'),
    });
  }

  useEffect(() => {
    const c = params.get('c');
    if (!c) return;
    setLoading(true);
    setError('');
    setPatient(null);
    (async () => {
      const uid = await FirestoreService.getCaregiverUid(c);
      if (!uid) { setError('Código no válido o expirado.'); setLoading(false); return; }
      try { await load(uid); } catch { setError('No pudimos cargar el progreso.'); }
      setLoading(false);
    })();
    // eslint-disable-next-line
  }, [params]);

  function submit(e) {
    e.preventDefault();
    const c = code.trim().toUpperCase();
    if (!c) return;
    setParams({ c });
  }

  return (
    <section className="section">
      <div className="container narrow">
        <Reveal>
          <div className="caregiver-head">
            <span className="assistant-avatar"><ShieldCheck size={22} /></span>
            <div>
              <h1>Panel del cuidador</h1>
              <p className="assistant-sub">Visualiza el progreso de tu familiar o paciente de forma privada.</p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.05}>
          <form className="caregiver-form" onSubmit={submit}>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Código de 6 caracteres"
              maxLength={6}
            />
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><Loader2 size={16} className="spin" /> Buscando…</> : <><Search size={16} /> Ver progreso</>}
            </button>
          </form>
          {error && <div className="auth-error"><AlertCircle size={18} /><span>{error}</span></div>}
        </Reveal>

        {patient && (
          <Reveal delay={0.05}>
            <div className="caregiver-result">
              <div className="profile-sub" style={{ '--plan-color': patient.plan.planColor }}>
                <div className="profile-sub-left">
                  <span className="profile-sub-dot" />
                  <div>
                    <div className="profile-sub-name">{patient.plan.planName}</div>
                    <div className="profile-sub-status">{patient.plan.statusLabel}</div>
                  </div>
                </div>
              </div>

              <div className="profile-grid">
                <div className="profile-stat">
                  <span className="profile-stat-icon"><Flame size={18} /></span>
                  <div><div className="profile-stat-value">{patient.streak}</div><div className="profile-stat-label">Racha de días</div></div>
                </div>
                <div className="profile-stat">
                  <span className="profile-stat-icon"><Activity size={18} /></span>
                  <div><div className="profile-stat-value">{patient.thi ?? '—'}</div><div className="profile-stat-label">Último THI{patient.thiGrade ? ` · ${patient.thiGrade}` : ''}</div></div>
                </div>
                {patient.avgTinnitus !== null && (
                  <div className="profile-stat">
                    <span className="profile-stat-icon"><Activity size={18} /></span>
                    <div><div className="profile-stat-value">{Math.round(patient.avgTinnitus)}</div><div className="profile-stat-label">Zumbido prom. /100</div></div>
                  </div>
                )}
                {patient.avgStress !== null && (
                  <div className="profile-stat">
                    <span className="profile-stat-icon"><Activity size={18} /></span>
                    <div><div className="profile-stat-value">{Math.round(patient.avgStress)}</div><div className="profile-stat-label">Estrés prom. /100</div></div>
                  </div>
                )}
              </div>

              <div className="profile-block" style={{ marginTop: 18 }}>
                <p className="profile-block-title"><ShieldCheck size={15} /> Evolución diaria</p>
                <DailyChart logs={patient.logs} />
              </div>

              <div className="profile-block" style={{ marginTop: 18 }}>
                <p className="profile-block-title"><FileText size={15} /> Notas recientes</p>
                {patient.notes?.length ? (
                  <ul className="notes-list">
                    {patient.notes.map((n) => (
                      <li key={n.id}>
                        <div className="note-top"><span className="note-mood">{n.mood || '—'}</span><span className="note-date">{fmt(n.createdAt)}</span></div>
                        <p>{n.text}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="profile-empty">Sin notas para mostrar.</p>
                )}
              </div>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}
