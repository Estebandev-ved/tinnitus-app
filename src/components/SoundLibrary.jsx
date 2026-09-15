import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
    Play, 
    Pause, 
    Volume2, 
    CloudRain, 
    Wind, 
    Waves, 
    Coffee, 
    ChevronLeft, 
    Plus, 
    Upload, 
    X, 
    Moon, 
    Timer, 
    Scissors, 
    Sparkles, 
    Bookmark, 
    Trash2, 
    Info, 
    Sliders,
    Check,
    VolumeX,
    BedDouble,
    SunMoon
} from 'lucide-react';
import { AudioEngine } from '../utils/audioEngine';
import './SoundLibrary.css';
import { useAuth } from '../contexts/AuthContext';
import { usePlan } from '../contexts/PlanContext';
import { FirestoreService } from '../services/firestoreService';
import { LIMITS, PLAN_FREE } from '../config/plans';

const INITIAL_SOUNDS = [
    { 
        id: 'brown', 
        name: 'Ruido Marrón', 
        desc: 'Bajas frecuencias cálidas, ideal para dormir',
        icon: <Volume2 size={22} />, 
        color: '#D4A373', 
        type: 'noise',
        nightRecommended: true 
    },
    { 
        id: 'pink', 
        name: 'Ruido Rosa', 
        desc: 'Frecuencias equilibradas, calma el sistema nervioso',
        icon: <Volume2 size={22} />, 
        color: '#FFB5A7', 
        type: 'noise',
        nightRecommended: true 
    },
    { 
        id: 'rain', 
        name: 'Lluvia Suave', 
        desc: 'Gotas rítmicas para enmascaramiento natural',
        icon: <CloudRain size={22} />, 
        color: '#48CAE4', 
        type: 'nature',
        nightRecommended: true 
    },
    { 
        id: 'ocean', 
        name: 'Olas del Mar', 
        desc: 'Flujo y reflujo cadencioso para relajación profunda',
        icon: <Waves size={22} />, 
        color: '#00B4D8', 
        type: 'nature',
        nightRecommended: true 
    },
    { 
        id: 'fan', 
        name: 'Ventilador', 
        desc: 'Zumbido mecánico continuo y tranquilizador',
        icon: <Wind size={22} />, 
        color: '#90E0EF', 
        type: 'home',
        nightRecommended: true 
    },
    { 
        id: 'white', 
        name: 'Ruido Blanco', 
        desc: 'Espectro completo para enmascaramiento estricto',
        icon: <Volume2 size={22} />, 
        color: '#E0E1DD', 
        type: 'noise',
        nightRecommended: false 
    }
];

const NIGHT_PRESETS = [
    {
        id: 'deep_sleep',
        name: 'Sueño Profundo',
        desc: 'Ruido Marrón + Lluvia',
        sounds: { brown: 0.6, rain: 0.4 },
        badge: 'Recomendado'
    },
    {
        id: 'ocean_breeze',
        name: 'Bruma Marina',
        desc: 'Olas + Ruido Rosa',
        sounds: { ocean: 0.55, pink: 0.35 },
        badge: 'Calma'
    },
    {
        id: 'night_room',
        name: 'Habitación Acogedora',
        desc: 'Ventilador + Ruido Marrón',
        sounds: { fan: 0.5, brown: 0.4 },
        badge: 'Constante'
    }
];

const TIMER_OPTIONS = [
    { minutes: 15, label: '15 min', tag: 'Siesta corta' },
    { minutes: 30, label: '30 min', tag: 'Relajación' },
    { minutes: 45, label: '45 min', tag: 'Conciliar sueño' },
    { minutes: 60, label: '60 min', tag: 'Descanso profundo' },
    { minutes: 90, label: '90 min', tag: 'Ciclo completo' }
];

const SoundLibrary = ({ onClose, isAdmin, tinnitusFrequency, onUpgrade }) => {
    const { currentUser } = useAuth();
    const { can } = usePlan();
    const [sounds] = useState(INITIAL_SOUNDS);
    const [activeSounds, setActiveSounds] = useState({});

    // Notch therapy setup
    const canFullNotch = can('notch_full');
    const canSaveMixes = can('save_mixes');
    const measuredFreq = tinnitusFrequency
        ? (typeof tinnitusFrequency === 'object' ? tinnitusFrequency.frequency : tinnitusFrequency)
        : null;
    const notchFreq = canFullNotch ? measuredFreq : LIMITS[PLAN_FREE].notchDefaultFreq;
    const [notchEnabled, setNotchEnabled] = useState(false);

    // Saved Mixes State
    const [savedMixes, setSavedMixes] = useState([]);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [newMixName, setNewMixName] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Sleep Timer State
    const [sleepTimer, setSleepTimer] = useState(null); // remaining seconds
    const [sleepInterval, setSleepInterval] = useState(null);
    const [showTimerPicker, setShowTimerPicker] = useState(false);
    const [showSleepInfo, setShowSleepInfo] = useState(false);

    // Night Mode Quick Drawer
    const [showNightPanel, setShowNightPanel] = useState(false);

    useEffect(() => {
        if (currentUser) {
            loadMixes();
        }
    }, [currentUser]);

    const loadMixes = async () => {
        try {
            const mixes = await FirestoreService.getSoundscapes(currentUser.uid);
            setSavedMixes(mixes || []);
        } catch (e) {
            console.warn('Error loading saved mixes:', e);
        }
    };

    const toggleSound = (sound) => {
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

    // Keep the engine's global notch config in sync and clear it when leaving.
    useEffect(() => {
        AudioEngine.setNotch(notchFreq, notchEnabled && !!notchFreq);
        return () => AudioEngine.setNotch(notchFreq, false);
    }, [notchEnabled, notchFreq]);

    const toggleNotch = () => {
        if (!notchFreq) return;
        const next = !notchEnabled;
        AudioEngine.setNotch(notchFreq, next);
        setNotchEnabled(next);

        const current = { ...activeSounds };
        Object.entries(current).forEach(([id, vol]) => {
            AudioEngine.stop(id);
            AudioEngine.play(id);
            AudioEngine.setVolume(id, vol);
        });
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

    const handleApplyNightPreset = (preset) => {
        stopAll();
        setTimeout(() => {
            Object.entries(preset.sounds).forEach(([id, vol]) => {
                AudioEngine.play(id);
                AudioEngine.setVolume(id, vol);
            });
            setActiveSounds(preset.sounds);
        }, 100);
    };

    const handleSaveMix = async (e) => {
        e.preventDefault();
        if (!newMixName.trim()) return;
        setIsSaving(true);
        try {
            await FirestoreService.saveSoundscape(currentUser.uid, newMixName.trim(), activeSounds);
            setNewMixName('');
            setShowSaveModal(false);
            loadMixes();
        } catch (error) {
            console.error('Error al guardar mezcla:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleLoadMix = (mix) => {
        stopAll();
        setTimeout(() => {
            Object.entries(mix.sounds).forEach(([id, vol]) => {
                AudioEngine.play(id);
                AudioEngine.setVolume(id, vol);
            });
            setActiveSounds(mix.sounds);
        }, 100);
    };

    const handleDeleteMix = async (mixId, e) => {
        e.stopPropagation();
        if (window.confirm('¿Deseas eliminar esta mezcla guardada?')) {
            await FirestoreService.deleteSoundscape(currentUser.uid, mixId);
            loadMixes();
        }
    };

    const activeCount = Object.keys(activeSounds).length;

    return (
        <div className="library-container animate-fade">
            {/* Header */}
            <header className="library-header">
                <button 
                    className="nav-btn-round press-effect" 
                    onClick={onClose}
                    aria-label="Cerrar mezclador"
                >
                    <ChevronLeft size={22} />
                </button>

                <div className="header-title-container">
                    <h2>Mezclador Acústico</h2>
                    <span className="header-subtitle">
                        {activeCount > 0 
                            ? `${activeCount} ${activeCount === 1 ? 'sonido activo' : 'sonidos en mezcla'}` 
                            : 'Terapia de enmascaramiento'}
                    </span>
                </div>

                <div className="header-actions">
                    {/* Botón Temporizador / Noche */}
                    <button 
                        className={`header-action-btn ${sleepTimer !== null || showTimerPicker ? 'active-glow' : ''} press-effect`}
                        onClick={() => setShowTimerPicker(!showTimerPicker)}
                        title="Temporizador de Sueño"
                        aria-label="Temporizador de Sueño"
                    >
                        <Moon size={18} />
                        {sleepTimer !== null && (
                            <span className="timer-badge-mini">{formatTime(sleepTimer)}</span>
                        )}
                    </button>

                    {/* Botón Guardar Mezcla */}
                    {activeCount > 0 && (
                        <button
                            className="header-save-btn press-effect"
                            onClick={() => canSaveMixes ? setShowSaveModal(true) : onUpgrade?.()}
                        >
                            <Bookmark size={15} />
                            <span>{canSaveMixes ? 'Guardar' : '🔒 Guardar'}</span>
                        </button>
                    )}

                    {/* Botón Detener Todo */}
                    {activeCount > 0 && (
                        <button 
                            className="header-stop-btn press-effect" 
                            onClick={stopAll}
                            title="Detener todos los sonidos"
                            aria-label="Detener todos los sonidos"
                        >
                            <VolumeX size={18} />
                        </button>
                    )}
                </div>
            </header>

            {/* Main scrollable body */}
            <div className="library-scrollable">
                {/* Visualizador Dinámico de Sonido (Reemplazo estético de las fotos antiguas) */}
                <div className="soundstage-visualizer card">
                    <div className="visualizer-bg-glow" style={{ opacity: activeCount > 0 ? 0.9 : 0.3 }} />
                    
                    <div className="visualizer-orb-wrapper">
                        <div className={`visualizer-orb ${activeCount > 0 ? 'pulsing' : ''}`}>
                            <div className="orb-inner">
                                <Sparkles size={activeCount > 0 ? 28 : 24} className="orb-icon" />
                            </div>
                            {activeCount > 0 && (
                                <>
                                    <div className="pulse-ring ring-1" />
                                    <div className="pulse-ring ring-2" />
                                    <div className="pulse-ring ring-3" />
                                </>
                            )}
                        </div>
                    </div>

                    <div className="visualizer-content">
                        <div className="visualizer-title-row">
                            <span className="visualizer-status">
                                {activeCount > 0 ? 'Reproduciendo enmascaramiento' : 'Ambiente en pausa'}
                            </span>
                            {activeCount > 0 && (
                                <div className="eq-bars">
                                    <span className="eq-bar bar-1" />
                                    <span className="eq-bar bar-2" />
                                    <span className="eq-bar bar-3" />
                                    <span className="eq-bar bar-4" />
                                    <span className="eq-bar bar-5" />
                                </div>
                            )}
                        </div>
                        <h3 className="visualizer-headline">
                            {activeCount > 0 
                                ? 'Mezcla terapéutica personalizada' 
                                : 'Diseña tu paisaje sonoro'}
                        </h3>
                        <p className="visualizer-subtext">
                            {activeCount > 0 
                                ? 'Combina intensidades para desviar la atención auditiva de tu cerebro.'
                                : 'Activa varios sonidos a la vez para encontrar tu punto óptimo de alivio.'}
                        </p>
                    </div>
                </div>

                {/* Barra de Temporizador Activo */}
                {sleepTimer !== null && (
                    <div className="sleep-timer-active-bar animate-fade">
                        <div className="timer-bar-left">
                            <div className="timer-pulse-icon">
                                <Moon size={16} />
                            </div>
                            <div className="timer-bar-info">
                                <span className="timer-bar-label">Temporizador de Sueño</span>
                                <span className="timer-bar-time">Apagado automático en <strong>{formatTime(sleepTimer)}</strong></span>
                            </div>
                        </div>
                        <button 
                            className="btn-cancel-timer press-effect" 
                            onClick={cancelSleepTimer}
                            aria-label="Cancelar temporizador"
                        >
                            <X size={16} />
                            <span>Cancelar</span>
                        </button>
                    </div>
                )}

                {/* Selector / Panel de Temporizador de Sueño y Noche */}
                {showTimerPicker && (
                    <div className="night-timer-card card animate-fade">
                        <div className="night-card-header">
                            <div className="night-title-group">
                                <Moon size={20} className="night-icon" />
                                <h4>Temporizador de Noche</h4>
                            </div>
                            <button 
                                className="info-pill-btn" 
                                onClick={() => setShowSleepInfo(!showSleepInfo)}
                            >
                                <Info size={14} />
                                <span>¿Cómo funciona?</span>
                            </button>
                        </div>

                        {/* Tarjeta explicativa de cómo funciona el temporizador de sueño */}
                        {showSleepInfo && (
                            <div className="sleep-explanation-box animate-fade">
                                <div className="explanation-bullet">
                                    <span className="bullet-dot" />
                                    <p><strong>Desvanecimiento Suave:</strong> 30 segundos antes de completarse el tiempo, el volumen desciende de forma casi imperceptible para que el silencio repentino no te despierte.</p>
                                </div>
                                <div className="explanation-bullet">
                                    <span className="bullet-dot" />
                                    <p><strong>Cuidado de tus Ciclos:</strong> Enmascara los pitidos durante la fase inicial de adormecimiento, facilitando la transición al sueño profundo sin consumir batería toda la noche.</p>
                                </div>
                            </div>
                        )}

                        <div className="timer-grid-options">
                            {TIMER_OPTIONS.map(opt => (
                                <button
                                    key={opt.minutes}
                                    className="timer-chip press-effect"
                                    onClick={() => startSleepTimer(opt.minutes)}
                                >
                                    <span className="timer-chip-minutes">{opt.label}</span>
                                    <span className="timer-chip-tag">{opt.tag}</span>
                                </button>
                            ))}
                        </div>

                        <div className="night-card-footer">
                            <button className="btn-ghost-sm" onClick={() => setShowTimerPicker(false)}>
                                Cerrar
                            </button>
                        </div>
                    </div>
                )}

                {/* Presets Nocturnos Rápidos */}
                <div className="night-presets-section">
                    <div className="section-header-row">
                        <div className="section-title-group">
                            <BedDouble size={18} className="section-title-icon" />
                            <h4>Ambientes Nocturnos</h4>
                        </div>
                        <span className="section-hint">Listos para descansar</span>
                    </div>

                    <div className="night-presets-scroll">
                        {NIGHT_PRESETS.map(preset => (
                            <div 
                                key={preset.id} 
                                className="night-preset-card press-effect"
                                onClick={() => handleApplyNightPreset(preset)}
                            >
                                <div className="preset-card-top">
                                    <span className="preset-badge">{preset.badge}</span>
                                    <SunMoon size={16} className="preset-moon-icon" />
                                </div>
                                <h5 className="preset-title">{preset.name}</h5>
                                <p className="preset-desc">{preset.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Notched Sound Therapy toggle */}
                <div className={`notch-bar ${notchEnabled ? 'active' : ''} ${!notchFreq ? 'disabled' : ''}`}>
                    <div className="notch-info">
                        <div className="notch-icon-wrap">
                            <Scissors size={18} />
                        </div>
                        <div className="notch-text">
                            <strong>
                                Supresión Notch {!canFullNotch && <span className="notch-demo-tag">DEMO</span>}
                            </strong>
                            {!canFullNotch ? (
                                <span>Versión demo a {notchFreq} Hz · <button className="notch-upgrade-link" onClick={onUpgrade}>Mejora a Premium</button> para tu frecuencia real</span>
                            ) : notchFreq ? (
                                <span>Filtra la banda de tu frecuencia ({notchFreq} Hz)</span>
                            ) : (
                                <span>Calibra tu frecuencia primero para activar el filtro notch</span>
                            )}
                        </div>
                    </div>
                    <button
                        className={`notch-switch ${notchEnabled ? 'on' : ''}`}
                        onClick={toggleNotch}
                        disabled={!notchFreq}
                        aria-pressed={notchEnabled}
                        aria-label="Activar supresión notch"
                    >
                        <span className="notch-knob" />
                    </button>
                </div>

                {/* Mis Mezclas Guardadas */}
                {savedMixes.length > 0 && (
                    <div className="mixes-section">
                        <div className="section-header-row">
                            <div className="section-title-group">
                                <Bookmark size={17} className="section-title-icon" />
                                <h4>Mis Mezclas Guardadas</h4>
                            </div>
                            <span className="section-hint">{savedMixes.length} guardadas</span>
                        </div>
                        <div className="mixes-scroll">
                            {savedMixes.map(mix => (
                                <div 
                                    key={mix.id} 
                                    className="mix-chip press-effect" 
                                    onClick={() => handleLoadMix(mix)}
                                >
                                    <span className="mix-chip-name">{mix.name}</span>
                                    <button 
                                        className="delete-mix-btn" 
                                        onClick={(e) => handleDeleteMix(mix.id, e)}
                                        aria-label="Eliminar mezcla"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Grid de Sonidos */}
                <div className="sounds-section">
                    <div className="section-header-row">
                        <div className="section-title-group">
                            <Sliders size={18} className="section-title-icon" />
                            <h4>Sonidos Individuales</h4>
                        </div>
                        <span className="section-hint">Toca para activar y ajusta el volumen</span>
                    </div>

                    <div className="sounds-grid">
                        {sounds.map(sound => {
                            const isActive = !!activeSounds[sound.id];
                            return (
                                <div
                                    key={sound.id}
                                    className={`sound-card ${isActive ? 'playing' : ''}`}
                                    onClick={(e) => {
                                        if (e.target.type !== 'range') toggleSound(sound);
                                    }}
                                    style={{ '--accent-color': sound.color }}
                                >
                                    <div className="sound-card-header">
                                        <div className="sound-icon-wrap" style={{ color: sound.color }}>
                                            {isActive ? <Pause size={20} /> : sound.icon}
                                        </div>
                                        <div className="sound-info">
                                            <span className="sound-name">{sound.name}</span>
                                            <span className="sound-desc">{sound.desc}</span>
                                        </div>
                                    </div>

                                    {isActive && (
                                        <div className="volume-control animate-fade" onClick={e => e.stopPropagation()}>
                                            <div className="vol-slider-row">
                                                <Volume2 size={15} className="vol-icon" />
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="1"
                                                    step="0.02"
                                                    value={activeSounds[sound.id] || 0.5}
                                                    onChange={(e) => handleVolumeChange(sound.id, e.target.value)}
                                                    className="volume-slider-input"
                                                    aria-label={`Volumen de ${sound.name}`}
                                                />
                                                <span className="vol-percentage">
                                                    {Math.round((activeSounds[sound.id] || 0.5) * 100)}%
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Modal de Guardar Mezcla */}
            {showSaveModal && (
                <div className="modal-overlay animate-fade" onClick={() => setShowSaveModal(false)}>
                    <div className="modal-card card animate-fade" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header-row">
                            <div className="modal-title-group">
                                <Bookmark size={20} className="modal-icon" />
                                <h3>Guardar Mezcla Acústica</h3>
                            </div>
                            <button 
                                className="modal-close-btn press-effect" 
                                onClick={() => setShowSaveModal(false)}
                                aria-label="Cerrar"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <p className="modal-desc">
                            Asigna un nombre descriptivo para cargar esta combinación sonora con un solo toque en cualquier momento.
                        </p>

                        <form onSubmit={handleSaveMix}>
                            <input
                                type="text"
                                placeholder="Ej: Noche Serena, Enfoque Lectura, Alivio Suave..."
                                value={newMixName}
                                onChange={e => setNewMixName(e.target.value)}
                                className="input-field mix-name-input"
                                autoFocus
                                maxLength={35}
                            />
                            
                            <div className="modal-actions-row">
                                <button 
                                    type="button" 
                                    className="btn btn-ghost press-effect" 
                                    onClick={() => setShowSaveModal(false)}
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit" 
                                    className="btn btn-primary press-effect" 
                                    disabled={!newMixName.trim() || isSaving}
                                >
                                    <Check size={18} />
                                    <span>{isSaving ? 'Guardando...' : 'Guardar Mezcla'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SoundLibrary;