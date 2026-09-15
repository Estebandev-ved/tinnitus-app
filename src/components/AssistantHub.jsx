import React, { useState, useEffect } from 'react';
import { MessageSquare, Zap, Lightbulb, Siren, ChevronLeft, Mic, Headphones, Brain, Heart, Shield, BookOpen, Volume2, Moon, Droplets, Wind, AlertTriangle, Flame, TrendingDown, Ear } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { FirestoreService } from '../services/firestoreService';
import AIChat from './AIChat';
import './AssistantHub.css';

const ACTIONS = [
    {
        id: 'matcher',
        icon: Mic,
        title: 'Medir Frecuencia',
        desc: 'Calibra tu tinnitus',
        color: '#00B4D8',
        gradient: 'linear-gradient(135deg, #0096C7, #0077B6)',
        section: 'matcher'
    },
    {
        id: 'breathing',
        icon: Wind,
        title: 'Respiración',
        desc: 'Relaja tu mente',
        color: '#2DD4BF',
        gradient: 'linear-gradient(135deg, #2DD4BF, #14B8A6)',
        section: 'breathing'
    },
    {
        id: 'tracker',
        icon: Heart,
        title: 'Registrar Día',
        desc: 'Síntomas de hoy',
        color: '#F472B6',
        gradient: 'linear-gradient(135deg, #EC4899, #DB2777)',
        section: 'tracker'
    },
    {
        id: 'rescue',
        icon: Siren,
        title: 'SOS Emergencia',
        desc: 'Calmar zumbido alto',
        color: '#FF6B6B',
        gradient: 'linear-gradient(135deg, #FF3B30, #FF2D55)',
        section: 'rescue'
    },
    {
        id: 'library',
        icon: Headphones,
        title: 'Terapia Sonora',
        desc: 'Enmascarar zumbido',
        color: '#A78BFA',
        gradient: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
        section: 'library'
    },
    {
        id: 'voice_diary',
        icon: BookOpen,
        title: 'Diario de Voz',
        desc: 'Graba tu progreso',
        color: '#FBBF24',
        gradient: 'linear-gradient(135deg, #F59E0B, #D97706)',
        section: 'voice_diary'
    },
    {
        id: 'thi',
        icon: Brain,
        title: 'Test THI',
        desc: 'Evalúa tu impacto',
        color: '#60A5FA',
        gradient: 'linear-gradient(135deg, #3B82F6, #2563EB)',
        section: 'thi'
    },
    {
        id: 'weekly_plan',
        icon: Flame,
        title: 'Mi Plan',
        desc: 'Sesión del día',
        color: '#F97316',
        gradient: 'linear-gradient(135deg, #F97316, #EA580C)',
        section: 'weekly_plan'
    }
];

const DAILY_TIPS = [
    {
        title: 'Respiración 4-7-8',
        text: 'Inhala 4s, mantén 7s, exhala 8s. Activa el nervio vago y baja la percepción del zumbido.',
        icon: Wind,
        color: '#2DD4BF'
    },
    {
        title: 'Enmascaramiento suave',
        text: 'Usa sonido ambiental a volumen bajo (debajo del tinnitus). 2-3 horas máximas para evitar sobreestimulación.',
        icon: Volume2,
        color: '#A78BFA'
    },
    {
        title: 'Evita el silencio total',
        text: 'El cerebro amplifica el tinnitus en silencio. Mantén ruido blanco suave de fondo, especialmente al dormir.',
        icon: Moon,
        color: '#60A5FA'
    },
    {
        title: 'Hidratación constante',
        text: 'La deshidratación afecta la presión del oído interno. Bebe al menos 2L de agua al día.',
        icon: Droplets,
        color: '#00B4D8'
    },
    {
        title: 'Ejercicio aeróbico',
        text: '20 min de caminata rápida reducen la percepción del tinnitus hasta un 30%. El flujo sanguíneo auditivo mejora.',
        icon: Heart,
        color: '#F472B6'
    },
    {
        title: 'Mindfulness 10 min',
        text: 'Medita enfocándote en la respiración. No intentes ignorar el zumbido, solo obsérvalo sin juzgar.',
        icon: Brain,
        color: '#FBBF24'
    },
    {
        title: 'Protege tus oídos',
        text: 'Ruidos mayores a 85 dB dañan la cóclea. Usa tapones en conciertos o ambientes ruidosos.',
        icon: Shield,
        color: '#FF6B6B'
    },
    {
        title: 'Sueño reparador',
        text: 'Evita pantallas 1h antes de dormir. Mantén horario regular. La fatiga intensifica el zumbido.',
        icon: Moon,
        color: '#8B5CF6'
    }
];

const SOS_OPTIONS = [
    {
        id: 'rescue',
        icon: AlertTriangle,
        title: 'Modo Rescate SOS',
        desc: 'Activa sonidos enmascarantes de alta intensidad para calmar una crisis aguda.',
        color: '#FF3B30',
        gradient: 'linear-gradient(135deg, #FF3B30, #FF2D55)',
        urgent: true
    },
    {
        id: 'breathing',
        icon: Wind,
        title: 'Respiración de Emergencia',
        desc: 'Respiración diafragmática acelerada para bajar la ansiedad en minutos.',
        color: '#2DD4BF',
        gradient: 'linear-gradient(135deg, #2DD4BF, #14B8A6)',
        urgent: false
    },
    {
        id: 'library',
        icon: Volume2,
        title: 'Sonido de Calma',
        desc: 'Ruido rosa u olas del mar a volumen suave para reducir la percepción.',
        color: '#A78BFA',
        gradient: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
        urgent: false
    },
    {
        id: 'matcher',
        icon: Ear,
        title: 'Re-afinar Frecuencia',
        desc: 'Si el tinnitus cambió, recalibra la frecuencia para una mejor terapia.',
        color: '#00B4D8',
        gradient: 'linear-gradient(135deg, #0096C7, #0077B6)',
        urgent: false
    }
];

const AssistantHub = ({ onClose, tinnitusFrequency, onNavigate }) => {
    const [activeTab, setActiveTab] = useState('chat');
    const { currentUser } = useAuth();
    const [userName, setUserName] = useState('');

    useEffect(() => {
        const loadUser = async () => {
            if (currentUser) {
                try {
                    const profile = await FirestoreService.getMedicalProfile(currentUser.uid);
                    setUserName(profile?.name || currentUser.displayName || '');
                } catch { /* silent */ }
            }
        };
        loadUser();
    }, [currentUser]);

    const handleAction = (section) => {
        if (onNavigate) onNavigate(section);
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'chat':
                return (
                    <AIChat
                        onClose={onClose}
                        tinnitusFrequency={tinnitusFrequency}
                        isDashboard={true}
                        onNavigate={onNavigate}
                    />
                );

            case 'acciones':
                return (
                    <div className="assistant-tab-scroll">
                        <div className="assistant-tab-intro">
                            <h3>Acciones Rápidas</h3>
                            <p>{userName ? `¿Qué necesitas hoy, ${userName}?` : '¿Qué necesitas hoy?'}</p>
                        </div>
                        <div className="actions-grid">
                            {ACTIONS.map(action => {
                                const Icon = action.icon;
                                return (
                                    <button
                                        key={action.id}
                                        className="action-card press-effect"
                                        onClick={() => handleAction(action.section)}
                                    >
                                        <div className="action-icon-wrap" style={{ background: action.gradient }}>
                                            <Icon size={22} color="white" />
                                        </div>
                                        <div className="action-text">
                                            <span className="action-title">{action.title}</span>
                                            <span className="action-desc">{action.desc}</span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                );

            case 'tips':
                return (
                    <div className="assistant-tab-scroll">
                        <div className="assistant-tab-intro">
                            <h3>Tips del Día</h3>
                            <p>Consejos personalizados para tu tinnitus</p>
                        </div>
                        <div className="tips-list">
                            {DAILY_TIPS.map((tip, idx) => {
                                const Icon = tip.icon;
                                return (
                                    <div key={idx} className="tip-card" style={{ '--tip-color': tip.color }}>
                                        <div className="tip-icon-wrap" style={{ background: `${tip.color}20`, color: tip.color }}>
                                            <Icon size={20} />
                                        </div>
                                        <div className="tip-content">
                                            <h4>{tip.title}</h4>
                                            <p>{tip.text}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );

            case 'sos':
                return (
                    <div className="assistant-tab-scroll">
                        <div className="assistant-tab-intro sos-intro">
                            <div className="sos-pulse-ring">
                                <Siren size={32} color="#FF3B30" />
                            </div>
                            <h3>Centro SOS</h3>
                            <p>Si el zumbido es insoportable, elige una acción de emergencia:</p>
                        </div>
                        <div className="sos-options">
                            {SOS_OPTIONS.map(opt => {
                                const Icon = opt.icon;
                                return (
                                    <button
                                        key={opt.id}
                                        className={`sos-option press-effect ${opt.urgent ? 'sos-urgent' : ''}`}
                                        onClick={() => handleAction(opt.id)}
                                    >
                                        <div className="sos-option-icon" style={{ background: opt.gradient }}>
                                            <Icon size={24} color="white" />
                                        </div>
                                        <div className="sos-option-text">
                                            <span className="sos-option-title">{opt.title}</span>
                                            <span className="sos-option-desc">{opt.desc}</span>
                                        </div>
                                        {opt.urgent && <Flame size={18} className="sos-flame-icon" />}
                                    </button>
                                );
                            })}
                        </div>
                        <div className="sos-reminder">
                            <Shield size={16} />
                            <span>Si sientes dolor agudo o pérdida súbita de audición, acude a urgencias.</span>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="assistant-hub animate-fade">
            <header className="assistant-hub-header">
                <button className="back-btn" onClick={onClose}>
                    <ChevronLeft />
                </button>
                <div className="assistant-hub-title-area">
                    <h2>Asistente</h2>
                </div>
            </header>

            <div className="assistant-hub-content">
                {renderTabContent()}
            </div>

            <nav className="assistant-hub-tabs">
                <button
                    className={`assistant-tab ${activeTab === 'chat' ? 'active' : ''}`}
                    onClick={() => setActiveTab('chat')}
                >
                    <MessageSquare size={18} />
                    <span>Chat</span>
                </button>
                <button
                    className={`assistant-tab ${activeTab === 'acciones' ? 'active' : ''}`}
                    onClick={() => setActiveTab('acciones')}
                >
                    <Zap size={18} />
                    <span>Acciones</span>
                </button>
                <button
                    className={`assistant-tab ${activeTab === 'tips' ? 'active' : ''}`}
                    onClick={() => setActiveTab('tips')}
                >
                    <Lightbulb size={18} />
                    <span>Tips</span>
                </button>
                <button
                    className={`assistant-tab ${activeTab === 'sos' ? 'active' : ''}`}
                    onClick={() => setActiveTab('sos')}
                >
                    <Siren size={18} />
                    <span>SOS</span>
                </button>
            </nav>
        </div>
    );
};

export default AssistantHub;
