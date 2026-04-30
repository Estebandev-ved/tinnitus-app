import React, { useState, useRef, useEffect } from 'react';
import { Droplet, Timer, Activity, Camera, Check } from 'lucide-react';
import { FirestoreService } from '../services/firestoreService';
import { useAuth } from '../contexts/AuthContext';
import './SideQuests.css';

export const SideQuestsWidget = () => {
  const { currentUser } = useAuth();
  
  // Estado persistente atado al día actual
  const [quests, setQuests] = useState(() => {
    const today = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"
    const saved = localStorage.getItem('tinnitoff_sidequests');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.date === today) return parsed.quests;
      } catch (e) {}
    }
    return { water: false, med: false, posture: false };
  });

  const [medTime, setMedTime] = useState(0);
  const [postureProgress, setPostureProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const holdTimerRef = useRef(null);

  // Guardar en cache cuando cambien las misiones
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem('tinnitoff_sidequests', JSON.stringify({ date: today, quests }));
  }, [quests]);

  const completeQuest = async (id) => {
    if (quests[id]) return;
    setQuests(prev => ({ ...prev, [id]: true }));
    if (currentUser) {
      await FirestoreService.updateUserEcos(currentUser.uid, 5);
    }
  };

  const handleWaterUpload = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      completeQuest('water');
    }
  };

  const startMeditation = () => {
    if (quests.med) return;
    setMedTime(60);
    const interval = setInterval(() => {
      setMedTime(t => {
        if (t <= 1) {
          clearInterval(interval);
          completeQuest('med');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    if (isHolding && !quests.posture) {
      holdTimerRef.current = setInterval(() => {
        setPostureProgress(p => {
          if (p >= 100) {
            clearInterval(holdTimerRef.current);
            completeQuest('posture');
            setIsHolding(false);
            return 100;
          }
          return p + 2; 
        });
      }, 50);
    } else {
      if (holdTimerRef.current) clearInterval(holdTimerRef.current);
      if (!quests.posture) setPostureProgress(0);
    }
    return () => clearInterval(holdTimerRef.current);
  }, [isHolding, quests.posture]);

  return (
    <div className="side-quests-container">
      <div className="sq-header">
        <h3>Misiones Express</h3>
        <span className="sq-reward">+15 Ecos posibles</span>
      </div>
      <div className="quests-grid">
        
        <label className={`quest-btn ${quests.water ? 'done' : ''}`}>
          {quests.water ? <Check size={20} /> : <Camera size={20} />}
          <span>{quests.water ? 'Verificado' : 'Foto al vaso'}</span>
          {!quests.water && (
            <input 
              type="file" 
              accept="image/*" 
              capture="environment" 
              onChange={handleWaterUpload} 
              style={{display: 'none'}} 
            />
          )}
        </label>

        <button className={`quest-btn ${quests.med ? 'done' : ''} ${medTime > 0 ? 'active' : ''}`} onClick={startMeditation}>
          {quests.med ? <Check size={20} /> : <Timer size={20} />}
          <span>{quests.med ? 'Completado' : medTime > 0 ? `${medTime}s` : '60s Relax'}</span>
        </button>

        <button 
          className={`quest-btn hold-btn ${quests.posture ? 'done' : ''}`}
          onMouseDown={() => setIsHolding(true)}
          onMouseUp={() => setIsHolding(false)}
          onMouseLeave={() => setIsHolding(false)}
          onTouchStart={() => setIsHolding(true)}
          onTouchEnd={() => setIsHolding(false)}
        >
          {quests.posture ? <Check size={20} /> : <Activity size={20} />}
          <span>{quests.posture ? 'Postura OK' : 'Mantén 3s'}</span>
          
          {!quests.posture && (
            <div className="hold-progress" style={{height: `${postureProgress}%`}}></div>
          )}
        </button>

      </div>
    </div>
  );
};

export default SideQuestsWidget;
