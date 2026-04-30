import React, { useState, useEffect } from 'react';
import { X, Play, Square, Volume2, Waves, Activity } from 'lucide-react';
import { AudioEngine } from '../utils/audioEngine';
import './CustomNoise.css';

const PRESETS = [
    { name: 'Marrón', freq: 150, color: '#D4A373', type: 'brown' },
    { name: 'Rosa',   freq: 800, color: '#FFB5A7', type: 'pink' },
    { name: 'Blanco', freq: 4000, color: '#E0E1DD', type: 'white' },
    { name: 'Violeta',freq: 12000, color: '#C8B6FF', type: 'violet' }
];

const CustomNoise = ({ onClose, tinnitusFrequency }) => {
    const defaultFreq = tinnitusFrequency ? (typeof tinnitusFrequency === 'object' ? tinnitusFrequency.frequency : tinnitusFrequency) : 4000;
    
    const [frequency, setFrequency] = useState(defaultFreq);
    const [volume, setVolume] = useState(0.5);
    const [modulation, setModulation] = useState(0); // 0 = off, >0 = pulse rate
    const [isPlaying, setIsPlaying] = useState(false);

    // Auto-stop on unmount
    useEffect(() => {
        return () => {
            AudioEngine.stop('custom');
        };
    }, []);

    const getCurrentPreset = (freq) => {
        if (freq < 400) return PRESETS[0];
        if (freq < 2000) return PRESETS[1];
        if (freq < 8000) return PRESETS[2];
        return PRESETS[3];
    };

    const activePreset = getCurrentPreset(frequency);

    const applyAudio = (freq, mod) => {
        if (isPlaying) {
            AudioEngine.playCustomNoise(freq, mod);
            AudioEngine.setVolume('custom', volume);
        }
    };

    const handleFrequencyChange = (e) => {
        const freq = parseInt(e.target.value);
        setFrequency(freq);
        applyAudio(freq, modulation);
    };

    const handleVolumeChange = (e) => {
        const vol = parseFloat(e.target.value);
        setVolume(vol);
        AudioEngine.setVolume('custom', vol);
    };

    const handleModulationChange = (e) => {
        const mod = parseFloat(e.target.value);
        setModulation(mod);
        applyAudio(frequency, mod);
    };

    const togglePlay = () => {
        if (isPlaying) {
            AudioEngine.stop('custom');
            setIsPlaying(false);
        } else {
            AudioEngine.playCustomNoise(frequency, modulation);
            AudioEngine.setVolume('custom', volume);
            setIsPlaying(true);
        }
    };

    const setPreset = (preset) => {
        setFrequency(preset.freq);
        applyAudio(preset.freq, modulation);
    };

    return (
        <div className="cn-wrapper animate-fade">
            <div className="cn-container">
                <header className="cn-header">
                    <h2>Terapia Acústica</h2>
                    <button className="cn-close-btn" onClick={() => { AudioEngine.stop('custom'); onClose(); }}>
                        <X size={20} />
                    </button>
                </header>

                <div className="cn-content">
                    {/* Visualizer Orb */}
                    <div className="orb-display">
                        <div 
                            className={`main-orb ${isPlaying ? 'playing' : ''}`}
                            style={{ 
                                '--orb-color': activePreset.color,
                                animationDuration: modulation > 0 ? `${1 / modulation}s` : '3s'
                            }}
                        ></div>
                        <div className="orb-info">
                            <span className="orb-name">{activePreset.name}</span>
                            <span className="orb-freq">{frequency} Hz</span>
                        </div>
                    </div>

                    {tinnitusFrequency && (
                        <div className="cn-alert">
                            <Activity size={18} />
                            Frecuencia objetivo: {defaultFreq} Hz
                        </div>
                    )}

                    {/* Presets */}
                    <div className="preset-grid">
                        {PRESETS.map(p => (
                            <button 
                                key={p.name}
                                className={`preset-card ${activePreset.name === p.name ? 'active' : ''}`}
                                onClick={() => setPreset(p)}
                                style={{ '--card-color': p.color }}
                            >
                                <span className="p-dot" style={{ background: p.color }}></span>
                                {p.name}
                            </button>
                        ))}
                    </div>

                    {/* Controls */}
                    <div className="glass-panel controls-panel">
                        
                        <div className="control-group">
                            <div className="control-header">
                                <label>Espectro Frecuencial</label>
                                <span>{frequency} Hz</span>
                            </div>
                            <input 
                                type="range" min="50" max="16000" step="50"
                                value={frequency} onChange={handleFrequencyChange}
                                className="cn-slider freq-slider"
                                style={{ '--slider-color': activePreset.color }}
                            />
                            <div className="slider-hints"><span>Grave</span><span>Agudo</span></div>
                        </div>

                        <div className="control-group">
                            <div className="control-header">
                                <label><Waves size={16}/> Pulsación Terapéutica (LFO)</label>
                                <span>{modulation > 0 ? `${modulation} Hz` : 'Fijo'}</span>
                            </div>
                            <input 
                                type="range" min="0" max="4" step="0.5"
                                value={modulation} onChange={handleModulationChange}
                                className="cn-slider mod-slider"
                            />
                            <div className="slider-hints"><span>Apagado</span><span>Rápido</span></div>
                            <p className="hint-text">La modulación crea un efecto de "ola" que distrae mejor al cerebro del zumbido.</p>
                        </div>

                        <div className="control-group" style={{ marginBottom: 0 }}>
                            <div className="control-header">
                                <label><Volume2 size={16}/> Volumen</label>
                                <span>{Math.round(volume * 100)}%</span>
                            </div>
                            <input 
                                type="range" min="0" max="1" step="0.05"
                                value={volume} onChange={handleVolumeChange}
                                className="cn-slider vol-slider"
                                disabled={!isPlaying}
                            />
                        </div>

                    </div>

                    {/* Main Action */}
                    <button 
                        className={`play-action-btn ${isPlaying ? 'active' : ''}`}
                        onClick={togglePlay}
                    >
                        {isPlaying ? (
                            <><Square size={20} fill="currentColor"/> Detener Terapia</>
                        ) : (
                            <><Play size={20} fill="currentColor" /> Iniciar Terapia</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CustomNoise;
