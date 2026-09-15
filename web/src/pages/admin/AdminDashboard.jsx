import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../api/adminService';
import { Donut } from '../../components/Charts';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [telemetry, setTelemetry] = useState({});
  const [downloads, setDownloads] = useState({});
  const [recent, setRecent] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminService.getStats(),
      adminService.getTelemetryByPlatform(),
      adminService.getDownloadsByPlatform(),
      adminService.getRecentDownloads(12),
    ])
      .then(([s, t, d, r]) => {
        setStats(s);
        setTelemetry(t);
        setDownloads(d);
        setRecent(r);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="container narrow"><p>Cargando panel…</p></div>;
  if (error) return <div className="container narrow"><div className="alert-error">{error}</div></div>;

  const cards = [
    { label: 'Usuarios', value: stats.totalUsers, to: '/admin/usuarios' },
    { label: 'Dispositivos', value: stats.totalDevices },
    { label: 'Eventos telemetría', value: stats.totalTelemetry },
    { label: 'Descargas', value: stats.totalDownloads },
    { label: 'Resultados THI', value: stats.totalThiResults },
    { label: 'Audiometrías', value: stats.totalAudiometries },
  ];

  return (
    <div className="dashboard">
      <header className="dash-head">
        <div>
          <h1>Dashboard</h1>
          <p className="muted">Visión general del ecosistema Tinnitoff.</p>
        </div>
      </header>

      <div className="stat-grid">
        {cards.map((c) => (
          <Link key={c.label} to={c.to || '#'} className={`stat-card ${c.to ? 'link' : ''}`}>
            <span className="stat-value">{c.value}</span>
            <span className="stat-label">{c.label}</span>
          </Link>
        ))}
      </div>

      <div className="charts-row">
        <Donut data={stats.usersByRole} title="Usuarios por rol" />
        <Donut data={telemetry} title="Telemetría por plataforma" />
        <Donut data={downloads} title="Descargas por plataforma" />
      </div>

      <div className="dash-section">
        <h2>Actividad reciente (descargas)</h2>
        {recent.length === 0 ? (
          <p className="muted">Sin descargas registradas todavía.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>Plataforma</th><th>Release</th><th>Fecha</th></tr>
              </thead>
              <tbody>
                {recent.map((d) => (
                  <tr key={d.id}>
                    <td>{d.platform || '—'}</td>
                    <td>{d.appRelease ? d.appRelease.version : '—'}</td>
                    <td>{d.downloadedAt ? new Date(d.downloadedAt).toLocaleString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
