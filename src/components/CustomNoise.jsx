import React, { useState } from 'react';
import { ChevronLeft, Play, Square, Volume2 } from 'lucide-react';
import { AudioEngine } from '../utils/audioEngine';
import './CustomNoise.css';
import customNoiseIllustration from '../assets/illustrations/custom_noise.png';

const PRESETS = [
    { name: 'Marrón', freq: 100, color: '#8B4513', desc: 'Grave y profundo' },
    { name: 'Rosa', freq: 1000, color: '#FFC0CB', desc: 'Equilibrado' },
    { name: 'Blanco', freq: 4000, color: '#C0C0C0', desc: 'Todas las frecuencias' },
    { name: 'Violeta', freq: 12000, color: '#9B59B6', desc: 'Agudo y brillante' },
];

const CustomNoise = ({ onClose, tinnitusFrequency }) => {
    const [frequency, setFrequency] = useState(
        tinnitusFrequency ? (typeof tinnitusFrequency === 'object' ? tinnitusFrequency.frequency : tinnitusFrequency) : 4000
    );
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.5);

    const getNoiseColor = (freq) => {
        if (freq < 200) return { name: 'Marrón', color: '#8B4513' };
        if (freq < 2000) return { name: 'Rosa', color: '#EC407A' };
        if (freq < 8000) return { name: 'Blanco', color: '#90A4AE' };
        return { name: 'Violeta', color: '#9B59B6' };
    };

    const handleFrequencyChange = (e) => {
        const freq = parseInt(e.target.value);
        setFrequency(freq);
        if (isPlaying) {
            AudioEngine.playCustomNoise(freq);
            AudioEngine.setVolume('custom', volume);
        }
    };

    const handleVolumeChange = (e) => {
        const vol = parseFloat(e.target.value);
        setVolume(vol);
        AudioEngine.setVolume('custom', vol);
    };

    const togglePlay = () => {
        if (isPlaying) {
            AudioEngine.stop('custom');
            setIsPlaying(false);
        } else {
            AudioEngine.playCustomNoise(frequency);
            AudioEngine.setVolume('custom', volume);
            setIsPlaying(true);
        }
    };

    const applyPreset = (preset) => {
        setFrequency(preset.freq);
        if (isPlaying) {
            AudioEngine.playCustomNoise(preset.freq);
            AudioEngine.setVolume('custom', volume);
        }
    };

    const noiseInfo = getNoiseColor(frequency);

    return (
        <div className="custom-noise-container animate-fade">
            <header className="custom-noise-header">
                <button className="back-btn" onClick={() => { AudioEngine.stop('custom'); onClose(); }}>
                    <ChevronLeft />
                </button>
                <h3>Ruido Personalizado</h3>
                <div style={{ width: 24 }}></div>
            </header>

            <div className="custom-noise-content">
                <img src={customNoiseIllustration} alt="" className="feature-illustration" />
                <div className="noise-visualizer" style={{ '--noise-color': noiseInfo.color }}>
                    <div className={`noise-orb ${isPlaying ? 'playing' : ''}`}>
                        <span className="noise-type">{noiseInfo.name}</span>
                        <span className="noise-freq">{frequency} Hz</span>
                    </div>
                </div>

                {tinnitusFrequency && (
                    <div className="tinnitus-hint">
                        Tu frecuencia de tinnitus: <strong>{typeof tinnitusFrequency === 'object' ? tinnitusFrequency.frequency : tinnitusFrequency} Hz</strong>
                    </div>
                )}

                <div className="freq-slider-section">
                    <label>Frecuencia</label>
                    <div className="freq-labels">
                        <span>Grave</span>
                        <span>Agudo</span>
                    </div>
                    <input
                        type="range"
                        min="50"
                        max="16000"
                        step="50"
                        value={frequency}
                        onChange={handleFrequencyChange}
                        className="freq-slider"
                        style={{ '--slider-color': noiseInfo.color }}
                    />
                </div>

                <div className="vol-slider-section">
                    <Volume2 size={16} />
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={volume}
                        onChange={handleVolumeChange}
                        className="vol-slider"
                        disabled={!isPlaying}
                    />
                </div>

                <div className="presets-row">
                    {PRESETS.map(p => (
                        <button
                            key={p.name}
                            className={`preset-btn ${frequency === p.freq ? 'active' : ''}`}
                            onClick={() => applyPreset(p)}
                            style={{ '--preset-color': p.color }}
                        >
                            <span className="preset-dot" style={{ background: p.color }}></span>
                            <span>{p.name}</span>
                        </button>
                    ))}
                </div>

                <button
                    className={`btn btn-primary play-noise-btn ${isPlaying ? 'stop' : ''}`}
                    onClick={togglePlay}
                >
                    {isPlaying ? <><Square size={20} /> Detener</> : <><Play size={20} /> Reproducir</>}
                </button>
            </div>
        </div>
    );
};

export default CustomNoise;
