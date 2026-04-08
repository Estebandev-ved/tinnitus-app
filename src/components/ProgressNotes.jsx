import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, Mic, Plus } from 'lucide-react';
import { FirestoreService } from '../services/firestoreService';
import { useAuth } from '../contexts/AuthContext';
import './ProgressNotes.css';
import progressNotesIllustration from '../assets/illustrations/progress_notes.png';

const MOODS = [
    { emoji: '😊', label: 'Bien', value: 'good' },
    { emoji: '😐', label: 'Normal', value: 'neutral' },
    { emoji: '😔', label: 'Mal', value: 'bad' },
    { emoji: '😣', label: 'Ansioso', value: 'anxious' },
    { emoji: '😤', label: 'Irritado', value: 'irritated' },
];

const ProgressNotes = ({ onClose }) => {
    const { currentUser } = useAuth();
    const [notes, setNotes] = useState([]);
    const [newNote, setNewNote] = useState('');
    const [selectedMood, setSelectedMood] = useState('neutral');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [view, setView] = useState('list'); // 'list' or 'create'

    useEffect(() => {
        loadNotes();
    }, [currentUser]);

    const loadNotes = async () => {
        if (!currentUser) return;
        try {
            const data = await FirestoreService.getProgressNotes(currentUser.uid, 20);
            setNotes(data);
        } catch (e) {
            console.error('Error loading notes:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!newNote.trim()) return;
        setSaving(true);
        try {
            await FirestoreService.saveProgressNote(currentUser.uid, {
                text: newNote,
                mood: selectedMood,
                timestamp: new Date().toISOString()
            });
            setNewNote('');
            setSelectedMood('neutral');
            setView('list');
            loadNotes();
        } catch (e) {
            console.error('Error saving note:', e);
            alert('Error al guardar la nota');
        } finally {
            setSaving(false);
        }
    };

    const getMoodEmoji = (value) => {
        return MOODS.find(m => m.value === value)?.emoji || '📝';
    };

    return (
        <div className="notes-overlay animate-fade">
            <div className="notes-modal">
                <header className="notes-header">
                    <h3>Notas de Progreso</h3>
                    <button className="close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </header>

                <img src={progressNotesIllustration} alt="" className="feature-illustration" />

                <div className="notes-content">
                    {view === 'list' ? (
                        <>
                            <div className="create-fab" onClick={() => setView('create')}>
                                <Plus size={24} /> Nueva Nota
                            </div>

                            {loading ? (
                                <p className="loading-text">Cargando notas...</p>
                            ) : notes.length === 0 ? (
                                <div className="empty-state">
                                    <p>No tienes notas registradas aún.</p>
                                    <button className="btn btn-primary" onClick={() => setView('create')}>
                                        Crear mi primera nota
                                    </button>
                                </div>
                            ) : (
                                <div className="notes-list">
                                    {notes.map(note => (
                                        <div key={note.id} className="note-card">
                                            <div className="note-header">
                                                <span className="note-mood">{getMoodEmoji(note.mood)}</span>
                                                <span className="note-date">
                                                    {new Date(note.timestamp || note.date).toLocaleDateString('es-ES', {
                                                        weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>
                                            <p className="note-text">{note.text}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="create-view animate-fade">
                            <label className="input-label">¿Cómo te sientes en este momento?</label>
                            <div className="mood-selector">
                                {MOODS.map(mood => (
                                    <button
                                        key={mood.value}
                                        className={`mood-btn ${selectedMood === mood.value ? 'active' : ''}`}
                                        onClick={() => setSelectedMood(mood.value)}
                                    >
                                        <span className="mood-emoji">{mood.emoji}</span>
                                        <span className="mood-label">{mood.label}</span>
                                    </button>
                                ))}
                            </div>

                            <label className="input-label">Escribe tus pensamientos...</label>
                            <textarea
                                className="note-input"
                                placeholder="Hoy me sentí mejor después de la meditación..."
                                value={newNote}
                                onChange={(e) => setNewNote(e.target.value)}
                                autoFocus
                            />

                            <div className="action-buttons">
                                <button className="btn btn-ghost" onClick={() => setView('list')}>
                                    Cancelar
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleSave}
                                    disabled={saving || !newNote.trim()}
                                >
                                    {saving ? 'Guardando...' : 'Guardar Nota'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProgressNotes;
