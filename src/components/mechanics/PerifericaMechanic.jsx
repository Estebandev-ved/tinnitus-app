import React, { useState, useEffect } from 'react';
import './Mechanics.css';

export const PerifericaMechanic = ({ onComplete }) => {
  const [isBird, setIsBird] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    let timeout;
    if (score < 3) {
      timeout = setTimeout(() => {
        setIsBird(true);
        setTimeout(() => setIsBird(false), 2000);
      }, Math.random() * 3000 + 1000);
    } else {
      setTimeout(onComplete, 1000);
    }
    return () => clearTimeout(timeout);
  }, [score]);

  const handleTap = () => {
    if (isBird) {
      setScore(s => s + 1);
      setIsBird(false);
    }
  };

  if (score >= 3) {
    return <div className="mechanic-container"><h2 className="mechanic-title">Radar Calibrado</h2><p>Sacaste tu atención del oído y la llevaste al exterior.</p></div>;
  }

  return (
    <div className="mechanic-container">
      <h2 className="mechanic-title">Escucha Periférica</h2>
      <p className="mechanic-desc">Toca el radar RÁPIDO solo cuando escuches (veas) el Pájaro. Ignora el ruido de fondo.</p>
      
      <button className="radar-btn" style={{ background: isBird ? '#34C759' : '#1E293B' }} onClick={handleTap}>
        {isBird ? '¡Pájaro!' : 'Bosque...'}
      </button>
      
      <div style={{ marginTop: '20px', fontWeight: 'bold' }}>{score}/3 Detectados</div>
    </div>
  );
};
