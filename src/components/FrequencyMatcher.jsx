import React, { useState, useEffect, useRef } from 'react';
import { VolumeX, Volume2, ChevronLeft, Check, Wind, Activity, Zap, Ear } from 'lucide-react';
import frequencyIllustration from '../assets/illustrations/frequency.png';

const FrequencyMatcher = ({ onComplete, onCancel }) => {
    // Wizard State
    const [step, setStep] = useState(1); // Now 4 steps total

    // Tinnitus Data State
    const [ear, setEar] = useState(null); // 'left', 'right', 'both'
    const [soundType, setSoundType] = useState('pure'); // 'pure', 'low', 'noise'
    const [frequency, setFrequency] = useState(4000);
    const [volume, setVolume] = useState(50); // 0-100 gain scale 

    // Audio State
    const [isPlaying, setIsPlaying] = useState(false);
    const audioContext = useRef(null);
    const sourceNode = useRef(null); // Can be oscillator or buffer source
    const gainNode = useRef(null);
    const filterNode = useRef(null); // For noise shaping
    const pannerNode = useRef(null); // To control which ear hears the sound

    const SOUND_TYPES = [
        { id: 'pure', name: 'Pito / Silbido', desc: 'Tono agudo y constante', icon: <Zap size={24} /> },
        { id: 'low', name: 'Motor / Ronquido', desc: 'Tono grave y profundo', icon: <Activity size={24} /> },
        { id: 'noise', name: 'Aire / Lluvia', desc: 'Ruido blanco o siseo', icon: <Wind size={24} /> }
    ];

    // --- Audio Generation Logic ---

    const createNoiseBuffer = (ctx) => {
        const bufferSize = ctx.sampleRate * 2; // 2 seconds of noise
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        return buffer;
    };

    const startAudio = () => {
        if (!audioContext.current) {
            audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
        }

        if (isPlaying) {
            stopAudio();
            return;
        }

        gainNode.current = audioContext.current.createGain();
        pannerNode.current = audioContext.current.createStereoPanner();

        // Setup panning based on selected ear
        if (ear === 'left') pannerNode.current.pan.value = -1;
        else if (ear === 'right') pannerNode.current.pan.value = 1;
        else pannerNode.current.pan.value = 0; // 'both'

        // Calculate gain from 0-100 scale
        const normalizedGain = volume / 100 * 0.2; // Max 0.2 to avoid clipping
        gainNode.current.gain.setValueAtTime(normalizedGain, audioContext.current.currentTime);

        gainNode.current.connect(pannerNode.current);
        pannerNode.current.connect(audioContext.current.destination);

        if (soundType === 'noise') {
            // Noise Source
            sourceNode.current = audioContext.current.createBufferSource();
            sourceNode.current.buffer = createNoiseBuffer(audioContext.current);
            sourceNode.current.loop = true;

            // Bandpass filter around the selected frequency
            filterNode.current = audioContext.current.createBiquadFilter();
            filterNode.current.type = 'bandpass';
            filterNode.current.frequency.setValueAtTime(frequency, audioContext.current.currentTime);
            filterNode.current.Q.value = 1; // Bandwidth

            sourceNode.current.connect(filterNode.current);
            filterNode.current.connect(gainNode.current);
            sourceNode.current.start();

        } else {
            // Oscillator Source (Pure tone or Low frequency tone)
            sourceNode.current = audioContext.current.createOscillator();
            sourceNode.current.type = 'sine';
            sourceNode.current.frequency.setValueAtTime(frequency, audioContext.current.currentTime);
            sourceNode.current.connect(gainNode.current);
            sourceNode.current.start();
        }

        setIsPlaying(true);
    };

    const stopAudio = () => {
        if (sourceNode.current) {
            sourceNode.current.stop();
            sourceNode.current.disconnect();
            sourceNode.current = null;
        }
        if (filterNode.current) {
            filterNode.current.disconnect();
            filterNode.current = null;
        }
        if (pannerNode.current) {
            pannerNode.current.disconnect();
            pannerNode.current = null;
        }
        setIsPlaying(false);
    };

    // --- Effect Hooks for Audio Updates ---

    useEffect(() => {
        if (isPlaying && audioContext.current) {
            if (soundType === 'noise' && filterNode.current) {
                filterNode.current.frequency.setTargetAtTime(frequency, audioContext.current.currentTime, 0.05);
            } else if (sourceNode.current && sourceNode.current.frequency) {
                sourceNode.current.frequency.setTargetAtTime(frequency, audioContext.current.currentTime, 0.05);
            }
        }
    }, [frequency, isPlaying, soundType]);

    useEffect(() => {
        if (isPlaying && gainNode.current && audioContext.current) {
            const normalizedGain = volume / 100 * 0.2;
            gainNode.current.gain.setTargetAtTime(normalizedGain, audioContext.current.currentTime, 0.05);
        }
    }, [volume, isPlaying]);

    useEffect(() => {
        return () => stopAudio();
    }, [soundType, ear]);

    // --- Navigation Handlers ---

    const handleNext = () => {
        if (step === 1 && !ear) return; // Prevent proceeding without selecting an ear
        if (step < 4) setStep(step + 1);
    };

    const handlePrev = () => {
        if (step > 1) setStep(step - 1);
        else onCancel();
    };

    const handleSelectEar = (selectedEar) => {
        // Toggle 'both' if clicking already selected
        let newEar = selectedEar;
        if (ear === 'left' && selectedEar === 'right') newEar = 'both';
        if (ear === 'right' && selectedEar === 'left') newEar = 'both';
        if (ear === selectedEar) newEar = null; // Unselect

        if (selectedEar === 'both') newEar = 'both';

        setEar(newEar);
        stopAudio();
    };

    const handleSelectType = (typeId) => {
        setSoundType(typeId);
        if (typeId === 'low') setFrequency(250);
        else if (typeId === 'pure') setFrequency(4000);
        else setFrequency(6000);
        stopAudio();
    };

    const handleFinish = () => {
        stopAudio();
        onComplete({
            ear: ear || 'both', // Default to both if somehow empty
            type: soundType,
            frequency: frequency,
            volume: volume
        });
    };

    // --- Render Helpers ---

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <div className="ear-selection-step">
                        <p className="instruction">¿En qué oído sientes el zumbido?</p>
                        <div className="ears-container">
                            <div
                                className={`ear-box ${(ear === 'left' || ear === 'both') ? 'active' : ''}`}
                                onClick={() => handleSelectEar('left')}
                            >
                                <Ear size={48} style={{ transform: 'scaleX(-1)' }} />
                                <span>Izquierdo</span>
                            </div>
                            <div
                                className={`ear-box ${(ear === 'right' || ear === 'both') ? 'active' : ''}`}
                                onClick={() => handleSelectEar('right')}
                            >
                                <Ear size={48} />
                                <span>Derecho</span>
                            </div>
                        </div>
                        <button
                            className={`btn btn-ghost light ${ear === 'both' ? 'active-ghost' : ''}`}
                            style={{ marginTop: '16px' }}
                            onClick={() => handleSelectEar('both')}
                        >
                            En ambos oídos
                        </button>
                    </div>
                );
            case 2:
                return (
                    <>
                        <p className="instruction">¿A qué se parece más tu acúfeno?</p>
                        <div className="sound-types-grid">
                            {SOUND_TYPES.map(type => (
                                <div
                                    key={type.id}
                                    className={`type-card ${soundType === type.id ? 'selected' : ''}`}
                                    onClick={() => handleSelectType(type.id)}
                                >
                                    <div className="type-icon">{type.icon}</div>
                                    <div className="type-info">
                                        <h4>{type.name}</h4>
                                        <p>{type.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                );
            case 3:
                const isLow = soundType === 'low';
                const minFreq = isLow ? 50 : 250;
                const maxFreq = isLow ? 1000 : 12000;
                const freqStep = isLow ? 10 : 50;

                return (
                    <>
                        <div className={`visualizer ${isPlaying ? 'active' : ''}`}>
                            <div className="wave"></div><div className="wave"></div><div className="wave"></div>
                        </div>

                        <div className="frequency-display">
                            <span className="freq-value">{frequency}</span>
                            <span className="freq-unit">Hz</span>
                        </div>

                        <p className="instruction">Ajusta el control hasta que el tono sea idéntico al que escuchas en tu cabeza.</p>

                        <input
                            type="range"
                            min={minFreq}
                            max={maxFreq}
                            step={freqStep}
                            value={frequency}
                            onChange={(e) => setFrequency(parseInt(e.target.value))}
                            className="freq-slider"
                        />
                    </>
                );
            case 4:
                return (
                    <>
                        <div className={`visualizer ${isPlaying ? 'active' : ''}`}>
                            <div className="wave"></div><div className="wave"></div><div className="wave"></div>
                        </div>

                        <div className="frequency-display">
                            <span className="freq-value">{volume}</span>
                            <span className="freq-unit">% Volumen</span>
                        </div>

                        <p className="instruction">Ajusta el volumen hasta que iguale la intensidad de tu acúfeno.</p>

                        <input
                            type="range"
                            min="0"
                            max="100"
                            step="1"
                            value={volume}
                            onChange={(e) => setVolume(parseInt(e.target.value))}
                            className="freq-slider"
                        />
                        <div className="volume-labels">
                            <span>Apenas perceptible</span>
                            <span>Muy fuerte</span>
                        </div>
                    </>
                );
            default: return null;
        }
    };

    return (
        <div className="matcher-container animate-fade">
            <header className="page-header">
                <button className="back-btn" onClick={handlePrev}>
                    <ChevronLeft />
                </button>
                <h2>Descubre tu Tono</h2>
            </header>

            <img src={frequencyIllustration} alt="" className="feature-illustration" style={{ maxHeight: '120px' }} />

            <div className="wizard-steps">
                <div className={`step-dot ${step >= 1 ? 'active' : ''}`} style={{ width: '24%' }}></div>
                <div className={`step-dot ${step >= 2 ? 'active' : ''}`} style={{ width: '24%' }}></div>
                <div className={`step-dot ${step >= 3 ? 'active' : ''}`} style={{ width: '24%' }}></div>
                <div className={`step-dot ${step >= 4 ? 'active' : ''}`} style={{ width: '24%' }}></div>
            </div>

            <div className="matcher-content">
                {renderStepContent()}

                {step > 1 && (
                    <button
                        className={`play-toggle ${isPlaying ? 'playing' : ''}`}
                        onClick={startAudio}
                    >
                        {isPlaying ? <VolumeX size={32} /> : <Volume2 size={32} />}
                        <span>{isPlaying ? 'Detener Sonido' : 'Escuchar Sonido'}</span>
                    </button>
                )}
            </div>

            <footer className="page-footer">
                {step < 4 ? (
                    <button className="btn btn-primary full-width" onClick={handleNext} disabled={step === 1 && !ear}>
                        Siguiente Paso
                    </button>
                ) : (
                    <button className="btn btn-primary full-width" onClick={handleFinish}>
                        Listo, terminar examen <Check size={20} />
                    </button>
                )}
            </footer>
        </div>
    );
};

export default FrequencyMatcher;
