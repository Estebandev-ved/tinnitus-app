import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Square, Headphones, Info } from 'lucide-react';
import './SpatialAudio.css';
import spatialAudioIllustration from '../assets/illustrations/spatial_audio.png';

const SpatialAudio = ({ onClose, initialFrequency = 4000, initialType = 'pure' }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioContext = useRef(null);
    const sourceNode = useRef(null);
    const pannerNode = useRef(null);
    const gainNode = useRef(null);

    // UI state for the dot's position (in screen coordinates/pixels)
    const [pos, setPos] = useState({ x: 0, y: -60 }); // Starts slightly in front
    const boundsRef = useRef(null);
    const isDragging = useRef(false);

    // Map screen coordinates to 3D space (-10 to 10 range)
    const updatePannerPosition = (x, y) => {
        if (!pannerNode.current) return;

        // Let's assume the draggable area is roughly 300x300, center is 0,0
        // We'll map the UI pixels (which go from roughly -120 to +120) into strict 3D space
        const scale = 0.1;

        // +X is right, -X is left in Web Audio API
        const audioX = x * scale;

        // Web Audio API Z: negative is forward, positive is backward.
        // On screen: -y (up) should be forward (-z). +y (down) should be backward (+z)
        const audioZ = y * scale;

        // Keep Y at ear level (0)
        const audioY = 0;

        // Smooth transition
        pannerNode.current.positionX.setTargetAtTime(audioX, audioContext.current.currentTime, 0.1);
        pannerNode.current.positionY.setTargetAtTime(audioY, audioContext.current.currentTime, 0.1);
        pannerNode.current.positionZ.setTargetAtTime(audioZ, audioContext.current.currentTime, 0.1);
    };

    const toggleAudio = () => {
        if (!audioContext.current) {
            audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
        }

        if (isPlaying) {
            if (sourceNode.current) {
                sourceNode.current.stop();
                sourceNode.current.disconnect();
                sourceNode.current = null;
            }
            setIsPlaying(false);
            return;
        }

        // Initialize Audio Graph
        gainNode.current = audioContext.current.createGain();
        gainNode.current.gain.value = 0.2; // Keep volume safe

        pannerNode.current = audioContext.current.createPanner();
        pannerNode.current.panningModel = 'HRTF'; // Essential for 3D spatialization over headphones
        pannerNode.current.distanceModel = 'inverse';
        pannerNode.current.refDistance = 1;
        pannerNode.current.maxDistance = 10000;
        pannerNode.current.rolloffFactor = 1;

        // Listener positioning (center)
        const listener = audioContext.current.listener;
        if (listener.positionX) {
            listener.positionX.setValueAtTime(0, audioContext.current.currentTime);
            listener.positionY.setValueAtTime(0, audioContext.current.currentTime);
            listener.positionZ.setValueAtTime(0, audioContext.current.currentTime);
            listener.forwardX.setValueAtTime(0, audioContext.current.currentTime);
            listener.forwardY.setValueAtTime(0, audioContext.current.currentTime);
            listener.forwardZ.setValueAtTime(-1, audioContext.current.currentTime);
            listener.upX.setValueAtTime(0, audioContext.current.currentTime);
            listener.upY.setValueAtTime(1, audioContext.current.currentTime);
            listener.upZ.setValueAtTime(0, audioContext.current.currentTime);
        } else {
            // Fallback for older browsers
            listener.setPosition(0, 0, 0);
            listener.setOrientation(0, 0, -1, 0, 1, 0);
        }

        // Apply current position immediately
        updatePannerPosition(pos.x, pos.y);

        if (initialType === 'noise') {
            const bufferSize = audioContext.current.sampleRate * 2;
            const buffer = audioContext.current.createBuffer(1, bufferSize, audioContext.current.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

            sourceNode.current = audioContext.current.createBufferSource();
            sourceNode.current.buffer = buffer;
            sourceNode.current.loop = true;

            const filter = audioContext.current.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.value = initialFrequency;

            sourceNode.current.connect(filter);
            filter.connect(pannerNode.current);
        } else {
            sourceNode.current = audioContext.current.createOscillator();
            sourceNode.current.type = initialType === 'low' ? 'sine' : 'sine';
            sourceNode.current.frequency.value = initialFrequency;
            sourceNode.current.connect(pannerNode.current);
        }

        pannerNode.current.connect(gainNode.current);
        gainNode.current.connect(audioContext.current.destination);

        sourceNode.current.start();
        setIsPlaying(true);
    };

    // Cleanup
    useEffect(() => {
        return () => {
            if (sourceNode.current) sourceNode.current.stop();
            if (audioContext.current && audioContext.current.state !== 'closed') {
                audioContext.current.close();
            }
        };
    }, []);

    // Drag Logic
    const handlePointerDown = (e) => {
        isDragging.current = true;
        moveDot(e);
    };

    const handlePointerMove = (e) => {
        if (!isDragging.current) return;
        moveDot(e);
    };

    const handlePointerUp = () => {
        isDragging.current = false;
    };

    const moveDot = (e) => {
        if (!boundsRef.current) return;
        const rect = boundsRef.current.getBoundingClientRect();

        // Handle both touch and mouse
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        let newX = clientX - rect.left - centerX;
        let newY = clientY - rect.top - centerY;

        // Constrain to circle area (radius = 120px)
        const radius = 120;
        const dist = Math.sqrt(newX * newX + newY * newY);
        if (dist > radius) {
            newX = (newX / dist) * radius;
            newY = (newY / dist) * radius;
        }

        setPos({ x: newX, y: newY });
        if (isPlaying) {
            updatePannerPosition(newX, newY);
        }
    };

    return (
        <div className="spatial-overlay animate-fade" onPointerUp={handlePointerUp} onMouseUp={handlePointerUp} onTouchEnd={handlePointerUp}>
            <div className="spatial-modal">
                <header className="spatial-header">
                    <h3>Sonido 3D Espacial</h3>
                    <button className="close-btn" onClick={onClose}><X size={24} /></button>
                </header>

                <img src={spatialAudioIllustration} alt="" className="feature-illustration" />

                <div className="spatial-content">
                    <div className="warning-banner">
                        <Headphones size={20} />
                        <span>Es imprescindible el uso de audífonos (auriculares) para que el efecto 3D (HRTF) funcione.</span>
                    </div>

                    <p className="instruction-text">
                        Arrastra el punto para externalizar tu acúfeno. Alejar el sonido de tu cabeza "engaña" a tu cerebro y facilita la habituación.
                    </p>

                    <div
                        className="spatial-arena"
                        ref={boundsRef}
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onTouchStart={handlePointerDown}
                        onTouchMove={handlePointerMove}
                    >
                        {/* The Head / Center */}
                        <div className="virtual-head">Tú</div>

                        {/* Guides */}
                        <div className="guide-line vertical"></div>
                        <div className="guide-line horizontal"></div>
                        <div className="arena-border"></div>

                        {/* The Draggable Sound Dot */}
                        <div
                            className="sound-dot"
                            style={{
                                transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))`
                            }}
                        >
                            {isPlaying && <div className="pulse-ring"></div>}
                        </div>
                    </div>

                    <button
                        className={`btn full-width spatial-play-btn ${isPlaying ? 'stop' : 'play'}`}
                        onClick={toggleAudio}
                    >
                        {isPlaying ? <Square size={20} /> : <Play size={20} />}
                        {isPlaying ? 'Detener Terapia' : 'Comenzar Terapia 3D'}
                    </button>

                    <div className="info-footer">
                        <Info size={16} />
                        <p>Basado en los principios de externalización auditiva, esta técnica ayuda a disminuir la percepción del acúfeno como un sonido "interno".</p>
                    </div>

                    <button
                        className="btn full-width"
                        style={{ marginTop: '16px', background: 'rgba(255, 59, 48, 0.1)', color: '#FF3B30', border: '1px solid rgba(255, 59, 48, 0.3)' }}
                        onClick={onClose}
                    >
                        Salir de Terapia 3D
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SpatialAudio;
