import React, { useState, useEffect } from 'react';
import { X, Plus, Sparkles, Tag, Activity, ArrowRight } from 'lucide-react';
import { FirestoreService } from '../services/firestoreService';
import { useAuth } from '../contexts/AuthContext';
import './ProgressNotes.css';

const MOODS = [
    { emoji: '😊', label: 'Bien', value: 'good', color: '#34C759' },
    { emoji: '😐', label: 'Normal', value: 'neutral', color: '#FF9500' },
    { emoji: '😔', label: 'Mal', value: 'bad', color: '#FF3B30' },
    { emoji: '😣', label: 'Ansioso', value: 'anxious', color: '#5856D6' },
    { emoji: '😤', label: 'Irritado', value: 'irritated', color: '#FF2D55' },
];

const ProgressNotes = ({ onClose, openTherapy }) => {
    const { currentUser } = useAuth();
    const [notes, setNotes] = useState([]);
    const [newNote, setNewNote] = useState('');
    const [selectedMood, setSelectedMood] = useState('neutral');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [view, setView] = useState('list'); // 'list' | 'create' | 'ai-analysis'
    const [aiInsight, setAiInsight] = useState(null);

    useEffect(() => {
        loadNotes();
    }, [currentUser]);

    const loadNotes = async () => {
        if (!currentUser) return;
        try {
            const data = await FirestoreService.getProgressNotes(currentUser.uid, 20);
            setNotes(data || []);
        } catch (e) {
            console.error('Error loading notes:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveAndAnalyze = async () => {
        if (!newNote.trim()) return;
        setView('ai-analysis');
        
        // Simular análisis IA
        setTimeout(async () => {
            const lowerText = newNote.toLowerCase();
            let tags = [];
            let suggestion = null;
            let therapyAction = null;

            if (lowerText.includes('dormir') || lowerText.includes('noche') || lowerText.includes('insomnio')) {
                tags.push('Problemas de Sueño');
                suggestion = 'Parece que el tinnitus está afectando tu sueño. El ruido marrón ayuda a enmascarar los pitidos en el silencio nocturno.';
                therapyAction = 'sound_brown';
            } else if (lowerText.includes('estrés') || lowerText.includes('trabajo') || lowerText.includes('ansiedad')) {
                tags.push('Pico de Estrés');
                suggestion = 'El estrés contrae los músculos del cuello agravando el tinnitus. Una respiración profunda bajará tu frecuencia cardíaca ahora mismo.';
                therapyAction = 'breathing';
            } else {
                tags.push('Registro Diario');
                suggestion = 'Gracias por llevar tu registro. Mantener un diario ayuda a la habituación neurológica.';
            }

            const analysisResult = { tags, suggestion, therapyAction };
            setAiInsight(analysisResult);

            try {
                await FirestoreService.saveProgressNote(currentUser.uid, {
                    text: newNote,
                    mood: selectedMood,
                    timestamp: new Date().toISOString(),
                    aiAnalysis: analysisResult
                });
                loadNotes();
            } catch (e) {
                console.error('Error saving note:', e);
            }
        }, 2000);
    };

    const finishCreation = () => {
        setNewNote('');
        setSelectedMood('neutral');
        setAiInsight(null);
        setView('list');
    };

    const executeTherapy = (action) => {
        onClose();
        if (openTherapy) openTherapy(action);
    };

    const getMoodData = (value) => MOODS.find(m => m.value === value) || MOODS[1];

    return (
        <div className="notes-full-wrapper animate-fade">
            <div className="notes-full-container">
                <header className="notes-header">
                    <h2>Diario de Observación IA</h2>
                    <button className="notes-close-btn" onClick={onClose}><X size={20} /></button>
                </header>

                <div className="notes-content">
                    {view === 'list' && (
                        <>
                            <div className="notes-list-header">
                                <p>Registra cómo te sientes. La IA analizará patrones para sugerirte la mejor terapia.</p>
                                <button className="premium-btn new-note-btn" onClick={() => setView('create')}>
                                    <Plus size={18} /> Escribir Nota
                                </button>
                            </div>

                            {loading ? (
                                <div className="loading-state"><Activity className="spinner" size={30} /></div>
                            ) : notes.length === 0 ? (
                                <div className="empty-notes glass-card">
                                    <Sparkles size={32} color="#5856D6" style={{ marginBottom: 10 }} />
                                    <p>Tu mente está en blanco. Escribe tu primera observación.</p>
                                </div>
                            ) : (
                                <div className="notes-grid">
                                    {notes.map(note => {
                                        const moodData = getMoodData(note.mood);
                                        return (
                                            <div key={note.id} className="glass-card note-item">
                                                <div className="note-item-header">
                                                    <span className="mood-badge" style={{ background: `${moodData.color}20`, color: moodData.color }}>
                                                        {moodData.emoji} {moodData.label}
                                                    </span>
                                                    <span className="note-date">
                                                        {new Date(note.timestamp || note.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <p className="note-body">{note.text}</p>
                                                
                                                {note.aiAnalysis && note.aiAnalysis.tags && (
                                                    <div className="note-tags">
                                                        {note.aiAnalysis.tags.map((tag, i) => (
                                                            <span key={i} className="ai-tag"><Tag size={12}/> {tag}</span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    )}

                    {view === 'create' && (
                        <div className="glass-card create-note-card animate-fade">
                            <h3>¿Cómo te afecta el zumbido hoy?</h3>
                            
                            <div className="mood-selection-row">
                                {MOODS.map(mood => (
                                    <button
                                        key={mood.value}
                                        className={`mood-icon-btn ${selectedMood === mood.value ? 'selected' : ''}`}
                                        onClick={() => setSelectedMood(mood.value)}
                                        style={{ '--mood-color': mood.color }}
                                    >
                                        <span className="m-emoji">{mood.emoji}</span>
                                        <span className="m-label">{mood.label}</span>
                                    </button>
                                ))}
                            </div>

                            <textarea
                                className="premium-textarea"
                                placeholder="Describe tus síntomas, nivel de estrés, o qué estabas haciendo cuando el ruido empeoró..."
                                value={newNote}
                                onChange={(e) => setNewNote(e.target.value)}
                                autoFocus
                            />

                            <div className="create-actions">
                                <button className="cancel-btn" onClick={() => setView('list')}>Cancelar</button>
                                <button className="premium-btn generate-btn" onClick={handleSaveAndAnalyze} disabled={!newNote.trim()}>
                                    <Sparkles size={18} /> Guardar y Analizar
                                </button>
                            </div>
                        </div>
                    )}

                    {view === 'ai-analysis' && (
                        <div className="ai-analysis-view animate-fade">
                            {!aiInsight ? (
                                <div className="ai-processing glass-card">
                                    <Activity className="spinner" size={40} color="#007AFF" />
                                    <h3>Analizando Patrones</h3>
                                    <p>Nuestra IA está evaluando tu nota para sugerir la mejor acción...</p>
                                </div>
                            ) : (
                                <div className="ai-result glass-card">
                                    <div className="ai-result-header">
                                        <Sparkles size={28} color="#5856D6" />
                                        <h3>Insight Generado</h3>
                                    </div>
                                    <div className="ai-suggestion-box">
                                        <p>{aiInsight.suggestion}</p>
                                    </div>
                                    
                                    <div className="ai-actions">
                                        {aiInsight.therapyAction && (
                                            <button className="premium-btn therapy-btn" onClick={() => executeTherapy(aiInsight.therapyAction)}>
                                                Ir a Terapia Recomendada <ArrowRight size={18} />
                                            </button>
                                        )}
                                        <button className="secondary-btn" onClick={finishCreation}>Volver a mis notas</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default ProgressNotes;
