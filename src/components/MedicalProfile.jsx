import React, { useState, useEffect } from 'react';
import { X, User, Stethoscope, Pill, Clock, Save, Ear } from 'lucide-react';
import { FirestoreService } from '../services/firestoreService';
import { useAuth } from '../contexts/AuthContext';
import './MedicalProfile.css';

const MedicalProfile = ({ onClose }) => {
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [profile, setProfile] = useState({
        yearsWithTinnitus: '',
        ear: 'ambos', // izquierdo, derecho, ambos
        medications: '',
        doctorName: '',
        notes: '',
    });

    const [lastAudiometry, setLastAudiometry] = useState(null);

    useEffect(() => {
        const load = async () => {
            if (currentUser) {
                try {
                    const data = await FirestoreService.getMedicalProfile(currentUser.uid);
                    if (data) setProfile(prev => ({ ...prev, ...data }));

                    const audioData = await FirestoreService.getLastAudiometry(currentUser.uid);
                    if (audioData) setLastAudiometry(audioData);
                } catch (e) {
                    console.error('Error loading profile:', e);
                }
            }
            setLoading(false);
        };
        load();
    }, [currentUser]);

    const handleSave = async () => {
        setSaving(true);
        try {
            if (currentUser) {
                await FirestoreService.saveMedicalProfile(currentUser.uid, profile);
                alert('Perfil médico guardado ✅');
                onClose();
            }
        } catch (e) {
            console.error('Error saving profile:', e);
            alert('Error al guardar: ' + e.message);
        } finally {
            setSaving(false);
        }
    };

    const update = (field, value) => {
        setProfile(prev => ({ ...prev, [field]: value }));
    };

    if (loading) return null;

    return (
        <div className="medical-overlay animate-fade">
            <div className="medical-modal">
                <header className="medical-header">
                    <h3>Perfil Médico</h3>
                    <button className="close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </header>

                <div className="medical-content">
                    {lastAudiometry && (
                        <div className="medical-card highlight-card primary">
                            <div className="medical-label" style={{ color: 'white', opacity: 0.9 }}>
                                <Ear size={18} />
                                <span>Última Acufenometría</span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px', color: 'white' }}>
                                <div>
                                    <span style={{ fontSize: '12px', opacity: 0.8 }}>Frecuencia</span>
                                    <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{lastAudiometry.frequency} Hz</div>
                                </div>
                                <div>
                                    <span style={{ fontSize: '12px', opacity: 0.8 }}>Tipo de Sonido</span>
                                    <div style={{ fontSize: '18px', fontWeight: '500', marginTop: '4px' }}>
                                        {lastAudiometry.type === 'pure' ? 'Pito/Silbido' : lastAudiometry.type === 'low' ? 'Motor' : 'Ruido'}
                                    </div>
                                </div>
                                <div style={{ gridColumn: 'span 2' }}>
                                    <span style={{ fontSize: '12px', opacity: 0.8 }}>Intensidad (Volumen)</span>
                                    <div style={{ fontSize: '16px', fontWeight: '500' }}>{lastAudiometry.volume}%</div>
                                </div>
                                <div style={{ gridColumn: 'span 2' }}>
                                    <span style={{ fontSize: '12px', opacity: 0.8 }}>Oído Afectado</span>
                                    <div style={{ fontSize: '16px', fontWeight: '500' }}>
                                        {lastAudiometry.ear === 'left' ? 'Izquierdo' : lastAudiometry.ear === 'right' ? 'Derecho' : 'Ambos'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="medical-card">
                        <div className="medical-label">
                            <Clock size={18} color="#007AFF" />
                            <span>Años con tinnitus</span>
                        </div>
                        <input
                            type="number"
                            min="0"
                            max="80"
                            placeholder="Ej: 3"
                            value={profile.yearsWithTinnitus}
                            onChange={(e) => update('yearsWithTinnitus', e.target.value)}
                            className="medical-input"
                        />
                    </div>



                    <div className="medical-card">
                        <div className="medical-label">
                            <Pill size={18} color="#007AFF" />
                            <span>Medicamentos actuales</span>
                        </div>
                        <textarea
                            placeholder="Ej: Alprazolam 0.25mg, Melatonina..."
                            value={profile.medications}
                            onChange={(e) => update('medications', e.target.value)}
                            className="medical-textarea"
                            rows={3}
                        />
                    </div>

                    <div className="medical-card">
                        <div className="medical-label">
                            <Stethoscope size={18} color="#007AFF" />
                            <span>Nombre de tu doctor</span>
                        </div>
                        <input
                            type="text"
                            placeholder="Dr. García"
                            value={profile.doctorName}
                            onChange={(e) => update('doctorName', e.target.value)}
                            className="medical-input"
                        />
                    </div>

                    <div className="medical-card">
                        <div className="medical-label">
                            <User size={18} color="#007AFF" />
                            <span>Notas personales</span>
                        </div>
                        <textarea
                            placeholder="Cualquier información relevante..."
                            value={profile.notes}
                            onChange={(e) => update('notes', e.target.value)}
                            className="medical-textarea"
                            rows={3}
                        />
                    </div>
                </div>

                <footer className="medical-footer">
                    <button className="btn btn-primary full-width" onClick={handleSave} disabled={saving}>
                        {saving ? 'Guardando...' : 'Guardar Perfil'} <Save size={18} />
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default MedicalProfile;
