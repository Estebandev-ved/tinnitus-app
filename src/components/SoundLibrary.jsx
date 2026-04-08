import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, CloudRain, Wind, Waves, Coffee, ChevronLeft, Plus, Upload, X, Moon, Timer } from 'lucide-react';
import { AudioEngine } from '../utils/audioEngine';
import './SoundLibrary.css';
import soundLibraryIllustration from '../assets/illustrations/sound_library.png';
import { useAuth } from '../contexts/AuthContext';
import { FirestoreService } from '../services/firestoreService';

const INITIAL_SOUNDS = [
    { id: 'white', name: 'Ruido Blanco', icon: <Volume2 />, color: '#A0A0A0', type: 'noise' },
    { id: 'pink', name: 'Ruido Rosa', icon: <Volume2 />, color: '#FFC0CB', type: 'noise' },
    { id: 'rain', name: 'Lluvia Suave', icon: <CloudRain />, color: '#007AFF', type: 'nature' },
    { id: 'ocean', name: 'Olas del Mar', icon: <Waves />, color: '#5AC8FA', type: 'nature' },
    { id: 'fan', name: 'Ventilador', icon: <Wind />, color: '#8E8E93', type: 'home' },
    { id: 'cafe', name: 'Café', icon: <Coffee />, color: '#FF9500', type: 'home' }
];

const SoundLibrary = ({ onClose, isAdmin }) => {
    const { currentUser } = useAuth();
    const [sounds, setSounds] = useState(INITIAL_SOUNDS);
    // Track active sounds: { id: volume (0-1) }
    const [activeSounds, setActiveSounds] = useState({});

    // Saved Mixes State
    const [savedMixes, setSavedMixes] = useState([]);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [newMixName, setNewMixName] = useState('');

    // Sleep Timer State
    const [sleepTimer, setSleepTimer] = useState(null); // remaining seconds
    const [sleepInterval, setSleepInterval] = useState(null);
    const [showTimerPicker, setShowTimerPicker] = useState(false);

    // Admin State
    const [showUpload, setShowUpload] = useState(false);
    const [newSoundName, setNewSoundName] = useState('');
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (currentUser) {
            loadMixes();
        }
    }, [currentUser]);

    const loadMixes = async () => {
        const mixes = await FirestoreService.getSoundscapes(currentUser.uid);
        setSavedMixes(mixes);
    };

    const toggleSound = (sound) => {
        // ... (existing logic)
        if (activeSounds[sound.id]) {
            AudioEngine.stop(sound.id);
            const newActive = { ...activeSounds };
            delete newActive[sound.id];
            setActiveSounds(newActive);
        } else {
            AudioEngine.play(sound.id);
            setActiveSounds(prev => ({ ...prev, [sound.id]: 0.5 }));
        }
    };

    const handleVolumeChange = (soundId, value) => {
        const vol = parseFloat(value);
        setActiveSounds(prev => ({ ...prev, [soundId]: vol }));
        AudioEngine.setVolume(soundId, vol);
    };

    const stopAll = () => {
        AudioEngine.stop();
        setActiveSounds({});
        cancelSleepTimer();
    };

    // Sleep Timer Logic
    const startSleepTimer = (minutes) => {
        cancelSleepTimer();
        setShowTimerPicker(false);
        let remaining = minutes * 60;
        setSleepTimer(remaining);

        const fadeStartSec = 30; // Start fading 30s before end

        const interval = setInterval(() => {
            remaining--;
            setSleepTimer(remaining);

            if (remaining === fadeStartSec) {
                AudioEngine.fadeOutAll(fadeStartSec * 1000, () => {
                    setActiveSounds({});
                    setSleepTimer(null);
                });
            }

            if (remaining <= 0) {
                clearInterval(interval);
                setSleepTimer(null);
                setSleepInterval(null);
            }
        }, 1000);

        setSleepInterval(interval);
    };

    const cancelSleepTimer = () => {
        if (sleepInterval) {
            clearInterval(sleepInterval);
            setSleepInterval(null);
        }
        setSleepTimer(null);
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const handleSaveMix = async (e) => {
        e.preventDefault();
        if (!newMixName.trim()) return;

        try {
            await FirestoreService.saveSoundscape(currentUser.uid, newMixName, activeSounds);
            setNewMixName('');
            setShowSaveModal(false);
            loadMixes();
            alert('¡Mezcla guardada!');
        } catch (error) {
            alert('Error al guardar');
        }
    };

    const handleLoadMix = (mix) => {
        stopAll();
        setTimeout(() => {
            // Restore sounds
            Object.entries(mix.sounds).forEach(([id, vol]) => {
                AudioEngine.play(id);
                AudioEngine.setVolume(id, vol);
            });
            setActiveSounds(mix.sounds);
        }, 100);
    };

    const handleDeleteMix = async (mixId, e) => {
        e.stopPropagation();
        if (confirm('¿Borrar esta mezcla?')) {
            await FirestoreService.deleteSoundscape(currentUser.uid, mixId);
            loadMixes();
        }
    };

    // Cleanup on unmount? Maybe not, allow background play? 
    // For now, let's keep playing even if closed, to allow mixing while chatting.
    // users can stop from the library.

    return (
        <div className="library-container animate-fade">
            <header className="library-header">
                <button className="back-btn" onClick={onClose}>
                    <ChevronLeft />
                </button>
                <h3>Mezclador</h3>
                <div className="header-actions">
                    {Object.keys(activeSounds).length > 0 && (
                        <>
                            <button className="timer-btn" onClick={() => setShowTimerPicker(!showTimerPicker)}>
                                <Moon size={18} />
                            </button>
                            <button className="save-mix-btn" onClick={() => setShowSaveModal(true)}>
                                Guardar
                            </button>
                            <button className="stop-all-btn" onClick={stopAll}>
                                <X size={20} />
                            </button>
                        </>
                    )}
                </div>
            </header>

            <img src={soundLibraryIllustration} alt="" className="feature-illustration" />

            {/* Sleep Timer UI */}
            {sleepTimer !== null && (
                <div className="sleep-timer-bar">
                    <Moon size={16} />
                    <span>Apagado en <strong>{formatTime(sleepTimer)}</strong></span>
                    <button className="cancel-timer-btn" onClick={cancelSleepTimer}>
                        <X size={14} />
                    </button>
                </div>
            )}

            {showTimerPicker && (
                <div className="timer-picker">
                    <span className="picker-label">Temporizador de Sueño</span>
                    <div className="timer-options">
                        {[15, 30, 60, 90].map(m => (
                            <button key={m} className="timer-option" onClick={() => startSleepTimer(m)}>
                                {m} min
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Saved Mixes Section */}
            {savedMixes.length > 0 && (
                <div className="mixes-section">
                    <h4>Mis Mezclas</h4>
                    <div className="mixes-scroll">
                        {savedMixes.map(mix => (
                            <div key={mix.id} className="mix-chip" onClick={() => handleLoadMix(mix)}>
                                <span>{mix.name}</span>
                                <button className="delete-mix-btn" onClick={(e) => handleDeleteMix(mix.id, e)}>
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Save Modal */}
            {showSaveModal && (
                <div className="upload-modal-overlay">
                    <div className="upload-modal card animate-fade">
                        <h4>Guardar Mezcla</h4>
                        <form onSubmit={handleSaveMix}>
                            <input
                                type="text"
                                placeholder="Nombre (ej: Dormir)"
                                value={newMixName}
                                onChange={e => setNewMixName(e.target.value)}
                                className="input-field"
                                autoFocus
                            />
                            <div className="modal-actions">
                                <button type="button" className="btn btn-ghost" onClick={() => setShowSaveModal(false)}>Cancelar</button>
                                <button type="submit" className="btn btn-primary">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Admin Upload Modal Logic Omitted for Brevity - Keeping it if needed later but focusing on Mixer UI */}

            <div className="sounds-grid">
                {sounds.map(sound => {
                    const isActive = !!activeSounds[sound.id];
                    return (
                        <div
                            key={sound.id}
                            className={`sound-card ${isActive ? 'active' : ''}`}
                            onClick={(e) => {
                                // Prevent toggling when clicking slider
                                if (e.target.type !== 'range') toggleSound(sound);
                            }}
                            style={{ '--accent-color': sound.color }}
                        >
                            <div className="icon-wrapper">
                                {isActive ? <Pause size={24} /> : sound.icon}
                            </div>
                            <span className="sound-name">{sound.name}</span>

                            {isActive && (
                                <div className="volume-control" onClick={e => e.stopPropagation()}>
                                    <Volume2 size={14} className="vol-icon" />
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.05"
                                        value={activeSounds[sound.id]}
                                        onChange={(e) => handleVolumeChange(sound.id, e.target.value)}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default SoundLibrary;
