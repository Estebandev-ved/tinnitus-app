import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AudioEngine } from '../../utils/audioEngine';
import { Moon, X, CheckCircle, Save, Loader2, Info, Volume2, SlidersHorizontal } from 'lucide-react';
import './Mechanics.css';

export const MezcladorMechanic = ({ onComplete, onClose }) => {
  const [tinnitusVol, setTinnitusVol] = useState(50);
  const [bgVol, setBgVol] = useState(0);
  const [isMixed, setIsMixed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSleepTimer, setShowSleepTimer] = useState(false);
  const [sleepTimer, setSleepTimer] = useState(null);
  const [sleepInterval, setSleepInterval] = useState(null);
  const [showTimerPicker, setShowTimerPicker] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [mixName, setMixName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const completedRef = useRef(false);
  const containerRef = useRef(null);

  const handleStart = () => {
    setIsPlaying(true);
    AudioEngine.playCustomNoise(6000);
    AudioEngine.play('pink');
  };

  const stopAll = useCallback(() => {
    AudioEngine.stop('custom');
    AudioEngine.stop('pink');
    setIsPlaying(false);
    setIsMixed(false);
    completedRef.current = false;
    cancelSleepTimer();
  }, []);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const startSleepTimer = (minutes) => {
    cancelSleepTimer();
    setShowTimerPicker(false);
    let remaining = minutes * 60;
    setSleepTimer(remaining);

    const fadeStartSec = 30;

    const interval = setInterval(() => {
      remaining--;
      setSleepTimer(remaining);

      if (remaining === fadeStartSec) {
        AudioEngine.fadeOutAll(fadeStartSec * 1000, () => {
          setSleepTimer(null);
        });
      }

      if (remaining <= 0) {
        clearInterval(interval);
        setSleepTimer(null);
        setSleepInterval(null);
      }
    }, 1000);

    setSleepInterval(interval);
  };

  const cancelSleepTimer = () => {
    if (sleepInterval) {
      clearInterval(sleepInterval);
      setSleepInterval(null);
    }
    setSleepTimer(null);
  };

  const handleSaveMix = async () => {
    if (!mixName.trim()) return;
    setIsSaving(true);
    try {
      const mixData = {
        name: mixName,
        tinnitusVol,
        bgVol,
        timestamp: Date.now(),
      };
      const saved = JSON.parse(localStorage.getItem('savedMixes') || '[]');
      saved.push(mixData);
      localStorage.setItem('savedMixes', JSON.stringify(saved));
      setMixName('');
      setShowSaveModal(false);
    } catch (e) {
      console.error('Error guardando mezcla:', e);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (isPlaying) {
      AudioEngine.setVolume('custom', tinnitusVol / 150);
      AudioEngine.setVolume('pink', bgVol / 100);

      if (bgVol > 0 && bgVol >= tinnitusVol - 15 && bgVol <= tinnitusVol + 15) {
        if (!completedRef.current) {
          completedRef.current = true;
          setIsMixed(true);
          setTimeout(() => {
            AudioEngine.stop('custom');
            AudioEngine.stop('pink');
            onComplete?.();
          }, 3000);
        }
      }
    }
  }, [tinnitusVol, bgVol, isPlaying, onComplete]);

  useEffect(() => {
    return () => {
      AudioEngine.stop('custom');
      AudioEngine.stop('pink');
      if (sleepInterval) clearInterval(sleepInterval);
    };
  }, [sleepInterval]);

  return (
    <div className="mechanic-container mixer-container" ref={containerRef}>
      <header className="mixer-header">
        <button className="btn-icon btn-close" onClick={onClose} aria-label="Cerrar">
          <X size={20} />
        </button>
        <div className="mixer-title-group">
          <div className="title-icon-wrapper">
            <SlidersHorizontal size={24} className="title-icon" />
          </div>
          <div>
            <h2 className="mixer-title">El Mezclador</h2>
            <p className="mixer-subtitle">Terapia de enmascaramiento</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn-icon btn-info" onClick={() => setShowInfo(!showInfo)} aria-label="Cómo funciona">
            <Info size={20} />
          </button>
        </div>
      </header>

      {showInfo && (
        <div className="info-panel animate-fade">
          <div className="info-header">
            <h3>Cómo funciona el Mezclador</h3>
            <button className="btn-icon btn-close-sm" onClick={() => setShowInfo(false)} aria-label="Cerrar">
              <X size={16} />
            </button>
          </div>
          <div className="info-content">
            <div className="info-step">
              <span className="step-number">1</span>
              <div>
                <strong>Reproduce el zumbido</strong> artificial (6 kHz) que simula tu tinnitus.
              </div>
            </div>
            <div className="info-step">
              <span className="step-number">2</span>
              <div>
                <strong>Sube el Ruido Rosa</strong> de fondo hasta que el zumbido empiece a volverse borroso.
              </div>
            </div>
            <div className="info-step">
              <span className="step-number">3</span>
              <div>
                <strong>Punto de Mezcla:</strong> Cuando el ruido rosa está entre -15 y +15 del zumbido, el cerebro empieza a ignorar el tinnitus.
              </div>
            </div>
            <div className="info-step">
              <span className="step-number">4</span>
              <div>
                <strong>Temporizador de Sueño:</strong> Programa apagado automático con fundido de 30s para no despertarte.
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="mixer-main">
        {!isPlaying ? (
          <div className="start-screen clay-enter">
            <div className="start-illustration">
              <div className="wave-animation">
                <div className="wave-ring ring-1" />
                <div className="wave-ring ring-2" />
                <div className="wave-ring ring-3" />
                <div className="wave-center">
                  <Volume2 size={32} className="center-icon" />
                </div>
              </div>
            </div>
            <p className="start-desc">Encuentra tu <strong>Punto de Mezcla</strong> personal para entrenar al cerebro a ignorar el tinnitus.</p>
            <button className="btn-primary btn-lg press-effect" onClick={handleStart}>
              <span className="btn-content">
                <span className="play-icon">▶</span>
                Empezar Prueba de Audio
              </span>
            </button>
          </div>
        ) : (
          <div className="mixer-controls stagger-children">
            <div className="slider-card clay-enter">
              <div className="slider-header">
                <div className="slider-icon-wrapper tinnitus">
                  <Volume2 size={20} />
                </div>
                <div className="slider-info">
                  <label className="slider-label">Zumbido Artificial</label>
                  <span className="slider-value">{tinnitusVol}%</span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={tinnitusVol}
                onChange={(e) => setTinnitusVol(Number(e.target.value))}
                className="slider-input tinnitus-slider"
                aria-label="Volumen zumbido artificial"
              />
              <div className="slider-hint">Simula tu tinnitus a 6 kHz</div>
            </div>

            <div className="slider-card clay-enter">
              <div className="slider-header">
                <div className="slider-icon-wrapper background">
                  <SlidersHorizontal size={20} />
                </div>
                <div className="slider-info">
                  <label className="slider-label">Ruido Rosa (Fondo)</label>
                  <span className="slider-value">{bgVol}%</span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={bgVol}
                onChange={(e) => setBgVol(Number(e.target.value))}
                className="slider-input bg-slider"
                aria-label="Volumen ruido rosa"
              />
              <div className="slider-hint">Sube hasta difuminar el zumbido</div>
            </div>

            {isMixed && (
              <div className="success-banner clay-enter">
                <div className="success-icon-wrapper">
                  <CheckCircle size={24} className="success-icon" />
                </div>
                <div className="success-content">
                  <strong>¡Punto de Mezcla encontrado!</strong>
                  <span>Mantén esta configuración. Tu cerebro está aprendiendo a filtrar el tinnitus.</span>
                </div>
              </div>
            )}

            <div className="sleep-timer-section clay-enter">
              <button
                className={`sleep-timer-btn ${sleepTimer ? 'active' : ''}`}
                onClick={() => setShowTimerPicker(!showTimerPicker)}
                aria-expanded={showTimerPicker}
              >
                <Moon size={20} className="timer-icon" />
                <div className="timer-info">
                  <span className="timer-label">Temporizador de Sueño</span>
                  {sleepTimer ? (
                    <span className="timer-countdown">Apagado en <strong>{formatTime(sleepTimer)}</strong></span>
                  ) : (
                    <span className="timer-hint">Programar apagado automático</span>
                  )}
                </div>
                {sleepTimer && (
                  <button className="btn-icon btn-cancel-timer" onClick={(e) => { e.stopPropagation(); cancelSleepTimer(); }} aria-label="Cancelar temporizador">
                    <X size={16} />
                  </button>
                )}
              </button>

              {showTimerPicker && (
                <div className="timer-picker animate-fade">
                  <p className="picker-title">¿Cuánto tiempo quieres escuchar?</p>
                  <div className="timer-options">
                    {[15, 30, 45, 60, 90].map((m) => (
                      <button
                        key={m}
                        className="timer-option press-effect"
                        onClick={() => startSleepTimer(m)}
                      >
                        <span className="option-time">{m} min</span>
                        <span className="option-desc">
                          {m <= 30 ? 'Siesta corta' : m <= 60 ? 'Dormir' : 'Noche completa'}
                        </span>
                      </button>
                    ))}
                  </div>
                  <button className="btn-ghost btn-sm" onClick={() => setShowTimerPicker(false)}>
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        <footer className="mixer-footer">
          <button
            className="btn-ghost press-effect"
            onClick={stopAll}
            disabled={!isPlaying}
          >
            <X size={18} />
            <span>Detener</span>
          </button>
          <button
            className="btn-primary press-effect"
            onClick={() => setShowSaveModal(true)}
            disabled={!isPlaying || isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 size={18} className="spinning" />
                Guardando...
              </>
            ) : (
              <>
                <Save size={18} />
                Guardar Mezcla
              </>
            )}
          </button>
        </footer>
      </main>

      {showSaveModal && (
        <div className="modal-overlay animate-fade" onClick={() => setShowSaveModal(false)}>
          <div className="modal-card card animate-fade" onClick={(e) => e.stopPropagation()}>
            <h3>Guardar Mezcla Actual</h3>
            <p className="modal-desc">Dale un nombre para encontrarla fácilmente después.</p>
            <input
              type="text"
              placeholder="Ej: Noche tranquila, Siesta, Trabajo..."
              value={mixName}
              onChange={(e) => setMixName(e.target.value)}
              className="input-field"
              autoFocus
              maxLength={30}
            />
            <div className="modal-actions">
              <button className="btn-ghost" onClick={() => setShowSaveModal(false)}>Cancelar</button>
              <button className="btn-primary" onClick={handleSaveMix} disabled={isSaving || !mixName.trim()}>
                {isSaving ? <Loader2 size={18} className="spinning" /> : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};