import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Flame } from 'lucide-react';
import { getWidgetData } from '../utils/widgetBridge';
import './HomeWidget.css';

const RING_R = 11;
const RING_C = 2 * Math.PI * RING_R;

const HomeWidget = () => {
  const [expanded, setExpanded] = useState(false);
  const [data, setData] = useState({ todayLevel: '-', streak: 0, lastSound: null });
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => { setData(getWidgetData()); }, []);

  const getLevelColor = (level) => {
    if (level === '-') return 'gray';
    if (level < 30) return '#34C759';
    if (level <= 70) return '#FFCC00';
    return '#FF3B30';
  };

  const streakPct = Math.min(data.streak / 7, 1);

  return (
    <div className={`home-widget ${expanded ? 'expanded' : 'collapsed'}`} onClick={() => setExpanded(!expanded)}>
      <div className="widget-header">
        <div className="widget-stat">
          <span className="stat-label">Tinnitus</span>
          <span className="stat-value" style={{ color: getLevelColor(data.todayLevel) }}>{data.todayLevel}</span>
        </div>
        <div className="widget-stat">
          <span className="stat-label">Racha</span>
          <span className="streak-ring-wrap" aria-label={`Racha de ${data.streak} días`}>
            <svg width="26" height="26" viewBox="0 0 26 26" className="streak-ring">
              <circle cx="13" cy="13" r={RING_R} className="streak-ring-bg" />
              <motion.circle
                cx="13" cy="13" r={RING_R}
                className="streak-ring-fg"
                strokeDasharray={RING_C}
                initial={{ strokeDashoffset: RING_C }}
                animate={{ strokeDashoffset: RING_C * (1 - streakPct) }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
                transform="rotate(-90 13 13)"
              />
            </svg>
            <Flame size={12} className="streak-ring-flame" style={{ color: '#FF9F45' }} />
          </span>
          <span className="stat-value">{data.streak}</span>
        </div>
        <button className="widget-play-btn" onClick={(e) => { e.stopPropagation(); setIsPlaying(!isPlaying); }}>
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </button>
      </div>
      {expanded && (
        <div className="widget-expanded-content">
          <p>Resumen: Estable.</p>
          <button className="install-widget-btn">Instalar Widget</button>
        </div>
      )}
    </div>
  );
};
export default HomeWidget;
