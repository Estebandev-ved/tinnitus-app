
import React, { useState, useEffect } from 'react';
import { EDUCATION_CONTENT } from '../data/educationContent';
import { contentService } from '../services/backend/contentService';
import { ChevronLeft, Clock, ArrowRight, Brain, Lightbulb, BookOpen, HelpCircle, MessageCircle, Dumbbell } from 'lucide-react';
import './Education.css';

const TYPE_LABEL = {
  FAQ: 'Pregunta frecuente',
  TIP: 'Consejo',
  ARTICLE: 'Artículo',
  MESSAGE: 'Novedad',
  EXERCISE: 'Ejercicio',
};

const TYPE_ICON = {
  FAQ: HelpCircle,
  TIP: Lightbulb,
  ARTICLE: BookOpen,
  MESSAGE: MessageCircle,
  EXERCISE: Dumbbell,
};

function estimateReadTime(body) {
  if (!body) return '1 min';
  const words = body.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).filter(Boolean).length;
  const mins = Math.max(1, Math.round(words / 200));
  return `${mins} min`;
}

function normalize(item) {
  return {
    id: item.id,
    title: item.title,
    category: TYPE_LABEL[item.type] || 'Contenido',
    type: item.type,
    icon: TYPE_ICON[item.type] || Brain,
    readTime: estimateReadTime(item.body),
    content: item.body || '',
    summary: item.summary || '',
    imageUrl: item.imageUrl || '',
    actionUrl: item.actionUrl || '',
  };
}

const Education = ({ onClose }) => {
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    contentService
      .list({ lang: 'es' })
      .then((data) => {
        if (!active) return;
        setItems((data || []).map(normalize));
        setUsingFallback(false);
      })
      .catch(() => {
        if (!active) return;
        setItems(EDUCATION_CONTENT);
        setUsingFallback(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const isBackend = !usingFallback && items.length > 0;

  return (
    <div className="education-container animate-fade">
      <header className="education-header">
        {selectedArticle ? (
          <button className="back-btn" onClick={() => setSelectedArticle(null)}>
            <ChevronLeft />
          </button>
        ) : (
          <button className="back-btn" onClick={onClose}>
            <ChevronLeft />
          </button>
        )}
        <h3>{selectedArticle ? 'Lectura' : 'Aprende'}</h3>
        <div style={{ width: 24 }}></div>
      </header>

      <div className="education-content">
        {selectedArticle ? (
          <article className="article-view animate-fade">
            <div className="article-hero">
              <div className="hero-icon">{typeof selectedArticle.icon === 'function' ? <selectedArticle.icon size={26} strokeWidth={1.8} /> : selectedArticle.icon}</div>
              <h2>{selectedArticle.title}</h2>
              <span className="read-time"><Clock size={14} /> {selectedArticle.readTime}</span>
            </div>
            {selectedArticle.summary && <p className="article-summary">{selectedArticle.summary}</p>}
            {selectedArticle.imageUrl && (
              <img src={selectedArticle.imageUrl} alt={selectedArticle.title} className="article-image" />
            )}
            <div className="article-body" dangerouslySetInnerHTML={{ __html: selectedArticle.content }} />
            {selectedArticle.actionUrl && (
              <a className="article-action" href={selectedArticle.actionUrl} target="_blank" rel="noopener noreferrer">
                Ver más <ArrowRight size={16} />
              </a>
            )}
          </article>
        ) : (
          <div className="articles-grid">
            <div className="intro-banner">
              <div className="feature-hero-anim hero-purple" aria-hidden="true">
                <div className="fha-ring fha-r1" />
                <div className="fha-ring fha-r2" />
                <div className="fha-orb">
                  <Brain size={26} strokeWidth={1.8} />
                </div>
              </div>
              <h4>Terapia Cognitiva (CBT)</h4>
              <p>Aprende a re-entrenar tu cerebro para ignorar el sonido.</p>
            </div>

            {loading && <p className="education-loading">Cargando contenido…</p>}

            {!loading && isBackend && items.map((item) => (
              <div key={item.id} className="article-card" onClick={() => setSelectedArticle(item)}>
                <div className="card-icon"><item.icon size={22} strokeWidth={1.8} /></div>
                <div className="card-info">
                  <span className="category">{item.category}</span>
                  <h4>{item.title}</h4>
                  <div className="card-meta">
                    <span>{item.readTime}</span>
                    <ArrowRight size={16} />
                  </div>
                </div>
              </div>
            ))}

            {!loading && usingFallback && EDUCATION_CONTENT.map((item) => (
              <div key={item.id} className="article-card" onClick={() => setSelectedArticle(item)}>
                <div className="card-icon">{item.icon}</div>
                <div className="card-info">
                  <span className="category">{item.category}</span>
                  <h4>{item.title}</h4>
                  <div className="card-meta">
                    <span>{item.readTime}</span>
                    <ArrowRight size={16} />
                  </div>
                </div>
              </div>
            ))}

            {!loading && !usingFallback && items.length === 0 && (
              <p className="education-empty">
                Aún no hay contenido publicado. Agrégalo desde el panel de administración (sección Contenido).
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Education;
