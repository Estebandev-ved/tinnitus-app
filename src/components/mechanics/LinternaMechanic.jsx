import React, { useState, useEffect, useRef } from 'react';
import './Mechanics.css';

export const LinternaMechanic = ({ onComplete }) => {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [score, setScore] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    let interval;
    if (score < 5) {
      interval = setInterval(() => {
        if (containerRef.current) {
          const w = containerRef.current.clientWidth - 50;
          const h = containerRef.current.clientHeight - 50;
          setPos({ x: Math.random() * w, y: Math.random() * h });
        }
      }, 1000);
    } else {
      setTimeout(onComplete, 1500);
    }
    return () => clearInterval(interval);
  }, [score]);

  const handleHit = () => setScore(s => s + 1);

  if (score >= 5) {
    return <div className="mechanic-container">
      <h2 className="mechanic-title">¡Atención Recuperada!</h2>
      <p>Cuando enfocas tu linterna visual/motora, tu linterna auditiva se apaga.</p>
    </div>;
  }

  return (
    <div className="mechanic-container">
      <h2 className="mechanic-title">La Linterna (Foco Visual)</h2>
      <p className="mechanic-desc">Ignora el pitido virtual. Atrapa la luz 5 veces.</p>
      
      <div className="linterna-board" ref={containerRef}>
        <div className="linterna-dot" style={{ left: pos.x, top: pos.y }} onClick={handleHit} />
      </div>
    </div>
  );
};
