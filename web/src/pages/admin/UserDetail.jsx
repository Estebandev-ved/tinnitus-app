import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Moon, Activity, Bell, AlertTriangle, Lightbulb } from 'lucide-react';
import { adminService } from '../../api/adminService';
import { Line, MultiLine } from '../../components/Charts';

function fmtDate(v, withTime = false) {
  if (!v) return '—';
  const d = new Date(v);
  if (isNaN(d)) return '—';
  return withTime ? d.toLocaleString() : d.toLocaleDateString();
}

function tryParse(v) {
  if (!v) return null;
  if (typeof v !== 'string') return v;
  try { return JSON.parse(v); } catch (_) { return null; }
}

function downloadCsv(filename, rows) {
  const csv = [Object.keys(rows[0]).join(','), ...rows.map((r) => Object.values(r).map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function UserDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getUser(id)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="container narrow"><p>Cargando paciente…</p></div>;
  if (error) return <div className="container narrow"><div className="alert-error">{error}</div></div>;
  if (!data) return null;

  const thiPoints = [...(data.thiResults || [])]
    .filter((t) => t.createdAt)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .map((t) => ({ label: fmtDate(t.createdAt), value: t.total }));

  const dailyLogs = [...(data.telemetry || [])]
    .filter((t) => t.eventType === 'daily_log' && t.timestamp)
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  const dailySeries = dailyLogs.length > 0 ? [
    { name: 'Sueño (h)', points: dailyLogs.map((d) => { const p = tryParse(d.payload) || {}; return { label: fmtDate(d.timestamp), value: p.sleepHours || 0 }; }) },
    { name: 'Estrés', points: dailyLogs.map((d) => { const p = tryParse(d.payload) || {}; return { label: fmtDate(d.timestamp), value: p.stressLevel || 0 }; }) },
    { name: 'Tinnitus', points: dailyLogs.map((d) => { const p = tryParse(d.payload) || {}; return { label: fmtDate(d.timestamp), value: p.tinnitusLevel || 0 }; }) },
  ] : [];

  const exportPaciente = () => {
    const rows = [{
      usuario: data.username,
      email: data.email || '',
      rol: data.role || '',
      alta: fmtDate(data.createdAt),
      dispositivos: (data.devices || []).length,
      thi: (data.thiResults || []).length,
      audiometrias: (data.audiometries || []).length,
      registro_diario: (data.telemetry || []).filter((t) => t.eventType === 'daily_log').length,
      predicciones: (data.predictions || []).length,
      diario_voz: (data.voiceDiary || []).length,
      notas: (data.progressNotes || []).length,
    }];
    downloadCsv(`paciente_${data.username}.csv`, rows);
  };

  return (
    <div className="dashboard">
      <header className="dash-head">
        <div>
          <h1>{data.username}</h1>
          <p className="muted">{data.email || 'Sin correo'} · <span className="role-pill">{data.role}</span></p>
        </div>
        <div className="head-actions">
          <button className="btn btn-small" onClick={exportPaciente}>Exportar CSV</button>
          <Link className="btn btn-small btn-ghost" to="/admin/usuarios">← Usuarios</Link>
        </div>
      </header>

      {thiPoints.length > 0 && <Line points={thiPoints} title="Evolución THI (puntuación total)" />}
      {dailySeries.length > 0 && <MultiLine series={dailySeries} title="Registro diario (sueño / estrés / tinnitus)" />}

      <div className="detail-grid">
        <section className="panel">
          <h3>Dispositivos</h3>
          {(data.devices || []).length === 0 && <p className="muted">Sin dispositivos registrados.</p>}
          <ul className="mini-list">
            {(data.devices || []).map((d) => (
              <li key={d.id}>
                <strong>{d.platform}</strong> · {d.deviceId} · v{d.appVersion}
                {d.lastSeen ? ` · ${fmtDate(d.lastSeen, true)}` : ''}
              </li>
            ))}
          </ul>
        </section>

        <section className="panel">
          <h3>Resultados THI ({(data.thiResults || []).length})</h3>
          {(data.thiResults || []).length === 0 && <p className="muted">Sin resultados THI.</p>}
          <ul className="mini-list">
            {(data.thiResults || []).map((t) => (
              <li key={t.id}>
                <strong>{t.total} pts</strong> ({t.grade}) · func {t.functional} · emo {t.emotional} · cat {t.catastrophic}
                {t.createdAt ? ` · ${fmtDate(t.createdAt)}` : ''}
              </li>
            ))}
          </ul>
        </section>

        <section className="panel">
          <h3>Audiometrías ({(data.audiometries || []).length})</h3>
          {(data.audiometries || []).length === 0 && <p className="muted">Sin audiometrías.</p>}
          <ul className="mini-list">
            {(data.audiometries || []).map((a) => (
              <li key={a.id}>
                {a.type || '—'} · {a.frequency} Hz · {a.volume}% · {a.ear}
                {a.measuredAt ? ` · ${fmtDate(a.measuredAt)}` : ''}
              </li>
            ))}
          </ul>
        </section>

        <section className="panel">
          <h3>Registro diario ({(data.telemetry || []).filter((t) => t.eventType === 'daily_log').length})</h3>
          {((data.telemetry || []).filter((t) => t.eventType === 'daily_log').length) === 0 && <p className="muted">Sin registros diarios.</p>}
          <ul className="mini-list">
            {(data.telemetry || []).filter((t) => t.eventType === 'daily_log').map((e) => {
              const p = tryParse(e.payload) || {};
              return (
                <li key={e.id}>
                  <span className="log-metric"><Moon size={13} /> Sueño {p.sleepHours ?? '—'}h</span>
                  <span className="log-metric"><Activity size={13} /> Estrés {p.stressLevel ?? '—'}</span>
                  <span className="log-metric"><Bell size={13} /> Tinnitus {p.tinnitusLevel ?? '—'}</span>
                  {e.timestamp ? ` · ${fmtDate(e.timestamp)}` : ''}
                </li>
              );
            })}
          </ul>
        </section>

        <section className="panel">
          <h3>Predicciones de riesgo ({(data.predictions || []).length})</h3>
          {(data.predictions || []).length === 0 && <p className="muted">Sin predicciones.</p>}
          <ul className="mini-list">
            {(data.predictions || []).map((p) => {
              const factors = tryParse(p.topFactors) || [];
              const actions = tryParse(p.preventionActions) || [];
              return (
                <li key={p.id}>
                  <strong>Riesgo {p.riskScore ?? '—'} ({p.riskLevel || '—'})</strong>
                  {p.predictedWindow ? ` · ventana ${p.predictedWindow}` : ''}
                  {factors.length ? ` · factores: ${factors.map((f) => f.factor).join(', ')}` : ''}
                  {actions.length ? ` · acciones: ${actions.map((a) => a.action).join(', ')}` : ''}
                  {p.createdAt ? ` · ${fmtDate(p.createdAt)}` : ''}
                </li>
              );
            })}
          </ul>
        </section>

        <section className="panel">
          <h3>Diario de voz ({(data.voiceDiary || []).length})</h3>
          {(data.voiceDiary || []).length === 0 && <p className="muted">Sin entradas de voz.</p>}
          <ul className="mini-list">
            {(data.voiceDiary || []).map((v) => (
              <li key={v.id}>
                <strong>{v.emotionalState || '—'}</strong>
                {v.stressScore != null ? ` · estrés ${v.stressScore}` : ''}
                 {v.tinnitusWorseningRisk ? <span className="risk-flag"><AlertTriangle size={13} /> empeoramiento</span> : ''}
                {v.transcript ? ` · “${v.transcript}”` : ''}
                {v.createdAt ? ` · ${fmtDate(v.createdAt)}` : ''}
              </li>
            ))}
          </ul>
        </section>

        <section className="panel panel-wide">
          <h3>Notas de progreso ({(data.progressNotes || []).length})</h3>
          {(data.progressNotes || []).length === 0 && <p className="muted">Sin notas.</p>}
          <ul className="mini-list">
            {(data.progressNotes || []).map((n) => {
              const ai = tryParse(n.aiAnalysis) || {};
              return (
                <li key={n.id}>
                  <strong>{n.mood || '—'}</strong>
                  {n.text ? ` · ${n.text}` : ''}
                  {ai.suggestion ? <span className="sugg-flag"><Lightbulb size={13} /> {ai.suggestion}</span> : ''}
                  {n.createdAt ? ` · ${fmtDate(n.createdAt, true)}` : ''}
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
}
