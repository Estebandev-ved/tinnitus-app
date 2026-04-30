import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function BreathingPacer() {
  const [phase, setPhase] = useState('Inhalar'); // Inhalar, Aguantar, Exhalar
  
  useEffect(() => {
    const cycle = setInterval(() => {
      setPhase((prev) => {
        if (prev === 'Inhalar') return 'Aguantar';
        if (prev === 'Aguantar') return 'Exhalar';
        return 'Inhalar';
      });
    }, 4000); // 4 segundos por fase
    
    return () => clearInterval(cycle);
  }, []);

  const getScale = () => {
    if (phase === 'Inhalar') return 1.5;
    if (phase === 'Aguantar') return 1.5;
    return 1;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px', background: '#121212', color: '#E0E0E0', borderRadius: '12px' }}>
      <h2 style={{ marginBottom: '40px' }}>Respirar para Calmar (TCC)</h2>
      
      <motion.div
        animate={{ scale: getScale() }}
        transition={{ duration: 4, ease: "easeInOut" }}
        style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: '#4CA1AF', // Color relajante (Agente 5)
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          boxShadow: '0 0 20px rgba(76, 161, 175, 0.4)'
        }}
      >
        <span style={{ fontWeight: 'bold', fontSize: '1.2rem', textShadow: '1px 1px 2px black' }}>
          {phase}
        </span>
      </motion.div>
      
      <p style={{ marginTop: '40px', color: '#9E9E9E' }}>Sigue el círculo. Lento y suave.</p>
    </div>
  );
}
