import React, { useState, useEffect } from 'react';
import { X, Heart, Wind, ShieldCheck, AlertCircle } from 'lucide-react';
import { AudioEngine } from '../../utils/audioEngine';
import { FirestoreService } from '../../services/firestoreService';
import { useAuth } from '../../contexts/AuthContext';
import './RescueMode.css';

const GROUNDING_MESSAGES = [
  "Este zumbido es solo una señal inofensiva. Estás a salvo.",
  "Tu respiración profunda le indica a tu cerebro que puede relajarse.",
  "Mantén tu atención en la esfera expansiva de luz.",
  "El sonido de fondo está enmascarando el acúfeno para darte descanso.",
  "Siente la temperatura del aire al inhalar y exhalar.",
  "Tu cerebro se está adaptando. Este pico de intensidad pasará."
];

export const RescueMode = ({ onClose, matchedFrequency }) => {
  const { currentUser } = useAuth();
  const [step, setStep] = useState('input'); // input, breathing, done
  const [discomfort, setDiscomfort] = useState(7);
  const [phase, setPhase] = useState('Inhala');
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes is perfect for quick panic relief
  const [messageIndex, setMessageIndex] = useState(0);

  const targetFreq = matchedFrequency ? (typeof matchedFrequency === 'object' ? matchedFrequency.frequency : matchedFrequency) : null;

  const startRescue = () => {
    setStep('breathing');
    // If matched frequency exists, play customized enmascarador noise
    if (targetFreq) {
      AudioEngine.playCustomNoise(targetFreq, 2.0); // Modulate high frequency with LFO pulses
      AudioEngine.setVolume('custom', 0.85);
    } else {
      // Play standard calming pink noise
      AudioEngine.play('pink');
      AudioEngine.setVolume('pink', 0.8);
    }
  };

  const stopRescueSound = () => {
    if (targetFreq) {
      AudioEngine.stop('custom');
    } else {
      AudioEngine.stop('pink');
    }
  };

  useEffect(() => {
    if (step === 'breathing') {
      let count = 0;
      const interval = setInterval(() => {
        count++;
        // 4-4-4 Calming Square/Box Breathing rhythm is best under panic
        if (count <= 4) setPhase('Inhala');
        else if (count <= 8) setPhase('Sostén');
        else if (count <= 12) setPhase('Exhala');
        else count = 0;

        setTimeLeft(t => {
          // Cycle messages every 7 seconds
          if (t % 7 === 0) {
            setMessageIndex(prev => (prev + 1) % GROUNDING_MESSAGES.length);
          }

          if (t <= 1) {
            setStep('done');
            stopRescueSound();
            if (currentUser) {
              FirestoreService.updateUserEcos(currentUser.uid, 25); // Resilience rewards
            }
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [step]);

  useEffect(() => {
    return () => {
      stopRescueSound();
    };
  }, []);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="rescue-mode animate-fade">
      {step !== 'breathing' && (
        <button className="rescue-close press-effect" onClick={onClose} aria-label="Cerrar">
          <X size={28} />
        </button>
      )}

      {step === 'input' && (
        <div className="rescue-content input-view">
          <div className="alert-badge">
            <AlertCircle size={16} /> SOS ALIVIO INMEDIATO
          </div>
          <h2 className="title-gradient">¿Cómo te sientes ahora?</h2>
          <p className="subtitle">Usa el slider para registrar el nivel de molestia del acúfeno.</p>
          
          <div className="discomfort-circle" style={{ 
            '--glow-color': discomfort < 4 ? 'var(--primary)' : discomfort < 8 ? 'var(--accent)' : '#FF3B30'
          }}>
            <span className="discomfort-number">{discomfort}</span>
            <span className="discomfort-label">Intensidad</span>
          </div>

          <input 
            type="range" min="1" max="10" 
            value={discomfort} 
            onChange={(e) => setDiscomfort(parseInt(e.target.value))} 
            className="rescue-slider"
            style={{ 
              '--accent-color': discomfort < 4 ? 'var(--primary)' : discomfort < 8 ? 'var(--accent)' : '#FF3B30'
            }}
          />

          <button className="btn-rescue press-effect" onClick={startRescue}>
            Comenzar Calma SOS
          </button>
        </div>
      )}

      {step === 'breathing' && (
        <div className="rescue-content breathing-view">
          <div className="breathing-top-info">
            <h3>Crisis de Acúfeno</h3>
            <p>El sonido {targetFreq ? `de enmascaramiento a ${targetFreq} Hz` : 'rosa terapéutico'} te protege. Sigue la esfera.</p>
          </div>

          {/* Glowing breathing sphere */}
          <div className="breathing-sphere-container">
            <div className={`breathing-glow-ring ${phase.toLowerCase()}`} />
            <div className={`rescue-main-sphere ${phase.toLowerCase()}`}>
              <span className="sphere-phase-text">{phase}</span>
            </div>
          </div>

          {/* Comfort message */}
          <div className="grounding-message-card">
            <p className="grounding-text">{GROUNDING_MESSAGES[messageIndex]}</p>
          </div>

          <div className="rescue-timer-container">
            <Wind size={20} color="#00E5FF" className="pulse-wind" />
            <span className="rescue-timer-text">{formatTime(timeLeft)}</span>
          </div>

          <button className="btn-stop-rescue press-effect" onClick={() => { stopRescueSound(); onClose(); }}>
            Detener e ir al Dashboard
          </button>
        </div>
      )}

      {step === 'done' && (
        <div className="rescue-content done-view">
          <div className="success-icon-container">
            <ShieldCheck size={72} color="#00E5FF" className="glow-success" />
          </div>
          <h2 className="title-gradient">Bucle de Estrés Roto</h2>
          <p className="success-subtitle">Has desactivado las señales de alarma en tu sistema auditivo. ¡Excelente trabajo!</p>
          
          <div className="ecos-reward-badge">
            <span className="gift-emoji">🏆</span>
            <div className="ecos-info">
              <strong>+25 Ecos de Resiliencia</strong>
              <span>Guardados en tu perfil</span>
            </div>
          </div>

          <button className="btn-finish-rescue press-effect" onClick={onClose}>
            Listo, volver al Dashboard
          </button>
        </div>
      )}
    </div>
  );
};
