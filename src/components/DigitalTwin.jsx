import React, { useState, useEffect } from 'react';
import { X, Cpu, TrendingUp, TrendingDown, AlertTriangle, ShieldCheck, HeartPulse, Moon, Coffee, Wind } from 'lucide-react';
import { FirestoreService } from '../services/firestoreService';
import { useAuth } from '../contexts/AuthContext';
import HolographicEar from './HolographicEar';
import './DigitalTwin.css';
import digitalTwinIllustration from '../assets/illustrations/digital_twin.png';

const DigitalTwin = ({ onClose, onActionSelect }) => {
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [logs, setLogs] = useState([]);
    const [analysis, setAnalysis] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            if (!currentUser) return;
            try {
                // Fetch up to 7 recent logs
                const recentLogs = await FirestoreService.getWeeklyLogs(currentUser.uid);
                setLogs(recentLogs);
                calculatePrediction(recentLogs);
            } catch (error) {
                console.error("Error loading logs for twin:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [currentUser]);

    const calculatePrediction = (recentLogs) => {
        if (!recentLogs || recentLogs.length === 0) {
            setAnalysis({ probability: null, status: 'Sin datos', message: 'Necesitamos registros en tu Diario para que la IA aprenda de ti.' });
            return;
        }

        let totalRiskPoints = 0;
        let maxRiskPoints = 0;

        let avgSleep = 0;
        let avgStress = 0;
        let dietIssues = 0;

        // Consider last 3 days heavier, but use all available up to 7
        const daysToConsider = Math.min(recentLogs.length, 7);

        for (let i = 0; i < daysToConsider; i++) {
            const log = recentLogs[recentLogs.length - 1 - i]; // Newest first
            const weight = i === 0 ? 1.5 : (i === 1 ? 1.2 : 1); // Recent days matter more

            // Sleep risk (ideal 7-9 hours)
            if (log.sleepHours !== undefined) {
                avgSleep += log.sleepHours;
                if (log.sleepHours < 6) totalRiskPoints += (20 * weight);
                else if (log.sleepHours < 7) totalRiskPoints += (10 * weight);
                maxRiskPoints += (20 * weight);
            }

            // Stress risk (range 1-10)
            if (log.stressLevel !== undefined) {
                avgStress += log.stressLevel;
                if (log.stressLevel > 7) totalRiskPoints += (25 * weight);
                else if (log.stressLevel > 5) totalRiskPoints += (10 * weight);
                maxRiskPoints += (25 * weight);
            }

            // Diet risk (caffeine/salt)
            if (log.diet && (log.diet.includes('high_caffeine') || log.diet.includes('high_sodium'))) {
                totalRiskPoints += (15 * weight);
                dietIssues++;
            }
            maxRiskPoints += (15 * weight);
        }

        avgSleep /= daysToConsider;
        avgStress /= daysToConsider;

        let probability = 0;
        if (maxRiskPoints > 0) {
            probability = Math.min(100, Math.round((totalRiskPoints / maxRiskPoints) * 100));
        } else {
            probability = 10; // Baseline
        }

        // Determine status and recommendations
        let statusObj = {
            probability,
            avgSleep: avgSleep.toFixed(1),
            avgStress: avgStress.toFixed(1),
            dietIssues,
            status: '',
            color: '',
            message: '',
            actions: []
        };

        if (probability >= 70) {
            statusObj.status = 'Alto Riesgo de Crisis';
            statusObj.color = '#FF3B30';
            statusObj.message = 'Tu gemelo digital detecta patrones críticos hoy. La combinación de tus últimos días fuertemente sugiere una alza en la percepción del zumbido.';
            statusObj.actions = [
                { id: 'facial', icon: <HeartPulse size={18} />, text: 'Revisar Tensión Facial', onClick: () => onActionSelect('facial') },
                { id: 'spatial', icon: <TrendingDown size={18} />, text: 'Terapia 3D de Inmediato', onClick: () => onActionSelect('spatial') }
            ];
        } else if (probability >= 40) {
            statusObj.status = 'Riesgo Moderado';
            statusObj.color = '#FF9500';
            statusObj.message = 'Algunos factores (como estrés o sueño) están desbalanceados. Puedes prevenir que el acúfeno empeore si tomas pausas activas hoy.';
            statusObj.actions = [
                { id: 'breathing', icon: <Wind size={18} />, text: 'Minutos de Respiración', onClick: () => onActionSelect('breathing') },
                { id: 'library', icon: <Coffee size={18} />, text: 'Escuchar Ruido Blanco', onClick: () => onActionSelect('library') }
            ];
        } else {
            statusObj.status = 'Estabilidad Óptima';
            statusObj.color = '#34C759';
            statusObj.message = 'Tus hábitos recientes te han mantenido seguro. Sigue cuidando tu descanso y alimentación.';
            statusObj.actions = [
                { id: 'tracker', icon: <TrendingUp size={18} />, text: 'Mantener Diario al Día', onClick: () => onActionSelect('tracker') }
            ];
        }

        setAnalysis(statusObj);
    };

    return (
        <div className="twin-overlay animate-fade">
            <div className="twin-modal">
                <header className="twin-header">
                    <h3>Tu Gemelo Digital</h3>
                    <button className="close-btn" onClick={onClose}><X size={24} /></button>
                </header>

                <img src={digitalTwinIllustration} alt="" className="feature-illustration" />

                <div className="twin-content">
                    {loading ? (
                        <div className="loading-state">
                            <div className="loader"></div>
                            <p>Sincronizando con la red neuronal...</p>
                        </div>
                    ) : !analysis?.probability ? (
                        <div className="empty-state">
                            <Cpu size={48} color="var(--primary)" />
                            <h4>Entrenamiento Incompleto</h4>
                            <p>{analysis?.message}</p>
                            <button className="btn btn-primary" onClick={() => onActionSelect('tracker')}>
                                Llenar Diario
                            </button>
                        </div>
                    ) : (
                        <>
                            <HolographicEar
                                riskColor={analysis.color}
                                probability={analysis.probability}
                            />

                            <div className="status-banner" style={{ backgroundColor: `${analysis.color}15`, color: analysis.color }}>
                                {analysis.probability >= 70 ? <AlertTriangle size={20} /> : <ShieldCheck size={20} />}
                                <b>{analysis.status}</b>
                            </div>

                            <p className="ai-message">"{analysis.message}"</p>

                            <div className="metrics-grid">
                                <div className="metric-box">
                                    <Moon size={18} color="#5856D6" />
                                    <span>Sueño Promedio</span>
                                    <b>{analysis.avgSleep} hrs</b>
                                </div>
                                <div className="metric-box">
                                    <HeartPulse size={18} color="#FF2D55" />
                                    <span>Estrés Reciente</span>
                                    <b>{analysis.avgStress} / 10</b>
                                </div>
                            </div>

                            <div className="action-recommendations">
                                <h4>Plan Preventivo Sugerido</h4>
                                <div className="action-list">
                                    {analysis.actions.map((act, idx) => (
                                        <button key={idx} className="btn full-width suggestion-btn" onClick={act.onClick}>
                                            {act.icon} {act.text}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DigitalTwin;
