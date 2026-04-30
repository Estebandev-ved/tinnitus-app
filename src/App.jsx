import React, { useState, useEffect } from 'react';
import { Shield, Mic, Trophy, Heart, Brain, BookOpen, Volume2, Calendar, MessageSquare, ChevronRight, Wind, Sliders, Lightbulb, Flame, TrendingDown, Moon, Sun, Bell, Download, Users, Globe, ScanFace, Headphones, Cpu, AlertTriangle } from 'lucide-react';
import { RescueMode } from './components/mechanics/RescueMode';
import { SideQuestsWidget } from './components/SideQuestsWidget';
import { FirestoreService } from './services/firestoreService';
import { generateDoctorReport } from './utils/reportGenerator';
import { useLanguage } from './contexts/LanguageContext';
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
import Onboarding from './components/Onboarding'; // cache bust
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
  const [showMatcher, setShowMatcher] = useState(false);
  const [showTracker, setShowTracker] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [showEducation, setShowEducation] = useState(false);
  const [showBreathing, setShowBreathing] = useState(false);
  const [showCustomNoise, setShowCustomNoise] = useState(false);
  const [showMedical, setShowMedical] = useState(false);
  const [showCommunity, setShowCommunity] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showVoiceDiary, setShowVoiceDiary] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showCaregiverMode, setShowCaregiverMode] = useState(false);
  const [showCrisisPrediction, setShowCrisisPrediction] = useState(false);
  const [showGuidedSessions, setShowGuidedSessions] = useState(false);
  const [showRescueMode, setShowRescueMode] = useState(false);
  const [achievementBanner, setAchievementBanner] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showFacialMonitor, setShowFacialMonitor] = useState(false);
  const [showSpatialAudio, setShowSpatialAudio] = useState(false);
  const [showTwin, setShowTwin] = useState(false);
  const [matchedFrequency, setMatchedFrequency] = useState(null);

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
    const hourBlock = Math.floor(Date.now() / (4 * 60 * 60 * 1000)); // changes every 4h
    setTipIndex(hourBlock % DAILY_TIPS.length);
  }, []);
  const dailyTip = DAILY_TIPS[tipIndex];

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
    // Check if logged in, if not show Login, else Disclaimer
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
    // Show onboarding if first time
    const onboarded = localStorage.getItem('tinnitoff_onboarded');
    if (!onboarded) {
      setStep('onboarding');
    } else {
      setStep('home');
    }
  };

  const handleCompleteMatcher = async (data) => {
    setMatchedFrequency(data);
    setShowMatcher(false);
    if (user) {
      await FirestoreService.saveAudiometry(user.uid, data);
      alert(`¡Acufenometría guardada correctamente en tu perfil médico!`);
    }
  };


  const handleSaveTracker = async (data) => {
    console.log("Tracker Data Saved:", data);
    setShowTracker(false);
    // Update streak in Firestore
    if (user) {
      try {
        const result = await FirestoreService.updateStreak(user.uid);
        setStreakData(result);
        setStreak(result.count || 0);
        // Refresh progress data
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

    // Fetch latest data for report
    try {
      const notes = await FirestoreService.getProgressNotes(user.uid, 50);
      const profile = await FirestoreService.getMedicalProfile(user.uid);
      // logs are already in weeklyLogs state, but let's ensure we have them

      generateDoctorReport(user, profile, weeklyLogs, notes, matchedFrequency);
    } catch (e) {
      console.error("Error generating report:", e);
      alert("Error al generar el reporte.");
    }
  };

  const closeAll = () => {
    setShowMatcher(false);
    setShowTracker(false);
    setShowChat(false);
    setShowLibrary(false);
    setShowEducation(false);
    setShowNotes(false);
    setShowProfile(false);
    setShowFacialMonitor(false);
    setShowSpatialAudio(false);
    setShowTwin(false);
    setShowCaregiverMode(false);
  };

  const openFeature = (setter) => {
    // Optional: closeAll(); if we want exclusive views
    setter(true);
  };

  if (step === 'login') {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  if (step === 'splash') {
    // ... (splash render unchanged) ...
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
      {/* ... main app content ... */}
      {showMatcher && (
        <FrequencyMatcher
          onComplete={handleCompleteMatcher}
          onCancel={() => setShowMatcher(false)}
        />
      )}
      {showTracker && (
        <DailyTracker
          onSave={handleSaveTracker}
          onClose={() => setShowTracker(false)}
        />
      )}
      {showChat && (
        <AIChat
          onClose={() => setShowChat(false)}
          tinnitusFrequency={matchedFrequency}
        />
      )}
      


      {showLibrary && (
        <SoundLibrary
          onClose={() => setShowLibrary(false)}
          isAdmin={user?.role === 'admin'}
        />
      )}
      {showEducation && (
        <Education
          onClose={() => setShowEducation(false)}
        />
      )}
      {showBreathing && (
        <BreathingGuide
          onClose={() => setShowBreathing(false)}
        />
      )}
      {showCustomNoise && (
        <CustomNoise
          onClose={() => setShowCustomNoise(false)}
          tinnitusFrequency={matchedFrequency}
        />
      )}
      {showMedical && (
        <MedicalProfile
          onClose={() => setShowMedical(false)}
        />
      )}
      {showCommunity && (
        <Community
          onClose={() => setShowCommunity(false)}
        />
      )}
      {showNotes && (
        <ProgressNotes
          onClose={() => setShowNotes(false)}
          openTherapy={(action) => {
            if (action === 'sound_brown') {
              setShowCustomNoise(true);
            } else if (action === 'breathing') {
              setShowBreathing(true);
            }
          }}
        />
      )}
      {showProfile && (
        <UserProfile
          onClose={() => setShowProfile(false)}
          onOpenDoctorReport={() => {
            setShowProfile(false);
            exportPDF(); // Will be replaced by new DoctorReport component later
          }}
          onOpenMedical={() => {
            setShowProfile(false);
            setShowMedical(true);
          }}
        />
      )}
      {showFacialMonitor && (
        <FacialMonitor
          onClose={() => setShowFacialMonitor(false)}
          onDetectTension={(level) => {
            // Let user know tension is high, suggest breathing
            setShowFacialMonitor(false);
            setTimeout(() => {
              if (window.confirm(`¡Detectamos alta tensión facial (${level}%)!\nTu mandíbula o ceño reflejan estrés, lo que empeora el acúfeno.\n\n¿Quieres hacer una sesión de respiración ahora mismo?`)) {
                setShowBreathing(true);
              }
            }, 300);
          }}
        />
      )}
      {showSpatialAudio && (
        <SpatialAudio
          onClose={() => setShowSpatialAudio(false)}
          initialFrequency={matchedFrequency ? matchedFrequency.frequency : 4000}
          initialType={matchedFrequency ? matchedFrequency.type : 'pure'}
        />
      )}
      {showTwin && (
        <DigitalTwin
          onClose={() => setShowTwin(false)}
          onActionSelect={(actionId) => {
            setShowTwin(false);
            if (actionId === 'facial') setShowFacialMonitor(true);
            if (actionId === 'spatial') setShowSpatialAudio(true);
            if (actionId === 'breathing') setShowBreathing(true);
            if (actionId === 'library') setShowLibrary(true);
            if (actionId === 'tracker') setShowTracker(true);
          }}
        />
      )}

      <header className="app-header">
        <div className="user-profile">
          <div className="avatar" onClick={() => setShowProfile(true)} style={{ cursor: 'pointer' }}>
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="avatar-img" />
            ) : (
              user?.role === 'admin' ? 'AD' : (user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'U')
            )}
          </div>
          <div onClick={() => setShowProfile(true)} style={{ cursor: 'pointer' }}>
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
              <span onClick={() => setShowTracker(true)}>¿Ya registraste tu día? <strong>Registrar ahora →</strong></span>
              <button className="reminder-close" onClick={() => setReminderDismissed(true)}>✕</button>
            </div>
          );
        }
        return null;
      })()}

      <main className="app-main">
        
        {/* Admin Section */}
        {user?.role === 'admin' && (
          <section className="admin-banner highlight-card" style={{ background: '#333', color: 'white' }}>
            <div className="card-header">
              <Shield size={24} color="#FF9500" />
              <span>Modo Administrador</span>
            </div>
            <p style={{ marginTop: 8, fontSize: 13, opacity: 0.8 }}>
              Tienes permisos para gestionar la Biblioteca de Sonidos.
            </p>
            <button className="btn btn-ghost light" style={{ marginTop: 10 }} onClick={() => setShowLibrary(true)}>
              Gestionar Sonidos
            </button>
          </section>
        )}

        {/* ... Highlights Section ... */}
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
              onClick={() => setShowMatcher(true)}
            >
              {matchedFrequency ? 'Repetir Examen' : 'Realizar Examen'}
            </button>
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
          <div className="actions-grid stagger-children">
            <div className="action-item card press-effect gradient-border" onClick={() => setShowTwin(true)}>
              <Cpu size={24} color="#5856D6" className="icon-glow" />
              <span>Gemelo Digital (IA)</span>
            </div>
            <div className="action-item card press-effect gradient-border" onClick={() => setShowSpatialAudio(true)}>
              <Headphones size={24} color="#30B0C7" className="icon-glow" />
              <span>Terapia 3D</span>
            </div>
            <div className="action-item card press-effect gradient-border" onClick={() => setShowFacialMonitor(true)}>
              <ScanFace size={24} color="#AF52DE" className="icon-glow" />
              <span>Monitor Facial IA</span>
            </div>
            <div className="action-item card press-effect" onClick={() => setShowMatcher(true)}>
              <Sliders size={24} color="#FF9500" className="icon-glow" />
              <span>{t('action_matcher')}</span>
            </div>
            <div className="action-item card press-effect" onClick={() => setShowTracker(true)}>
              <Calendar size={24} color="#34C759" className="icon-glow-success" />
              <span>{t('action_tracker')}</span>
            </div>
            <div className="action-item card press-effect" onClick={() => setShowChat(true)}>
              <MessageSquare size={24} color="#5856D6" className="icon-glow" />
              <span>{t('action_chat')}</span>
            </div>
            <div className="action-item card press-effect" onClick={() => setShowCommunity(true)}>
              <Users size={24} color="#FF9500" className="icon-glow-warning" />
              <span>Community</span>
            </div>
            <div className="action-item card press-effect" onClick={() => setShowLibrary(true)}>
              <Volume2 size={24} color="#FF2D55" className="icon-glow" />
              <span>{t('action_library')}</span>
            </div>

            <div className="action-item card press-effect" onClick={() => setShowBreathing(true)}>
              <Wind size={24} color="#30B0C7" className="icon-glow" />
              <span>{t('action_breathing')}</span>
            </div>
            <div className="action-item card press-effect" onClick={() => setShowCustomNoise(true)}>
              <Sliders size={24} color="#007AFF" className="icon-glow" />
              <span>{t('action_noise')}</span>
            </div>
            <div className="action-item card press-effect" onClick={() => setShowNotes(true)}>
              <MessageSquare size={24} color="#007AFF" className="icon-glow" />
              <span>{t('action_notes')}</span>
            </div>
            <div className="action-item card press-effect gradient-border" onClick={() => setShowVoiceDiary(true)}>
              <Mic size={24} color="#FF2D55" className="icon-glow" />
              <span>Diario de Voz</span>
            </div>
            <div className="action-item card press-effect gradient-border" onClick={() => setShowAchievements(true)}>
              <Trophy size={24} color="#FFD700" className="icon-glow" />
              <span>Mis Logros</span>
            </div>
            <div className="action-item card press-effect" onClick={() => setShowCaregiverMode(true)}>
              <Heart size={24} color="#FF2D55" className="icon-glow" />
              <span>Cuidador</span>
            </div>
            <div className="action-item card press-effect" onClick={() => setShowCrisisPrediction(true)}>
              <Brain size={24} color="#5856D6" className="icon-glow" />
              <span>Predicción ML</span>
            </div>
            <div className="action-item card press-effect" onClick={() => setShowGuidedSessions(true)}>
              <BookOpen size={24} color="#34C759" className="icon-glow" />
              <span>Programa 30D</span>
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
                // Map logs to days of week
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

      {showVoiceDiary && <VoiceDiary onClose={() => setShowVoiceDiary(false)} />}
      {showAchievements && <Achievements onClose={() => setShowAchievements(false)} />}
      {showCaregiverMode && <CaregiverMode onClose={() => setShowCaregiverMode(false)} />}
      {showCrisisPrediction && <CrisisPrediction onClose={() => setShowCrisisPrediction(false)} openBreathing={() => setShowBreathing(true)} openSpatialAudio={() => setShowSpatialAudio(true)} />}
      {showGuidedSessions && <GuidedSessions onClose={() => setShowGuidedSessions(false)} openBreathing={() => setShowBreathing(true)} />}
      {showRescueMode && <RescueMode onClose={() => setShowRescueMode(false)} />}
      
      {/* Botón Rojo SOS Global */}
      <button 
        onClick={() => setShowRescueMode(true)}
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
        <div className="nav-item" onClick={() => setShowLibrary(true)}><Volume2 size={24} /></div>
        <div className="nav-item" onClick={() => setShowTracker(true)}><Calendar size={24} /></div>
        <div className="nav-item" onClick={() => setShowChat(true)}><MessageSquare size={24} /></div>
        <div className="nav-item" onClick={() => setShowCommunity(true)}><Users size={24} /></div>
        <div className="nav-item" onClick={() => setShowEducation(true)}><BookOpen size={24} /></div>
      </nav>
    </div>
  );
}

export default App;
