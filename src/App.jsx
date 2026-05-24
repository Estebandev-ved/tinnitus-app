import React, { useState, useEffect } from 'react';
import { Shield, Mic, Trophy, Heart, Brain, BookOpen, Volume2, Calendar, MessageSquare, ChevronRight, Wind, Sliders, Lightbulb, Flame, TrendingDown, Moon, Sun, Bell, Download, Users, Globe, ScanFace, Headphones, Cpu, AlertTriangle } from 'lucide-react';
import { RescueMode } from './components/mechanics/RescueMode';
import { SideQuestsWidget } from './components/SideQuestsWidget';
import { FirestoreService } from './services/firestoreService';
import { generateDoctorReport } from './utils/reportGenerator';
import { useLanguage } from './contexts/LanguageContext';
import { Device } from '@capacitor/device';
import AdminDashboard from './components/AdminDashboard';
import LandingPage from './components/LandingPage';
import './App.css';

// Illustration imports
import splashIllustration from './assets/illustrations/corte2.png';

// Component Imports
import FrequencyMatcher from './components/FrequencyMatcher';
import VoiceDiary from "./components/VoiceDiary";
import HomeWidget from "./components/HomeWidget";
import Achievements from "./components/Achievements";
import CaregiverMode from "./components/CaregiverMode";
import CrisisPrediction from "./components/CrisisPrediction";
import GuidedSessions from "./components/GuidedSessions";
import DailyTracker from './components/DailyTracker';
import AIChat from './components/AIChat';
import SoundLibrary from './components/SoundLibrary';
import Education from './components/Education';
import BreathingGuide from './components/BreathingGuide';
import CustomNoise from './components/CustomNoise';
import Onboarding from './components/Onboarding';
import MedicalDisclaimer from './components/MedicalDisclaimer';
import MedicalProfile from './components/MedicalProfile';
import Community from './components/Community';
import Login from './components/Login';
import ProgressNotes from './components/ProgressNotes';
import UserProfile from './components/UserProfile';
import FacialMonitor from './components/FacialMonitor';
import SpatialAudio from './components/SpatialAudio';
import DigitalTwin from './components/EnhancedDigitalTwin';

// CSS Imports (Side Effects)
import './components/FrequencyMatcher.css';
import './components/DailyTracker.css';
import './components/AIChat.css';
import './components/SoundLibrary.css';
import './components/Education.css';
import './components/BreathingGuide.css';
import './components/CustomNoise.css';
import './components/Onboarding.css';
import './components/MedicalProfile.css';
import './components/Community.css';
import './components/Login.css';
import './components/ProgressNotes.css';
import './components/UserProfile.css';
import './components/FacialMonitor.css';
import './components/SpatialAudio.css';
import './components/DigitalTwin.css';


const SplashScreen = ({ onFinish }) => {
  const { t, toggleLanguage, language } = useLanguage();
  return (
    <div className="splash-screen">
      <div className="language-toggle" onClick={toggleLanguage}>
        <Globe size={20} />
        <span>{language.toUpperCase()}</span>
      </div>
      <div className="logo-container">
        <img src={splashIllustration} alt="TinnitOff" className="splash-illustration" />
        <h1 className="brand-name">{t('welcome_title')}</h1>
        <p className="brand-tagline">{t('welcome_tagline')}</p>
      </div>
      <button className="btn btn-primary start-btn" onClick={onFinish}>
        {t('start_btn')} <ChevronRight size={20} />
      </button>
    </div>
  );
};


const DAILY_TIPS = [
  ' Evita la cafeína después de las 3pm — puede intensificar el zumbido.',
  ' 20 minutos de ejercicio aeróbico reducen la percepción del tinnitus hasta un 30%.',
  ' Usa los sonidos a volumen bajo mientras trabajas para acelerar la habituación.',
  ' Mantén un horario de sueño regular. La fatiga empeora el tinnitus.',
  ' La respiración 4-7-8 antes de dormir reduce la ansiedad auditiva.',
  ' Mantente hidratado. La deshidratación puede aumentar la presión coclear.',
  ' Reduce el tiempo en pantalla antes de dormir para mejorar tu descanso.',
  ' Una dieta baja en sodio ayuda a regular la presión del oído interno.',
  ' Escucha música suave a tu frecuencia de tinnitus para reentrenar tu cerebro.',
  ' El mindfulness diario (10 min) disminuye la percepción del zumbido.',
];


function App() {
  const { t } = useLanguage();
  const [user, setUser] = useState(null); // Auth State
  const [step, setStep] = useState('splash');
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard'); // SPA view switcher instead of modals stack
  const [matchedFrequency, setMatchedFrequency] = useState(null);
  const [showGuide, setShowGuide] = useState(true);

  // Dark Mode
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('tinnitoff_darkMode') === 'true';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark-mode', darkMode);
    localStorage.setItem('tinnitoff_darkMode', darkMode.toString());
  }, [darkMode]);

  // Reminder banner
  const [reminderDismissed, setReminderDismissed] = useState(false);

  // Rotating tip: changes every 4 hours
  const [tipIndex, setTipIndex] = useState(0);
  useEffect(() => {
    const hourBlock = Math.floor(Date.now() / (4 * 60 * 60 * 1000));
    setTipIndex(hourBlock % DAILY_TIPS.length);
  }, []);
  const dailyTip = DAILY_TIPS[tipIndex];

  // URL Redirection to Landing Page / Download Tracker
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('ref') || params.has('download')) {
      setStep('landing');
    }
  }, []);

  // Streak from Firestore
  const [streak, setStreak] = useState(0);
  const [streakData, setStreakData] = useState(null);

  // Weekly progress (real data from daily logs)
  const [weeklyLogs, setWeeklyLogs] = useState([]);

  // Load streak + weekly logs when user is set
  const loadHomeData = async (uid) => {
    try {
      const [streakResult, logs] = await Promise.all([
        FirestoreService.getStreak(uid),
        FirestoreService.getWeeklyLogs(uid)
      ]);
      setStreakData(streakResult);
      setStreak(streakResult.count || 0);
      setWeeklyLogs(logs);
    } catch (e) {
      console.error('Error loading home data:', e);
    }
  };

  const handleStart = () => {
    if (!user) {
      setStep('login');
    } else {
      setShowDisclaimer(true);
    }
  };

  const handleLoginSuccess = async (userData) => {
    setUser(userData);
    setStep('splash');
    setShowDisclaimer(true);

    // Save device telemetry on successful login
    try {
      let info = { platform: 'web', operatingSystem: 'unknown', osVersion: 'unknown', model: 'unknown', manufacturer: 'unknown', isVirtual: false };
      let deviceId = 'web_browser_' + Math.random().toString(36).substring(2, 10);
      
      try {
        info = await Device.getInfo();
        const idRes = await Device.getId();
        deviceId = idRes.identifier;
      } catch (err) {
        console.warn("Capacitor Device info not available (likely web browser):", err);
      }

      const telemetryData = {
        deviceId,
        platform: info.platform || 'web',
        operatingSystem: info.operatingSystem || 'unknown',
        osVersion: info.osVersion || 'unknown',
        model: info.model || 'unknown',
        manufacturer: info.manufacturer || 'unknown',
        isVirtual: info.isVirtual || false
      };

      await FirestoreService.saveDeviceTelemetry(userData.uid, telemetryData);
    } catch (telemetryErr) {
      console.error("Error setting up device telemetry:", telemetryErr);
    }

    // Load persisted frequency + home data
    try {
      const lastAudio = await FirestoreService.getLastAudiometry(userData.uid);
      if (lastAudio) {
        setMatchedFrequency(lastAudio);
      }
      await loadHomeData(userData.uid);
    } catch (e) {
      console.error("Error loading data:", e);
    }
  };

  const handleAcceptDisclaimer = () => {
    setShowDisclaimer(false);
    const onboarded = localStorage.getItem('tinnitoff_onboarded');
    if (!onboarded) {
      setStep('onboarding');
    } else {
      setStep('home');
    }
  };

  const handleCompleteMatcher = async (data) => {
    setMatchedFrequency(data);
    setActiveSection('dashboard');
    if (user) {
      await FirestoreService.saveAudiometry(user.uid, data);
      alert(`¡Medición de tinnitus guardada correctamente en tu perfil médico!`);
    }
  };

  const handleSaveTracker = async (data) => {
    console.log("Tracker Data Saved:", data);
    setActiveSection('dashboard');
    if (user) {
      try {
        const result = await FirestoreService.updateStreak(user.uid);
        setStreakData(result);
        setStreak(result.count || 0);
        const logs = await FirestoreService.getWeeklyLogs(user.uid);
        setWeeklyLogs(logs);
      } catch (e) {
        console.error('Error updating streak:', e);
      }
    }
  };

  const handleRecoverStreak = async () => {
    if (!user) return;
    if (confirm('¿Recuperar tu racha anterior? Esto es una sola vez.')) {
      try {
        const result = await FirestoreService.recoverStreak(user.uid);
        if (result) {
          setStreakData(result);
          setStreak(result.count || 0);
          alert('¡Racha recuperada! 🎉');
        }
      } catch (e) {
        console.error('Error recovering streak:', e);
      }
    }
  };

  const exportPDF = async () => {
    if (!user) return;
    try {
      const notes = await FirestoreService.getProgressNotes(user.uid, 50);
      const profile = await FirestoreService.getMedicalProfile(user.uid);
      generateDoctorReport(user, profile, weeklyLogs, notes, matchedFrequency);
    } catch (e) {
      console.error("Error generating report:", e);
      alert("Error al generar el reporte.");
    }
  };

  if (step === 'landing') {
    return <LandingPage onGoToApp={() => {
      // Clear URL params so reload doesn't trigger landing page again
      window.history.replaceState({}, document.title, window.location.pathname);
      setStep('splash');
    }} />;
  }

  if (step === 'login') {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  if (step === 'splash') {
    return (
      <div className="app-container">
        <SplashScreen onFinish={handleStart} />
        {showDisclaimer && <MedicalDisclaimer onAccept={handleAcceptDisclaimer} />}
      </div>
    );
  }

  if (step === 'onboarding') {
    return (
      <div className="app-container">
        <Onboarding onComplete={() => setStep('home')} />
      </div>
    );
  }

  return (
    <div className="app-container animated-bg">
      {/* Floating Particles */}
      <div className="particles-container">
        <div className="particle" />
        <div className="particle" />
        <div className="particle" />
        <div className="particle" />
        <div className="particle" />
        <div className="particle" />
        <div className="particle" />
        <div className="particle" />
      </div>

      {/* RENDER THE ACTIVE VIEW INSTEAD OF STACKING OVERLAYS */}
      {activeSection === 'matcher' && (
        <FrequencyMatcher
          onComplete={handleCompleteMatcher}
          onCancel={() => setActiveSection('dashboard')}
        />
      )}

      {activeSection === 'tracker' && (
        <DailyTracker
          onSave={handleSaveTracker}
          onClose={() => setActiveSection('dashboard')}
        />
      )}

      {activeSection === 'chat' && (
        <AIChat
          onClose={() => setActiveSection('dashboard')}
          tinnitusFrequency={matchedFrequency}
        />
      )}

      {activeSection === 'library' && (
        <SoundLibrary
          onClose={() => setActiveSection('dashboard')}
          isAdmin={user?.role === 'admin'}
        />
      )}

      {activeSection === 'education' && (
        <Education
          onClose={() => setActiveSection('dashboard')}
        />
      )}

      {activeSection === 'breathing' && (
        <BreathingGuide
          onClose={() => setActiveSection('dashboard')}
        />
      )}

      {activeSection === 'custom_noise' && (
        <CustomNoise
          onClose={() => setActiveSection('dashboard')}
          tinnitusFrequency={matchedFrequency}
        />
      )}

      {activeSection === 'medical' && (
        <MedicalProfile
          onClose={() => setActiveSection('dashboard')}
        />
      )}

      {activeSection === 'community' && (
        <Community
          onClose={() => setActiveSection('dashboard')}
        />
      )}

      {activeSection === 'notes' && (
        <ProgressNotes
          onClose={() => setActiveSection('dashboard')}
          openTherapy={(action) => {
            if (action === 'sound_brown') {
              setActiveSection('custom_noise');
            } else if (action === 'breathing') {
              setActiveSection('breathing');
            }
          }}
        />
      )}

      {activeSection === 'profile' && (
        <UserProfile
          onClose={() => setActiveSection('dashboard')}
          onOpenDoctorReport={() => {
            setActiveSection('dashboard');
            exportPDF();
          }}
          onOpenMedical={() => {
            setActiveSection('medical');
          }}
        />
      )}

      {activeSection === 'facial' && (
        <FacialMonitor
          onClose={() => setActiveSection('dashboard')}
          onDetectTension={(level) => {
            setActiveSection('dashboard');
            setTimeout(() => {
              if (window.confirm(`¡Detectamos alta tensión facial (${level}%)!\nTu mandíbula o ceño reflejan estrés, lo que empeora el acúfeno.\n\n¿Quieres hacer una sesión de respiración ahora mismo?`)) {
                setActiveSection('breathing');
              }
            }, 300);
          }}
        />
      )}

      {activeSection === 'spatial' && (
        <SpatialAudio
          onClose={() => setActiveSection('dashboard')}
          initialFrequency={matchedFrequency ? matchedFrequency.frequency : 4000}
          initialType={matchedFrequency ? matchedFrequency.type : 'pure'}
        />
      )}

      {activeSection === 'twin' && (
        <DigitalTwin
          onClose={() => setActiveSection('dashboard')}
          onActionSelect={(actionId) => {
            if (actionId === 'facial') setActiveSection('facial');
            if (actionId === 'spatial') setActiveSection('spatial');
            if (actionId === 'breathing') setActiveSection('breathing');
            if (actionId === 'library') setActiveSection('library');
            if (actionId === 'tracker') setActiveSection('tracker');
          }}
        />
      )}

      {activeSection === 'voice_diary' && (
        <VoiceDiary
          onClose={() => setActiveSection('dashboard')}
        />
      )}

      {activeSection === 'achievements' && (
        <Achievements
          onClose={() => setActiveSection('dashboard')}
        />
      )}

      {activeSection === 'caregiver' && (
        <CaregiverMode
          onClose={() => setActiveSection('dashboard')}
        />
      )}

      {activeSection === 'crisis_prediction' && (
        <CrisisPrediction
          onClose={() => setActiveSection('dashboard')}
          openBreathing={() => setActiveSection('breathing')}
          openSpatialAudio={() => setActiveSection('spatial')}
        />
      )}

      {activeSection === 'guided_sessions' && (
        <GuidedSessions
          onClose={() => setActiveSection('dashboard')}
          openBreathing={() => setActiveSection('breathing')}
        />
      )}

      {activeSection === 'rescue' && (
        <RescueMode
          matchedFrequency={matchedFrequency}
          onClose={() => setActiveSection('dashboard')}
        />
      )}

      {activeSection === 'admin_dashboard' && (
        <AdminDashboard
          onClose={() => setActiveSection('dashboard')}
        />
      )}

      {/* DASHBOARD RENDER PATH */}
      {activeSection === 'dashboard' && (
        <>
          <header className="app-header">
            <div className="user-profile">
              <div className="avatar" onClick={() => setActiveSection('profile')} style={{ cursor: 'pointer' }}>
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="avatar-img" />
                ) : (
                  user?.role === 'admin' ? 'AD' : (user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'U')
                )}
              </div>
              <div onClick={() => setActiveSection('profile')} style={{ cursor: 'pointer' }}>
                <h3>{t('greeting', { name: user?.displayName ? user.displayName.split(' ')[0] : (user?.role === 'admin' ? 'Admin' : 'Usuario') })}</h3>
                <p>
                  {user?.role === 'admin'
                    ? t('greeting_admin')
                    : t('greeting_user')}
                </p>
              </div>
              <button className="dark-toggle" onClick={() => setDarkMode(!darkMode)} aria-label="Toggle dark mode">
                {darkMode ? <Sun size={22} color="#FFD60A" /> : <Moon size={22} color="#007AFF" />}
              </button>
            </div>
          </header>

          {/* Reminder Banner */}
          {(() => {
            const today = new Date().toISOString().split('T')[0];
            const todayLogged = weeklyLogs.some(log => {
              const logDate = log.date ? log.date.split('T')[0] : '';
              return logDate === today;
            });
            if (!todayLogged && !reminderDismissed && step === 'home') {
              return (
                <div className="reminder-banner">
                  <Bell size={16} color="#007AFF" />
                  <span onClick={() => setActiveSection('tracker')}>¿Ya registraste tu día? <strong>Registrar ahora →</strong></span>
                  <button className="reminder-close" onClick={() => setReminderDismissed(true)}>✕</button>
                </div>
              );
            }
            return null;
          })()}

          <main className="app-main">
            
            {/* Banner de Emergencia SOS */}
            <section className="sos-banner card press-effect" onClick={() => setActiveSection('rescue')} style={{
              background: 'linear-gradient(135deg, rgba(255, 59, 48, 0.15) 0%, rgba(255, 45, 85, 0.05) 100%)',
              border: '1px solid rgba(255, 59, 48, 0.3)',
              padding: '16px',
              borderRadius: '20px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              cursor: 'pointer'
            }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '50%',
                background: 'rgba(255, 59, 48, 0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#FF3B30', flexShrink: 0
              }}>
                <AlertTriangle size={24} className="icon-glow" style={{ filter: 'drop-shadow(0 0 8px #FF3B30)' }} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#FF3B30' }}>🚨 ¿Molestia muy fuerte hoy?</h4>
                <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>Pulsa aquí para activar el enmascarador SOS y calmar la tensión.</p>
              </div>
            </section>
            
            {/* Admin Section */}
            {(user?.role === 'admin' || user?.email === 'admin@tinnitoff.com') && (
              <section className="admin-banner highlight-card" style={{ background: 'linear-gradient(135deg, #1e1e24 0%, #0d0d12 100%)', border: '1px solid rgba(0, 229, 255, 0.25)', color: 'white', padding: '20px', borderRadius: '20px', marginBottom: '24px' }}>
                <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Shield size={24} color="#00E5FF" className="icon-glow" style={{ filter: 'drop-shadow(0 0 6px #00E5FF)' }} />
                  <span style={{ fontWeight: '800', letterSpacing: '0.5px' }}>Modo Administrador Activo</span>
                </div>
                <p style={{ marginTop: 8, fontSize: 13, opacity: 0.8, lineHeight: '1.4' }}>
                  Tienes permisos de administrador. Puedes gestionar la biblioteca de sonidos, analizar la telemetría de dispositivos de usuarios, controlar versiones del APK y ver estadísticas de descarga.
                </p>
                <div style={{ display: 'flex', gap: '12px', marginTop: 14 }}>
                  <button className="btn btn-ghost light" style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }} onClick={() => setActiveSection('library')}>
                    Gestionar Sonidos
                  </button>
                  <button className="btn btn-primary" style={{ flex: 1, background: 'linear-gradient(135deg, #00e5ff 0%, #007aff 100%)', border: 'none', boxShadow: '0 4px 12px rgba(0, 229, 255, 0.25)', cursor: 'pointer' }} onClick={() => setActiveSection('admin_dashboard')}>
                    Panel de Control Global
                  </button>
                </div>
              </section>
            )}

            {/* Highlights Section */}
            <section className="highlights">
              <div className="highlight-card primary">
                <div className="card-header">
                  <Volume2 size={24} />
                  <span>Nivel Actual</span>
                </div>
                <div className="card-content">
                  <span className="big-value">
                    {matchedFrequency ? matchedFrequency.frequency : '--'}
                  </span>
                  <span className="unit">
                    {matchedFrequency ? `Hz (${matchedFrequency.type === 'pure' ? 'Pito' : matchedFrequency.type === 'low' ? 'Motor' : 'Ruido'} - ${matchedFrequency.ear === 'left' ? 'Izquierdo' : matchedFrequency.ear === 'right' ? 'Derecho' : 'Ambos'})` : 'dB estimados'}
                  </span>
                </div>
                <button
                  className="btn btn-ghost light"
                  onClick={() => setActiveSection('matcher')}
                >
                  {matchedFrequency ? 'Medir de nuevo' : 'Medir mi Tinnitus'}
                </button>
              </div>
            </section>

            
            {/* Guía de Inicio Rápido */}
            <section className="guide-section" style={{ marginBottom: 24 }}>
              <div className="card guide-card" style={{ border: '1px solid rgba(0, 229, 255, 0.15)', background: 'linear-gradient(180deg, rgba(0, 229, 255, 0.03) 0%, rgba(255, 255, 255, 0) 100%), var(--card-bg)' }}>
                <div className="guide-header" onClick={() => setShowGuide(!showGuide)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Lightbulb size={24} color="#00E5FF" className="icon-glow" />
                    <div style={{ textAlign: 'left' }}>
                      <h4 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--text-main)' }}>💡 Guía de Inicio Rápido</h4>
                      <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)' }}>¿Cómo usar TinnitOff para aliviar tu acúfeno?</p>
                    </div>
                  </div>
                  <ChevronRight size={20} style={{ transform: showGuide ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease', color: 'var(--text-muted)' }} />
                </div>
                
                {showGuide && (
                  <div className="guide-content animate-fade" style={{ marginTop: 20, textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className="guide-step" style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <div className="guide-step-number" style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--primary-light)', border: '1px solid var(--primary)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 14, flexShrink: 0 }}>1</div>
                      <div className="guide-step-text">
                        <h5 style={{ margin: '0 0 4px 0', fontSize: 14, fontWeight: 600, color: 'var(--text-main)' }}>Paso 1: Mide tu Tinnitus (Hz)</h5>
                        <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>Usa la herramienta <strong>Mide tu Tinnitus</strong>. Ajusta el volumen y el tono hasta que escuches un sonido idéntico al de tu tinnitus. Esto calibra tu terapia.</p>
                      </div>
                    </div>
                    
                    <div className="guide-step" style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <div className="guide-step-number" style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(176, 114, 255, 0.15)', border: '1px solid var(--accent)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 14, flexShrink: 0 }}>2</div>
                      <div className="guide-step-text">
                        <h5 style={{ margin: '0 0 4px 0', fontSize: 14, fontWeight: 600, color: 'var(--text-main)' }}>Paso 2: Realiza tu Terapia Diaria</h5>
                        <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>Escucha la <strong>Terapia 3D</strong> o el <strong>Ruido Personalizado</strong> durante 15-20 minutos al día usando auriculares. Esta terapia genera un sonido neutralizador que reentrena tu cerebro para ignorar el zumbido.</p>
                      </div>
                    </div>
                    
                    <div className="guide-step" style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <div className="guide-step-number" style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(52, 199, 89, 0.15)', border: '1px solid var(--success)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 14, flexShrink: 0 }}>3</div>
                      <div className="guide-step-text">
                        <h5 style={{ margin: '0 0 4px 0', fontSize: 14, fontWeight: 600, color: 'var(--text-main)' }}>Paso 3: Monitorea tus Síntomas</h5>
                        <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>Registra tu estado diariamente con el <strong>Registro Diario</strong> o el <strong>Monitor Facial</strong>. Con esto, la Inteligencia Artificial aprenderá tu patrón y podrá predecir posibles crisis.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>
            
            <section className="daily-actions">
              {step === 'home' && (
                <div style={{marginBottom: 20}}>
                  <HomeWidget />
                  <SideQuestsWidget />
                </div>
              )}
              <h3 className="text-gradient">Acciones Diarias</h3>
              
              {/* Terapias y Sonido */}
              <div className="category-section">
                <div className="category-header">
                  <h4 className="category-title"><Volume2 size={20} color="#FF2D55" /> Terapias y Sonido</h4>
                  <p className="category-desc">Herramientas acústicas para reducir la percepción del tinnitus.</p>
                </div>
                <div className="actions-grid stagger-children">
                  <div className="action-item card press-effect gradient-border" onClick={() => setActiveSection('spatial')}>
                    <Headphones size={24} color="#30B0C7" className="icon-glow" />
                    <span>Terapia 3D</span>
                  </div>
                  <div className="action-item card press-effect" onClick={() => setActiveSection('library')}>
                    <Volume2 size={24} color="#FF2D55" className="icon-glow" />
                    <span>{t('action_library')}</span>
                  </div>
                  <div className="action-item card press-effect" onClick={() => setActiveSection('custom_noise')}>
                    <Sliders size={24} color="#007AFF" className="icon-glow" />
                    <span>{t('action_noise')}</span>
                  </div>
                  <div className="action-item card press-effect" onClick={() => setActiveSection('matcher')}>
                    <Sliders size={24} color="#FF9500" className="icon-glow" />
                    <span>{t('action_matcher')}</span>
                  </div>
                </div>
              </div>

              {/* Monitoreo y Progreso */}
              <div className="category-section">
                <div className="category-header">
                  <h4 className="category-title"><TrendingDown size={20} color="#34C759" /> Monitoreo y Progreso</h4>
                  <p className="category-desc">Lleva un registro de tus síntomas y observa tu avance.</p>
                </div>
                <div className="actions-grid stagger-children">
                  <div className="action-item card press-effect" onClick={() => setActiveSection('tracker')}>
                    <Calendar size={24} color="#34C759" className="icon-glow-success" />
                    <span>{t('action_tracker')}</span>
                  </div>
                  <div className="action-item card press-effect gradient-border" onClick={() => setActiveSection('voice_diary')}>
                    <Mic size={24} color="#FF2D55" className="icon-glow" />
                    <span>Diario de Voz</span>
                  </div>
                  <div className="action-item card press-effect" onClick={() => setActiveSection('notes')}>
                    <MessageSquare size={24} color="#007AFF" className="icon-glow" />
                    <span>{t('action_notes')}</span>
                  </div>
                  <div className="action-item card press-effect gradient-border" onClick={() => setActiveSection('achievements')}>
                    <Trophy size={24} color="#FFD700" className="icon-glow" />
                    <span>Mis Logros</span>
                  </div>
                </div>
              </div>

              {/* Relajación y Ejercicios */}
              <div className="category-section">
                <div className="category-header">
                  <h4 className="category-title"><Wind size={20} color="#30B0C7" /> Relajación y Ejercicios</h4>
                  <p className="category-desc">Ejercicios para disminuir el estrés y la tensión física.</p>
                </div>
                <div className="actions-grid stagger-children">
                  <div className="action-item card press-effect" onClick={() => setActiveSection('breathing')}>
                    <Wind size={24} color="#30B0C7" className="icon-glow" />
                    <span>{t('action_breathing')}</span>
                  </div>
                  <div className="action-item card press-effect" onClick={() => setActiveSection('guided_sessions')}>
                    <BookOpen size={24} color="#34C759" className="icon-glow" />
                    <span>Programa 30D</span>
                  </div>
                  <div className="action-item card press-effect gradient-border" onClick={() => setActiveSection('facial')}>
                    <ScanFace size={24} color="#AF52DE" className="icon-glow" />
                    <span>Monitor Facial IA</span>
                  </div>
                </div>
              </div>

              {/* Asistencia Inteligente y Comunidad */}
              <div className="category-section">
                <div className="category-header">
                  <h4 className="category-title"><Brain size={20} color="#5856D6" /> Asistencia y Comunidad</h4>
                  <p className="category-desc">Acompañamiento impulsado por IA y apoyo comunitario.</p>
                </div>
                <div className="actions-grid stagger-children">
                  <div className="action-item card press-effect gradient-border" onClick={() => setActiveSection('twin')}>
                    <Cpu size={24} color="#5856D6" className="icon-glow" />
                    <span>Gemelo Digital (IA)</span>
                  </div>
                  <div className="action-item card press-effect" onClick={() => setActiveSection('chat')}>
                    <MessageSquare size={24} color="#5856D6" className="icon-glow" />
                    <span>{t('action_chat')}</span>
                  </div>
                  <div className="action-item card press-effect" onClick={() => setActiveSection('crisis_prediction')}>
                    <Brain size={24} color="#5856D6" className="icon-glow" />
                    <span>Predicción ML</span>
                  </div>
                  <div className="action-item card press-effect" onClick={() => setActiveSection('community')}>
                    <Users size={24} color="#FF9500" className="icon-glow-warning" />
                    <span>Community</span>
                  </div>
                  <div className="action-item card press-effect" onClick={() => setActiveSection('caregiver')}>
                    <Heart size={24} color="#FF2D55" className="icon-glow" />
                    <span>Cuidador</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Tip del Día */}
            <section className="tip-section">
              <div className="tip-card press-effect">
                <div className="tip-header">
                  <Lightbulb size={18} color="#0A84FF" className="icon-glow" />
                  <span>Tip del Día</span>
                </div>
                <p className="tip-text">{dailyTip}</p>
              </div>
            </section>

            {/* Racha */}
            <section className="streak-section">
              <div className="streak-card">
                <div className="streak-fire">
                  <Flame size={28} color="#007AFF" />
                </div>
                <div className="streak-info">
                  <span className="streak-count">{streak}</span>
                  <span className="streak-label">{streak === 1 ? 'día' : 'días'} consecutivos</span>
                </div>
                <div className="streak-right">
                  {streakData?.lostCount > 0 ? (
                    <button className="recover-btn" onClick={handleRecoverStreak}>
                      Recuperar ({streakData.lostCount})
                    </button>
                  ) : (
                    <span className="streak-msg">
                      {streak >= 7 ? '🏆' : streak >= 3 ? '💪' : '🌱'}
                    </span>
                  )}
                </div>
              </div>
            </section>

            {/* Tu Progreso */}
            <section className="progress-section">
              <div className="progress-header-row">
                <h3>Tu Progreso</h3>
                <button className="export-btn" onClick={exportPDF}>
                  <Download size={14} /> PDF
                </button>
              </div>
              <div className="progress-card">
                <div className="progress-row">
                  <TrendingDown size={20} color="#007AFF" />
                  <div className="progress-info">
                    <span className="progress-title">Intensidad Semanal</span>
                    <span className="progress-subtitle">
                      {weeklyLogs.length > 0
                        ? `${weeklyLogs.length} registros esta semana`
                        : 'Registra tu diario para ver datos reales'}
                    </span>
                  </div>
                </div>
                <div className="progress-bars">
                  {(() => {
                    const days = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
                    const dayData = {};
                    weeklyLogs.forEach(log => {
                      const logDate = log.date ? new Date(log.date) : (log.createdAt?.toDate ? log.createdAt.toDate() : new Date());
                      const dayIdx = (logDate.getDay() + 6) % 7; // Mon=0
                      dayData[dayIdx] = log.tinnitusLevel || 0;
                    });
                    return days.map((day, i) => (
                      <div key={day} className="bar-col">
                        <div className="bar-track">
                          <div
                            className="bar-fill"
                            style={{
                              height: dayData[i] !== undefined ? `${dayData[i]}%` : '0%',
                              opacity: dayData[i] !== undefined ? 1 : 0.2
                            }}
                          ></div>
                        </div>
                        <span className="bar-label">{day}</span>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </section>
          </main>

          {/* Botón Rojo SOS Global */}
          <button 
            onClick={() => setActiveSection('rescue')}
            style={{
              position: 'fixed', bottom: 80, right: 20, zIndex: 100, 
              background: 'linear-gradient(135deg, #FF3B30 0%, #FF2D55 100%)', color: 'white', border: 'none', 
              borderRadius: '50%', width: 56, height: 56, 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 15px rgba(255, 59, 48, 0.4)', cursor: 'pointer',
              animation: 'pulse 2s infinite'
            }}
          >
            <AlertTriangle size={24} />
          </button>

          <nav className="bottom-nav">
            <div className="nav-item" onClick={() => setActiveSection('library')}><Volume2 size={24} /></div>
            <div className="nav-item" onClick={() => setActiveSection('tracker')}><Calendar size={24} /></div>
            <div className="nav-item" onClick={() => setActiveSection('chat')}><MessageSquare size={24} /></div>
            <div className="nav-item" onClick={() => setActiveSection('community')}><Users size={24} /></div>
            <div className="nav-item" onClick={() => setActiveSection('education')}><BookOpen size={24} /></div>
          </nav>
        </>
      )}
    </div>
  );
}

export default App;
