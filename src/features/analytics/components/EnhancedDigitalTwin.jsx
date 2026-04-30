import React, { useEffect, useState } from 'react';
import { analyzeEmotion } from '../Services/emotionalAnalyzer';
// Requerimiento: Disclaimer Médico Constante

export const EnhancedDigitalTwin = ({ userInput }) => {
  const [mood, setMood] = useState('neutral');

  useEffect(() => {
    if(userInput) {
      const detected = analyzeEmotion(userInput);
      setMood(detected);
      // Animación 3D trigger aquí (< 3s max overhead)
    }
  }, [userInput]);

  return (
    <div className="digital-twin-enhanced">
      <div className={`avatar-3d state-${mood}`}>
        [Render Avatar 3D con expresión: {mood}]
      </div>
      <p className="disclaimer-text text-xs opacity-70">
        Recordatorio: Soy una IA de apoyo emocional, no sustituyo consejo médico profesional.
      </p>
    </div>
  );
};
