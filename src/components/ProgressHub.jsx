import React, { useState, useEffect, useMemo } from 'react';
import {
  X, Plus, Search, TrendingUp, TrendingDown, Minus, Sparkles,
  Target, BarChart3, BookOpen, CheckCircle, Clock, ArrowRight, Brain, NotebookPen, Timer
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { FirestoreService } from '../services/firestoreService';
import {
  calculateHealthScore, getWeeklyComparison, detectCorrelations,
  generateWeeklySummary, generateWeeklyGoals, analyzeNote, MOOD_CONFIG
} from '../services/progressInsightsService';
import './ProgressHub.css';

const TABS = [
  { id: 'summary', label: 'Resumen', icon: BarChart3 },
  { id: 'diary', label: 'Diario', icon: NotebookPen },
  { id: 'analytics', label: 'Análisis', icon: Brain },
  { id: 'goals', label: 'Metas', icon: Target },
];

const ProgressHub = ({ onClose, openTherapy, lastTHI }) => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('summary');
  const [notes, setNotes] = useState([]);
  const [weeklyLogs, setWeeklyLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [selectedMood, setSelectedMood] = useState(null);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetch = async () => {
      if (!currentUser) return;
      setLoading(true);
      try {
        const [fetchedNotes, fetchedLogs] = await Promise.all([
          FirestoreService.getProgressNotes(currentUser.uid, 50),
          FirestoreService.getWeeklyLogs(currentUser.uid),
        ]);
        setNotes(fetchedNotes || []);
        setWeeklyLogs(fetchedLogs || []);
      } catch (e) {
        console.error('Error loading progress data:', e);
      }
      setLoading(false);
    };
    fetch();
  }, [currentUser]);

  const healthScore = useMemo(() => calculateHealthScore(weeklyLogs, notes), [weeklyLogs, notes]);
  const comparison = useMemo(() => getWeeklyComparison(weeklyLogs), [weeklyLogs]);
  const correlations = useMemo(() => detectCorrelations(weeklyLogs), [weeklyLogs]);
  const weeklySummary = useMemo(() => generateWeeklySummary(weeklyLogs, notes, lastTHI), [weeklyLogs, notes, lastTHI]);
  const goals = useMemo(() => generateWeeklyGoals(weeklyLogs, notes), [weeklyLogs, notes]);

  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes;
    const q = searchQuery.toLowerCase();
    return notes.filter(n =>
      (n.text || '').toLowerCase().includes(q) ||
      (n.mood || '').toLowerCase().includes(q) ||
      (n.aiAnalysis?.tags || []).some(t => t.toLowerCase().includes(q))
    );
  }, [notes, searchQuery]);

  const moodDistribution = useMemo(() => {
    const counts = {};
    notes.forEach(n => {
      if (n.mood) counts[n.mood] = (counts[n.mood] || 0) + 1;
    });
    const total = notes.length || 1;
    return Object.entries(counts)
      .map(([mood, count]) => ({
        mood,
        count,
        percent: Math.round((count / total) * 100),
        ...MOOD_CONFIG[mood],
      }))
      .sort((a, b) => b.count - a.count);
  }, [notes]);

  const recentActivity = useMemo(() => {
    const items = [];
    notes.slice(0, 5).forEach(n => {
      items.push({
        type: 'note',
        text: `Nota: ${(n.text || '').slice(0, 60)}${(n.text || '').length > 60 ? '...' : ''}`,
        time: n.timestamp || n.createdAt,
        color: MOOD_CONFIG[n.mood]?.color || '#90E0EF',
      });
    });
    weeklyLogs.slice(0, 3).forEach(l => {
      items.push({
        type: 'tracker',
        text: `Registro: Sueño ${l.sleepHours}h, Tinnitus ${l.tinnitusLevel}/100`,
        time: l.date || l.createdAt,
        color: '#FBBF24',
      });
    });
    return items.sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 6);
  }, [notes, weeklyLogs]);

  const handleSaveNote = async () => {
    if (!newNote.trim() || !selectedMood || !currentUser) return;
    setSaving(true);

    const todayLog = weeklyLogs.find(l => l.date === new Date().toISOString().split('T')[0]);
    const analysis = analyzeNote(newNote, selectedMood, todayLog);
    const noteData = {
      text: newNote,
      mood: selectedMood,
      timestamp: new Date().toISOString(),
      aiAnalysis: analysis,
    };

    try {
      await FirestoreService.saveProgressNote(currentUser.uid, noteData);
      setNewNote('');
      setSelectedMood(null);
      setShowCreate(false);
      const [fetchedNotes, fetchedLogs] = await Promise.all([
        FirestoreService.getProgressNotes(currentUser.uid, 50),
        FirestoreService.getWeeklyLogs(currentUser.uid),
      ]);
      setNotes(fetchedNotes || []);
      setWeeklyLogs(fetchedLogs || []);
    } catch (e) {
      console.error('Error saving note:', e);
    }
    setSaving(false);
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now - d;
    const diffH = Math.floor(diffMs / 3600000);
    if (diffH < 1) return 'Ahora';
    if (diffH < 24) return `Hace ${diffH}h`;
    const diffD = Math.floor(diffH / 24);
    if (diffD < 7) return `Hace ${diffD}d`;
    return d.toLocaleDateString('es', { day: 'numeric', month: 'short' });
  };

  const getHealthColor = (score) => {
    if (score >= 70) return '#2DD4BF';
    if (score >= 40) return '#FBBF24';
    return '#F87171';
  };

  const getHealthMessage = (score) => {
    if (score >= 80) return 'Excelente progreso. Tu constancia está dando resultados.';
    if (score >= 60) return 'Buen avance. Mantén la rutina diaria para seguir mejorando.';
    if (score >= 40) return 'Progreso moderado. Intenta registrar más días y seguir tu plan.';
    return 'Estás empezando. Cada día de registros te acerca a la habituación.';
  };

  return (
    <div className="ph-wrapper">
      <div className="ph-container">
        {/* Header */}
        <div className="ph-header">
          <span className="ph-header-title">Mi Progreso</span>
          <button className="ph-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="ph-tabs">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`ph-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="ph-tab-icon"><tab.icon size={16} /></span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="ph-content">
          {loading ? (
            <div className="ph-empty">
              <div className="ph-empty-icon"><Timer size={28} /></div>
              <p>Cargando tus datos...</p>
            </div>
          ) : (
            <>
              {/* ═══ TAB: RESUMEN ═══ */}
              {activeTab === 'summary' && (
                <>
                  {healthScore !== null ? (
                    <>
                      <div className="ph-health-card">
                        <div className="ph-health-score" style={{ color: getHealthColor(healthScore) }}>
                          {healthScore}
                        </div>
                        <div className="ph-health-label">Health Score</div>
                        <div className="ph-health-bar">
                          <div
                            className="ph-health-bar-fill"
                            style={{ width: `${healthScore}%`, background: getHealthColor(healthScore) }}
                          />
                        </div>
                        <p className="ph-health-message">{getHealthMessage(healthScore)}</p>
                      </div>

                      {comparison && (
                        <div className="ph-metrics-row">
                          <div className="ph-metric-card">
                            <div className="ph-metric-icon">😴</div>
                            <div className="ph-metric-value">{comparison.sleep.curr}h</div>
                            <div className="ph-metric-label">Sueño</div>
                            <span className={`ph-metric-diff ${comparison.sleep.diff > 0 ? 'good-down' : comparison.sleep.diff < 0 ? 'up' : 'neutral'}`}>
                              {comparison.sleep.diff > 0 ? '↑' : comparison.sleep.diff < 0 ? '↓' : '→'}
                              {Math.abs(comparison.sleep.diff)}%
                            </span>
                          </div>
                          <div className="ph-metric-card">
                            <div className="ph-metric-icon">🧠</div>
                            <div className="ph-metric-value">{comparison.stress.curr}</div>
                            <div className="ph-metric-label">Estrés</div>
                            <span className={`ph-metric-diff ${comparison.stress.diff < 0 ? 'good-down' : comparison.stress.diff > 0 ? 'up' : 'neutral'}`}>
                              {comparison.stress.diff > 0 ? '↑' : comparison.stress.diff < 0 ? '↓' : '→'}
                              {Math.abs(comparison.stress.diff)}%
                            </span>
                          </div>
                          <div className="ph-metric-card">
                            <div className="ph-metric-icon">🔊</div>
                            <div className="ph-metric-value">{comparison.tinnitus.curr}</div>
                            <div className="ph-metric-label">Tinnitus</div>
                            <span className={`ph-metric-diff ${comparison.tinnitus.diff < 0 ? 'good-down' : comparison.tinnitus.diff > 0 ? 'up' : 'neutral'}`}>
                              {comparison.tinnitus.diff > 0 ? '↑' : comparison.tinnitus.diff < 0 ? '↓' : '→'}
                              {Math.abs(comparison.tinnitus.diff)}%
                            </span>
                          </div>
                        </div>
                      )}

                      {weeklySummary && (
                        <div className="ph-summary-card">
                          <div className="ph-summary-header">
                            <Sparkles size={16} className="ph-summary-header-icon" />
                            <h4>Resumen de IA</h4>
                          </div>
                          <p className="ph-summary-text">{weeklySummary}</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="ph-empty">
                      <div className="ph-empty-icon"><BarChart3 size={28} /></div>
                      <h4>Sin datos aún</h4>
                      <p>Registra tu primer día en el tracker para ver tu progreso.</p>
                    </div>
                  )}

                  <div className="ph-activity-section">
                    <h3 className="ph-section-title">Actividad Reciente</h3>
                    {recentActivity.length > 0 ? (
                      <div className="ph-activity-list">
                        {recentActivity.map((item, idx) => (
                          <div key={idx} className="ph-activity-item">
                            <div className="ph-activity-dot" style={{ background: item.color }} />
                            <span className="ph-activity-text">{item.text}</span>
                            <span className="ph-activity-time">{formatTime(item.time)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="ph-empty" style={{ padding: '1rem' }}>No hay actividad reciente.</p>
                    )}
                  </div>
                </>
              )}

              {/* ═══ TAB: DIARIO ═══ */}
              {activeTab === 'diary' && (
                <>
                  {showCreate ? (
                    <div className="ph-create-view">
                      <div className="ph-create-card">
                        <h3 className="ph-create-title">¿Cómo te afecta el zumbido hoy?</h3>

                        <div className="ph-mood-grid">
                          {Object.entries(MOOD_CONFIG).map(([key, cfg]) => (
                            <button
                              key={key}
                              className={`ph-mood-btn ${selectedMood === key ? 'selected' : ''}`}
                              style={selectedMood === key ? {
                                borderColor: cfg.color,
                                background: `${cfg.color}15`,
                                boxShadow: `0 4px 12px ${cfg.color}30`,
                              } : {}}
                              onClick={() => setSelectedMood(key)}
                            >
                              <span className="ph-mood-btn-emoji">{cfg.emoji}</span>
                              <span className="ph-mood-btn-label">{cfg.label}</span>
                            </button>
                          ))}
                        </div>

                        <textarea
                          className="ph-create-textarea"
                          placeholder="Escribe cómo te sientes, qué ha pasado hoy, qué has notado..."
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                        />

                        <div className="ph-create-actions">
                          <button className="ph-cancel-btn" onClick={() => { setShowCreate(false); setNewNote(''); setSelectedMood(null); }}>
                            Cancelar
                          </button>
                          <button
                            className="ph-save-btn"
                            onClick={handleSaveNote}
                            disabled={!newNote.trim() || !selectedMood || saving}
                          >
                            {saving ? 'Guardando...' : 'Guardar y Analizar'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="ph-notes-header">
                        <h3 className="ph-section-title" style={{ margin: 0 }}>Tus Notas</h3>
                        <button className="ph-new-note-btn" onClick={() => setShowCreate(true)}>
                          <Plus size={16} />
                          Escribir
                        </button>
                      </div>

                      <input
                        className="ph-notes-search"
                        type="text"
                        placeholder="Buscar por texto, mood o tag..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />

                      {filteredNotes.length > 0 ? (
                        <div className="ph-notes-timeline">
                          {filteredNotes.map((note, idx) => {
                            const mood = MOOD_CONFIG[note.mood] || MOOD_CONFIG.neutral;
                            return (
                              <div key={note.id || idx} className="ph-note-item">
                                <div className="ph-note-dot" style={{ borderColor: mood.color }} />
                                <div className="ph-note-header">
                                  <span className="ph-note-mood" style={{
                                    background: `${mood.color}15`,
                                    color: mood.color,
                                  }}>
                                    {mood.emoji} {mood.label}
                                  </span>
                                  <span className="ph-note-date">{formatTime(note.timestamp || note.createdAt)}</span>
                                </div>
                                <p className="ph-note-text">{note.text}</p>
                                {note.aiAnalysis?.tags && (
                                  <div className="ph-note-tags">
                                    {note.aiAnalysis.tags.map((tag, i) => (
                                      <span key={i} className="ph-note-tag">{tag}</span>
                                    ))}
                                  </div>
                                )}
                                {note.aiAnalysis?.suggestion && (
                                  <div className="ph-note-insight">
                                    💡 {note.aiAnalysis.suggestion}
                                    {note.aiAnalysis.therapyAction && (
                                      <span
                                        style={{ color: '#00B4D8', cursor: 'pointer', marginLeft: 6, fontWeight: 700 }}
                                        onClick={() => openTherapy?.(note.aiAnalysis.therapyAction)}
                                      >
                                        Ir a terapia →
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="ph-empty">
                          <div className="ph-empty-icon"><NotebookPen size={28} /></div>
                          <h4>{searchQuery ? 'Sin resultados' : 'Sin notas aún'}</h4>
                          <p>{searchQuery ? 'Intenta con otra búsqueda.' : 'Escribe tu primera observación para que la IA analice patrones.'}</p>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}

              {/* ═══ TAB: ANÁLISIS ═══ */}
              {activeTab === 'analytics' && (
                <>
                  {correlations.length > 0 ? (
                    <>
                      <h3 className="ph-section-title">Insights de IA</h3>
                      <div className="ph-insights-list">
                        {correlations.map((insight, idx) => (
                          <div
                            key={insight.id}
                            className="ph-insight-card"
                            style={{ animationDelay: `${idx * 0.08}s` }}
                          >
                            <span className="ph-insight-icon">{insight.icon}</span>
                            <div className="ph-insight-content">
                              <h4 className="ph-insight-title">{insight.title}</h4>
                              <p className="ph-insight-text">{insight.text}</p>
                              <div className="ph-insight-strength">
                                <div
                                  className="ph-insight-strength-fill"
                                  style={{
                                    width: `${insight.strength}%`,
                                    background: insight.type === 'positive' ? '#2DD4BF' : insight.type === 'warning' ? '#FBBF24' : '#00B4D8',
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="ph-empty">
                            <div className="ph-empty-icon"><Brain size={28} /></div>
                      <h4>Menos de 3 días de datos</h4>
                      <p>Registra al menos 3 días en el tracker para detectar patrones y correlaciones.</p>
                    </div>
                  )}

                  {moodDistribution.length > 0 && (
                    <>
                      <h3 className="ph-section-title" style={{ marginTop: '1.5rem' }}>Distribución de Mood</h3>
                      <div className="ph-mood-dist">
                        <div className="ph-mood-dist-bar">
                          {moodDistribution.map(m => (
                            <div
                              key={m.mood}
                              className="ph-mood-dist-segment"
                              style={{ width: `${m.percent}%`, background: m.color }}
                              title={`${m.label}: ${m.count}`}
                            />
                          ))}
                        </div>
                        <div className="ph-mood-dist-legend">
                          {moodDistribution.map(m => (
                            <span key={m.mood} className="ph-mood-dist-item">
                              <span className="ph-mood-dist-dot" style={{ background: m.color }} />
                              {m.emoji} {m.label} ({m.count})
                            </span>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}

              {/* ═══ TAB: METAS ═══ */}
              {activeTab === 'goals' && (
                <>
                  <h3 className="ph-section-title">Metas de la Semana</h3>
                  {goals.length > 0 ? (
                    <div className="ph-goals-list">
                      {goals.map((goal, idx) => {
                        const percent = goal.invert
                          ? Math.min(100, Math.max(0, ((goal.target - goal.current) / goal.target) * 100))
                          : Math.min(100, Math.round((goal.current / goal.target) * 100));
                        const achieved = percent >= 100;

                        return (
                          <div
                            key={goal.id}
                            className={`ph-goal-card ${achieved ? 'achieved' : ''}`}
                            style={{ animationDelay: `${idx * 0.08}s` }}
                          >
                            <div className="ph-goal-header">
                              <span className="ph-goal-icon">{goal.icon}</span>
                              <div className="ph-goal-info">
                                <h4 className="ph-goal-title">{goal.title}</h4>
                                <p className="ph-goal-desc">{goal.description}</p>
                              </div>
                            </div>
                            <div className="ph-goal-progress">
                              <div className="ph-goal-bar">
                                <div
                                  className="ph-goal-bar-fill"
                                  style={{ width: `${Math.min(100, percent)}%`, background: goal.color }}
                                />
                              </div>
                              <span className="ph-goal-count" style={{ color: goal.color }}>
                                {goal.invert ? goal.current : `${goal.current}/${goal.target}`}
                              </span>
                            </div>
                            {achieved && (
                              <div className="ph-goal-achieved-badge">
                                <CheckCircle size={13} />
                                ¡Meta alcanzada!
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="ph-empty">
                      <div className="ph-empty-icon"><Target size={28} /></div>
                      <h4>Sin metas aún</h4>
                      <p>Las metas se generan automáticamente cuando tienes datos en el tracker.</p>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressHub;
