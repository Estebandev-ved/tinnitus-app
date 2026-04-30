import React from 'react';

export const PredictiveCard = ({ insight }) => (
  <div className="insight-card predictive">
    <h4><span role="img" aria-label="brain">🧠</span> IA Predictiva</h4>
    <p>{insight}</p>
    <button className="btn btn-ghost">Ajustar Rutina</button>
  </div>
);
