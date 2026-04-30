import React, { useState } from 'react';
import { Send } from 'lucide-react';

const CATEGORIES = [
  { id: 'obs', icon: '💡', label: 'Observación' },
  { id: 'alert', icon: '⚠️', label: 'Alerta' },
  { id: 'cheer', icon: '💙', label: 'Ánimo' },
];

export function SharedDiary() {
  const [text, setText] = useState('');
  const [category, setCategory] = useState('cheer');
  const [notes, setNotes] = useState([
    { text: 'Estuvo muy tranquilo esta tarde.', category: 'obs', time: 'Hoy 10:30' },
  ]);

  const send = () => {
    if (!text.trim()) return;
    const cat = CATEGORIES.find(c => c.id === category);
    setNotes(n => [{ text, category, icon: cat.icon, time: 'Ahora' }, ...n].slice(0, 10));
    setText('');
  };

  const cat = CATEGORIES.find(c => c.id === category);

  return (
    <div>
      <p style={{ margin: '0 0 12px', fontSize: '0.85rem', color: '#A1A1AA', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        Notas del Cuidador
      </p>

      {/* Category selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        {CATEGORIES.map(c => (
          <button key={c.id} onClick={() => setCategory(c.id)}
            style={{
              padding: '5px 12px', borderRadius: 20, fontSize: '0.8rem', cursor: 'pointer',
              background: category === c.id ? 'rgba(0,122,255,0.2)' : 'rgba(255,255,255,0.05)',
              border: category === c.id ? '1px solid #007AFF' : '1px solid rgba(255,255,255,0.1)',
              color: '#fff', transition: 'all 0.2s',
            }}
          >{c.icon} {c.label}</button>
        ))}
      </div>

      {/* Input */}
      <div style={{ display: 'flex', gap: 8 }}>
        <textarea
          value={text} onChange={e => setText(e.target.value)} maxLength={200}
          placeholder="Escribe una nota para tu paciente..."
          style={{
            flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 12, color: '#fff', padding: '10px 14px', fontSize: '0.9rem',
            resize: 'none', height: 70, fontFamily: 'inherit',
          }}
        />
        <button onClick={send}
          style={{
            background: 'linear-gradient(135deg, #007AFF, #5856D6)', border: 'none', borderRadius: 12,
            padding: '0 16px', cursor: 'pointer', alignSelf: 'stretch', flexShrink: 0,
          }}
        ><Send size={18} color="#fff" /></button>
      </div>

      {/* Timeline */}
      <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 160, overflowY: 'auto' }}>
        {notes.map((n, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, borderLeft: '3px solid rgba(0,122,255,0.4)' }}>
            <span style={{ fontSize: '1rem', flexShrink: 0 }}>{n.icon || cat.icon}</span>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, color: '#E4E4E7', fontSize: '0.85rem' }}>{n.text}</p>
              <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>{n.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
