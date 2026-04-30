import React, { useState, useEffect, useRef } from 'react';
import { AudioEngine } from '../../utils/audioEngine';
import './Mechanics.css';

export const MezcladorMechanic = ({ onComplete }) => {
  const [tinnitusVol, setTinnitusVol] = useState(50);
  const [bgVol, setBgVol] = useState(0);
  const [isMixed, setIsMixed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const completedRef = useRef(false);

  const handleStart = () => {
    setIsPlaying(true);
    AudioEngine.playCustomNoise(6000); // Simulador tinnitus 6kHz
    AudioEngine.play('pink'); // Ruido Rosa de fondo
  };
  
  useEffect(() => {
    if (isPlaying) {
      AudioEngine.setVolume('custom', tinnitusVol / 150); // Mantenlo bajito para no lastimar
      AudioEngine.setVolume('pink', bgVol / 100);

      // Si el ruido rosa tapa el tinnitus o lo "emborrona" (diferencia de -15 a +15 pts)
      if (bgVol > 0 && bgVol >= tinnitusVol - 15 && bgVol <= tinnitusVol + 15) {
        if (!completedRef.current) {
            completedRef.current = true;
            setIsMixed(true);
            setTimeout(() => {
              AudioEngine.stop('custom');
              AudioEngine.stop('pink');
              onComplete();
            }, 3000); // 3 segundos para celebrar antes de pasar
        }
      }
    }
  }, [tinnitusVol, bgVol, isPlaying]);

  useEffect(() => {
    return () => {
        AudioEngine.stop('custom');
        AudioEngine.stop('pink');
    };
  }, []);

  return (
    <div className="mechanic-container">
      <h2 className="mechanic-title">El Mezclador</h2>
      <p className="mechanic-desc">Encuentra el "Punto de Mezcla": Sube el Ruido Rosa hasta que el zumbido artificial empiece a volverse borroso en el fondo. No lo tapes al 100%.</p>
      
      {!isPlaying ? (
         <button onClick={handleStart} style={{ padding: '15px 30px', background: '#5856D6', color: '#fff', border: 'none', borderRadius: 8, fontSize: 18, cursor: 'pointer', marginBottom: 20 }}>
           ▶️ Empezar Prueba de Audio
         </button>
      ) : (
        <>
          <div className="slider-group">
            <label>🔊 Zumbido Artificial</label>
            <input type="range" min="0" max="100" value={tinnitusVol} onChange={e => setTinnitusVol(Number(e.target.value))} />
          </div>
          
          <div className="slider-group">
            <label>🌧️ Ruido Rosa (Fondo)</label>
            <input type="range" min="0" max="100" value={bgVol} onChange={e => setBgVol(Number(e.target.value))} />
          </div>

          {isMixed && (
            <div style={{ color: '#34C759', fontWeight: 'bold', marginTop: '20px' }}>
              ¡Punto de Mezcla encontrado! Mantén la escucha...
            </div>
          )}
        </>
      )}
    </div>
  );
};
