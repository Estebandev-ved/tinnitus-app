import React, { useMemo } from 'react';
import { Sliders, ClipboardList, Sparkles, Play, CheckCircle, ChevronRight, Zap } from 'lucide-react';
import { useWeeklyPlan } from '../contexts/WeeklyPlanContext';
import './QuickStartGuide.css';

const STEPS = [
  {
    id: 'matcher',
    section: 'matcher',
    icon: Sliders,
    title: 'Calibrar tu frecuencia',
    description: 'Identifica el tono exacto de tu acúfeno para personalizar la terapia.',
    color: '#00B4D8',
    checkKey: 'frequency',
  },
  {
    id: 'thi',
    section: 'thi',
    icon: ClipboardList,
    title: 'Test de Impacto THI',
    description: 'Mide cómo el tinnitus afecta tu vida diaria con 25 preguntas clínicas.',
    color: '#A78BFA',
    checkKey: 'thi',
  },
  {
    id: 'plan',
    section: 'weekly_plan',
    icon: Sparkles,
    title: 'Generar tu Plan Semanal',
    description: 'La IA crea tu receta personalizada de ejercicios terapéuticos.',
    color: '#F472B6',
    checkKey: 'plan',
  },
  {
    id: 'session',
    section: 'weekly_plan',
    icon: Play,
    title: 'Completar tu primera sesión',
    description: 'Inicia tu jornada y completa los ejercicios guiados del día.',
    color: '#2DD4BF',
    checkKey: 'session',
  },
];

const QuickStartGuide = ({ matchedFrequency, lastTHI, onNavigate }) => {
  const { activePlan } = useWeeklyPlan();

  const stepStatus = useMemo(() => {
    const hasFrequency = !!matchedFrequency;
    const hasTHI = !!lastTHI;
    const hasPlan = !!activePlan;
    const hasSession = hasPlan && Object.keys(activePlan.completedTasks || {}).length > 0;

    return {
      frequency: hasFrequency,
      thi: hasTHI,
      plan: hasPlan,
      session: hasSession,
    };
  }, [matchedFrequency, lastTHI, activePlan]);

  const completedCount = Object.values(stepStatus).filter(Boolean).length;
  const allDone = completedCount === STEPS.length;

  const pendingSteps = STEPS.filter(step => !stepStatus[step.checkKey]);
  const currentStep = pendingSteps[0] || null;

  if (allDone) {
    return (
      <div className="qsg-container qsg-completed">
        <div className="qsg-completed-inner">
          <div className="qsg-completed-icon">
            <CheckCircle size={28} />
          </div>
          <div className="qsg-completed-text">
            <h3>¡Configuración completa!</h3>
            <p>Tu perfil está listo. Continúa con tu plan semanal o explora las herramientas clínicas.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="qsg-container">
      <div className="qsg-header">
        <div className="qsg-header-left">
          <div className="qsg-header-icon">
            <Zap size={18} />
          </div>
          <div>
            <h3 className="qsg-title">Inicio Rápido</h3>
            <p className="qsg-subtitle">{completedCount} de {STEPS.length} pasos completados</p>
          </div>
        </div>
        <div className="qsg-progress-pill">
          {STEPS.map((step) => (
            <div
              key={step.id}
              className={`qsg-progress-dot ${stepStatus[step.checkKey] ? 'done' : ''}`}
            />
          ))}
        </div>
      </div>

      <div className="qsg-steps">
        {STEPS.map((step, idx) => {
          const isDone = stepStatus[step.checkKey];
          const isCurrent = currentStep && step.id === currentStep.id;
          const isLocked = !isDone && !isCurrent;
          const Icon = step.icon;

          return (
            <div
              key={step.id}
              className={`qsg-step ${isDone ? 'done' : ''} ${isCurrent ? 'current' : ''} ${isLocked ? 'locked' : ''}`}
              onClick={() => !isLocked && onNavigate(step.section)}
            >
              <div className="qsg-step-indicator" style={{
                background: isDone ? `${step.color}20` : isCurrent ? `${step.color}15` : 'rgba(255,255,255,0.03)',
                borderColor: isDone ? step.color : isCurrent ? `${step.color}50` : 'rgba(255,255,255,0.08)',
              }}>
                {isDone ? (
                  <CheckCircle size={18} style={{ color: step.color }} />
                ) : (
                  <Icon size={18} style={{ color: isCurrent ? step.color : 'rgba(144,224,239,0.3)' }} />
                )}
              </div>

              <div className="qsg-step-content">
                <span className="qsg-step-num">Paso {idx + 1}</span>
                <h4 className="qsg-step-title">{step.title}</h4>
                <p className="qsg-step-desc">{step.description}</p>
              </div>

              {!isDone && isCurrent && (
                <div className="qsg-step-action" style={{ color: step.color }}>
                  <span>Ir</span>
                  <ChevronRight size={16} />
                </div>
              )}

              {isDone && (
                <span className="qsg-step-done-label" style={{ color: step.color }}>
                  Listo
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QuickStartGuide;
