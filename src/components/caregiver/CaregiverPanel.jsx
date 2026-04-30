import React, { useState } from 'react';
import { Heart, Activity, AlertTriangle, ShieldCheck } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export function CaregiverPanel({ patientName = "Carlos" }) {
  // Mock Data Semáforo
  // 🟢 Verde: Lección < 24h
  // 🟡 Amarillo: Login > 24h
  // 🔴 Rojo: TinnitusLevel >= 8
  const [status] = useState('yellow'); // 'green', 'yellow', 'red'

  // Mock Gráfico
  const habituationData = [
    { day: '-7d', score: 30 }, { day: '-6d', score: 45 },
    { day: '-5d', score: 40 }, { day: '-4d', score: 60 },
    { day: '-3d', score: 65 }, { day: '-2d', score: 80 },
    { day: 'Hoy', score: 75 },
  ];

  const handleReaction = (type, emoji) => {
    // POST /api/v1/reaction -> Envía Push
    alert(`[PUSH ORG] A ${patientName}: "Te enviaron ${type} ${emoji}"`);
  };

  const statusConfig = {
    green: { color: 'text-green-400', bg: 'bg-green-900/30', icon: ShieldCheck, msg: 'Paciente activo y estable.' },
    yellow: { color: 'text-yellow-400', bg: 'bg-yellow-900/30', icon: Activity, msg: '>24h sin actividad.' },
    red: { color: 'text-red-400', bg: 'bg-red-900/30', icon: AlertTriangle, msg: 'Spike detectado. Requiere atención.' },
  };

  const CurrentStatus = statusConfig[status];
  const StatusIcon = CurrentStatus.icon;

  return (
    <div className="glass-card" style={{ maxWidth: '450px', margin: '0 auto' }}>
      
      {/* Header Semáforo */}
      <div className={`p-4 rounded-xl flex items-center gap-3 border border-gray-700/50 ${CurrentStatus.bg}`}>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-gray-900`}>
          <StatusIcon className={`w-5 h-5 ${CurrentStatus.color}`} />
        </div>
        <div>
          <h2 className="font-bold text-lg">Estado {patientName}</h2>
          <p className={`text-sm ${CurrentStatus.color}`}>{CurrentStatus.msg}</p>
        </div>
      </div>

      {/* Gráfico 7 Días */}
      <div className="glass-card" style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)' }}>
        <p className="text-sm font-semibold text-gray-300 mb-4">Habituación (7 días)</p>
        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={habituationData}>
              <XAxis dataKey="day" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis hide domain={[0, 100]} />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
              <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Interacción Social */}
      <div>
        <p className="text-sm font-semibold text-gray-300 mb-3 text-center">Reacciones Rápidas</p>
        <div className="grid grid-cols-4 gap-2">
          {[
            { id: 'corazon', emoji: '❤️', label: 'Corazón' },
            { id: 'fuerza', emoji: '💪', label: 'Fuerza' },
            { id: 'medalla', emoji: '🏅', label: 'Medalla' },
            { id: 'abrazo', emoji: '🫂', label: 'Abrazo' },
          ].map(btn => (
            <button 
              key={btn.id}
              onClick={() => handleReaction(btn.label, btn.emoji)}
              className="bg-gray-800 hover:bg-gray-700 aspect-square rounded-xl flex flex-col justify-center items-center gap-1 transition-transform active:scale-95 shadow-md"
            >
              <span className="text-2xl">{btn.emoji}</span>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
