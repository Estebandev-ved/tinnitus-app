import React from 'react';

export const EmotionalIndicator = ({ currentMood }) => (
  <div className={`mood-badge mood-${currentMood}`}>
    {currentMood === 'frustration' ? 'Detectamos estrés, respiremos juntos' : 'Día tranquilo'}
  </div>
);
