import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, Shield, CheckCircle, Activity, Headphones, HeartPulse } from 'lucide-react';
import { fetchWeatherAndPredict } from '../utils/crisisPredictor';
import { useAuth } from '../contexts/AuthContext';
import { FirestoreService } from '../services/firestoreService';
import './CrisisPrediction.css';

const CrisisPrediction = ({ onClose, openBreathing, openSpatialAudio }) => {
  const { currentUser } = useAuth();
  const [prediction, setPrediction] = useState(null);

  useEffect(() => {
    const getPrediction = async () => {
      let logs = [];
      if (currentUser) {
        logs = await FirestoreService.getWeeklyLogs(currentUser.uid) || [];
      }
      const pred = await fetchWeatherAndPredict(logs);
      setPrediction(pred);
      
      if (currentUser && pred) {
        FirestoreService.savePrediction(currentUser.uid, pred);
      }
    };
    getPrediction();
  }, [currentUser]);

  const handleActionClick = (type) => {
    onClose();
    if (type === 'breathing' && openBreathing) openBreathing();
    if (type === 'sound' && openSpatialAudio) openSpatialAudio();
  };

  if (!prediction) return (
    <div className="crisis-wrapper animate-fade">
      <div className="crisis-container">
        <div className="loading-data">
           <Activity className="spinner" size={32} color="#007AFF" />
           <p>Analizando gemelo digital...</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="crisis-wrapper animate-fade">
      <div className="crisis-container">
        <header className="cp-header">
          <h2>Predicción ML</h2>
          <button onClick={onClose} className="cp-close-btn"><X size={20}/></button>
        </header>

        <div className="cp-content">
          <div className="glass-card text-center" style={{ padding: '2rem 1rem' }}>
            <div className={`risk-gauge ${prediction.riskLevel}`}>
              <div className="score">{prediction.riskScore}</div>
              <span className="label">Riesgo {prediction.riskLevel === 'high' ? 'Alto' : prediction.riskLevel === 'moderate' ? 'Medio' : 'Bajo'}</span>
            </div>
            
            {prediction.riskLevel === 'high' && (
              <div className="alert-banner" style={{ marginTop: '1.5rem' }}>
                <AlertTriangle size={24} color="#FF3B30"/>
                <span>Posible crisis en las próximas {prediction.predictedWindow}</span>
              </div>
            )}
          </div>

          <div className="glass-card">
            <h3 className="section-title">Factores Principales</h3>
            <ul className="factors-list">
              {prediction.topFactors.map((f, i) => (
                <li key={i}>
                  <span>{f.factor}</span> 
                  <span className="contribution">+{f.contribution} pts</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="glass-card">
            <h3 className="section-title">Plan de Prevención</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {prediction.preventionActions.map((a, i) => {
                let Icon = Shield;
                if (a.type === 'breathing') Icon = HeartPulse;
                if (a.type === 'sound') Icon = Headphones;
                
                return (
                  <button 
                    key={i} 
                    className="premium-btn action-btn" 
                    onClick={() => handleActionClick(a.type)}
                  >
                    <Icon size={18} /> {a.action}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default CrisisPrediction;

