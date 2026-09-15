import React, { useState, useEffect } from 'react';
import { Shield, Mic, Trophy, Heart, Brain, BookOpen, Volume2, Calendar, MessageSquare, ChevronRight, Wind, Sliders, Lightbulb, Flame, TrendingDown, Moon, Sun, Bell, Download, Users, Globe, ScanFace, Headphones, Cpu, AlertTriangle, Home, User, Sparkles, Waves, AudioLines } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { haptic } from './utils/haptics';
import { RescueMode } from './components/mechanics/RescueMode';
import { SideQuestsWidget } from './components/SideQuestsWidget';
import { FirestoreService } from './services/firestoreService';
import { generateDoctorReport } from './utils/reportGenerator';
import { useLanguage } from './contexts/LanguageContext';
import { Device } from '@capacitor/device';
import ErrorBoundary from './components/MobileErrorBoundary';
import LandingPage from './components/LandingPage';
import './App.css';

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
import AssistantHub from './components/AssistantHub';
import SoundLibrary from './components/SoundLibrary';
import Education from './components/Education';
import BreathingGuide from './components/BreathingGuide';
import CustomNoise from './components/CustomNoise';
import Onboarding from './components/Onboarding';
import MedicalDisclaimer from './components/MedicalDisclaimer';
import MedicalProfile from './components/MedicalProfile';
import Community from './components/Community';
import Login from './components/Login';
import ProgressHub from './components/ProgressHub';
import UserProfile from './components/UserProfile';
import FacialMonitor from './components/FacialMonitor';
import SpatialAudio from './components/SpatialAudio';
import DigitalTwin from './components/EnhancedDigitalTwin';
import DashboardHome from './components/DashboardHome';
import THIQuestionnaire from './components/THIQuestionnaire';
import PlansScreen from './components/PlansScreen';
import PremiumLock from './components/PremiumLock';
import WeeklyPlanView from './components/WeeklyPlanView';
import { WeeklyPlanProvider } from './contexts/WeeklyPlanContext';
import { usePlan } from './contexts/PlanContext';
import { PLAN_PREMIUM } from './config/plans';

// CSS Imports (Side Effects)
import './components/FrequencyMatcher.css';
import './components/DailyTracker.css';
import './components/AIChat.css';
import './components/AssistantHub.css';
import './components/SoundLibrary.css';
import './components/Education.css';
import './components/BreathingGuide.css';
import './components/CustomNoise.css';
import './components/Onboarding.css';
import './components/MedicalProfile.css';
import './components/Community.css';
import './components/Login.css';
import './components/ProgressHub.css';
import './components/UserProfile.css';
import './components/FacialMonitor.css';
import './components/SpatialAudio.css';
import './components/DigitalTwin.css';
import './components/DashboardHome.css';
import './components/THIQuestionnaire.css';
import './components/PlansScreen.css';
import './components/PremiumLock.css';
import './components/WeeklyPlanView.css';


const SplashScreen = ({ onFinish }) => {
  const { t, toggleLanguage, language } = useLanguage();
  return (
    <div className="splash-screen">
      <div className="language-toggle" onClick={toggleLanguage}>
        <Globe size={20} />
        <span>{language.toUpperCase()}</span>
      </div>
      {/* Partículas flotantes de fondo */}
      <div className="splash-particles" aria-hidden="true">
        {[...Array(8)].map((_, i) => (
          <div key={i} className={`splash-particle sp-${i + 1}`} />
        ))}
      </div>

      <div className="logo-container">
        {/* Logo animado: orbe sonoro con anillos de pulso */}
        <div className="splash-logo-stage" aria-hidden="true">
          <div className="splash-pulse-ring spr-1" />
          <div className="splash-pulse-ring spr-2" />
          <div className="splash-pulse-ring spr-3" />
          <div className="splash-orb">
            <AudioLines size={44} className="splash-orb-icon" strokeWidth={1.8} />
          </div>
          {/* Ondas laterales tipo marca */}
          <div className="splash-side-waves left">
            <span className="ssw ssw-1" />
            <span className="ssw ssw-2" />
            <span className="ssw ssw-3" />
          </div>
          <div className="splash-side-waves right">
            <span className="ssw ssw-1" />
            <span className="ssw ssw-2" />
            <span className="ssw ssw-3" />
          </div>
        </div>

        <h1 className="brand-name splash-title-enter">{t('welcome_title')}</h1>
        <p className="brand-tagline splash-tagline-enter">{t('welcome_tagline')}</p>

        {/* Barras de ecualizador decorativas */}
        <div className="splash-eq" aria-hidden="true">
          {[...Array(9)].map((_, i) => (
            <span key={i} className="splash-eq-bar" style={{ animationDelay: `${i * 0.12}s` }} />
          ))}
        </div>
      </div>
      <button className="btn btn-primary start-btn splash-btn-enter press-effect" onClick={onFinish}>
        {t('start_btn')} <ChevronRight size={20} />
      </button>
    </div>
  );
};


const NAV_ITEMS = [
  { id: 'dashboard', label: 'Inicio', icon: Home },
  { id: 'chat', label: 'Asistente', icon: MessageSquare },
  { id: 'library', label: 'Terapia', icon: Headphones },
  { id: 'education', label: 'Aprende', icon: BookOpen },
  { id: 'notes', label: 'Progreso', icon: Calendar },
  { id: 'profile', label: 'Perfil', icon: User },
];

const BottomNav = ({ activeSection, onNavigate }) => {
  return (
    <motion.nav
      className="bottom-nav"
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 320, damping: 30 }}
    >
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = activeSection === item.id;
        return (
          <button
            key={item.id}
            className={`nav-item ${isActive ? 'active' : ''}`}
            onClick={() => { haptic(12); onNavigate(item.id); }}
            aria-label={item.label}
          >
            {isActive && (
              <motion.span
                layoutId="nav-pill"
                className="nav-pill"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
            <Icon size={20} className="nav-icon" />
            <span className="nav-label">{item.label}</span>
            {isActive && (
              <motion.span
                layoutId="nav-dot"
                className="nav-dot"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
          </button>
        );
      })}
    </motion.nav>
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
  const { can } = usePlan();
  const [user, setUser] = useState(null); // Auth State
  const [step, setStep] = useState('splash');
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard'); // SPA view switcher instead of modals stack
  const [matchedFrequency, setMatchedFrequency] = useState(null);
  const [lastTHI, setLastTHI] = useState(null);
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

    // Save root user metadata to ensure it physically exists for Admin Dashboard query
    try {
      await FirestoreService.saveUserMetadata(userData.uid, {
        email: userData.email,
        displayName: userData.displayName,
        photoURL: userData.photoURL || null,
        role: userData.role || 'user'
      });
    } catch (e) {
      console.error("Error saving root user metadata:", e);
    }

    // Reflejar el usuario de Firebase en el backend (panel administrativo)
    try {
      const { ClinicalService } = await import('./services/backend/clinicalService');
      const backendUser = await ClinicalService.syncPatient(userData.uid, {
        email: userData.email,
        username: userData.displayName || userData.email,
      });
      if (backendUser?.role) {
        const backendRole = backendUser.role === 'ROLE_ADMIN' ? 'admin' : 'user';
        setUser((prev) => ({ ...prev, role: backendRole }));
        await FirestoreService.saveUserMetadata(userData.uid, {
          email: userData.email,
          displayName: userData.displayName,
          photoURL: userData.photoURL || null,
          role: backendRole
        });
      }
    } catch (e) {
      console.warn('Error sincronizando paciente al backend:', e);
    }

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
      const thi = await FirestoreService.getLastTHI(userData.uid);
      if (thi) {
        setLastTHI(thi);
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
    if (user) {
      await FirestoreService.saveAudiometry(user.uid, data, { email: user.email, username: user.displayName || user.email });
    }
    // Orden cronológico: tras medir la frecuencia, presentar el test THI
    setActiveSection('thi');
  };

  const handleCompleteTHI = async (result, navigateToPlan = false) => {
    setLastTHI(result);
    if (user) {
      try {
        await FirestoreService.saveTHIResult(user.uid, result, { email: user.email, username: user.displayName || user.email });
      } catch (e) {
        console.error('Error saving THI result:', e);
      }
    }
    if (navigateToPlan) {
      setActiveSection('weekly_plan');
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
          alert('¡Racha recuperada!');
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

  const showBottomNav = ['dashboard', 'chat', 'library', 'education', 'notes', 'profile', 'weekly_plan'].includes(activeSection);

  return (
    <div className={`app-container animated-bg ${showBottomNav ? 'has-bottom-nav' : ''}`}>
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
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSection}
          className="screen-transition"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -14 }}
          transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
        >
        {activeSection === 'matcher' && (
        <FrequencyMatcher
          onComplete={handleCompleteMatcher}
          onCancel={() => setActiveSection('dashboard')}
        />
      )}

      {activeSection === 'thi' && (
        <THIQuestionnaire
          onClose={() => setActiveSection('dashboard')}
          onComplete={handleCompleteTHI}
          previousTHI={lastTHI}
          matchedFrequency={matchedFrequency}
        />
      )}

      {activeSection === 'weekly_plan' && (
        <WeeklyPlanView onBack={() => setActiveSection('dashboard')} />
      )}

      {activeSection === 'tracker' && (
        <DailyTracker
          onSave={handleSaveTracker}
          onClose={() => setActiveSection('dashboard')}
        />
      )}

      {activeSection === 'chat' && (
        <AssistantHub
          onClose={() => setActiveSection('dashboard')}
          tinnitusFrequency={matchedFrequency}
          onNavigate={(section) => setActiveSection(section)}
        />
      )}

      {activeSection === 'library' && (
        <SoundLibrary
          onClose={() => setActiveSection('dashboard')}
          isAdmin={user?.role === 'admin'}
          tinnitusFrequency={matchedFrequency}
          onUpgrade={() => setActiveSection('plans')}
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
        can('create_sounds') ? (
          <CustomNoise
            onClose={() => setActiveSection('dashboard')}
            tinnitusFrequency={matchedFrequency}
          />
        ) : (
          <PremiumLock
            title="Crea tus propios sonidos"
            description="La Terapia Acústica para diseñar tu propio sonido con notch y modulación es una función Premium."
            requiredPlan={PLAN_PREMIUM}
            onUpgrade={() => setActiveSection('plans')}
            onClose={() => setActiveSection('dashboard')}
          />
        )
      )}

      {activeSection === 'plans' && (
        <PlansScreen onClose={() => setActiveSection('dashboard')} />
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
        <ProgressHub
          onClose={() => setActiveSection('dashboard')}
          openTherapy={(action) => {
            if (action === 'sound_brown') {
              setActiveSection('custom_noise');
            } else if (action === 'breathing') {
              setActiveSection('breathing');
            }
          }}
          lastTHI={lastTHI}
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
          onOpenPlans={() => setActiveSection('plans')}
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

      {/* DASHBOARD RENDER PATH */}
      {activeSection === 'dashboard' && (
        <DashboardHome
          user={user}
          streak={streak}
          dailyTip={dailyTip}
          matchedFrequency={matchedFrequency}
          lastTHI={lastTHI}
          onNavigate={(section) => setActiveSection(section)}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />
      )}

        </motion.div>
      </AnimatePresence>

      {/* PERSISTENT BOTTOM NAVIGATION TAB BAR */}
      {showBottomNav && (
        <BottomNav activeSection={activeSection} onNavigate={setActiveSection} />
      )}
    </div>
  );
}

export default function AppWithProviders() {
  return (
    <ErrorBoundary>
      <WeeklyPlanProvider>
        <App />
      </WeeklyPlanProvider>
    </ErrorBoundary>
  );
}
