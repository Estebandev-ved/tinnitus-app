import React, { useState } from 'react';

const REACTIONS = [
  { id: 'love', emoji: '❤️', label: 'Amor' },
  { id: 'strong', emoji: '💪', label: 'Fuerza' },
  { id: 'medal', emoji: '🏅', label: 'Medalla' },
  { id: 'party', emoji: '🎉', label: 'Celebrar' },
  { id: 'hug', emoji: '🫂', label: 'Abrazo' },
  { id: 'star', emoji: '🌟', label: 'Estrella' },
];

export function QuickReactions({ patientName = 'el paciente' }) {
  const [sent, setSent] = useState(null);
  const [history, setHistory] = useState([]);

  const send = (r) => {
    setSent(r.id);
    setHistory(h => [{ ...r, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }, ...h].slice(0, 5));
    setTimeout(() => setSent(null), 1500);
    // POST /api/v1/reaction → Push Notification
  };

  return (
    <div>
      <p style={{ margin: '0 0 12px', fontSize: '0.85rem', color: '#A1A1AA', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        Reacciones Rápidas a {patientName}
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
        {REACTIONS.map(r => (
          <button key={r.id} onClick={() => send(r)}
            style={{
              background: sent === r.id ? 'rgba(0,122,255,0.2)' : 'rgba(255,255,255,0.05)',
              border: sent === r.id ? '1px solid #007AFF' : '1px solid rgba(255,255,255,0.08)',
              borderRadius: 14, aspectRatio: '1', cursor: 'pointer',
              fontSize: '1.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transform: sent === r.id ? 'scale(1.25)' : 'scale(1)',
              transition: 'all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            }}
            title={r.label}
          >{r.emoji}</button>
        ))}
      </div>
      {history.length > 0 && (
        <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {history.map((h, i) => (
            <span key={i} style={{ fontSize: '0.75rem', color: '#6b7280', background: 'rgba(255,255,255,0.04)', padding: '2px 8px', borderRadius: 20 }}>
              {h.emoji} {h.time}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
