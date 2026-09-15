import React, { useEffect, useState } from 'react';
import { adminService } from '../../api/adminService';
import { Line, Donut, Bar } from '../../components/Charts';

const RANGES = [
  { label: '7 días', days: 7 },
  { label: '30 días', days: 30 },
  { label: '90 días', days: 90 },
  { label: '6 meses', days: 180 },
];

export default function AnalyticsPage() {
  const [days, setDays] = useState(180);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [signups, setSignups] = useState([]);
  const [activity, setActivity] = useState([]);
  const [thi, setThi] = useState(null);
  const [audiometry, setAudiometry] = useState([]);
  const [adherence, setAdherence] = useState(null);
  const [engagement, setEngagement] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      adminService.getSignups(days),
      adminService.getActivity(days),
      adminService.getThi(days > 90 ? 365 : 90),
      adminService.getAudiometry(),
      adminService.getAdherence(),
      adminService.getEngagement(),
    ])
      .then(([s, a, t, aud, adh, eng]) => {
        setSignups(s.signups || []);
        setActivity(a.activity || []);
        setThi(t);
        setAudiometry(aud || []);
        setAdherence(adh);
        setEngagement(eng);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [days]);

  if (loading) return <div className="container narrow"><p>Cargando analítica…</p></div>;
  if (error) return <div className="container narrow"><div className="alert-error">{error}</div></div>;

  const thiPoints = (thi?.series || []).map((p) => ({ label: p.date.slice(5), value: p.value }));
  const signupPoints = signups.map((p) => ({ label: p.date.slice(5), value: p.value }));
  const activityPoints = activity.map((p) => ({ label: p.date.slice(5), value: p.value }));
  const audMap = {};
  audiometry.forEach((a) => { audMap[`${a.frequency} Hz`] = a.avgVolume; });

  const adherencePct = adherence ? Math.round((adherence.active30d / Math.max(1, adherence.totalUsers)) * 100) : 0;
  const byType = engagement?.byEventType || {};

  return (
    <div className="dashboard">
      <header className="dash-head">
        <div>
          <h1>Analítica clínica</h1>
          <p className="muted">Tendencias de uso y evolución clínica de los pacientes.</p>
        </div>
        <div className="filters">
          <select className="input" value={days} onChange={(e) => setDays(Number(e.target.value))}>
            {RANGES.map((r) => <option key={r.days} value={r.days}>Últimos {r.label}</option>)}
          </select>
        </div>
      </header>

      <div className="stat-grid">
        <div className="stat-card"><span className="stat-value">{adherence?.totalUsers ?? '—'}</span><span className="stat-label">Usuarios</span></div>
        <div className="stat-card"><span className="stat-value">{adherence?.active30d ?? '—'}</span><span className="stat-label">Activos 30d ({adherencePct}%)</span></div>
        <div className="stat-card"><span className="stat-value">{thi?.avgImprovement ?? '—'}</span><span className="stat-label">Mejora THI media</span></div>
        <div className="stat-card"><span className="stat-value">{engagement?.dau ?? '—'}</span><span className="stat-label">DAU</span></div>
        <div className="stat-card"><span className="stat-value">{engagement?.wau ?? '—'}</span><span className="stat-label">WAU</span></div>
        <div className="stat-card"><span className="stat-value">{engagement?.mau ?? '—'}</span><span className="stat-label">MAU</span></div>
      </div>

      <div className="charts-row">
        <Line points={signupPoints} title={`Altas de usuario (${days}d)`} />
        <Line points={activityPoints} title={`Actividad / telemetría (${days}d)`} />
        <Line points={thiPoints} title="Evolución THI (promedio diario)" />
      </div>

      <div className="charts-row">
        <Donut data={thi?.grades || {}} title="Distribución THI por grado" />
        <Bar data={audMap} title="Volumen promedio por frecuencia (dB)" />
        <Donut data={byType} title="Eventos de telemetría por tipo" />
      </div>

      <div className="charts-row">
        <Donut data={{ 'Activos 30d': adherence?.active30d || 0, 'Inactivos': Math.max(0, (adherence?.totalUsers || 0) - (adherence?.active30d || 0)) }} title="Adherencia (30 días)" />
      </div>

      <div className="dash-section">
        <h2>Notas</h2>
        <p className="muted">
          La mejora THI media es el promedio de (primer resultado − último resultado) por paciente con al menos dos evaluaciones.
          Valores positivos indican reducción de la intensidad percibida del acúfeno.
          DAU/WAU/MAU se calculan a partir de la telemetría de la app (las cuentas de usuario sin telemetría migrada aparecerán como 0).
        </p>
      </div>
    </div>
  );
}
