import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingDown, TrendingUp } from 'lucide-react';

const DATA_7 = [
  { day: 'L', val: 7 }, { day: 'M', val: 6 }, { day: 'X', val: 8 }, { day: 'J', val: 5 },
  { day: 'V', val: 6 }, { day: 'S', val: 4 }, { day: 'D', val: 4 },
];
const DATA_30 = Array.from({ length: 30 }, (_, i) => ({ day: `D${i + 1}`, val: Math.max(2, Math.round(8 - i * 0.15 + (Math.random() - 0.5) * 2)) }));

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#1c1c1e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '8px 12px' }}>
      <p style={{ margin: 0, color: '#007AFF', fontWeight: 700 }}>{payload[0].value}/10</p>
    </div>
  );
};

export function ProgressChart() {
  const [range, setRange] = useState('7');
  const data = range === '7' ? DATA_7 : DATA_30;
  const avg = (data.reduce((s, d) => s + d.val, 0) / data.length).toFixed(1);
  const first = data[0].val, last = data[data.length - 1].val;
  const diff = ((first - last) / first * 100).toFixed(0);
  const improved = last <= first;

  return (
    <div>
      {/* Range selector */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#A1A1AA', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Progreso del Paciente
        </p>
        <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: 3 }}>
          {['7', '30'].map(r => (
            <button key={r} onClick={() => setRange(r)}
              style={{ padding: '4px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
                background: range === r ? '#007AFF' : 'transparent', color: range === r ? '#fff' : '#6b7280', transition: 'all 0.2s',
              }}
            >{r}d</button>
          ))}
        </div>
      </div>

      {/* KPI */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
        {[
          { label: 'Promedio', val: `${avg}/10` },
          { label: 'Tendencia', val: improved ? `↓ ${diff}%` : `↑ ${Math.abs(diff)}%`, color: improved ? '#34C759' : '#FF3B30' },
        ].map(k => (
          <div key={k.label} style={{ flex: 1, background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '8px 12px', textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280' }}>{k.label}</p>
            <p style={{ margin: 0, fontWeight: 700, color: k.color || '#fff', fontSize: '1.1rem' }}>{k.val}</p>
          </div>
        ))}
        <div style={{ flex: 1, background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '8px 12px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {improved ? <TrendingDown size={22} color="#34C759" /> : <TrendingUp size={22} color="#FF3B30" />}
        </div>
      </div>

      {/* Chart */}
      <div style={{ height: 130 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -35 }}>
            <XAxis dataKey="day" stroke="#374151" fontSize={11} tickLine={false} interval={range === '30' ? 4 : 0} />
            <YAxis domain={[0, 10]} stroke="transparent" fontSize={11} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={5} stroke="rgba(255,255,255,0.1)" strokeDasharray="4 4" />
            <Line type="monotone" dataKey="val" stroke="#007AFF" strokeWidth={2.5}
              dot={range === '7' ? { r: 4, fill: '#007AFF' } : false}
              activeDot={{ r: 6, fill: '#007AFF' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
