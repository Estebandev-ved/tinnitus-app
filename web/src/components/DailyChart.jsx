import React from 'react';

// Gráfica SVG de registros diarios (sin librerías externas).
// Espera logs en orden cronológico con: tinnitusLevel, stressLevel (0-100) y sleepHours.
export default function DailyChart({ logs = [] }) {
  const W = 320;
  const H = 170;
  const pad = 26;
  const innerW = W - pad * 2;
  const innerH = H - pad * 2;

  if (!logs || logs.length === 0) {
    return <p className="profile-empty">Aún no tienes registros diarios. Agrégalos desde la app para ver tu evolución.</p>;
  }

  const n = logs.length;
  const xFor = (i) => pad + (n === 1 ? innerW / 2 : (i / (n - 1)) * innerW);
  const yFor = (v) => pad + innerH - (Math.max(0, Math.min(100, v)) / 100) * innerH;

  const line = (key, scale = 1) => {
    const pts = logs.map((l, i) => {
      const raw = key === 'sleep' ? (l.sleepHours || 0) / 24 * 100 : (l[key] || 0);
      return `${xFor(i)},${yFor(raw * scale)}`;
    });
    return pts.join(' ');
  };

  const series = [
    { id: 'tinnitusLevel', label: 'Zumbido', color: '#0ea5a4' },
    { id: 'stressLevel', label: 'Estrés', color: '#f59e0b' },
    { id: 'sleep', label: 'Sueño (h)', color: '#3b82f6' },
  ];

  const days = logs.map((l) => {
    const d = l.createdAt ? (l.createdAt.toDate ? l.createdAt.toDate() : (l.createdAt.seconds ? new Date(l.createdAt.seconds * 1000) : new Date(l.date || Date.now()))) : new Date();
    return isNaN(d.getTime()) ? '' : d.toLocaleDateString('es', { day: 'numeric', month: 'short' });
  });

  return (
    <div className="daily-chart">
      <svg viewBox={`0 0 ${W} ${H}`} className="daily-chart-svg" role="img" aria-label="Evolución diaria">
        {/* grid */}
        {[0, 25, 50, 75, 100].map((g) => (
          <g key={g}>
            <line x1={pad} y1={yFor(g)} x2={W - pad} y2={yFor(g)} stroke="rgba(15,34,54,.08)" strokeWidth="1" />
            <text x={4} y={yFor(g) + 3} fontSize="8" fill="var(--ink-soft)">{g}</text>
          </g>
        ))}
        {series.map((s) => (
          <polyline key={s.id} points={line(s.id)} fill="none" stroke={s.color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        ))}
        {series.map((s) =>
          logs.map((l, i) => {
            const raw = s.id === 'sleep' ? (l.sleepHours || 0) / 24 * 100 : (l[s.id] || 0);
            return <circle key={s.id + i} cx={xFor(i)} cy={yFor(raw)} r="2.6" fill={s.color} />;
          })
        )}
        {days.map((d, i) => (
          <text key={i} x={xFor(i)} y={H - 8} fontSize="8" fill="var(--ink-soft)" textAnchor="middle">{d}</text>
        ))}
      </svg>
      <div className="daily-legend">
        {series.map((s) => (
          <span key={s.id} className="daily-legend-item"><i style={{ background: s.color }} /> {s.label}</span>
        ))}
      </div>
    </div>
  );
}
