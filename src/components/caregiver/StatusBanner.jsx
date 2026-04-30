import React from 'react';
import { ShieldCheck, Activity, AlertTriangle } from 'lucide-react';

const config = {
  green: { icon: ShieldCheck, color: '#34C759', bg: 'rgba(52,199,89,0.12)', msg: 'Paciente activo y estable.', pulse: false },
  yellow: { icon: Activity, color: '#FF9500', bg: 'rgba(255,149,0,0.12)', msg: '+24h sin actividad registrada.', pulse: true },
  red: { icon: AlertTriangle, color: '#FF3B30', bg: 'rgba(255,59,48,0.12)', msg: '¡Spike detectado! Nivel ≥ 8/10.', pulse: true },
};

export function StatusBanner({ status = 'yellow' }) {
  const { icon: Icon, color, bg, msg, pulse } = config[status];
  return (
    <div style={{ background: bg, border: `1px solid ${color}30`, borderRadius: 16, padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: 14, marginBottom: '1.25rem' }}>
      <div style={{ position: 'relative', width: 44, height: 44, flexShrink: 0 }}>
        {pulse && <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: color, opacity: 0.2, animation: 'pulse 2s infinite' }} />}
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={22} color={color} />
        </div>
      </div>
      <div>
        <p style={{ margin: 0, fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>Estado del Paciente</p>
        <p style={{ margin: 0, color, fontSize: '0.85rem', marginTop: 2 }}>{msg}</p>
      </div>
    </div>
  );
}
