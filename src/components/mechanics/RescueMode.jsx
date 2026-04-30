import React, { useState, useEffect } from 'react';
import { X, Heart, Wind, ShieldCheck } from 'lucide-react';
import { AudioEngine } from '../../utils/audioEngine';
import { FirestoreService } from '../../services/firestoreService';
import { useAuth } from '../../contexts/AuthContext';
import './RescueMode.css';

export const RescueMode = ({ onClose }) => {
  const { currentUser } = useAuth();
  const [step, setStep] = useState('input'); // input, breathing, done
  const [discomfort, setDiscomfort] = useState(5);
  const [phase, setPhase] = useState('Inhala');
  const [timeLeft, setTimeLeft] = useState(300);

  const startRescue = () => {
    setStep('breathing');
    AudioEngine.play('pink');
    AudioEngine.setVolume('pink', 0.6); // Mascaramiento envolvente
  };

  useEffect(() => {
    if (step === 'breathing') {
      let count = 0;
      const interval = setInterval(() => {
        count++;
        if (count <= 4) setPhase('Inhala');
        else if (count <= 11) setPhase('Sostén');
        else if (count <= 19) setPhase('Exhala');
        else count = 0;
        
        setTimeLeft(t => {
          if (t <= 1) {
            setStep('done');
            AudioEngine.stop('pink');
            if (currentUser) FirestoreService.updateUserEcos(currentUser.uid, 20); // Recompensa por resiliencia
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [step]);

  useEffect(() => {
    return () => { AudioEngine.stop('pink'); };
  }, []);

  return (
    <div className="rescue-mode animate-fade">
      {step !== 'breathing' && <button className="rescue-close" onClick={onClose}><X size={32}/></button>}
      
      {step === 'input' && (
        <div className="rescue-content">
          <Heart size={64} color="#FF3B30" className="rescue-icon-static" />
          <h2>SOS - Modo Rescate</h2>
          <p>¿Qué tan fuerte es la molestia ahora mismo?</p>
          <div style={{fontSize: 48, fontWeight: 'bold', margin: '20px 0'}}>{discomfort}/10</div>
          <input 
            type="range" min="1" max="10" 
            value={discomfort} 
            onChange={(e) => setDiscomfort(e.target.value)} 
            style={{width: '100%', maxWidth: '300px', accentColor: '#FF3B30', marginBottom: 40}}
          />
          <button onClick={startRescue} style={{background: '#FF3B30', color: '#fff', border: 'none', padding: '15px 40px', borderRadius: 30, fontSize: 18, fontWeight: 'bold', cursor: 'pointer'}}>
            Iniciar Rescate (5 Min)
          </button>
        </div>
      )}

      {step === 'breathing' && (
        <div className="rescue-content">
          <h2>Respira con la guía</h2>
          <p style={{opacity: 0.7}}>Concéntrate en el centro. El ruido rosa te protege.</p>
          <div className={`rescue-circle ${phase.toLowerCase()}`}>
            <Wind size={40} color="white" />
            <span className="rescue-phase">{phase}</span>
          </div>
          <div className="rescue-timer">
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </div>
        </div>
      )}

      {step === 'done' && (
        <div className="rescue-content">
          <ShieldCheck size={64} color="#34C759" />
          <h2>Crisis Superada</h2>
          <p>Tu cerebro recuperó el control de tu sistema nervioso.</p>
          <div style={{color: '#FFD700', fontWeight: 'bold', margin: '20px 0', fontSize: 24}}>+20 Ecos (Resiliencia)</div>
          <button onClick={onClose} style={{background: '#34C759', color: '#fff', border: 'none', padding: '15px 40px', borderRadius: 30, fontSize: 18, fontWeight: 'bold', cursor: 'pointer'}}>
            Volver
          </button>
        </div>
      )}
    </div>
  );
};
