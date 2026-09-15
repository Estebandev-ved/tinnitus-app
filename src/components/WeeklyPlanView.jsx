import React, { useState, useMemo } from 'react';
import {
  Play, CheckCircle, Clock, Calendar, Sparkles, Trophy, Flame,
  Headphones, Wind, Brain, Mic, BookOpen, Volume2, Sliders,
  Moon, ScanFace, ChevronLeft, Target, Timer, TrendingUp,
  TrendingDown, Minus, Zap, Award, BarChart3
} from 'lucide-react';
import { useWeeklyPlan } from '../contexts/WeeklyPlanContext';
import { getDayExercisePlan, CATEGORY_META } from '../data/weeklyExerciseDatabase';
import GuidedDailySession from './GuidedDailySession';
import './WeeklyPlanView.css';

const ICON_MAP = {
  Headphones, Wind, Brain, Mic, BookOpen, Volume2,
  Sliders, Moon, ScanFace, Calendar, Trophy
};

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const DIFFICULTY_LABELS = { basic: 'Básico', intermediate: 'Intermedio', advanced: 'Avanzado' };

const ProgressRing = ({ percent, size = 140, strokeWidth = 8 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="plan-progress-ring-wrap" style={{ width: size, height: size }}>
      <svg className="plan-progress-ring-svg" width={size} height={size}>
        <defs>
          <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00B4D8" />
            <stop offset="100%" stopColor="#48CAE4" />
          </linearGradient>
        </defs>
        <circle className="plan-progress-ring-bg" cx={size / 2} cy={size / 2} r={radius} />
        <circle
          className="plan-progress-ring-fill"
          cx={size / 2} cy={size / 2} r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ '--ring-circumference': circumference, '--ring-offset': offset }}
        />
      </svg>
      <div className="plan-progress-ring-center">
        <span className="plan-progress-ring-percent">{percent}%</span>
        <span className="plan-progress-ring-label">Avance Semanal</span>
      </div>
    </div>
  );
};

const WeeklyPlanView = ({ onBack }) => {
  const {
    activePlan, getWeekProgress, getDayProgress, setCurrentDay,
    getPlanStats, getWeekComparison, getCategoryBreakdown
  } = useWeeklyPlan();
  const [showGuidedWizard, setShowGuidedWizard] = useState(false);

  const stats = useMemo(() => getPlanStats(), [getPlanStats]);
  const comparison = useMemo(() => getWeekComparison(), [getWeekComparison]);
  const categoryBreakdown = useMemo(() => getCategoryBreakdown(), [getCategoryBreakdown]);

  if (!activePlan) {
    return (
      <div className="weekly-plan-container">
        {onBack && (
          <div className="plan-top-bar">
            <button className="plan-back-nav" onClick={onBack}>
              <ChevronLeft size={20} />
              <span>Volver al Inicio</span>
            </button>
          </div>
        )}
        <div className="plan-empty-state">
          <div className="plan-empty-icon">
            <Sparkles size={36} style={{ color: '#00B4D8' }} />
          </div>
          <h2>Aún no has generado tu Plan Semanal</h2>
          <p>Realiza tu medición de tinnitus y el test THI para desbloquear tu receta clínica personalizada con inteligencia artificial.</p>
        </div>
      </div>
    );
  }

  const { currentWeek, currentDay, recommendation } = activePlan;
  const selectedDayPlan = getDayExercisePlan(currentWeek, currentDay);
  const weekPercent = getWeekProgress(currentWeek);
  const totalWeeks = recommendation?.recommendedWeeksCount || 4;

  const handleDaySelect = (dayNum) => {
    setCurrentDay(dayNum);
  };

  return (
    <div className="weekly-plan-container">
      {onBack && (
        <div className="plan-top-bar">
          <button className="plan-back-nav" onClick={onBack}>
            <ChevronLeft size={20} />
            <span>Inicio</span>
          </button>
          <span className="plan-top-title">Mi Plan Semanal</span>
        </div>
      )}

      {/* ===== HERO CARD ===== */}
      <div className="plan-hero-card">
        <div className="plan-hero-info">
          <h2>{selectedDayPlan.weekTitle}</h2>
          <p>{selectedDayPlan.weekSubtitle}</p>

          <div className="plan-badges-row">
            <div className="plan-badge">
              <Sparkles size={13} style={{ color: '#48CAE4' }} />
              <span>{recommendation?.gradeInfo?.grade || 'Evaluado'}</span>
            </div>
            <div className="plan-badge">
              <Flame size={13} style={{ color: '#FF9500' }} />
              <span>Racha: {activePlan.streakDays || 1} días</span>
            </div>
            {activePlan.matchedFrequency && (
              <div className="plan-badge">
                <Headphones size={13} style={{ color: '#00B4D8' }} />
                <span>{activePlan.matchedFrequency.frequency || 4000} Hz</span>
              </div>
            )}
            {comparison && (
              <div className="plan-badge">
                <span className={`trend-icon trend-${comparison.trend}`}>
                  {comparison.trend === 'improving' ? '↑' : comparison.trend === 'declining' ? '↓' : '→'}
                </span>
                <span>{comparison.diff}% vs semana anterior</span>
              </div>
            )}
          </div>
        </div>

        <ProgressRing percent={weekPercent} />
      </div>

      {/* ===== STATS CARDS ===== */}
      {stats && (
        <div className="plan-stats-row">
          <div className="plan-stat-card">
            <div className="plan-stat-icon" style={{ background: 'rgba(0, 180, 216, 0.12)' }}>
              <Target size={18} style={{ color: '#00B4D8' }} />
            </div>
            <span className="plan-stat-value" style={{ color: '#00B4D8' }}>
              {stats.totalCompleted}/{stats.totalTasks}
            </span>
            <span className="plan-stat-label">Tareas</span>
          </div>

          <div className="plan-stat-card">
            <div className="plan-stat-icon" style={{ background: 'rgba(45, 212, 191, 0.12)' }}>
              <Timer size={18} style={{ color: '#2DD4BF' }} />
            </div>
            <span className="plan-stat-value" style={{ color: '#2DD4BF' }}>
              {stats.totalTimeInvested}m
            </span>
            <span className="plan-stat-label">Invertido</span>
          </div>

          <div className="plan-stat-card">
            <div className="plan-stat-icon" style={{ background: 'rgba(251, 191, 36, 0.12)' }}>
              <Award size={18} style={{ color: '#FBBF24' }} />
            </div>
            <span className="plan-stat-value" style={{ color: '#FBBF24' }}>
              {activePlan.streakDays || 1}
            </span>
            <span className="plan-stat-label">Racha</span>
          </div>

          <div className="plan-stat-card">
            <div className="plan-stat-icon" style={{ background: 'rgba(167, 139, 250, 0.12)' }}>
              <BarChart3 size={18} style={{ color: '#A78BFA' }} />
            </div>
            <span className="plan-stat-value" style={{ color: '#A78BFA' }}>
              {currentWeek}/{totalWeeks}
            </span>
            <span className="plan-stat-label">Semanas</span>
          </div>
        </div>
      )}

      {/* ===== DAY SELECTOR ===== */}
      <div className="plan-days-section">
        <div className="plan-days-header">
          <span className="plan-days-title">Días de la Semana</span>
          <span className="plan-days-week-label">Semana {currentWeek}</span>
        </div>
        <div className="plan-days-grid">
          {[1, 2, 3, 4, 5, 6, 7].map((d) => {
            const isSelected = d === currentDay;
            const dayProgress = getDayProgress(currentWeek, d);
            const isDone = dayProgress === 100;
            const dayDate = new Date();
            dayDate.setDate(dayDate.getDate() - dayDate.getDay() + d);
            const dayName = DAY_NAMES[dayDate.getDay()];

            return (
              <button
                key={d}
                className={`plan-day-btn ${isSelected ? 'active' : ''} ${isDone ? 'completed' : ''}`}
                onClick={() => handleDaySelect(d)}
              >
                <span className="plan-day-name">{dayName}</span>
                <span className="plan-day-num">{d}</span>
                <div className="plan-day-mini-progress">
                  <div
                    className={`plan-day-mini-progress-fill ${isDone ? 'complete' : dayProgress > 0 ? 'partial' : ''}`}
                    style={{ width: `${dayProgress}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ===== SELECTED DAY CARD ===== */}
      <div className="plan-day-card">
        <div className="plan-day-card-header">
          <div className="plan-day-card-title-group">
            <div className="plan-day-card-day-num">
              <Calendar size={13} />
              Día {currentDay} de 7
            </div>
            <h3 className="plan-day-card-title">{selectedDayPlan.dayTitle}</h3>
            <p className="plan-day-card-subtitle">{selectedDayPlan.daySubtitle}</p>
          </div>

          <button className="plan-resume-btn" onClick={() => setShowGuidedWizard(true)}>
            <Play size={18} />
            <span>Iniciar Jornada</span>
          </button>
        </div>

        {/* Day meta chips */}
        <div className="plan-day-card-meta">
          <div className="plan-day-meta-chip">
            <Clock size={12} />
            {selectedDayPlan.dayTotalMinutes} min total
          </div>
          <div className="plan-day-meta-chip">
            <Zap size={12} />
            {selectedDayPlan.tasks.length} ejercicios
          </div>
          <div className="plan-day-meta-chip">
            <Target size={12} />
            {getDayProgress(currentWeek, currentDay)}% completado
          </div>
        </div>

        {/* Category Breakdown */}
        {categoryBreakdown.length > 0 && (
          <div className="plan-category-breakdown">
            {categoryBreakdown.map((cat) => (
              <span
                key={cat.label}
                className="plan-cat-chip"
                style={{
                  background: `${cat.color}10`,
                  borderColor: `${cat.color}30`,
                  color: cat.color,
                }}
              >
                <span className="plan-cat-dot" style={{ background: cat.color }} />
                {cat.label} {cat.completed}/{cat.count}
              </span>
            ))}
          </div>
        )}

        {/* Task Timeline */}
        <div className="plan-task-timeline">
          {selectedDayPlan.tasks.map((task, idx) => {
            const isDone = !!activePlan.completedTasks[task.id];
            const isCurrent = idx === activePlan.activeTaskIndex && !isDone;
            const IconComponent = ICON_MAP[task.icon] || Headphones;
            const catMeta = CATEGORY_META[task.category] || CATEGORY_META.sound;

            return (
              <div
                key={task.id}
                className={`plan-task-item ${isDone ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
              >
                <div className={`plan-task-step ${isDone ? 'completed' : isCurrent ? 'active' : 'pending'}`}>
                  {isDone ? <CheckCircle size={16} /> : idx + 1}
                </div>

                <div className="plan-task-content">
                  <div className="plan-task-header">
                    <span className="plan-task-title">{task.title}</span>
                    <span className="plan-task-duration">
                      <Clock size={11} />
                      {task.durationMinutes} min
                    </span>
                  </div>

                  <p className="plan-task-desc">{task.description}</p>

                  <div className="plan-task-footer">
                    <span
                      className="plan-task-cat-badge"
                      style={{
                        background: `${catMeta.color}15`,
                        color: catMeta.color,
                      }}
                    >
                      <IconComponent size={10} />
                      {task.categoryLabel || catMeta.label}
                    </span>
                    <span className={`plan-task-difficulty ${task.difficulty || 'basic'}`}>
                      {DIFFICULTY_LABELS[task.difficulty] || 'Básico'}
                    </span>
                  </div>

                  {task.benefit && (
                    <div className="plan-task-benefit">✦ {task.benefit}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== WEEK COMPARISON ===== */}
      {comparison && (
        <div className="plan-comparison-card">
          <div className="plan-comparison-header">
            <span className="plan-comparison-title">
              <BarChart3 size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              Comparativa de Semanas
            </span>
            <span className={`plan-comparison-trend ${comparison.trend}`}>
              {comparison.trend === 'improving' && <TrendingUp size={13} />}
              {comparison.trend === 'declining' && <TrendingDown size={13} />}
              {comparison.trend === 'stable' && <Minus size={13} />}
              {comparison.trend === 'improving' ? 'Mejorando' :
               comparison.trend === 'declining' ? 'En descenso' : 'Estable'}
              {' '} {comparison.diff}%
            </span>
          </div>

          <div className="plan-comparison-bars">
            <div className="plan-comparison-bar-row">
              <span className="plan-comparison-bar-label">Sem. {currentWeek - 1}</span>
              <div className="plan-comparison-bar-track">
                <div
                  className="plan-comparison-bar-fill prev"
                  style={{ width: `${comparison.previous.percent}%` }}
                />
              </div>
              <span className="plan-comparison-bar-value">{comparison.previous.percent}%</span>
            </div>
            <div className="plan-comparison-bar-row">
              <span className="plan-comparison-bar-label">Sem. {currentWeek}</span>
              <div className="plan-comparison-bar-track">
                <div
                  className="plan-comparison-bar-fill curr"
                  style={{ width: `${comparison.current.percent}%` }}
                />
              </div>
              <span className="plan-comparison-bar-value">{comparison.current.percent}%</span>
            </div>
          </div>
        </div>
      )}

      {/* ===== GUIDED SESSION MODAL ===== */}
      {showGuidedWizard && (
        <GuidedDailySession
          dayPlan={selectedDayPlan}
          onClose={() => setShowGuidedWizard(false)}
        />
      )}
    </div>
  );
};

export default WeeklyPlanView;
