import React, { useState, useEffect } from 'react';
import { X, Heart, UserCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { FirestoreService } from '../services/firestoreService';
import { LinkFlow } from './caregiver/LinkFlow';
import { PatientDashboardBadge } from './caregiver/PatientDashboardBadge';
import { CaregiverPanel } from './caregiver/CaregiverPanel';
import { StatusBanner } from './caregiver/StatusBanner';
import { QuickReactions } from './caregiver/QuickReactions';
import { SharedDiary } from './caregiver/SharedDiary';
import { ProgressChart } from './caregiver/ProgressChart';
import './CaregiverMode.css';

const CaregiverMode = ({ onClose }) => {
  const { currentUser } = useAuth();
  const [role, setRole] = useState(null);
  const [hasCaregiver, setHasCaregiver] = useState(false);
  const [patientStatus] = useState('yellow'); // 'green' | 'yellow' | 'red'

  useEffect(() => {
    if (currentUser) {
      FirestoreService.getCaregiverLinks?.(currentUser.uid).then(links => {
        setHasCaregiver(!!(links && links.length > 0));
      }).catch(() => {});
    }
  }, [currentUser]);

  const goBack = () => setRole(null);

  /* ─── ROLE SELECTION ─── */
  if (!role) return (
    <div className="caregiver-wrapper">
      <div className="caregiver-container">
        <header className="cg-header">
          <h2>Modo Cuidador <Heart size={22} color="#FF2D55" style={{ verticalAlign: 'middle' }} /></h2>
          <button onClick={onClose} className="cg-close-btn"><X size={20} /></button>
        </header>
        <div className="view-header" style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h3>¿Cómo usas TinnitOff hoy?</h3>
          <p>Selecciona tu rol para continuar</p>
        </div>
        <div className="role-grid">
          <div className="role-card" onClick={() => setRole('patient')}>
            <div className="role-icon-wrapper"><UserCircle size={32} color="#007AFF" /></div>
            <h3>Soy Paciente</h3>
            <p>Comparte tu progreso y recibe apoyo de tu familia o médico.</p>
          </div>
          <div className="role-card" onClick={() => setRole('caregiver')}>
            <div className="role-icon-wrapper"><Heart size={32} color="#FF2D55" /></div>
            <h3>Soy Cuidador</h3>
            <p>Acompaña y monitorea el bienestar de tu ser querido.</p>
          </div>
        </div>
      </div>
    </div>
  );

  /* ─── PATIENT VIEW ─── */
  if (role === 'patient') return (
    <div className="caregiver-wrapper">
      <div className="caregiver-container">
        <header className="cg-header">
          <button className="cg-back-btn" onClick={goBack}>← Volver</button>
          <button onClick={onClose} className="cg-close-btn"><X size={20} /></button>
        </header>
        <div className="view-header">
          <h3>Tu Respaldo Digital</h3>
          <p>Gestiona tu red de apoyo.</p>
        </div>
        <div className="glass-card" style={{ marginBottom: '1rem' }}>
          <LinkFlow />
        </div>
        {hasCaregiver && (
          <div className="glass-card">
            <PatientDashboardBadge caregiverName="Tu Cuidador" />
          </div>
        )}
      </div>
    </div>
  );

  /* ─── CAREGIVER VIEW ─── */
  return (
    <div className="caregiver-wrapper">
      <div className="caregiver-container" style={{ maxWidth: 680 }}>
        <header className="cg-header">
          <button className="cg-back-btn" onClick={goBack}>← Volver</button>
          <button onClick={onClose} className="cg-close-btn"><X size={20} /></button>
        </header>

        {/* Traffic light alert */}
        <StatusBanner status={patientStatus} />

        {/* Progress chart */}
        <div className="glass-card" style={{ marginBottom: '1rem' }}>
          <ProgressChart />
        </div>

        {/* Quick Reactions */}
        <div className="glass-card" style={{ marginBottom: '1rem' }}>
          <QuickReactions patientName="Tu Paciente" />
        </div>

        {/* Shared Diary */}
        <div className="glass-card" style={{ marginBottom: '1rem' }}>
          <SharedDiary />
        </div>

        {/* Classic panel stats */}
        <div className="glass-card">
          <CaregiverPanel patientName="Tu Paciente" />
        </div>
      </div>
    </div>
  );
};

export default CaregiverMode;
