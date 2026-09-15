import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  ChevronRight, 
  CheckCircle, 
  Headphones, 
  Sliders, 
  ClipboardList, 
  Sparkles, 
  Volume2,
  AlertCircle,
  ArrowRight,
  Loader2,
  Bell,
  Mic
} from 'lucide-react';
import { FirestoreService } from '../services/firestoreService';
import FrequencyMatcher from './FrequencyMatcher';
import THIQuestionnaire from './THIQuestionnaire';
import { useLanguage } from '../contexts/LanguageContext';
import './OnboardingWizard.css';

const STEPS = [
  {
    id: 'welcome',
    icon: Sparkles,
    titleKey: 'onboarding_welcome_title',
    subtitleKey: 'onboarding_welcome_subtitle',
    descriptionKey: 'onboarding_welcome_desc',
    primaryAction: 'requestPermissions',
  },
  {
    id: 'frequency',
    icon: Sliders,
    titleKey: 'onboarding_freq_title',
    subtitleKey: 'onboarding_freq_subtitle',
    descriptionKey: 'onboarding_freq_desc',
    primaryAction: 'calibrateFrequency',
  },
  {
    id: 'thi',
    icon: ClipboardList,
    titleKey: 'onboarding_thi_title',
    subtitleKey: 'onboarding_thi_subtitle',
    descriptionKey: 'onboarding_thi_desc',
    primaryAction: 'completeTHI',
  },
  {
    id: 'preferences',
    icon: Headphones,
    titleKey: 'onboarding_pref_title',
    subtitleKey: 'onboarding_pref_subtitle',
    descriptionKey: 'onboarding_pref_desc',
    primaryAction: 'savePreferences',
  },
];

const SOUND_OPTIONS = [
  { id: 'white', labelKey: 'sound_white', descKey: 'sound_white_desc', icon: Volume2, color: '#00B4D8' },
  { id: 'pink', labelKey: 'sound_pink', descKey: 'sound_pink_desc', icon: Volume2, color: '#A78BFA' },
  { id: 'brown', labelKey: 'sound_brown', descKey: 'sound_brown_desc', icon: Volume2, color: '#F472B6' },
  { id: 'adaptive', labelKey: 'sound_adaptive', descKey: 'sound_adaptive_desc', icon: Sparkles, color: '#2DD4BF' },
];

export default function OnboardingWizard({ user, onComplete, matchedFrequency: initialFrequency, lastTHI: initialTHI }) {
  const { t } = useLanguage();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [frequencyData, setFrequencyData] = useState(initialFrequency);
  const [thiResult, setThiResult] = useState(initialTHI);
  const [soundPreference, setSoundPreference] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [permissionsRequested, setPermissionsRequested] = useState(false);
  
  const stepRefs = useRef({});
  const progressRingRef = useRef(null);

  const currentStep = STEPS[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === STEPS.length - 1;
  const isStepComplete = completedSteps.has(currentStep.id);
  const canProceed = isStepComplete || currentStep.id === 'welcome';

  useEffect(() => {
    const savedProgress = localStorage.getItem(`onboarding_progress_${user?.uid}`);
    if (savedProgress) {
      try {
        const parsed = JSON.parse(savedProgress);
        if (parsed.frequencyData) setFrequencyData(parsed.frequencyData);
        if (parsed.thiResult) setThiResult(parsed.thiResult);
        if (parsed.soundPreference) setSoundPreference(parsed.soundPreference);
        if (parsed.completedSteps) setCompletedSteps(new Set(parsed.completedSteps));
        if (parsed.currentStepIndex !== undefined) setCurrentStepIndex(parsed.currentStepIndex);
      } catch (e) {
        console.warn('Failed to restore onboarding progress:', e);
      }
    }
  }, [user?.uid]);

  const saveProgress = useCallback(() => {
    if (!user?.uid) return;
    const progress = {
      frequencyData,
      thiResult,
      soundPreference,
      completedSteps: Array.from(completedSteps),
      currentStepIndex,
      timestamp: Date.now(),
    };
    localStorage.setItem(`onboarding_progress_${user.uid}`, JSON.stringify(progress));
  }, [user?.uid, frequencyData, thiResult, soundPreference, completedSteps, currentStepIndex]);

  useEffect(() => { saveProgress(); }, [saveProgress]);

  const markStepComplete = useCallback((stepId) => {
    setCompletedSteps(prev => new Set([...prev, stepId]));
  }, []);

  const goToNextStep = useCallback(() => {
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      handleFinalComplete();
    }
  }, [currentStepIndex]);

  const goToPrevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  }, [currentStepIndex]);

  const requestPermissions = useCallback(async () => {
    setIsProcessing(true);
    setError(null);
    try {
      if ('Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission();
      }
      if (navigator.mediaSession) {
        try {
          await navigator.mediaSession.setActionHandler('play', () => {});
        } catch { /* ignore */ }
      }
      setPermissionsRequested(true);
      markStepComplete('welcome');
      setTimeout(goToNextStep, 600);
    } catch (e) {
      setError(t('permission_error'));
      console.error('Permission error:', e);
    } finally {
      setIsProcessing(false);
    }
  }, [t, markStepComplete, goToNextStep]);

  const handleFrequencyComplete = async (data) => {
    setFrequencyData(data);
    markStepComplete('frequency');
      if (user?.uid) {
        try {
          await FirestoreService.saveAudiometry(user.uid, data, {
            email: user.email,
            username: user.displayName || user.email,
          });
        } catch (e) {
          console.error('Failed to save frequency:', e);
        }
      }
    setTimeout(goToNextStep, 800);
  };

  const handleTHIComplete = async (result) => {
    setThiResult(result);
    markStepComplete('thi');
      if (user?.uid) {
        try {
          await FirestoreService.saveTHIResult(user.uid, result, {
            email: user.email,
            username: user.displayName || user.email,
          });
        } catch (e) {
          console.error('Failed to save THI:', e);
        }
      }
    setTimeout(goToNextStep, 800);
  };

  const handleSoundSelect = (optionId) => {
    setSoundPreference(optionId);
    markStepComplete('preferences');
  };

  const handleFinalComplete = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      if (user?.uid && soundPreference) {
        await FirestoreService.saveUserPreferences(user.uid, {
          soundPreference,
          onboardingCompleted: true,
          onboardingVersion: 2,
          completedAt: new Date().toISOString(),
        });
        await FirestoreService.saveUserMetadata(user.uid, {
          onboardingCompleted: true,
          onboardingCompletedAt: new Date().toISOString(),
        });
      }
      localStorage.setItem('tinnitoff_onboarded', 'true');
      localStorage.removeItem(`onboarding_progress_${user?.uid}`);
      setShowConfetti(true);
      setTimeout(() => onComplete(), 2500);
    } catch (e) {
      setError(t('save_error'));
      console.error('Onboarding complete error:', e);
    } finally {
      setIsProcessing(false);
    }
  };

  const skipStep = () => {
    if (!isLastStep) {
      markStepComplete(currentStep.id);
      goToNextStep();
    }
  };

  const renderStepContent = () => {
    switch (currentStep.id) {
      case 'welcome':
        return (
          <WelcomeStep 
            onAction={requestPermissions} 
            isProcessing={isProcessing && currentStep.id === 'welcome'}
            permissionsRequested={permissionsRequested}
            t={t}
          />
        );
      case 'frequency':
        if (frequencyData) {
          return (
            <FrequencyCompleteStep 
              data={frequencyData} 
              onRedo={() => { setFrequencyData(null); markStepComplete('frequency'); }}
              t={t}
            />
          );
        }
        return (
          <FrequencyMatcher
            onComplete={handleFrequencyComplete}
            onCancel={goToPrevStep}
            embedded={true}
            initialFrequency={frequencyData?.frequency}
          />
        );
      case 'thi':
        if (thiResult) {
          return (
            <THICompleteStep 
              result={thiResult} 
              onRedo={() => { setThiResult(null); markStepComplete('thi'); }}
              t={t}
            />
          );
        }
        return (
          <THIQuestionnaire
            onClose={goToPrevStep}
            onComplete={handleTHIComplete}
            previousTHI={thiResult}
            matchedFrequency={frequencyData}
            embedded={true}
          />
        );
      case 'preferences':
        return (
          <PreferencesStep
            selected={soundPreference}
            onSelect={handleSoundSelect}
            t={t}
          />
        );
      default:
        return null;
    }
  };

  const progress = ((completedSteps.size + (isStepComplete ? 0 : 0)) / STEPS.length) * 100;
  const visualProgress = Math.max(progress, (currentStepIndex / STEPS.length) * 100);

  return (
    <div className="onboarding-wizard">
      <div className="wizard-bg">
        <div className="bg-gradient-orb orb-1" />
        <div className="bg-gradient-orb orb-2" />
        <div className="bg-gradient-orb orb-3" />
        <div className="particles-container">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="particle" style={{ 
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${8 + Math.random() * 4}s`,
            }} />
          ))}
        </div>
      </div>

      <div className="wizard-container" role="main">
        <header className="wizard-header">
          <div className="progress-ring-wrapper">
            <svg className="progress-ring" ref={progressRingRef} viewBox="0 0 120 120">
              <circle 
                className="progress-ring-bg" 
                cx="60" cy="60" r="54" 
                fill="none" strokeWidth="8"
              />
              <circle 
                className="progress-ring-fill" 
                cx="60" cy="60" r="54" 
                fill="none" strokeWidth="8"
                strokeDasharray="339.3"
                strokeDashoffset={339.3 - (339.3 * visualProgress / 100)}
                style={{ 
                  transition: 'stroke-dashoffset 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  transform: 'rotate(-90deg)',
                  transformOrigin: '60px 60px',
                }}
              />
              <text 
                x="60" y="68" 
                className="progress-ring-text"
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {Math.round(visualProgress)}%
              </text>
            </svg>
          </div>
          <div className="step-indicators" role="progressbar" aria-valuenow={currentStepIndex + 1} aria-valuemin={1} aria-valuemax={STEPS.length}>
            {STEPS.map((step, i) => (
              <button
                key={step.id}
                className={`step-dot ${completedSteps.has(step.id) ? 'done' : ''} ${i === currentStepIndex ? 'active' : ''} ${i < currentStepIndex && !completedSteps.has(step.id) ? 'skipped' : ''}`}
                onClick={() => i <= currentStepIndex || completedSteps.has(step.id) ? setCurrentStepIndex(i) : null}
                disabled={i > currentStepIndex && !completedSteps.has(step.id)}
                aria-label={`${t('step')} ${i + 1}: ${t(step.titleKey)}`}
                aria-current={i === currentStepIndex ? 'step' : undefined}
              >
                {completedSteps.has(step.id) ? <CheckCircle size={14} /> : <span className="dot-number">{i + 1}</span>}
              </button>
            ))}
          </div>
        </header>

        <div className="wizard-content" role="region" aria-label={t(currentStep.titleKey)}>
          <div className="step-header">
            <div className="step-icon-wrapper">
              <currentStep.icon className="step-icon" size={28} />
            </div>
            <h1 className="step-title">{t(currentStep.titleKey)}</h1>
            <p className="step-subtitle">{t(currentStep.subtitleKey)}</p>
            <p className="step-description">{t(currentStep.descriptionKey)}</p>
          </div>

          <div className="step-body">
            {renderStepContent()}
          </div>

          {error && (
            <div className="wizard-error" role="alert">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <footer className="wizard-footer">
            {!isFirstStep && (
              <button 
                className="btn-ghost" 
                onClick={goToPrevStep}
                disabled={isProcessing}
              >
                <ChevronRight size={18} style={{ transform: 'rotate(180deg)' }} />
                {t('back')}
              </button>
            )}
            <div className="footer-actions">
              {currentStep.id === 'welcome' && !permissionsRequested && (
                <button 
                  className="btn-skip" 
                  onClick={skipStep}
                  disabled={isProcessing}
                >
                  {t('skip')}
                </button>
              )}
              {(isStepComplete || currentStep.id === 'welcome') && !isLastStep && !isProcessing && (
                <button 
                  className="btn-primary" 
                  onClick={goToNextStep}
                >
                  {t('next')} <ArrowRight size={18} />
                </button>
              )}
              {isLastStep && isStepComplete && (
                <button 
                  className="btn-primary btn-finish" 
                  onClick={handleFinalComplete}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={18} className="spinning" />
                      {t('finishing')}
                    </>
                  ) : (
                    <>
                      {t('finish')} <CheckCircle size={18} />
                    </>
                  )}
                </button>
              )}
            </div>
          </footer>
        </div>
      </div>

      {showConfetti && <ConfettiCelebration />}
    </div>
  );
}

function WelcomeStep({ onAction, isProcessing, permissionsRequested, t }) {
  const [animate, setAnimate] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="welcome-step" data-animate={animate}>
      <div className="illustration-wrapper">
        <div className="ear-illustration">
          <div className="ear-shape">
            <div className="ear-inner" />
            <div className="ear-canal" />
          </div>
          <div className="sound-waves">
            <div className="wave wave-1" />
            <div className="wave wave-2" />
            <div className="wave wave-3" />
          </div>
          <div className="particle-burst">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="burst-particle" style={{ 
                transform: `rotate(${i * 45}deg) translateY(-60px) rotate(${-i * 45}deg)` 
              }} />
            ))}
          </div>
        </div>
      </div>
      
      <div className="welcome-features">
        <FeatureItem icon={Bell} titleKey="feature_notifications" descKey="feature_notifications_desc" />
        <FeatureItem icon={Mic} titleKey="feature_audio" descKey="feature_audio_desc" />
        <FeatureItem icon={Sparkles} titleKey="feature_ai" descKey="feature_ai_desc" />
      </div>

      <button 
        className="btn-primary btn-lg" 
        onClick={onAction}
        disabled={isProcessing || permissionsRequested}
      >
        {isProcessing ? (
          <>
            <Loader2 size={20} className="spinning" />
            {t('requesting_permissions')}
          </>
        ) : permissionsRequested ? (
          <>
            <CheckCircle size={20} />
            {t('permissions_granted')}
          </>
        ) : (
          <>
            {t('grant_permissions')} <ArrowRight size={20} />
          </>
        )}
      </button>
    </div>
  );
}

function FeatureItem({ icon: Icon, titleKey, descKey }) {
  const { t } = useLanguage();
  return (
    <div className="feature-item">
      <div className="feature-icon"><Icon size={20} /></div>
      <div className="feature-text">
        <h4>{t(titleKey)}</h4>
        <p>{t(descKey)}</p>
      </div>
    </div>
  );
}

function FrequencyCompleteStep({ data, onRedo, t }) {
  return (
    <div className="complete-step">
      <div className="complete-icon success">
        <CheckCircle size={48} />
      </div>
      <h3>{t('frequency_saved')}</h3>
      <div className="frequency-badge">
        <span className="freq-value">{data.frequency} Hz</span>
        <span className="freq-type">{t(`freq_type_${data.type}`)}</span>
      </div>
      <p className="complete-desc">{t('frequency_saved_desc')}</p>
      <button className="btn-ghost" onClick={onRedo}>
        {t('recalibrate')}
      </button>
    </div>
  );
}

function THICompleteStep({ result, onRedo, t }) {
  const gradeColors = {
    slight: '#34C759',
    mild: '#30B0C7',
    moderate: '#FF9500',
    severe: '#FF3B30',
    catastrophic: '#AF52DE',
  };
  const color = gradeColors[result.grade] || '#00B4D8';

  return (
    <div className="complete-step">
      <div className="complete-icon" style={{ background: `linear-gradient(135deg, ${color}20, ${color}40)`, borderColor: color }}>
        <ClipboardList size={48} style={{ color }} />
      </div>
      <h3>{t('thi_completed')}</h3>
      <div className="thi-result" style={{ borderColor: color }}>
        <span className="thi-grade" style={{ color }}>{t(`thi_grade_${result.grade}`)}</span>
        <span className="thi-score">{result.score} / 100</span>
      </div>
      <p className="complete-desc">{t('thi_completed_desc')}</p>
      <button className="btn-ghost" onClick={onRedo}>
        {t('retake_test')}
      </button>
    </div>
  );
}

function PreferencesStep({ selected, onSelect, t }) {
  return (
    <div className="preferences-step">
      <div className="sound-options" role="radiogroup" aria-label={t('select_sound_preference')}>
        {SOUND_OPTIONS.map(option => (
          <button
            key={option.id}
            className={`sound-option ${selected === option.id ? 'selected' : ''}`}
            onClick={() => onSelect(option.id)}
            role="radio"
            aria-checked={selected === option.id}
            aria-label={t(option.labelKey)}
          >
            <div className="option-icon" style={{ background: `linear-gradient(135deg, ${option.color}20, ${option.color}40)`, borderColor: option.color }}>
              <option.icon size={24} style={{ color: option.color }} />
            </div>
            <div className="option-content">
              <h4>{t(option.labelKey)}</h4>
              <p>{t(option.descKey)}</p>
            </div>
            {selected === option.id && (
              <div className="option-check" style={{ borderColor: option.color, boxShadow: `0 0 0 3px ${option.color}30` }}>
                <CheckCircle size={20} style={{ color: option.color }} />
              </div>
            )}
          </button>
        ))}
      </div>
      {selected && (
        <div className="preference-preview">
          <span className="preview-label">{t('your_plan_will_include')}</span>
          <div className="preview-tags">
            <span className="preview-tag">{t('personalized_therapy')}</span>
            <span className="preview-tag">{t('weekly_schedule')}</span>
            <span className="preview-tag">{t('progress_tracking')}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function ConfettiCelebration() {
  const { t } = useLanguage();
  useEffect(() => {
    const timer = setTimeout(() => {}, 3000);
    return () => clearTimeout(timer);
  }, []);

  const colors = ['#00B4D8', '#A78BFA', '#F472B6', '#2DD4BF', '#FF9500', '#FF3B30'];
  const pieces = Array.from({ length: 100 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}vw`,
    animationDelay: `${Math.random() * 2}s`,
    backgroundColor: colors[Math.floor(Math.random() * colors.length)],
    width: `${Math.random() * 8 + 6}px`,
    height: `${Math.random() * 16 + 8}px`,
    shape: Math.random() > 0.5 ? '50%' : '4px',
  }));

  return (
    <div className="confetti-overlay" aria-hidden="true">
      <div className="success-card">
        <div className="success-icon">
          <CheckCircle size={72} strokeWidth={2} color="#34C759" />
        </div>
        <h2>{t('onboarding_complete_title')}</h2>
        <p>{t('onboarding_complete_desc')}</p>
      </div>
      {pieces.map(p => (
        <div 
          key={p.id} 
          className="confetti-piece" 
          style={p}
        />
      ))}
    </div>
  );
}

export { STEPS, SOUND_OPTIONS };