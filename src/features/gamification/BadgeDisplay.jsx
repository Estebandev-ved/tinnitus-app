import { motion } from 'framer-motion';

const userBadges = [
  { id: 1, name: 'Primer Meditar', desc: 'Respirar 1 vez', icon: '🧘', locked: false },
  { id: 2, name: 'Lluvia Maestro', desc: 'Escuchar 1 hora', icon: '🌧️', locked: false },
  { id: 3, name: 'Siete Días Cueva', desc: 'Entrar toda semana', icon: '🔥', locked: true }, // Aún no ganar
];

export function BadgeDisplay() {
  return (
    <div style={{ background: '#1E1E1E', padding: '20px', borderRadius: '8px', color: '#E0E0E0' }}>
      <h2>Tus Medallas de Gloria (Gamification)</h2>
      <p style={{ color: '#9E9E9E', marginBottom: '20px' }}>Tú ganar premios por no rendirte al pitido.</p>
      
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        {userBadges.map(b => (
          <motion.div 
            key={b.id}
            whileHover={!b.locked ? { scale: 1.1 } : {}}
            style={{ 
              width: '120px', 
              padding: '15px', 
              textAlign: 'center', 
              borderRadius: '8px',
              background: b.locked ? '#2C3E50' : '#4CA1AF', 
              opacity: b.locked ? 0.5 : 1,
              boxShadow: b.locked ? 'none' : '0 4px 10px rgba(76, 161, 175, 0.3)',
              cursor: b.locked ? 'not-allowed' : 'pointer'
            }}
          >
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>{b.icon}</div>
            <h4 style={{ margin: '0 0 5px 0', fontSize: '14px' }}>{b.name}</h4>
            <span style={{ fontSize: '11px', color: b.locked ? '#9E9E9E' : '#121212' }}>
              {b.locked ? 'Aún escondido' : b.desc}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
