import React, { useState, useEffect } from 'react';
import './Mechanics.css';

const THOUGHTS = [
  { p: 'Me volveré sordo por esto', r: 'Es falso, el tinnitus no causa sordera, es solo una señal.' },
  { p: 'Nunca volveré a dormir bien', r: 'Mi cerebro aprenderá a ignorarlo con el tiempo y terapia.' },
  { p: 'Es algo peligroso en mi cabeza', r: 'Mi otorrino ya lo descartó, mi oído está a salvo.' }
];

export const MonstruoMechanic = ({ onComplete }) => {
  const [index, setIndex] = useState(0);
  const [top, setTop] = useState(0);
  
  useEffect(() => {
    let interval = setInterval(() => {
      setTop(t => (t < 250 ? t + 5 : t));
    }, 100);
    return () => clearInterval(interval);
  }, [index]);

  const handleRefute = (choice) => {
    if (choice === THOUGHTS[index].r) {
      setIndex(i => i + 1);
      setTop(0);
    }
  };

  if (index >= THOUGHTS.length) {
    setTimeout(onComplete, 1000);
    return <div className="mechanic-container"><h2 className="mechanic-title">¡Monstruo Silenciado!</h2></div>;
  }

  const current = THOUGHTS[index];

  return (
    <div className="mechanic-container">
      <h2 className="mechanic-title">El Monstruo de Pensamientos</h2>
      <p className="mechanic-desc">Destruye el catastrofismo falso con verdades médicas.</p>
      
      <div className="monstruo-board">
        <div className="monstruo-text" style={{ top: top + 'px' }}>{current.p}</div>
      </div>
      
      <div className="refutacion-btns">
        <button onClick={() => handleRefute('Estaré loco pronto (Falso)')}>Eso es peor (Incorrecto)</button>
        <button onClick={() => handleRefute(current.r)}>{current.r}</button>
      </div>
    </div>
  );
};
