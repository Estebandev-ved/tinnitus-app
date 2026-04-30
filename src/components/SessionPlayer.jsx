import React, { useState } from 'react';
import { X, CheckCircle } from 'lucide-react';
import { NeveraMechanic } from './mechanics/NeveraMechanic';
import { MezcladorMechanic } from './mechanics/MezcladorMechanic';
import { LinternaMechanic } from './mechanics/LinternaMechanic';
import { MonstruoMechanic } from './mechanics/MonstruoMechanic';
import { PerifericaMechanic } from './mechanics/PerifericaMechanic';

export const SessionPlayer = ({ sessionData, onClose, onComplete }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [isDone, setIsDone] = useState(false);

  const handleNext = () => {
    if (stepIndex + 1 < sessionData.steps.length) {
      setStepIndex(i => i + 1);
    } else {
      setIsDone(true);
      setTimeout(onComplete, 2000);
    }
  };

  if (isDone) {
    return <div style={{ position: 'fixed', inset: 0, background: '#0B1426', zIndex: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
      <CheckCircle size={64} color="#34C759" />
      <h2 style={{ marginTop: 20 }}>Día {sessionData.day} Completado</h2>
      <p style={{ opacity: 0.7 }}>Tu cerebro está aprendiendo. Buen trabajo.</p>
    </div>;
  }

  const currentStep = sessionData.steps[stepIndex];
  
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#0B1426', zIndex: 300, color: 'white', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: 20, alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div>
          <span style={{ fontSize: 12, opacity: 0.6, textTransform: 'uppercase', letterSpacing: 1 }}>{sessionData.title}</span>
          <div style={{ fontSize: 14, fontWeight: 'bold' }}>Paso {stepIndex + 1} de {sessionData.steps.length}</div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X /></button>
      </div>

      <div style={{ flex: 1, overflow: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {currentStep.type === 'nevera' && <NeveraMechanic onComplete={handleNext} />}
        {currentStep.type === 'mezclador' && <MezcladorMechanic onComplete={handleNext} />}
        {currentStep.type === 'linterna' && <LinternaMechanic onComplete={handleNext} />}
        {currentStep.type === 'monstruo' && <MonstruoMechanic onComplete={handleNext} />}
        {currentStep.type === 'periferica' && <PerifericaMechanic onComplete={handleNext} />}
        
        {/* Fallback for undefined types */}
        {!['nevera', 'mezclador', 'linterna', 'monstruo', 'periferica'].includes(currentStep.type) && (
          <div style={{ textAlign: 'center' }}>
            <h2>Tipo Desconocido: {currentStep.type}</h2>
            <button onClick={handleNext} style={{ background: '#5856D6', color: 'white', padding: '10px 20px', border: 'none', borderRadius: 8, marginTop: 20 }}>Saltar</button>
          </div>
        )}
      </div>
    </div>
  );
};
