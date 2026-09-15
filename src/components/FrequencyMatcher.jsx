import React, { useState, useEffect, useRef, useCallback } from 'react';
import { VolumeX, Volume2, ChevronLeft, ChevronRight, Check, Wind, Activity, Zap, Ear, Info, ArrowLeftRight, Play, Pause, Sparkles, Target } from 'lucide-react';

const FrequencyMatcher = ({ onComplete, onCancel }) => {
    const [step, setStep] = useState(1);
    const [ear, setEar] = useState(null);
    const [soundType, setSoundType] = useState('pure');
    const [frequency, setFrequency] = useState(4000);
    const [volume, setVolume] = useState(50);
    const [showInfo, setShowInfo] = useState(false);

    const audioContext = useRef(null);
    const sourceNode = useRef(null);
    const gainNode = useRef(null);
    const filterNode = useRef(null);
    const pannerNode = useRef(null);
    const analyserNode = useRef(null);
    const canvasRef = useRef(null);
    const animFrameRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPreviewing, setIsPreviewing] = useState(null);
    const previewTimeoutRef = useRef(null);

    const SOUND_TYPES = [
        { id: 'pure', name: 'Pito / Silbido', desc: 'Tono agudo y constante, como un pitido', icon: Zap, color: '#00B4D8', tip: 'El más común. Un tono puro y continuo.' },
        { id: 'low', name: 'Motor / Ronquido', desc: 'Tono grave y profundo, como un motor', icon: Activity, color: '#A78BFA', tip: 'Frecuencias bajas. Se siente como vibración.' },
        { id: 'noise', name: 'Aire / Lluvia', desc: 'Ruido suave, como aire acondicionado', icon: Wind, color: '#2DD4BF', tip: 'Ruido broadband. Similar a siseo o estática.' }
    ];

    const FREQ_PRESETS = {
        pure: [1000, 2000, 4000, 6000, 8000, 10000],
        low: [100, 200, 400, 600, 800],
        noise: [2000, 4000, 6000, 8000, 10000, 12000]
    };

    const isLow = soundType === 'low';
    const minFreq = isLow ? 50 : 250;
    const maxFreq = isLow ? 1000 : 12000;
    const freqStep = isLow ? 10 : 25;

    const createNoiseBuffer = useCallback((ctx) => {
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        return buffer;
    }, []);

    const stopAudio = useCallback(() => {
        if (sourceNode.current) {
            try { sourceNode.current.stop(); } catch { /* already stopped */ }
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
        if (analyserNode.current) {
            analyserNode.current.disconnect();
            analyserNode.current = null;
        }
        if (animFrameRef.current) {
            cancelAnimationFrame(animFrameRef.current);
            animFrameRef.current = null;
        }
        setIsPlaying(false);
    }, []);

    const startAudio = useCallback(() => {
        if (!audioContext.current) {
            audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (isPlaying) {
            stopAudio();
            return;
        }

        gainNode.current = audioContext.current.createGain();
        pannerNode.current = audioContext.current.createStereoPanner();
        analyserNode.current = audioContext.current.createAnalyser();
        analyserNode.current.fftSize = 256;

        if (ear === 'left') pannerNode.current.pan.value = -1;
        else if (ear === 'right') pannerNode.current.pan.value = 1;
        else pannerNode.current.pan.value = 0;

        const normalizedGain = volume / 100 * 0.18;
        gainNode.current.gain.setValueAtTime(normalizedGain, audioContext.current.currentTime);

        gainNode.current.connect(analyserNode.current);
        analyserNode.current.connect(pannerNode.current);
        pannerNode.current.connect(audioContext.current.destination);

        if (soundType === 'noise') {
            sourceNode.current = audioContext.current.createBufferSource();
            sourceNode.current.buffer = createNoiseBuffer(audioContext.current);
            sourceNode.current.loop = true;
            filterNode.current = audioContext.current.createBiquadFilter();
            filterNode.current.type = 'bandpass';
            filterNode.current.frequency.setValueAtTime(frequency, audioContext.current.currentTime);
            filterNode.current.Q.value = 1;
            sourceNode.current.connect(filterNode.current);
            filterNode.current.connect(gainNode.current);
            sourceNode.current.start();
        } else {
            sourceNode.current = audioContext.current.createOscillator();
            sourceNode.current.type = 'sine';
            sourceNode.current.frequency.setValueAtTime(frequency, audioContext.current.currentTime);
            sourceNode.current.connect(gainNode.current);
            sourceNode.current.start();
        }

        setIsPlaying(true);
    }, [isPlaying, ear, soundType, frequency, volume, createNoiseBuffer, stopAudio]);

    const previewSoundType = useCallback((typeId) => {
        if (isPreviewing === typeId) {
            stopAudio();
            setIsPreviewing(null);
            return;
        }

        stopAudio();
        setIsPreviewing(typeId);

        if (!audioContext.current) {
            audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
        }

        const previewGain = audioContext.current.createGain();
        previewGain.gain.value = 0.08;

        let previewSource;
        if (typeId === 'noise') {
            previewSource = audioContext.current.createBufferSource();
            previewSource.buffer = createNoiseBuffer(audioContext.current);
            previewSource.loop = false;
            const f = audioContext.current.createBiquadFilter();
            f.type = 'bandpass';
            f.frequency.value = 4000;
            f.Q.value = 1;
            previewSource.connect(f);
            f.connect(previewGain);
        } else {
            previewSource = audioContext.current.createOscillator();
            previewSource.type = 'sine';
            previewSource.frequency.value = typeId === 'low' ? 200 : 4000;
            previewSource.connect(previewGain);
        }

        previewGain.connect(audioContext.current.destination);
        previewSource.start();

        previewTimeoutRef.current = setTimeout(() => {
            try { previewSource.stop(); } catch { /* already stopped */ }
            previewSource.disconnect();
            setIsPreviewing(null);
        }, 1500);
    }, [isPreviewing, stopAudio, createNoiseBuffer]);

    useEffect(() => {
        return () => {
            if (previewTimeoutRef.current) clearTimeout(previewTimeoutRef.current);
            stopAudio();
        };
    }, [stopAudio]);

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
            const normalizedGain = volume / 100 * 0.18;
            gainNode.current.gain.setTargetAtTime(normalizedGain, audioContext.current.currentTime, 0.05);
        }
    }, [volume, isPlaying]);

    useEffect(() => {
        return () => stopAudio();
    }, [soundType, ear, stopAudio]);

    useEffect(() => {
        if (!isPlaying || !analyserNode.current || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const bufferLength = analyserNode.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
            animFrameRef.current = requestAnimationFrame(draw);
            if (!analyserNode.current) return;
            analyserNode.current.getByteFrequencyData(dataArray);

            const w = canvas.width;
            const h = canvas.height;
            ctx.clearRect(0, 0, w, h);

            const barCount = 64;
            const barWidth = (w / barCount) - 1;
            const step = Math.floor(bufferLength / barCount);

            for (let i = 0; i < barCount; i++) {
                const val = dataArray[i * step] / 255;
                const barH = val * h * 0.85;
                const x = i * (barWidth + 1);

                const gradient = ctx.createLinearGradient(0, h - barH, 0, h);
                gradient.addColorStop(0, 'rgba(0, 180, 216, 0.9)');
                gradient.addColorStop(1, 'rgba(0, 119, 182, 0.3)');
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.roundRect(x, h - barH, barWidth, barH, 2);
                ctx.fill();
            }
        };

        draw();
        return () => {
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        };
    }, [isPlaying]);

    const handleNext = () => {
        if (step === 1 && !ear) return;
        if (step < 4) setStep(step + 1);
    };

    const handlePrev = () => {
        if (step > 1) setStep(step - 1);
        else onCancel();
    };

    const handleSelectEar = (selectedEar) => {
        let newEar = selectedEar;
        if (ear === 'left' && selectedEar === 'right') newEar = 'both';
        if (ear === 'right' && selectedEar === 'left') newEar = 'both';
        if (ear === selectedEar) newEar = null;
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
            ear: ear || 'both',
            type: soundType,
            frequency,
            volume
        });
    };

    const freqToLabel = (f) => {
        if (f < 250) return 'Grave';
        if (f < 2000) return 'Medio';
        if (f < 4000) return 'Medio-Agudo';
        if (f < 8000) return 'Agudo';
        return 'Muy Agudo';
    };

    const freqToNotchInfo = (f) => {
        if (f < 500) return 'Frecuencia baja. La terapia notch es muy efectiva aquí.';
        if (f < 2000) return 'Rango medio. La mayoría de pacientes responden bien.';
        if (f < 6000) return 'Rango medio-agudo. Zona común de tinnitus.';
        return 'Rango agudo. El notch requiere más supresión.';
    };

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <div className="fm-step-content">
                        <div className="fm-step-badge">
                            <span className="fm-step-num">1</span>
                            <span>de 4</span>
                        </div>
                        <h3 className="fm-step-title">Selecciona el oído</h3>
                        <p className="fm-step-desc">¿En qué oído(s) escuchas el zumbido?</p>

                        <div className="fm-ears-container">
                            <button
                                className={`fm-ear-card ${(ear === 'left' || ear === 'both') ? 'active' : ''}`}
                                onClick={() => handleSelectEar('left')}
                            >
                                <div className="fm-ear-icon-wrap">
                                    <Ear size={36} style={{ transform: 'scaleX(-1)' }} />
                                </div>
                                <span className="fm-ear-label">Izquierdo</span>
                                <span className="fm-ear-sublabel">Oído izquierdo</span>
                            </button>

                            <button
                                className={`fm-ear-card ${(ear === 'right' || ear === 'both') ? 'active' : ''}`}
                                onClick={() => handleSelectEar('right')}
                            >
                                <div className="fm-ear-icon-wrap">
                                    <Ear size={36} />
                                </div>
                                <span className="fm-ear-label">Derecho</span>
                                <span className="fm-ear-sublabel">Oído derecho</span>
                            </button>
                        </div>

                        <button
                            className={`fm-both-btn ${ear === 'both' ? 'active' : ''}`}
                            onClick={() => handleSelectEar('both')}
                        >
                            <ArrowLeftRight size={16} />
                            Ambos oídos
                        </button>
                    </div>
                );

            case 2:
                return (
                    <div className="fm-step-content">
                        <div className="fm-step-badge">
                            <span className="fm-step-num">2</span>
                            <span>de 4</span>
                        </div>
                        <h3 className="fm-step-title">Tipo de sonido</h3>
                        <p className="fm-step-desc">¿A qué se parece más tu acúfeno?</p>

                        <div className="fm-type-list">
                            {SOUND_TYPES.map(type => {
                                const Icon = type.icon;
                                return (
                                    <button
                                        key={type.id}
                                        className={`fm-type-card ${soundType === type.id ? 'selected' : ''}`}
                                        onClick={() => handleSelectType(type.id)}
                                    >
                                        <div className="fm-type-icon" style={{
                                            background: soundType === type.id ? type.color : `${type.color}15`,
                                            color: soundType === type.id ? 'white' : type.color
                                        }}>
                                            <Icon size={22} />
                                        </div>
                                        <div className="fm-type-info">
                                            <h4>{type.name}</h4>
                                            <p>{type.desc}</p>
                                            {soundType === type.id && (
                                                <span className="fm-type-tip">{type.tip}</span>
                                            )}
                                        </div>
                                        <button
                                            className="fm-preview-btn"
                                            onClick={(e) => { e.stopPropagation(); previewSoundType(type.id); }}
                                            title="Escuchar ejemplo"
                                        >
                                            {isPreviewing === type.id ? <Pause size={14} /> : <Play size={14} fill="currentColor" />}
                                        </button>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div className="fm-step-content">
                        <div className="fm-step-badge">
                            <span className="fm-step-num">3</span>
                            <span>de 4</span>
                        </div>
                        <h3 className="fm-step-title">Ajusta la frecuencia</h3>
                        <p className="fm-step-desc">Mueve el control hasta que el tono sea idéntico al que escuchas.</p>

                        <div className="fm-visualizer-area">
                            <canvas
                                ref={canvasRef}
                                width={300}
                                height={80}
                                className={`fm-spectrum-canvas ${isPlaying ? 'active' : ''}`}
                            />
                            {!isPlaying && (
                                <div className="fm-visualizer-placeholder">
                                    <Zap size={20} />
                                    <span>Pulsa play para escuchar</span>
                                </div>
                            )}
                        </div>

                        <div className="fm-freq-display">
                            <span className="fm-freq-value">{frequency}</span>
                            <span className="fm-freq-unit">Hz</span>
                        </div>
                        <span className="fm-freq-label">{freqToLabel(frequency)}</span>

                        <div className="fm-slider-area">
                            <span className="fm-slider-min">{minFreq}</span>
                            <input
                                type="range"
                                min={minFreq}
                                max={maxFreq}
                                step={freqStep}
                                value={frequency}
                                onChange={(e) => setFrequency(parseInt(e.target.value))}
                                className="fm-freq-slider"
                            />
                            <span className="fm-slider-max">{maxFreq}</span>
                        </div>

                        <div className="fm-fine-controls">
                            <button className="fm-fine-btn" onClick={() => setFrequency(f => Math.max(minFreq, f - freqStep))}>
                                <ChevronLeft size={16} /> -{freqStep}
                            </button>
                            <span className="fm-fine-label">Ajuste fino</span>
                            <button className="fm-fine-btn" onClick={() => setFrequency(f => Math.min(maxFreq, f + freqStep))}>
                                +{freqStep} <ChevronRight size={16} />
                            </button>
                        </div>

                        <div className="fm-preset-chips">
                            {FREQ_PRESETS[soundType].map(f => (
                                <button
                                    key={f}
                                    className={`fm-preset-chip ${frequency === f ? 'active' : ''}`}
                                    onClick={() => setFrequency(f)}
                                >
                                    {f >= 1000 ? `${f / 1000}k` : f}
                                </button>
                            ))}
                        </div>

                        <div className="fm-info-box">
                            <Info size={14} />
                            <span>{freqToNotchInfo(frequency)}</span>
                        </div>
                    </div>
                );

            case 4:
                return (
                    <div className="fm-step-content">
                        <div className="fm-step-badge">
                            <span className="fm-step-num">4</span>
                            <span>de 4</span>
                        </div>
                        <h3 className="fm-step-title">Volumen del zumbido</h3>
                        <p className="fm-step-desc">Ajusta hasta que iguale la intensidad de tu acúfeno.</p>

                        <div className="fm-visualizer-area">
                            <canvas
                                ref={canvasRef}
                                width={300}
                                height={80}
                                className={`fm-spectrum-canvas ${isPlaying ? 'active' : ''}`}
                            />
                            {!isPlaying && (
                                <div className="fm-visualizer-placeholder">
                                    <Volume2 size={20} />
                                    <span>Pulsa play para escuchar</span>
                                </div>
                            )}
                        </div>

                        <div className="fm-volume-display">
                            <div className="fm-volume-meter">
                                <div className="fm-volume-fill" style={{ width: `${volume}%` }} />
                            </div>
                            <span className="fm-volume-value">{volume}%</span>
                        </div>

                        <div className="fm-slider-area">
                            <span className="fm-slider-min">0</span>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                step="1"
                                value={volume}
                                onChange={(e) => setVolume(parseInt(e.target.value))}
                                className="fm-freq-slider fm-volume-slider"
                            />
                            <span className="fm-slider-max">100</span>
                        </div>

                        <div className="fm-volume-labels">
                            <span>Apenas se nota</span>
                            <span>Muy intenso</span>
                        </div>

                        <div className="fm-volume-presets">
                            {[10, 25, 50, 75].map(v => (
                                <button
                                    key={v}
                                    className={`fm-vol-chip ${volume === v ? 'active' : ''}`}
                                    onClick={() => setVolume(v)}
                                >
                                    {v}%
                                </button>
                            ))}
                        </div>
                    </div>
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
                <div className="fm-header-center">
                    <h2>Calibrar Frecuencia</h2>
                    <span className="fm-header-subtitle">Mide tu tinnitus</span>
                </div>
                <button className="fm-info-btn" onClick={() => setShowInfo(!showInfo)}>
                    <Info size={18} />
                </button>
            </header>

            {showInfo && (
                <div className="fm-info-panel animate-fade">
                    <Sparkles size={16} />
                    <div>
                        <strong>¿Por qué calibrar?</strong>
                        <p>Medir la frecuencia exacta permite crear una terapia Notch personalizada que suprime tu banda de tinnitus, acelerando la habituación.</p>
                    </div>
                    <button className="fm-info-close" onClick={() => setShowInfo(false)}>×</button>
                </div>
            )}

            <div className="fm-progress-bar">
                <div className="fm-progress-fill" style={{ width: `${(step / 4) * 100}%` }} />
                <div className="fm-progress-steps">
                    {[1, 2, 3, 4].map(s => (
                        <div key={s} className={`fm-progress-dot ${step >= s ? 'done' : ''} ${step === s ? 'current' : ''}`}>
                            {step > s ? <Check size={10} /> : <span>{s}</span>}
                        </div>
                    ))}
                </div>
            </div>

            <div className="matcher-content">
                {renderStepContent()}

                {step >= 3 && (
                    <button
                        className={`fm-play-btn ${isPlaying ? 'playing' : ''}`}
                        onClick={startAudio}
                    >
                        {isPlaying ? (
                            <>
                                <div className="fm-play-ripple" />
                                <Pause size={24} />
                                <span>Detener</span>
                            </>
                        ) : (
                            <>
                                <Play size={24} fill="currentColor" />
                                <span>Escuchar Tono</span>
                            </>
                        )}
                    </button>
                )}
            </div>

            <footer className="page-footer">
                <button
                    className="fm-next-btn"
                    onClick={step === 4 ? handleFinish : handleNext}
                    disabled={step === 1 && !ear}
                >
                    {step < 4 ? (
                        <>
                            <span>Siguiente</span>
                            <ChevronRight size={18} />
                        </>
                    ) : (
                        <>
                            <Check size={18} />
                            <span>Guardar Medición</span>
                        </>
                    )}
                </button>

                {step === 4 && (
                    <div className="fm-result-preview">
                        <span className="fm-result-icon"><Target size={20} /></span>
                        <span>Frecuencia: <strong>{frequency} Hz</strong> · Volumen: <strong>{volume}%</strong></span>
                    </div>
                )}
            </footer>
        </div>
    );
};

export default FrequencyMatcher;
