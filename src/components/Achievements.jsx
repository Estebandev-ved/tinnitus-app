import React, { useEffect, useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { X, Share2, Lock, Gift } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { FirestoreService } from '../services/firestoreService';
import { achievementsData } from '../data/achievementsData';
import { ChestAnimation } from './mechanics/ChestAnimation';
import './Achievements.css';

const Achievements = ({ onClose }) => {
  const { currentUser } = useAuth();
  const [unlockedIds, setUnlockedIds] = useState([]);
  const [activeChest, setActiveChest] = useState(null);
  
  useEffect(() => {
    if (currentUser) {
      FirestoreService.getUserAchievements(currentUser.uid).then(data => {
        setUnlockedIds(data?.unlockedIds || []);
      });
    }
  }, [currentUser]);

  const shareAchievement = (ach) => {
    const text = `¡Acabo de desbloquear '${ach.name}' en TinnitOff! 🔇`;
    if (navigator.share) {
      navigator.share({ text });
    } else {
      navigator.clipboard.writeText(text);
      alert('Copiado al portapapeles');
    }
  };

  const claimAchievement = async (ach) => {
    // Si ya está desbloqueado visualmente, no hacer nada aquí.
    // La "lógica automática" en otros módulos llamará a unlockAchievement y luego el usuario viene aquí a ver los desbloqueados.
    // Pero si el usuario hace clic en uno que según la app ya "cumple" (podríamos tener un array 'claimableIds' a futuro),
    // o para mantener la simulación interactiva como solicitó el usuario ("clic para reclamar el premio de verdad"):
    
    if (unlockedIds.includes(ach.id)) return;
    setActiveChest(ach);
  };

  const handleChestClose = async () => {
    if (activeChest && currentUser) {
      // Reclamar real en BD
      const success = await FirestoreService.unlockAchievement(currentUser.uid, activeChest.id, activeChest.ecos || 10);
      if (success) {
        setUnlockedIds(prev => [...prev, activeChest.id]);
      }
      setActiveChest(null);
    } else {
      setActiveChest(null);
    }
  };

  return (
    <>
      <div className="achievements-modal animate-fade">
        <div className="ach-header">
          <h2>Tus Conquistas</h2>
          <button onClick={onClose} className="close-btn"><X /></button>
        </div>
        <div className="ach-grid">
          {achievementsData.map(ach => {
            const isUnlocked = unlockedIds.includes(ach.id);
            const Icon = LucideIcons[ach.icon] || LucideIcons.Star; // Fallback
            
            return (
              <div 
                key={ach.id} 
                className={`ach-card ${isUnlocked ? 'unlocked' : 'locked'}`}
                onClick={() => claimAchievement(ach)}
                style={{ cursor: isUnlocked ? 'default' : 'pointer' }}
              >
                <div className="ach-emoji-wrapper">
                  <div className="ach-emoji" style={{ color: isUnlocked ? '#E4E4E7' : '#52525B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={32} />
                  </div>
                  {!isUnlocked && <div className="ach-lock-overlay"><Lock size={16} /></div>}
                </div>
                <div className="ach-info">
                  <h3>{ach.name}</h3>
                  <p className="ach-desc">{ach.desc}</p>
                  <div className="ach-reward">
                    <Gift size={14} className="reward-icon" />
                    <span>{ach.rewardText}</span>
                  </div>
                </div>
                {isUnlocked && (
                  <button className="share-btn" onClick={(e) => { e.stopPropagation(); shareAchievement(ach); }}>
                    <Share2 size={16} /> Compartir
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {activeChest && (
        <ChestAnimation 
          rewardText={activeChest.rewardText}
          ecos={activeChest.ecos}
          onClose={handleChestClose} 
        />
      )}
    </>
  );
};
export default Achievements;

