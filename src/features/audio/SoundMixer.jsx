import { useState } from 'react';
import { useAudio } from './AudioContext';

export function SoundMixer() {
  const { isPlaying, togglePlay } = useAudio();
  const [sounds, setSounds] = useState([
    { id: 'rain', name: 'Lluvia Fuerte', vol: 0.8 },
    { id: 'brown_noise', name: 'Ruido Marrón', vol: 0.5 },
    { id: 'wind', name: 'Viento Suave', vol: 0.2 }
  ]);

  const handleVol = (id, newVol) => {
    setSounds(sounds.map(s => s.id === id ? { ...s, vol: newVol } : s));
    // Agente 2 manda volumen al Nodo (Gain)
  };

  return (
    <div className="mixer-panel" style={{ background: '#1E1E1E', color: '#E0E0E0', padding: '20px', borderRadius: '8px' }}>
      <h2>Mezclador de Sonidos</h2>
      <button onClick={togglePlay} style={{ background: '#4CA1AF', padding: '10px', border: 'none', borderRadius: '4px', cursor: 'pointer', color: 'white', marginBottom: '20px' }}>
        {isPlaying ? 'Parar Magia' : 'Iniciar Magia'}
      </button>

      {sounds.map(s => (
        <div key={s.id} style={{ marginBottom: '15px' }}>
          <label>{s.name}</label>
          <input 
            type="range" 
            min="0" max="1" step="0.05" 
            value={s.vol} 
            onChange={(e) => handleVol(s.id, parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: '#4CA1AF' }}
          />
        </div>
      ))}
    </div>
  );
}
