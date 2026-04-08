
import React, { useState } from 'react';
import { EDUCATION_CONTENT } from '../data/educationContent';
import { ChevronLeft, Clock, ArrowRight } from 'lucide-react';
import educationIllustration from '../assets/illustrations/3.png';
import './Education.css';

const Education = ({ onClose }) => {
    const [selectedArticle, setSelectedArticle] = useState(null);

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
                <div style={{ width: 24 }}></div> {/* Spacer */}
            </header>

            <div className="education-content">
                {selectedArticle ? (
                    <article className="article-view animate-fade">
                        <div className="article-hero">
                            <div className="hero-icon">{selectedArticle.icon}</div>
                            <h2>{selectedArticle.title}</h2>
                            <span className="read-time"><Clock size={14} /> {selectedArticle.readTime}</span>
                        </div>
                        <div className="article-body" dangerouslySetInnerHTML={{ __html: selectedArticle.content }} />
                    </article>
                ) : (
                    <div className="articles-grid">
                        <div className="intro-banner">
                            <img src={educationIllustration} alt="" className="education-illustration" />
                            <h4>Terapia Cognitiva (CBT)</h4>
                            <p>Aprende a re-entrenar tu cerebro para ignorar el sonido.</p>
                        </div>

                        {EDUCATION_CONTENT.map(item => (
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
                    </div>
                )}
            </div>
        </div>
    );
};

export default Education;
