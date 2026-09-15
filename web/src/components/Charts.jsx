import React from 'react';

const PALETTE = ['#0ea5a4', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#10b981', '#ec4899'];

function toEntries(data) {
  if (!data) return [];
  return Object.entries(data).map(([label, value]) => ({ label, value: Number(value) || 0 }));
}

export function Donut({ data, title, height = 200 }) {
  const entries = toEntries(data).filter((e) => e.value > 0);
  const total = entries.reduce((s, e) => s + e.value, 0);
  const size = height;
  const r = size / 2 - 10;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="chart-card">
      {title && <h4 className="chart-title">{title}</h4>}
      <div className="donut-wrap">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#eef2f7" strokeWidth="16" />
          {entries.map((e, i) => {
            const frac = total ? e.value / total : 0;
            const dash = frac * circumference;
            const seg = (
              <circle
                key={e.label}
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke={PALETTE[i % PALETTE.length]}
                strokeWidth="16"
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-offset}
                transform={`rotate(-90 ${cx} ${cy})`}
              />
            );
            offset += dash;
            return seg;
          })}
          <text x={cx} y={cy - 4} textAnchor="middle" className="donut-total">{total}</text>
          <text x={cx} y={cy + 16} textAnchor="middle" className="donut-sub">total</text>
        </svg>
        <ul className="legend">
          {entries.map((e, i) => (
            <li key={e.label}>
              <span className="dot" style={{ background: PALETTE[i % PALETTE.length] }} />
              <span className="legend-label">{e.label}</span>
              <span className="legend-value">{e.value}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function Bar({ data, title, height = 220 }) {
  const entries = toEntries(data);
  const max = Math.max(1, ...entries.map((e) => e.value));
  return (
    <div className="chart-card">
      {title && <h4 className="chart-title">{title}</h4>}
      <div className="bar-wrap" style={{ height }}>
        {entries.map((e, i) => (
          <div className="bar-row" key={e.label}>
            <span className="bar-label">{e.label}</span>
            <div className="bar-track">
              <div
                className="bar-fill"
                style={{ width: `${(e.value / max) * 100}%`, background: PALETTE[i % PALETTE.length] }}
              />
            </div>
            <span className="bar-value">{e.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Line({ points, title, height = 220 }) {
  const data = (points || []).map((p) => ({ label: p.label, value: Number(p.value) || 0 }));
  if (data.length === 0) {
    return (
      <div className="chart-card">
        {title && <h4 className="chart-title">{title}</h4>}
        <p className="muted">Sin datos.</p>
      </div>
    );
  }
  const w = 520;
  const h = height;
  const pad = 36;
  const max = Math.max(1, ...data.map((d) => d.value));
  const stepX = data.length > 1 ? (w - pad * 2) / (data.length - 1) : 0;
  const coords = data.map((d, i) => ({
    x: pad + i * stepX,
    y: h - pad - (d.value / max) * (h - pad * 2),
    ...d,
  }));
  const path = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ');

  return (
    <div className="chart-card">
      {title && <h4 className="chart-title">{title}</h4>}
      <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid meet">
        <line x1={pad} y1={h - pad} x2={w - pad} y2={h - pad} stroke="#e2e8f0" />
        <line x1={pad} y1={pad} x2={pad} y2={h - pad} stroke="#e2e8f0" />
        <path d={path} fill="none" stroke="#0ea5a4" strokeWidth="2.5" />
        {coords.map((c, i) => (
          <g key={i}>
            <circle cx={c.x} cy={c.y} r="3.5" fill="#0b8483" />
            <text x={c.x} y={c.y - 8} textAnchor="middle" className="line-value">{c.value}</text>
            <text x={c.x} y={h - pad + 16} textAnchor="middle" className="line-axis">{c.label}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export function MultiLine({ series, title, height = 240 }) {
  if (!series || series.length === 0 || series.every((s) => !s.points || s.points.length === 0)) {
    return (
      <div className="chart-card">
        {title && <h4 className="chart-title">{title}</h4>}
        <p className="muted">Sin datos.</p>
      </div>
    );
  }

  const w = 520;
  const h = height;
  const pad = 36;

  // Merge all labels from all series (union, preserving order)
  const labelSet = new Set();
  series.forEach((s) => (s.points || []).forEach((p) => labelSet.add(p.label)));
  const labels = [...labelSet];

  // Build lookup per series
  const lookup = series.map((s) => {
    const map = {};
    (s.points || []).forEach((p) => { map[p.label] = Number(p.value) || 0; });
    return map;
  });

  const max = Math.max(1, ...labels.map((_, i) => Math.max(...series.map((s, j) => lookup[j][labels[i]] || 0))));
  const stepX = labels.length > 1 ? (w - pad * 2) / (labels.length - 1) : 0;

  const lines = series.map((s, si) => {
    const color = PALETTE[si % PALETTE.length];
    const coords = labels.map((l, i) => ({
      x: pad + i * stepX,
      y: h - pad - ((lookup[si][l] || 0) / max) * (h - pad * 2),
    }));
    const path = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ');
    return { color, path, coords, name: s.name };
  });

  return (
    <div className="chart-card">
      {title && <h4 className="chart-title">{title}</h4>}
      <div className="multi-line-wrap">
        <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid meet">
          <line x1={pad} y1={h - pad} x2={w - pad} y2={h - pad} stroke="#e2e8f0" />
          <line x1={pad} y1={pad} x2={pad} y2={h - pad} stroke="#e2e8f0" />
          {lines.map((l, li) => (
            <path key={li} d={l.path} fill="none" stroke={l.color} strokeWidth="2.5" />
          ))}
          {labels.map((l, i) => (
            <text key={i} x={pad + i * stepX} y={h - pad + 16} textAnchor="middle" className="line-axis">{l}</text>
          ))}
        </svg>
        <div className="multi-legend">
          {lines.map((l) => (
            <span key={l.name} className="multi-legend-item">
              <span className="dot" style={{ background: l.color }} /> {l.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
