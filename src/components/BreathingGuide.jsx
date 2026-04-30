import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Square, Wind } from 'lucide-react';
import { playBreathPhase, stopBreathAudio } from '../utils/breathAudio';
import './BreathingGuide.css';

const DEFAULT_PHASES = [
    { id: 'inhale', label: 'Inhala', duration: 4 },
    { id: 'hold', label: 'Sostén', duration: 7 },
    { id: 'exhale', label: 'Exhala', duration: 8 }
];

const BreathingGuide = ({ onClose }) => {
    const [isRunning, setIsRunning] = useState(false);
    const [currentPhaseIndex, setCurrentPhaseIndex] = useState(null);
    const [phases, setPhases] = useState(DEFAULT_PHASES); // Optional: could be dynamically changed
    const timerRef = useRef(null);

    useEffect(() => {
        return () => {
            stopMeditation();
        };
    }, []);

    const stopMeditation = () => {
        setIsRunning(false);
        setCurrentPhaseIndex(null);
        if (timerRef.current) clearTimeout(timerRef.current);
        stopBreathAudio();
    };

    const runPhase = (index) => {
        if (!isRunning) return; // Prevent next phase if stopped
        
        setCurrentPhaseIndex(index);
        const phase = phases[index];
        
        // Play human breath audio
        playBreathPhase(phase.id, phase.duration);

        // Schedule next phase
        timerRef.current = setTimeout(() => {
            const nextIndex = (index + 1) % phases.length;
            runPhase(nextIndex);
        }, phase.duration * 1000);
    };

    // Need to hook into acts when isRunning becomes true originally
    const handleToggle = () => {
        if (isRunning) {
            stopMeditation();
        } else {
            setIsRunning(true);
            // It will trigger in a useEffect or we just call runPhase(0) immediately
            // Timeout hack to allow state update to flag isRunning true
            setTimeout(() => {
                runPhase(0);
            }, 0);
        }
    };

    const currentPhase = currentPhaseIndex !== null ? phases[currentPhaseIndex] : null;

    return (
        <div className="bg-wrapper animate-fade">
            <div className="bg-container">
                <header className="bg-header">
                    <h2>Respiración 4-7-8</h2>
                    <button className="bg-close-btn" onClick={() => { stopMeditation(); onClose(); }}>
                        <X size={20} />
                    </button>
                </header>

                <div className="bg-content">
                    
                    <div className="bg-alert">
                        <Wind size={18} />
                        Las respiraciones largas envían señales de calma al cerebro, desactivando alertas.
                    </div>

                    {/* Central Glass Orb Visualizer */}
                    <div className="bg-orb-display">
                        <div className="bg-orb-rings">
                            <div className={`orb-ring r1 ${isRunning ? 'active' : ''} ${currentPhase?.id || ''}`} 
                                 style={{ animationDuration: currentPhase ? `${currentPhase.duration}s` : '0s' }}></div>
                            <div className={`orb-ring r2 ${isRunning ? 'active' : ''} ${currentPhase?.id || ''}`} 
                                 style={{ animationDuration: currentPhase ? `${currentPhase.duration}s` : '0s' }}></div>
                        </div>
                        <div className={`bg-main-orb ${isRunning ? 'active' : ''} ${currentPhase?.id || ''}`}
                             style={{ transitionDuration: currentPhase ? `${currentPhase.duration}s` : '0.5s' }}>
                            <span className="orb-text">
                                {isRunning ? currentPhase?.label : 'LISTO'}
                            </span>
                        </div>
                    </div>

                    {/* Phases Tracker row */}
                    <div className="phases-tracker">
                        {phases.map((p, i) => (
                            <div key={p.id} className={`phase-card ${currentPhaseIndex === i ? 'active' : ''}`}>
                                <span className="phase-label">{p.label}</span>
                                <span className="phase-time">{p.duration}s</span>
                            </div>
                        ))}
                    </div>

                    {/* Action Button */}
                    <button 
                        className={`bg-action-btn ${isRunning ? 'stop' : ''}`}
                        onClick={handleToggle}
                    >
                        {isRunning ? (
                            <><Square size={20} fill="currentColor"/> Detener</>
                        ) : (
                            <><Play size={20} fill="currentColor" /> Comenzar Técnica</>
                        )}
                    </button>

                </div>
            </div>
        </div>
    );
};

export default BreathingGuide;
