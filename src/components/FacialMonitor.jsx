import React, { useState, useEffect, useRef } from 'react';
import * as faceapi from '@vladmandic/face-api';
import { Camera, X, AlertCircle, Activity, Smile, Frown } from 'lucide-react';
import './FacialMonitor.css';
import facialMonitorIllustration from '../assets/illustrations/facial_monitor.png';

const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';

const FacialMonitor = ({ onClose, onDetectTension }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState(null);
    const [tensionLevel, setTensionLevel] = useState(0); // 0 to 100
    const [isActive, setIsActive] = useState(false);
    const tensionHistory = useRef([]); // To smooth out predictions

    useEffect(() => {
        let stream = null;
        let detectionInterval = null;

        const loadModelsAndStart = async () => {
            try {
                // Load only the essential models for expressions
                await Promise.all([
                    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                    faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
                ]);

                setIsLoaded(true);

                // Request camera access
                stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Error accessing camera or loading models:", err);
                setError("No se pudo acceder a la cámara o cargar la IA. Revisa los permisos.");
            }
        };

        const handlePlay = () => {
            setIsActive(true);
            if (canvasRef.current && videoRef.current) {
                const displaySize = { width: videoRef.current.width, height: videoRef.current.height };
                faceapi.matchDimensions(canvasRef.current, displaySize);

                detectionInterval = setInterval(async () => {
                    if (!videoRef.current) return;

                    const detections = await faceapi.detectSingleFace(
                        videoRef.current,
                        new faceapi.TinyFaceDetectorOptions({ inputSize: 160 })
                    ).withFaceExpressions();

                    if (detections) {
                        const resizedDetections = faceapi.resizeResults(detections, displaySize);
                        const canvas = canvasRef.current;
                        if (canvas) {
                            const ctx = canvas.getContext('2d');
                            ctx.clearRect(0, 0, canvas.width, canvas.height);
                            // Optional: draw box
                            // faceapi.draw.drawDetections(canvas, resizedDetections);
                        }

                        // Calculate tension based on expressions (angry, sad, disgusted)
                        const { expressions } = detections;

                        // Heuristic: tension is a combination of angry/disgusted/sad/fearful
                        const angryScore = expressions.angry || 0;
                        const disgustedScore = expressions.disgusted || 0;
                        const fearScore = expressions.fearful || 0;
                        const sadScore = expressions.sad || 0;

                        // We give more weight to angry (clenched jaw/frown) and fear
                        const rawTension = (angryScore * 0.5) + (disgustedScore * 0.2) + (fearScore * 0.2) + (sadScore * 0.1);

                        // Smooth the tension level over the last 10 readings (~1 second)
                        tensionHistory.current.push(rawTension);
                        if (tensionHistory.current.length > 20) {
                            tensionHistory.current.shift();
                        }

                        const avgTension = tensionHistory.current.reduce((a, b) => a + b, 0) / tensionHistory.current.length;
                        const tensionPercent = Math.min(100, Math.round(avgTension * 100)); // Mult by 100 
                        // Because raw is 0..1, avgTension might be small. Let's amplify it slightly.
                        const amplifiedTension = Math.min(100, Math.round(avgTension * 150));

                        setTensionLevel(amplifiedTension);

                        if (amplifiedTension > 60) {
                            // Alert user if tension is consistently high
                            onDetectTension(amplifiedTension);
                        }
                    } else {
                        // Rapidly decay if face lost
                        if (tensionLevel > 0) setTensionLevel(prev => Math.max(0, prev - 5));
                    }
                }, 200); // 5 FPS is enough
            }
        };

        if (videoRef.current) {
            videoRef.current.addEventListener('play', handlePlay);
        }

        loadModelsAndStart();

        return () => {
            if (detectionInterval) clearInterval(detectionInterval);
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            if (videoRef.current) {
                videoRef.current.removeEventListener('play', handlePlay);
            }
        };
    }, []);

    const getTensionStatus = () => {
        if (tensionLevel < 20) return { text: 'Relajado', color: '#34C759', icon: <Smile size={24} /> };
        if (tensionLevel < 50) return { text: 'Leve tensión', color: '#FF9500', icon: <Activity size={24} /> };
        return { text: 'Tensos / Estrés', color: '#FF3B30', icon: <Frown size={24} /> };
    };

    const statusObj = getTensionStatus();

    return (
        <div className="facial-overlay animate-fade">
            <div className="facial-modal">
                <header className="facial-header">
                    <h3>Monitor de Tensión IA</h3>
                    <button className="close-btn" onClick={onClose}><X size={24} /></button>
                </header>

                <img src={facialMonitorIllustration} alt="" className="feature-illustration" />

                <div className="facial-content">
                    {error ? (
                        <div className="error-box">
                            <AlertCircle size={32} color="#FF3B30" />
                            <p>{error}</p>
                        </div>
                    ) : (
                        <>
                            <div className="video-container">
                                {!isLoaded && (
                                    <div className="loading-models">
                                        <div className="loader"></div>
                                        <p>Cargando red neuronal facial...</p>
                                    </div>
                                )}
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    muted
                                    playsInline
                                    width="240"
                                    height="180"
                                    className={!isLoaded ? 'hidden' : ''}
                                />
                                <canvas ref={canvasRef} className="face-canvas" />
                            </div>

                            <div className="tension-meter">
                                <div className="tension-label">
                                    <span style={{ color: statusObj.color, display: 'flex', alignItems: 'center', gap: 6 }}>
                                        {statusObj.icon} {statusObj.text}
                                    </span>
                                    <span>{tensionLevel}%</span>
                                </div>
                                <div className="progress-bar">
                                    <div
                                        className="progress-fill"
                                        style={{
                                            width: `${tensionLevel}%`,
                                            backgroundColor: statusObj.color,
                                            transition: 'width 0.3s ease-out, background-color 0.3s ease'
                                        }}
                                    />
                                </div>
                                <p className="tension-hint">Mantenemos tu privacidad. El análisis usa la cámara localmente para avisarte de contracciones mandibulares que empeoran el acúfeno.</p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FacialMonitor;
