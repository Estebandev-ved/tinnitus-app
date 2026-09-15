import React, { useState } from 'react';
import {
  X, Check, ArrowRight, Clock, Trophy, Headphones, Wind, Brain,
  Mic, BookOpen, Volume2, Sliders, Moon, ScanFace, Sparkles,
  Lightbulb, BarChart2
} from 'lucide-react';
import { useWeeklyPlan } from '../contexts/WeeklyPlanContext';
import { CATEGORY_META } from '../data/weeklyExerciseDatabase';
import './GuidedDailySession.css';

const ICON_MAP = {
  Headphones, Wind, Brain, Mic, BookOpen, Volume2,
  Sliders, Moon, ScanFace
};

const DIFFICULTY_LABELS = { basic: 'Básico', intermediate: 'Intermedio', advanced: 'Avanzado' };

const GuidedDailySession = ({ dayPlan, onClose }) => {
  const { activePlan, completeTask } = useWeeklyPlan();
  const tasks = dayPlan.tasks || [];

  const initialIndex = tasks.findIndex(t => !activePlan?.completedTasks?.[t.id]);
  const [currentIndex, setCurrentIndex] = useState(initialIndex >= 0 ? initialIndex : 0);
  const [isCompletedState, setIsCompletedState] = useState(initialIndex < 0);

  const currentTask = tasks[currentIndex];
  const totalTasks = tasks.length;
  const progressPercent = Math.round(((currentIndex + (isCompletedState ? 1 : 0)) / totalTasks) * 100);

  const handleNext = () => {
    if (!currentTask) return;
    completeTask(currentTask.id);

    if (currentIndex < totalTasks - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsCompletedState(true);
    }
  };

  const IconComponent = currentTask ? (ICON_MAP[currentTask.icon] || Headphones) : Headphones;
  const catMeta = currentTask ? (CATEGORY_META[currentTask.category] || CATEGORY_META.sound) : null;

  return (
    <div className="guided-session-backdrop">
      <div className="guided-session-modal">
        {/* Header */}
        <div className="guided-wizard-header">
          <span className="guided-step-indicator">
            {isCompletedState ? '¡Jornada Completada!' : `Paso ${currentIndex + 1} de ${totalTasks}`}
          </span>
          <button className="guided-close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Visual Step Progress */}
        <div className="guided-steps-row">
          {tasks.map((task, idx) => {
            const isTaskDone = !!activePlan?.completedTasks?.[task.id];
            const isThis = idx === currentIndex && !isCompletedState;
            return (
              <div
                key={task.id}
                className={`guided-step-dot ${isTaskDone ? 'done' : ''} ${isThis ? 'active' : ''}`}
                title={task.title}
              >
                {isTaskDone ? <Check size={10} /> : idx + 1}
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="wizard-progress-bar-bg">
          <div
            className="wizard-progress-bar-fill"
            style={{ width: `${isCompletedState ? 100 : progressPercent}%` }}
          />
        </div>

        {/* Content */}
        {!isCompletedState && currentTask ? (
          <div className="wizard-task-content">
            <div className="wizard-task-icon" style={{
              background: `linear-gradient(135deg, ${catMeta.color}20, ${catMeta.color}35)`,
              borderColor: `${catMeta.color}40`,
              color: catMeta.color,
            }}>
              <IconComponent size={32} />
            </div>

            <h3 className="wizard-task-title">{currentTask.title}</h3>
            <p className="wizard-task-desc">{currentTask.description}</p>

            <div className="wizard-task-meta-row">
              <div className="wizard-task-duration">
                <Clock size={14} />
                <span>{currentTask.durationMinutes} min</span>
              </div>
              <span className="wizard-task-cat-badge" style={{
                background: `${catMeta.color}15`,
                color: catMeta.color,
              }}>
                {catMeta.label}
              </span>
              <span className={`wizard-task-difficulty ${currentTask.difficulty || 'basic'}`}>
                {DIFFICULTY_LABELS[currentTask.difficulty] || 'Básico'}
              </span>
            </div>

            {currentTask.tip && (
              <div className="wizard-task-tip">
                <Lightbulb size={14} />
                <span>{currentTask.tip}</span>
              </div>
            )}

            {currentTask.benefit && (
              <div className="wizard-task-benefit">
                <Sparkles size={12} />
                <span>{currentTask.benefit}</span>
              </div>
            )}

            <div className="wizard-actions">
              {currentIndex > 0 && (
                <button className="wizard-btn-secondary" onClick={() => setCurrentIndex(prev => prev - 1)}>
                  Anterior
                </button>
              )}
              <button className="wizard-btn-primary" onClick={handleNext}>
                <Check size={18} />
                <span>Completar Paso</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        ) : (
          <div className="celebration-box">
            <div className="celebration-icon">🎉</div>
            <h2>¡Excelente trabajo!</h2>
            <p style={{ color: '#cbd5e1', marginBottom: '0.75rem' }}>
              Has completado <strong>{dayPlan.dayTitle}</strong>
            </p>
            <div className="celebration-stats">
              <div className="celebration-stat">
                <Check size={16} style={{ color: '#2DD4BF' }} />
                <span>{totalTasks} ejercicios completados</span>
              </div>
              <div className="celebration-stat">
                <Clock size={16} style={{ color: '#00B4D8' }} />
                <span>{dayPlan.dayTotalMinutes || tasks.reduce((s, t) => s + t.durationMinutes, 0)} minutos invertidos</span>
              </div>
            </div>
            <p style={{ color: 'rgba(144, 224, 239, 0.6)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Tu cerebro continúa aprendiendo a filtrar el tinnitus. Cada sesión fortalece la habituación.
            </p>
            <button className="wizard-btn-primary" onClick={onClose} style={{ width: '100%' }}>
              <Trophy size={18} />
              <span>Volver a Mi Plan Semanal</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuidedDailySession;
