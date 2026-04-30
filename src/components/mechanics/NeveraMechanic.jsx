import React, { useState } from 'react';
import './Mechanics.css';

const ITEMS = [
  { id: 1, name: 'Ladrón en casa', isThreat: true },
  { id: 2, name: 'Ruido de nevera', isThreat: false },
  { id: 3, name: 'Tigre', isThreat: true },
  { id: 4, name: 'Viento en hojas', isThreat: false },
  { id: 5, name: 'Zumbido (Tinnitus)', isThreat: false }, // Clave de la terapia
  { id: 6, name: 'Alarma de incendios', isThreat: true }
];

export const NeveraMechanic = ({ onComplete }) => {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);

  const handleChoice = (isThreatChoice) => {
    const current = ITEMS[index];
    if (isThreatChoice === current.isThreat) setScore(s => s + 1);
    
    if (index + 1 < ITEMS.length) {
      setIndex(i => i + 1);
    } else {
      setTimeout(onComplete, 1000);
    }
  };

  if (index >= ITEMS.length) {
    return <div className="mechanic-container">
      <h2 className="mechanic-title">¡Filtro cerebral entrenado!</h2>
      <p>Tu cerebro está aprendiendo a clasificar el zumbido como "ruido de fondo".</p>
    </div>;
  }

  const currentItem = ITEMS[index];

  return (
    <div className="mechanic-container">
      <h2 className="mechanic-title">Efecto Nevera</h2>
      <p className="mechanic-desc">Clasifica el sonido. Tu cerebro necesita saber qué ignorar.</p>
      
      <div className="nevera-card">{currentItem.name}</div>
      
      <div className="nevera-btns">
        <button className="btn-ignorar" onClick={() => handleChoice(false)}>Ignorar (Seguro)</button>
        <button className="btn-alerta" onClick={() => handleChoice(true)}>Alerta (Peligro)</button>
      </div>
    </div>
  );
};
