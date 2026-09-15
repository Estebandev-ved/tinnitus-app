import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, MessageSquare, Headphones, Sliders, Calendar, Wind, Cpu, Trophy, User, Sun, Moon, Sparkles, ClipboardList, Play, CheckCircle2, Flame, Siren, BookOpen } from 'lucide-react';
import { useWeeklyPlan } from '../contexts/WeeklyPlanContext';
import QuickStartGuide from './QuickStartGuide';
import { contentService } from '../services/backend/contentService';
import './DashboardHome.css';

const TYPE_LABEL = {
    TIP: 'Consejo',
    ARTICLE: 'Artículo',
    FAQ: 'Pregunta frecuente',
    MESSAGE: 'Novedad',
    EXERCISE: 'Ejercicio'
};

const DashboardHome = ({ user, streak, dailyTip, matchedFrequency, lastTHI, onNavigate, darkMode, setDarkMode }) => {
    const { activePlan, getWeekProgress } = useWeeklyPlan();
    const [content, setContent] = useState([]);

    useEffect(() => {
        let mounted = true;
        contentService.list({ lang: 'es' })
            .then((data) => { if (mounted) setContent(Array.isArray(data) ? data : []); })
            .catch(() => { if (mounted) setContent([]); });
        return () => { mounted = false; };
    }, []);

    const feedItems = content;

    const CARDS = [
        {
            id: 'weekly_plan',
            title: 'Mi Plan Semanal (IA)',
            desc: 'Tu receta personalizada de 7 días con ejercicios guiados paso a paso.',
            icon: <Sparkles size={24} style={{ color: '#c084fc' }} />,
            badge: activePlan ? `Semana ${activePlan.currentWeek} · Día ${activePlan.currentDay}` : 'Recomendado'
        },
        {
            id: 'chat',
            title: 'Asistente IA',
            desc: 'Conversa con tu guía digital y recibe recomendaciones personalizadas.',
            icon: <MessageSquare size={24} />,
            badge: 'Chat'
        },
        {
            id: 'library',
            title: 'Terapia de Sonido',
            desc: 'Ruido blanco, rosa, lluvia y enmascaradores personalizados.',
            icon: <Headphones size={24} />
        },
        {
            id: 'tracker',
            title: 'Diario Clínico',
            desc: 'Registra tu nivel de tinnitus, horas de sueño y estrés diario.',
            icon: <Calendar size={24} />
        },
        {
            id: 'guided_sessions',
            title: 'Sesiones de Alivio',
            desc: 'Ejercicios de respiración 4-7-8 y relajación auditiva guiada.',
            icon: <Wind size={24} />
        },
        {
            id: 'matcher',
            title: 'Calibración Hz',
            desc: 'Identifica la frecuencia exacta de tu acúfeno para modular la terapia.',
            icon: <Sliders size={24} />,
            badge: matchedFrequency ? `${matchedFrequency.frequency} Hz` : 'No medido'
        },
        {
            id: 'thi',
            title: 'Test de Impacto (THI)',
            desc: 'Mide cuánto afecta el tinnitus tu vida diaria (25 preguntas).',
            icon: <ClipboardList size={24} />,
            badge: lastTHI ? `${lastTHI.grade}` : 'Pendiente'
        },
        {
            id: 'twin',
            title: 'Gemelo Auditivo',
            desc: 'Simulación coclear 3D y análisis de tensión temporomandibular.',
            icon: <Cpu size={24} />
        },
        {
            id: 'achievements',
            title: 'Logros y Metas',
            desc: 'Completa tus desafíos de constancia y gana medallas clínicas.',
            icon: <Trophy size={24} />
        },
        {
            id: 'profile',
            title: 'Perfil Clínico',
            desc: 'Reportes médicos en PDF, contacto de tutor y datos personales.',
            icon: <User size={24} />
        }
    ];

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Buenos días';
        if (hour < 18) return 'Buenas tardes';
        return 'Buenas noches';
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.07, delayChildren: 0.05 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 22, scale: 0.97 },
        show: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { type: 'spring', stiffness: 280, damping: 26 }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 26, scale: 0.95 },
        show: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { type: 'spring', stiffness: 300, damping: 24 }
        }
    };

    return (
        <motion.div
            className="dh-container"
            variants={containerVariants}
            initial="hidden"
            animate="show"
        >
            {/* Ola animada decorativa en el header */}
            <div className="dh-header-wave" aria-hidden="true">
                <svg viewBox="0 0 500 120" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="dhWave" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#00B4D8" stopOpacity="0.0" />
                            <stop offset="50%" stopColor="#00B4D8" stopOpacity="0.35" />
                            <stop offset="100%" stopColor="#0096C7" stopOpacity="0.0" />
                        </linearGradient>
                    </defs>
                    <path className="dh-wave-path" d="M0,60 C125,10 375,110 500,60 L500,120 L0,120 Z" fill="url(#dhWave)" />
                </svg>
            </div>

            {/* Header de bienvenida premium */}
            <motion.header className="dh-header" variants={itemVariants}>
                <div className="dh-profile-info">
                    <motion.div
                        className="dh-avatar"
                        onClick={() => onNavigate('profile')}
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.94 }}
                    >
                        {user?.displayName ? user.displayName[0].toUpperCase() : 'U'}
                    </motion.div>
                    <div className="dh-greeting-text">
                        <span className="dh-greeting-sub">{getGreeting()},</span>
                        <h2 className="dh-username">{user?.displayName || 'Usuario'}</h2>
                    </div>
                </div>

                <div className="dh-header-actions">
                    <motion.div
                        className="dh-streak-badge"
                        onClick={() => onNavigate('achievements')}
                        whileHover={{ scale: 1.05, y: -1 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Flame size={15} className="dh-flame" />
                        <span className="dh-streak-count">{streak}</span>
                    </motion.div>
                    <motion.button
                        className="dh-theme-toggle"
                        onClick={() => setDarkMode(!darkMode)}
                        aria-label="Cambiar tema"
                        whileTap={{ scale: 0.9, rotate: 90 }}
                    >
                        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                    </motion.button>
                </div>
            </motion.header>

            {/* Banner de Tip del día */}
            <motion.div className="dh-tip-banner" variants={itemVariants}>
                <div className="dh-tip-icon">
                    <Sparkles size={16} />
                </div>
                <div className="dh-tip-body">
                    <strong>Consejo diario:</strong>
                    <p>{dailyTip}</p>
                </div>
            </motion.div>

            {/* Guía de Inicio Rápido (solo muestra pasos pendientes) */}
            <motion.div variants={itemVariants}>
                <QuickStartGuide
                    matchedFrequency={matchedFrequency}
                    lastTHI={lastTHI}
                    onNavigate={onNavigate}
                />
            </motion.div>

            {/* Banner de Reanudación de Plan Semanal Activo */}
            {activePlan && (
                <motion.div
                    className="dh-tip-banner dh-plan-banner"
                    style={{
                        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(168, 85, 247, 0.25) 100%)',
                        border: '1px solid rgba(168, 85, 247, 0.4)',
                        cursor: 'pointer'
                    }}
                    onClick={() => onNavigate('weekly_plan')}
                    variants={itemVariants}
                    whileHover={{ scale: 1.01 }}
                >
                    <div className="dh-tip-icon" style={{ background: 'rgba(168, 85, 247, 0.3)', color: '#fff' }}>
                        <Play size={16} />
                    </div>
                    <div className="dh-tip-body" style={{ flex: 1 }}>
                        <strong style={{ color: '#c084fc' }}>Plan Semanal en Progreso: Semana {activePlan.currentWeek} · Día {activePlan.currentDay}</strong>
                        <p style={{ margin: 0, color: '#e2e8f0' }}>Avance de la semana: {getWeekProgress(activePlan.currentWeek)}% completado. ¡Haz clic para continuar tu jornada!</p>
                    </div>
                </motion.div>
            )}

            {/* Tarjeta de emergencia SOS Gigante */}
            <motion.section className="dh-sos-section" variants={itemVariants}>
                <motion.div
                    className="dh-sos-card"
                    onClick={() => onNavigate('rescue')}
                    whileHover={{ scale: 1.015, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <div className="dh-sos-glow" />
                    <div className="dh-sos-icon-wrap">
                        <ShieldAlert size={28} />
                    </div>
                    <div className="dh-sos-content">
                        <h3><Siren size={18} className="dh-sos-title-icon" /> Modo Rescate SOS</h3>
                        <p>Alivio rápido para crisis auditivas y zumbidos intensos.</p>
                    </div>
                </motion.div>
            </motion.section>

            {/* Sección de contenido publicado (visible para todos los usuarios) */}
            {feedItems.length > 0 && (
                <section className="dh-content-section">
                    <div className="dh-content-head">
                        <h3 className="dh-section-title">
                            <BookOpen size={18} style={{ verticalAlign: '-3px', marginRight: 6 }} />
                            Consejos y artículos
                        </h3>
                        <button className="dh-content-more" onClick={() => onNavigate('education')}>
                            Ver todos →
                        </button>
                    </div>
                    <div className="dh-content-list">
                        {feedItems.slice(0, 3).map((item) => (
                            <motion.div
                                key={item.id}
                                className={`dh-content-card ${item.type === 'MESSAGE' ? 'dh-content-card--muted' : ''}`}
                                whileHover={{ y: -3, scale: 1.01 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => onNavigate('education')}
                            >
                                <span className="dh-content-type">{TYPE_LABEL[item.type] || item.type}</span>
                                <h4>{item.title}</h4>
                                {item.summary && <p>{item.summary}</p>}
                            </motion.div>
                        ))}
                    </div>
                </section>
            )}

            {/* Grid de opciones principales (Apps grandes) */}
            <section className="dh-grid-section">
                <h3 className="dh-section-title">Herramientas Clínicas</h3>

                <motion.div
                    className="dh-grid"
                    variants={containerVariants}
                >
                    {CARDS.map((card) => (
                        <motion.div
                            key={card.id}
                            className="dh-card press-effect"
                            variants={cardVariants}
                            whileHover={{ y: -4, scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => onNavigate(card.id)}
                        >
                            <div className="dh-card-header">
                                <div className="dh-card-icon">{card.icon}</div>
                                {card.badge && (
                                    <span className={`dh-card-badge ${card.badge === 'Chat' ? 'chat-badge' : 'hz-badge'}`}>
                                        {card.badge}
                                    </span>
                                )}
                            </div>
                            <div className="dh-card-body">
                                <h4>{card.title}</h4>
                                <p>{card.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </section>
        </motion.div>
    );
};

export default DashboardHome;
