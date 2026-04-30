import React, { useState, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';
import { getWidgetData } from '../utils/widgetBridge';
import './HomeWidget.css';

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

  return (
    <div className={`home-widget ${expanded ? 'expanded' : 'collapsed'}`} onClick={() => setExpanded(!expanded)}>
      <div className="widget-header">
        <div className="widget-stat">
          <span className="stat-label">Tinnitus</span>
          <span className="stat-value" style={{ color: getLevelColor(data.todayLevel) }}>{data.todayLevel}</span>
        </div>
        <div className="widget-stat">
          <span className="stat-label">Racha</span>
          <span className="stat-value">🔥 {data.streak}</span>
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
