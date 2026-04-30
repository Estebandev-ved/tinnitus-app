import React, { useEffect, useState } from 'react';
import { CheckCircle } from 'lucide-react';

export default function ConfettiCelebration() {
  const [show, setShow] = useState(true);
  useEffect(() => { setTimeout(() => setShow(false), 4000); }, []);
  if (!show) return null;

  const colors = ['#5856D6', '#AF52DE', '#FF9500', '#34C759', '#30B0C7', '#FF2D55'];
  const pieces = Array.from({ length: 80 }).map((_, i) => ({
    id: i,
    left: Math.random() * 100 + 'vw',
    animationDelay: Math.random() * 3 + 's',
    backgroundColor: colors[Math.floor(Math.random() * colors.length)],
    width: Math.random() * 10 + 5 + 'px',
    height: Math.random() * 20 + 10 + 'px'
  }));

  return (
    <div className="confetti-wrapper">
      <div className="wizard-card success-card" style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10000, textAlign: 'center', minWidth: '320px'}}>
        <CheckCircle size={64} strokeWidth={1.5} color="#34C759" style={{marginBottom: '20px', filter: 'drop-shadow(0 0 12px rgba(52,199,89,0.4))'}} />
        <h2 style={{ fontSize: '2rem', marginBottom: '10px' }}>¡Felicidades!</h2>
        <p style={{ color: '#A1A1AA', fontSize: '1.2rem' }}>Perfil configurado con éxito.</p>
      </div>
      {pieces.map(p => (
        <div key={p.id} className="confetti-piece" style={p} />
      ))}
    </div>
  );
}