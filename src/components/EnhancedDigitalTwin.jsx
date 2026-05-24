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
    if (userInput) {
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
      <div className="twin-modal">
        <header className="twin-header">
          <h3>Tu Gemelo Digital IA</h3>
          <button className="close-btn" onClick={onClose}><X size={24} /></button>
        </header>

        <div className="twin-content">
          <div className={`avatar-3d state-${mood}`}>
            {mood === 'frustration' ? '😣' : mood === 'anxiety' ? '😟' : mood === 'calm' ? '😌' : '🤖'}
          </div>
          
          <div className={`mood-badge mood-${mood}`}>
            {mood === 'frustration' ? 'Detectamos estrés, respiremos juntos' : mood === 'anxiety' ? 'Notamos ansiedad, prueba sonido 3D' : mood === 'calm' ? '¡Día tranquilo! Sigue así' : 'Estado neutral'}
          </div>

          {loading ? (
             <p className="ai-message">Analizando patrones...</p>
          ) : (
            <div className="insight-card predictive">
              <h4>🧠 IA Predictiva</h4>
              <p>{predictionText}</p>
            </div>
          )}

          <div className="action-recommendations">
              <h4>Plan Preventivo Sugerido</h4>
              <div className="action-list">
                  <button className="suggestion-btn" onClick={() => onActionSelect('breathing')}>
                      <Wind size={18} /> Minutos de Respiración
                  </button>
                  <button className="suggestion-btn" onClick={() => onActionSelect('spatial')}>
                      <TrendingDown size={18} /> Terapia 3D de Inmediato
                  </button>
              </div>
          </div>
          
          <p className="disclaimer-text">
            Recordatorio: Soy una IA de apoyo emocional, no sustituyo consejo médico profesional.
          </p>
        </div>
      </div>
    </div>
  );
};
export default EnhancedDigitalTwin;
