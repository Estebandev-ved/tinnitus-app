import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../api/adminService';

const TYPE_LABEL = {
  SEVERE_TINNITUS: 'Tinnitus severo',
  DETERIORATION: 'Empeoramiento',
  ABANDONED: 'Abandono de tratamiento',
  NO_ENGAGEMENT: 'Sin engagement',
  HEARING_LOSS: 'Hipoacusia',
  HIGH_RISK_PREDICTION: 'Predicción riesgo alto',
};

const SEV_LABEL = { HIGH: 'Alta', MEDIUM: 'Media', LOW: 'Baja' };

function fmtDate(v) {
  if (!v) return '—';
  const d = new Date(v);
  return isNaN(d) ? '—' : d.toLocaleDateString();
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sev, setSev] = useState('');

  useEffect(() => {
    adminService.getAlerts()
      .then(setAlerts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const counts = useMemo(() => {
    const c = { HIGH: 0, MEDIUM: 0, LOW: 0 };
    alerts.forEach((a) => { if (c[a.severity] !== undefined) c[a.severity]++; });
    return c;
  }, [alerts]);

  const filtered = useMemo(
    () => (sev ? alerts.filter((a) => a.severity === sev) : alerts),
    [alerts, sev]
  );

  if (loading) return <div className="container narrow"><p>Cargando alertas…</p></div>;
  if (error) return <div className="container narrow"><div className="alert-error">{error}</div></div>;

  return (
    <div className="dashboard">
      <header className="dash-head">
        <div>
          <h1>Alertas clínicas</h1>
          <p className="muted">Pacientes que requieren atención: tinnitus severo, empeoramiento, abandono o bajo engagement.</p>
        </div>
      </header>

      <div className="stat-grid">
        <div className="stat-card"><span className="stat-value" style={{ color: 'var(--danger)' }}>{counts.HIGH}</span><span className="stat-label">Prioridad alta</span></div>
        <div className="stat-card"><span className="stat-value" style={{ color: 'var(--warn)' }}>{counts.MEDIUM}</span><span className="stat-label">Prioridad media</span></div>
        <div className="stat-card"><span className="stat-value">{counts.LOW}</span><span className="stat-label">Prioridad baja</span></div>
        <div className="stat-card"><span className="stat-value">{alerts.length}</span><span className="stat-label">Total alertas</span></div>
      </div>

      <div className="filters">
        <select className="input" value={sev} onChange={(e) => setSev(e.target.value)}>
          <option value="">Todas las prioridades</option>
          <option value="HIGH">Alta</option>
          <option value="MEDIUM">Media</option>
          <option value="LOW">Baja</option>
        </select>
      </div>

      <div className="alert-list">
        {filtered.map((a, i) => (
          <div key={i} className={`alert-card sev-${a.severity}`}>
            <div className="alert-card-head">
              <span className={`sev-pill sev-${a.severity}`}>{SEV_LABEL[a.severity] || a.severity}</span>
              <span className="alert-type">{TYPE_LABEL[a.type] || a.type}</span>
            </div>
            <p className="alert-msg">{a.message}</p>
            <div className="alert-card-foot">
              <span><strong>{a.username}</strong> {a.email ? `· ${a.email}` : ''}</span>
              <span className="muted">{fmtDate(a.date)}</span>
              <Link className="btn btn-small" to={`/admin/usuarios/${a.userId}`}>Ver paciente</Link>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="muted center">Sin alertas para este filtro.</p>}
      </div>
    </div>
  );
}
