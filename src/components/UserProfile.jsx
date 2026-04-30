import React, { useState, useEffect, useRef } from 'react';
import { X, User, Phone, Calendar, Mail, Camera, LogOut, FileText, ChevronRight, Shield } from 'lucide-react';
import PrivacyPolicy from './PrivacyPolicy';
import { useAuth } from '../contexts/AuthContext';
import { FirestoreService } from '../services/firestoreService';
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import './UserProfile.css';

const UserProfile = ({ onClose, onOpenDoctorReport, onOpenMedical }) => {
    const { currentUser, logout } = useAuth();
    const [loading, setLoading] = useState(true);
    const [showPrivacy, setShowPrivacy] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Profile Data
    const [profile, setProfile] = useState({
        fullName: currentUser?.displayName || '',
        phone: '',
        dob: '',
        photoURL: currentUser?.photoURL || null
    });

    const fileInputRef = useRef(null);

    useEffect(() => {
        loadProfile();
    }, [currentUser]);

    const loadProfile = async () => {
        if (!currentUser) return;
        try {
            const data = await FirestoreService.getUserProfile(currentUser.uid);
            if (data) {
                setProfile(prev => ({
                    ...prev,
                    fullName: data.fullName || currentUser.displayName || '',
                    phone: data.phone || '',
                    dob: data.dob || '',
                    photoURL: data.photoURL || currentUser.photoURL
                }));
            }
        } catch (e) {
            console.error('Error loading profile:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const storageRef = ref(storage, `avatars/${currentUser.uid}/${file.name}`);
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);

            // Update Auth Profile
            await updateProfile(currentUser, { photoURL: url });

            // Update Firestore Profile
            await FirestoreService.saveUserProfile(currentUser.uid, { photoURL: url });

            setProfile(prev => ({ ...prev, photoURL: url }));
        } catch (error) {
            console.error('Error uploading photo:', error);
            alert('Error al subir la foto');
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Update Auth Display Name if changed
            if (profile.fullName !== currentUser.displayName) {
                await updateProfile(currentUser, { displayName: profile.fullName });
            }

            // Save to Firestore
            await FirestoreService.saveUserProfile(currentUser.uid, {
                fullName: profile.fullName,
                phone: profile.phone,
                dob: profile.dob,
                email: currentUser.email
            });

            alert('Perfil actualizado correctamente ✅');
        } catch (e) {
            console.error('Error saving profile:', e);
            alert('Error al guardar el perfil');
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            onClose();
        } catch (e) {
            console.error('Error logging out:', e);
        }
    };

    return (
        <>
        <div className="profile-overlay animate-fade">
            <div className="profile-modal">
                <header className="profile-header">
                    <h3>Mi Perfil</h3>
                    <button className="close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </header>

                <div className="profile-content">
                    {/* Avatar Section */}
                    <div className="avatar-section">
                        <div className="avatar-wrapper" onClick={() => fileInputRef.current.click()}>
                            {profile.photoURL ? (
                                <img src={profile.photoURL} alt="Avatar" className="profile-img" />
                            ) : (
                                <div className="avatar-placeholder">
                                    {profile.fullName ? profile.fullName.charAt(0).toUpperCase() : 'U'}
                                </div>
                            )}
                            <div className="camera-badge">
                                <Camera size={16} color="white" />
                            </div>
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            hidden
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                        <p className="avatar-hint">{uploading ? 'Subiendo...' : 'Toca para cambiar foto'}</p>
                    </div>

                    {/* Form Section */}
                    <div className="profile-form">
                        <div className="form-group">
                            <label><User size={16} /> Nombre Completo</label>
                            <input
                                type="text"
                                value={profile.fullName}
                                onChange={e => setProfile({ ...profile, fullName: e.target.value })}
                                placeholder="Tu nombre"
                            />
                        </div>

                        <div className="form-group">
                            <label><Mail size={16} /> Correo Electrónico</label>
                            <input
                                type="email"
                                value={currentUser?.email}
                                disabled
                                className="disabled-input"
                            />
                        </div>

                        <div className="form-group">
                            <label><Phone size={16} /> Teléfono</label>
                            <input
                                type="tel"
                                value={profile.phone}
                                onChange={e => setProfile({ ...profile, phone: e.target.value })}
                                placeholder="+57 300 123 4567"
                            />
                        </div>

                        <div className="form-group">
                            <label><Calendar size={16} /> Fecha de Nacimiento</label>
                            <input
                                type="date"
                                value={profile.dob}
                                onChange={e => setProfile({ ...profile, dob: e.target.value })}
                            />
                        </div>

                        <button className="btn btn-primary save-btn" onClick={handleSave} disabled={saving || uploading}>
                            {saving ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>

                    {/* Actions Section */}
                    <div className="profile-actions">
                        <button className="action-row" onClick={onOpenMedical}>
                            <div className="row-left">
                                <div className="icon-bg blue"><FileText size={20} color="#007AFF" /></div>
                                <span>Perfil Médico</span>
                            </div>
                            <ChevronRight size={20} color="#ccc" />
                        </button>

                        <button className="action-row" onClick={onOpenDoctorReport}>
                            <div className="row-left">
                                <div className="icon-bg purple"><FileText size={20} color="#AF52DE" /></div>
                                <span>Reporte para Doctor PDF</span>
                            </div>
                            <ChevronRight size={20} color="#ccc" />
                        </button>

                        <button className="action-row" onClick={() => setShowPrivacy(true)}>
                            <div className="row-left">
                                <div className="icon-bg" style={{ background: '#e8f4fd' }}><Shield size={20} color="#007AFF" /></div>
                                <span>Política de Privacidad</span>
                            </div>
                            <ChevronRight size={20} color="#ccc" />
                        </button>

                        <button className="action-row logout" onClick={handleLogout}>
                            <div className="row-left">
                                <div className="icon-bg red"><LogOut size={20} color="#FF3B30" /></div>
                                <span>Cerrar Sesión</span>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        {showPrivacy && <PrivacyPolicy onClose={() => setShowPrivacy(false)} />}
        </>
    );
};

export default UserProfile;
