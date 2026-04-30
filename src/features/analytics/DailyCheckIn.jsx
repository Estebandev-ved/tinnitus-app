import { useState } from 'react';

export function DailyCheckIn() {
  const [volume, setVolume] = useState(5);
  const [stress, setStress] = useState(5);

  const saveLog = () => {
    // Agente 6 (Firebase) guarda esto luego
    console.log('Guardar en cueva:', { volume, stress, date: new Date() });
    alert('¡Dato guardado! Tú hacer bien.');
  };

  return (
    <div style={{ background: '#1E1E1E', color: '#E0E0E0', padding: '20px', borderRadius: '8px' }}>
      <h2>Registro Diario (Check-in)</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <label>¿Qué tan fuerte pitar oído hoy? ({volume}/10)</label>
        <input 
          type="range" min="1" max="10" value={volume} 
          onChange={(e) => setVolume(e.target.value)}
          style={{ width: '100%', accentColor: '#E57373' }} 
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label>¿Qué tan estresado tú estar? ({stress}/10)</label>
        <input 
          type="range" min="1" max="10" value={stress} 
          onChange={(e) => setStress(e.target.value)}
          style={{ width: '100%', accentColor: '#FFB74D' }} 
        />
      </div>

      <button onClick={saveLog} style={{ background: '#81C784', color: '#121212', padding: '10px 20px', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
        Guardar Día
      </button>
    </div>
  );
}
