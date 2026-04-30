import React, { useState, useEffect } from 'react';
import { X, Play, CheckCircle, Lock, Clock } from 'lucide-react';
import { SessionPlayer } from '../components/SessionPlayer';
import { useAuth } from '../contexts/AuthContext';
import { FirestoreService } from '../services/firestoreService';
import { sessionProgram } from '../data/sessionProgram';
import './GuidedSessions.css';

const GuidedSessions = ({ onClose, openBreathing }) => {
  const { currentUser } = useAuth();
  const [progress, setProgress] = useState({ completedDays: [], totalXp: 0, lastCompletedDate: null });
  const [activeSession, setActiveSession] = useState(null);
  const [hoursToNext, setHoursToNext] = useState(0);

  useEffect(() => {
    if (currentUser) {
      FirestoreService.getSessionProgress(currentUser.uid).then(p => {
        if (p) {
          setProgress(p);
          
          if (p.lastCompletedDate) {
            const lastDate = new Date(p.lastCompletedDate);
            const now = new Date();
            const diffHours = Math.floor((now - lastDate) / (1000 * 60 * 60));
            setHoursToNext(24 - diffHours);
          }
        }
      });
    }
  }, [currentUser]);

  const handleStartSession = (dayNum) => {
    const sessionData = sessionProgram.find(s => s.day === dayNum);
    setActiveSession(sessionData);
  };

  const handleSessionComplete = () => {
    if (currentUser && activeSession) {
        FirestoreService.saveSessionProgress(currentUser.uid, activeSession.day, activeSession.steps.length, 50);
        setProgress(prev => ({
          ...prev, 
          completedDays: [...prev.completedDays, activeSession.day],
          totalXp: prev.totalXp + 50,
          lastCompletedDate: new Date().toISOString()
        }));
        setHoursToNext(24);
        
        // Solicitar permiso para notificar mañana
        if ('Notification' in window && Notification.permission !== 'granted') {
          Notification.requestPermission();
        }
    }
    setActiveSession(null);
  };

  if (activeSession) {
    return <SessionPlayer 
      sessionData={activeSession} 
      onClose={() => setActiveSession(null)} 
      onComplete={handleSessionComplete} 
    />;
  }

  return (
    <div className="guided-modal animate-fade">
      <div className="gs-header">
        <h2>Programa 30 Días</h2>
        <div className="xp-badge" style={{background: 'rgba(52, 199, 89, 0.2)', color: '#34C759'}}>
          🌱 {progress.totalXp} Ecos
        </div>
        <button onClick={onClose} className="close-btn"><X /></button>
      </div>
      
      {/* Barra de Carga Neuronal */}
      <div style={{ margin: '0 20px 20px', background: 'rgba(255,255,255,0.05)', padding: 15, borderRadius: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 8, opacity: 0.8, textTransform: 'uppercase' }}>
          <span>Carga de Red Neuronal</span>
          <span>{Math.round((progress.completedDays.length / 30) * 100)}%</span>
        </div>
        <div style={{ height: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ width: `${(progress.completedDays.length / 30) * 100}%`, height: '100%', background: '#5856D6', transition: 'width 1s ease-out' }}></div>
        </div>
      </div>

      <div className="gs-content">
        <div className="calendar-grid">
          {sessionProgram.map(s => {
            const isCompleted = progress.completedDays.includes(s.day);
            const isNextDay = s.day === 1 ? !isCompleted : (progress.completedDays.includes(s.day - 1) && !isCompleted);
            
            // Si es el siguiente día, revisar si pasaron 24h
            let isTimeLocked = false;
            if (isNextDay && progress.lastCompletedDate) {
              const lastDate = new Date(progress.lastCompletedDate);
              const now = new Date();
              const diffHours = (now - lastDate) / (1000 * 60 * 60);
              if (diffHours < 24) {
                 isTimeLocked = true;
              }
            }

            const isLocked = s.day > 1 && !progress.completedDays.includes(s.day - 1);
            
            return (
              <div 
                key={s.day} 
                className={`day-card ${isCompleted ? 'completed' : (isLocked || isTimeLocked) ? 'locked' : 'pending'}`} 
                onClick={() => !isCompleted && !isLocked && !isTimeLocked && handleStartSession(s.day)}
              >
                <span className="day-number">Día {s.day}</span>
                <h3>
                  {isLocked ? 'Bloqueado' : s.title}
                  {isTimeLocked && <div style={{fontSize: 12, color: '#FF9500', marginTop: 4}}><Clock size={12} style={{verticalAlign: 'middle', marginRight: 4}}/>Vuelve en {hoursToNext > 0 ? hoursToNext : '< 1'} horas</div>}
                </h3>
                {isCompleted ? <CheckCircle color="#34C759" size={24} /> : 
                 (isLocked || isTimeLocked) ? <Lock color="#666" size={24} /> : 
                 <Play color="#5856D6" size={24} />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
export default GuidedSessions;
