import React, { useEffect, useState } from 'react';
import { X, Cpu, TrendingDown, HeartPulse, Wind, Coffee, TrendingUp } from 'lucide-react';
import { FirestoreService } from '../services/firestoreService';
import { useAuth } from '../contexts/AuthContext';
import { analyzeEmotion } from '../features/emotionalAnalyzer';
import { getPrediction } from '../features/predictiveEngine';
import './DigitalTwin.css';

export const EnhancedDigitalTwin = ({ onClose, onActionSelect, userInput }) => {
  const { currentUser } = useAuth();
  const [mood, setMood] = useState('neutral');
  const [loading, setLoading] = useState(true);
  const [predictionText, setPredictionText] = useState('');

  useEffect(() => {
    if(userInput) {
      const detected = analyzeEmotion(userInput);
      setMood(detected);
    }
  }, [userInput]);

  useEffect(() => {
    const loadData = async () => {
      if (!currentUser) return;
      try {
        const recentLogs = await FirestoreService.getWeeklyLogs(currentUser.uid);
        const predictMsg = getPrediction(recentLogs);
        setPredictionText(predictMsg);
      } catch (error) {
        console.error("Error loading logs for twin:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [currentUser]);

  return (
    <div className="twin-overlay animate-fade">
      <div className="twin-modal" style={{background: 'var(--surface)', color: 'var(--text)'}}>
        <header className="twin-header">
          <h3>Tu Gemelo Digital IA</h3>
          <button className="close-btn" onClick={onClose}><X size={24} /></button>
        </header>

        <div className="twin-content" style={{textAlign: 'center', padding: '20px 0'}}>
          <div className={`avatar-3d state-${mood}`} style={{fontSize: '80px', margin: '20px 0'}}>
            {mood === 'frustration' ? '😣' : mood === 'anxiety' ? '😟' : mood === 'calm' ? '😌' : '🤖'}
          </div>
          
          <div className={`mood-badge mood-${mood}`} style={{margin: '10px auto', padding: '8px 16px', borderRadius: '20px', background: mood === 'frustration' ? '#FF3B30' : mood === 'anxiety' ? '#FF9500' : '#34C759', color: 'white', display: 'inline-block'}}>
            {mood === 'frustration' ? 'Detectamos estrés, respiremos juntos' : mood === 'anxiety' ? 'Notamos ansiedad, prueba sonido 3D' : mood === 'calm' ? '¡Día tranquilo! Sigue así' : 'Estado neutral'}
          </div>

          {loading ? (
             <p>Analizando patrones...</p>
          ) : (
            <div className="insight-card predictive" style={{background: '#1c1c1e', color: 'white', padding: '15px', borderRadius: '12px', marginTop: '20px', textAlign: 'left'}}>
              <h4><span role="img" aria-label="brain">🧠</span> IA Predictiva</h4>
              <p style={{fontSize: '14px', marginTop: '8px'}}>{predictionText}</p>
            </div>
          )}

          <div className="action-recommendations" style={{marginTop: '20px'}}>
              <h4>Plan Preventivo Sugerido</h4>
              <div className="action-list" style={{display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px'}}>
                  <button className="btn full-width suggestion-btn" onClick={() => onActionSelect('breathing')} style={{display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'center'}}>
                      <Wind size={18} /> Minutos de Respiración
                  </button>
                  <button className="btn full-width suggestion-btn" onClick={() => onActionSelect('spatial')} style={{display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'center'}}>
                      <TrendingDown size={18} /> Terapia 3D de Inmediato
                  </button>
              </div>
          </div>
          
          <p className="disclaimer-text" style={{fontSize: '11px', opacity: 0.7, marginTop: '30px'}}>
            Recordatorio: Soy una IA de apoyo emocional, no sustituyo consejo médico profesional.
          </p>
        </div>
      </div>
    </div>
  );
};
export default EnhancedDigitalTwin;
