import React, { useState, useEffect } from 'react';
import { Gift, X } from 'lucide-react';
import './ChestAnimation.css';

export const ChestAnimation = ({ rewardText, ecos, onClose }) => {
  const [stage, setStage] = useState('closed'); // 'closed' -> 'opening' -> 'opened'

  useEffect(() => {
    // Auto-open after 1s
    const timer1 = setTimeout(() => setStage('opening'), 1000);
    const timer2 = setTimeout(() => setStage('opened'), 2000);
    return () => { clearTimeout(timer1); clearTimeout(timer2); };
  }, []);

  return (
    <div className="chest-overlay animate-fade">
      <div className={`chest-container ${stage}`}>
        
        {stage === 'opened' && (
          <button className="close-chest-btn" onClick={onClose}>
            <X size={24} />
          </button>
        )}

        <div className={`chest-box ${stage}`}>
          <Gift size={64} className="chest-icon" />
        </div>

        {stage === 'opened' && (
          <div className="reward-reveal animate-slide-up">
            <h2 className="text-2xl font-bold text-yellow-400 mb-2">¡Logro Desbloqueado!</h2>
            <div className="reward-item bg-gray-800 border border-yellow-500/30 p-4 rounded-xl mb-4">
              <span className="text-xl block mb-2">{rewardText}</span>
              <span className="text-yellow-400 font-bold block">+{ecos} Ecos añadidos a tu cuenta</span>
            </div>
            <button className="bg-yellow-500 text-black font-bold py-3 px-8 rounded-xl w-full" onClick={onClose}>
              Reclamar
            </button>
          </div>
        )}

        {stage !== 'opened' && (
          <p className="text-gray-400 mt-8 animate-pulse">Abriendo recompensa...</p>
        )}

      </div>
    </div>
  );
};
