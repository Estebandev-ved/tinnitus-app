import React, { useState, useEffect } from 'react';
import { Heart, Activity, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { FirestoreService } from '../services/firestoreService';
import './CaregiverMode.css'; // Reusing some CSS for brevity

const CaregiverDashboard = () => {
  const { currentUser } = useAuth();
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    if (currentUser) {
      FirestoreService.getCaregiverPatients(currentUser.uid).then(p => setPatients(p || []));
    }
  }, [currentUser]);

  return (
    <div className="caregiver-dashboard">
      <h2>Panel de Cuidador <Heart size={20} color="#FF2D55" /></h2>
      {patients.length === 0 ? (
        <p>No tienes pacientes asignados. Ingresa un código de paciente para comenzar.</p>
      ) : (
        patients.map((p, i) => (
          <div key={i} className="patient-card">
            <div className="p-header">
              <h3>{p.name || `Paciente ${i+1}`}</h3>
              <span className={`status ${p.todayLevel > 70 ? 'alert' : ''}`}>
                Tinnitus: {p.todayLevel || '-'}
              </span>
            </div>
            <div className="p-stats">
              <span><Activity size={16}/> Racha: {p.streak}🔥</span>
              <span><Calendar size={16}/> Último: {p.lastEntry || 'Hoy'}</span>
            </div>
            <button className="encourage-btn">Enviar Ánimo 💌</button>
          </div>
        ))
      )}
    </div>
  );
};
export default CaregiverDashboard;
