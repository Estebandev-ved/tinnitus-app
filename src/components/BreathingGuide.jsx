import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Play, Pause } from 'lucide-react';
import { playBreathPhase, stopBreathAudio } from '../utils/breathAudio';
import breathingIllustration from '../assets/illustrations/2.png';
import './BreathingGuide.css';

const PHASES = [
    { name: 'Inhala', duration: 4, color: '#7C5CFC', audioPhase: 'inhale' },
    { name: 'Sostén', duration: 7, color: '#C084FC', audioPhase: 'hold' },
    { name: 'Exhala', duration: 8, color: '#38BDF8', audioPhase: 'exhale' },
];

const BreathingGuide = ({ onClose }) => {
    const [isRunning, setIsRunning] = useState(false);
    const [phaseIndex, setPhaseIndex] = useState(0);
    const [countdown, setCountdown] = useState(PHASES[0].duration);
    const [cycles, setCycles] = useState(0);
    const intervalRef = useRef(null);

    useEffect(() => {
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            stopBreathAudio();
        };
    }, []);

    const start = () => {
        setIsRunning(true);
        setCycles(0);
        setPhaseIndex(0);
        setCountdown(PHASES[0].duration);

        // Play the first phase sound
        playBreathPhase(PHASES[0].audioPhase, PHASES[0].duration);

        runTimer(0, PHASES[0].duration);
    };

    const stop = () => {
        setIsRunning(false);
        if (intervalRef.current) clearInterval(intervalRef.current);
        stopBreathAudio();
        setPhaseIndex(0);
        setCountdown(PHASES[0].duration);
    };

    const runTimer = (pIdx, remaining) => {
        if (intervalRef.current) clearInterval(intervalRef.current);

        intervalRef.current = setInterval(() => {
            remaining--;
            if (remaining <= 0) {
                // Move to next phase
                const nextIdx = (pIdx + 1) % PHASES.length;
                if (nextIdx === 0) {
                    setCycles(prev => prev + 1);
                }
                setPhaseIndex(nextIdx);
                remaining = PHASES[nextIdx].duration;
                setCountdown(remaining);

                // Play sound for the new phase
                playBreathPhase(PHASES[nextIdx].audioPhase, PHASES[nextIdx].duration);

                // Restart interval for new phase
                clearInterval(intervalRef.current);
                runTimer(nextIdx, remaining);
            } else {
                setCountdown(remaining);
            }
        }, 1000);
    };

    const currentPhase = PHASES[phaseIndex];
    const totalPhaseDuration = currentPhase.duration;
    const progress = 1 - (countdown / totalPhaseDuration);

    return (
        <div className="breathing-container animate-fade">
            <header className="breathing-header">
                <button className="back-btn" onClick={() => { stop(); onClose(); }}>
                    <ChevronLeft />
                </button>
                <h3>Respiración Guiada</h3>
                <div style={{ width: 24 }}></div>
            </header>

            <div className="breathing-content">
                <img src={breathingIllustration} alt="" className="breathing-illustration" />
                <p className="breathing-subtitle">Técnica 4-7-8 para calmar tu sistema nervioso</p>

                <div className="circle-wrapper">
                    <div
                        className={`breathing-circle ${isRunning ? 'active' : ''}`}
                        style={{
                            '--phase-color': currentPhase.color,
                            '--scale': isRunning ? (currentPhase.name === 'Inhala' ? 1 + progress * 0.4 : currentPhase.name === 'Exhala' ? 1.4 - progress * 0.4 : 1.4) : 1,
                        }}
                    >
                        <span className="phase-name">{isRunning ? currentPhase.name : 'Listo'}</span>
                        <span className="phase-countdown">
                            {isRunning ? countdown : ''}
                        </span>
                    </div>
                </div>

                <div className="phase-indicators">
                    {PHASES.map((p, i) => (
                        <div key={i} className={`phase-dot ${i === phaseIndex && isRunning ? 'active' : ''}`} style={{ background: p.color }}>
                            <span>{p.name}</span>
                            <span>{p.duration}s</span>
                        </div>
                    ))}
                </div>

                {cycles > 0 && (
                    <p className="cycle-count">{cycles} {cycles === 1 ? 'ciclo' : 'ciclos'} completados</p>
                )}

                <button
                    className={`btn btn-primary breathing-btn ${isRunning ? 'stop' : ''}`}
                    onClick={isRunning ? stop : start}
                >
                    {isRunning ? <><Pause size={20} /> Detener</> : <><Play size={20} /> Comenzar</>}
                </button>
            </div>
        </div>
    );
};

export default BreathingGuide;
