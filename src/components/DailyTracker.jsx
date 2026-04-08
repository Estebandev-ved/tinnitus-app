import React, { useState, useEffect } from 'react';
import { X, Moon, Zap, Activity, Save, ChevronLeft, ChevronRight, Smile, Meh, Frown } from 'lucide-react';
import { FirestoreService } from '../services/firestoreService';
import { useAuth } from '../contexts/AuthContext';
import './DailyTracker.css';
import dailyTrackerIllustration from '../assets/illustrations/daily_tracker.png';

const WeekStrip = ({ logs = [] }) => {
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const today = new Date();
  const currentDayIndex = today.getDay();

  // Helper to get date string YYYY-MM-DD for a specific day of current week
  const getDateStringForDay = (dayIndex) => {
    const d = new Date();
    const diff = dayIndex - currentDayIndex;
    d.setDate(d.getDate() + diff);
    return d.toISOString().split('T')[0];
  };

  return (
    <div className="week-strip">
      {days.map((day, index) => {
        const dateStr = getDateStringForDay(index);
        const isCompleted = logs.some(log => log.date.startsWith(dateStr));
        const isToday = index === currentDayIndex;

        return (
          <div key={day} className={`day-item ${isToday ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
            <span className="day-name">{day}</span>
            <div className="day-circle">
              {isCompleted ? '✓' : new Date(dateStr).getDate()}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const MoodSelector = ({ value, onChange }) => (
  <div className="mood-selector">
    <button className={`mood-btn ${value < 33 ? 'selected' : ''}`} onClick={() => onChange(20)}>
      <Smile size={32} color="#34C759" />
      <span>Bien</span>
    </button>
    <button className={`mood-btn ${value >= 33 && value < 66 ? 'selected' : ''}`} onClick={() => onChange(50)}>
      <Meh size={32} color="#FF9500" />
      <span>Regular</span>
    </button>
    <button className={`mood-btn ${value >= 66 ? 'selected' : ''}`} onClick={() => onChange(80)}>
      <Frown size={32} color="#FF3B30" />
      <span>Mal</span>
    </button>
  </div>
);

import StatisticsChart from './StatisticsChart';

// ... (WeekStrip, MoodSelector remain same) ...

const DailyTracker = ({ onClose, onSave }) => {
  const [sleepHours, setSleepHours] = useState(7);
  const [stressLevel, setStressLevel] = useState(50);
  const [tinnitusLevel, setTinnitusLevel] = useState(50);
  const [isSaving, setIsSaving] = useState(false);
  const [weeklyLogs, setWeeklyLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('log'); // 'log' or 'stats'

  // Import Services
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchLogs = async () => {
      if (currentUser) {
        try {
          const logs = await FirestoreService.getWeeklyLogs(currentUser.uid);
          setWeeklyLogs(logs);
        } catch (err) {
          console.error("Error fetching logs:", err);
        }
      }
    };
    fetchLogs();
  }, [currentUser]);

  const handleSave = async () => {
    setIsSaving(true);
    const logData = {
      sleepHours,
      stressLevel,
      tinnitusLevel,
      date: new Date().toISOString()
    };

    try {
      if (currentUser) {
        await FirestoreService.saveDailyLog(currentUser.uid, logData);
        // Refresh logs immediately after save
        const updatedLogs = await FirestoreService.getWeeklyLogs(currentUser.uid);
        setWeeklyLogs(updatedLogs);
        alert('Progreso guardado en la nube ☁️');
      } else {
        console.warn("Usuario no autenticado, guardando localmente.");
      }

      onSave(logData); // Update parent state/UI
      // onClose(); // Keep open to see the checkmark update? Or close. Let's close for now.
      onClose();
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Error al guardar en la nube: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="tracker-overlay animate-fade">
      <div className="tracker-modal">
        <header className="tracker-header">
          <h3>Mi Progreso</h3>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </header>

        <img src={dailyTrackerIllustration} alt="" className="feature-illustration" />

        {/* Tab Switcher */}
        <div className="tracker-tabs">
          <button
            className={`tab-btn ${activeTab === 'log' ? 'active' : ''}`}
            onClick={() => setActiveTab('log')}
          >
            Diario
          </button>
          <button
            className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            Estadísticas
          </button>
        </div>

        <div className="tracker-content-scroll">
          {activeTab === 'log' ? (
            <>
              <WeekStrip logs={weeklyLogs} />

              <div className="tracker-card">
                <div className="section-label">
                  <Moon size={20} color="#5856D6" />
                  <span>¿Cuánto dormiste?</span>
                </div>
                <div className="stepper-control">
                  <button onClick={() => setSleepHours(Math.max(0, sleepHours - 0.5))}><ChevronLeft /></button>
                  <span className="big-number">{sleepHours} <small>h</small></span>
                  <button onClick={() => setSleepHours(Math.min(12, sleepHours + 0.5))}><ChevronRight /></button>
                </div>
              </div>

              <div className="tracker-card">
                <div className="section-label">
                  <Zap size={20} color="#FF9500" />
                  <span>Nivel de Estrés</span>
                </div>
                <MoodSelector value={stressLevel} onChange={setStressLevel} />
              </div>

              <div className="tracker-card">
                <div className="section-label">
                  <Activity size={20} color="#FF3B30" />
                  <span>Intensidad del Zumbido</span>
                </div>
                <div className="interactive-slider-container">
                  <span className="value-display">{tinnitusLevel}/100</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={tinnitusLevel}
                    onChange={(e) => setTinnitusLevel(parseInt(e.target.value))}
                    className="custom-slider intensity-slider"
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="stats-view animate-fade">
              <StatisticsChart data={weeklyLogs} />

              {/* Smart Correlation */}
              {(() => {
                if (weeklyLogs.length < 3) {
                  return (
                    <div className="stats-insight-card">
                      <h5>💡 Insights</h5>
                      <p>Registra al menos 3 días para obtener análisis inteligente de tus datos.</p>
                    </div>
                  );
                }

                const insights = [];
                const avgSleep = weeklyLogs.reduce((a, l) => a + (l.sleepHours || 0), 0) / weeklyLogs.length;
                const avgTinnitus = weeklyLogs.reduce((a, l) => a + (l.tinnitusLevel || 0), 0) / weeklyLogs.length;

                // Sleep vs Tinnitus correlation
                const goodSleepLogs = weeklyLogs.filter(l => (l.sleepHours || 0) >= 7);
                const badSleepLogs = weeklyLogs.filter(l => (l.sleepHours || 0) < 7);
                if (goodSleepLogs.length > 0 && badSleepLogs.length > 0) {
                  const avgGood = goodSleepLogs.reduce((a, l) => a + (l.tinnitusLevel || 0), 0) / goodSleepLogs.length;
                  const avgBad = badSleepLogs.reduce((a, l) => a + (l.tinnitusLevel || 0), 0) / badSleepLogs.length;
                  const diff = Math.round(((avgBad - avgGood) / avgBad) * 100);
                  if (diff > 5) {
                    insights.push(`🛏️ Los días que duermes +7h, tu tinnitus baja un ${diff}%.`);
                  } else if (diff < -5) {
                    insights.push(`🛏️ Dormir más no parece reducir tu zumbido. Enfócate en otras técnicas.`);
                  }
                }

                // Stress vs Tinnitus
                const highStress = weeklyLogs.filter(l => (l.stressLevel || 0) >= 66);
                const lowStress = weeklyLogs.filter(l => (l.stressLevel || 0) < 33);
                if (highStress.length > 0 && lowStress.length > 0) {
                  const avgHigh = highStress.reduce((a, l) => a + (l.tinnitusLevel || 0), 0) / highStress.length;
                  const avgLow = lowStress.reduce((a, l) => a + (l.tinnitusLevel || 0), 0) / lowStress.length;
                  const stressDiff = Math.round(avgHigh - avgLow);
                  if (stressDiff > 5) {
                    insights.push(`⚡ El estrés alto aumenta tu tinnitus +${stressDiff} puntos. Prueba la guía de respiración.`);
                  }
                }

                // Best day
                const bestLog = weeklyLogs.reduce((best, l) => (l.tinnitusLevel || 100) < (best.tinnitusLevel || 100) ? l : best, weeklyLogs[0]);
                const bestDate = bestLog.date ? new Date(bestLog.date) : null;
                if (bestDate) {
                  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
                  insights.push(`🌟 Tu mejor día fue el ${dayNames[bestDate.getDay()]} con ${bestLog.tinnitusLevel}/100.`);
                }

                // Trend
                if (weeklyLogs.length >= 4) {
                  const firstHalf = weeklyLogs.slice(0, Math.floor(weeklyLogs.length / 2));
                  const secondHalf = weeklyLogs.slice(Math.floor(weeklyLogs.length / 2));
                  const avg1 = firstHalf.reduce((a, l) => a + (l.tinnitusLevel || 0), 0) / firstHalf.length;
                  const avg2 = secondHalf.reduce((a, l) => a + (l.tinnitusLevel || 0), 0) / secondHalf.length;
                  if (avg2 < avg1 - 5) {
                    insights.push(`📉 ¡Buenas noticias! Tu tinnitus muestra tendencia a la baja.`);
                  } else if (avg2 > avg1 + 5) {
                    insights.push(`📈 Tu tinnitus ha subido esta semana. ¿Hubo cambios en tu rutina?`);
                  }
                }

                if (insights.length === 0) {
                  insights.push(`📊 Tinnitus promedio: ${Math.round(avgTinnitus)}/100. Sueño promedio: ${avgSleep.toFixed(1)}h.`);
                }

                return (
                  <div className="stats-insight-card">
                    <h5>📊 Correlaciones Inteligentes</h5>
                    {insights.map((insight, idx) => (
                      <p key={idx} className="insight-item">{insight}</p>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {activeTab === 'log' && (
          <footer className="tracker-footer">
            <button className="btn btn-primary full-width" onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Guardando...' : 'Registrar Día'} <Save size={18} />
            </button>
          </footer>
        )}
      </div>
    </div>
  );
};

export default DailyTracker;
