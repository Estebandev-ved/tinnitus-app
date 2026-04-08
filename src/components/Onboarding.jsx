import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import './Onboarding.css';

// Illustration imports
import onb1 from '../assets/illustrations/corte3.png';
import onb2 from '../assets/illustrations/splash_stairs.png';
import onb3 from '../assets/illustrations/c2.png';
import onb4 from '../assets/illustrations/c1.png';
import onb5 from '../assets/illustrations/4.png';

const SLIDES = [
    {
        image: onb1,
        title: 'Mide tu Tinnitus',
        desc: 'Encuentra la frecuencia exacta de tu zumbido con nuestro test auditivo profesional.',
    },
    {
        image: onb2,
        title: 'Registra tu Día',
        desc: 'Lleva un diario de sueño, estrés e intensidad. Verás patrones y mejoras con el tiempo.',
    },
    {
        image: onb3,
        title: 'Terapia de Sonido',
        desc: 'Mezcla sonidos terapéuticos personalizados. Usa el timer de sueño para dormir mejor.',
    },
    {
        image: onb4,
        title: 'Tu IA Especialista',
        desc: 'Chatea con una IA entrenada en tinnitus que analiza tus datos para darte consejos personalizados.',
    },
    {
        image: onb5,
        title: 'Respira y Relájate',
        desc: 'Técnicas de respiración 4-7-8 y ruido personalizado para reducir la percepción del zumbido.',
    },
];

const Onboarding = ({ onComplete }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const isLast = currentSlide === SLIDES.length - 1;

    const handleNext = () => {
        if (isLast) {
            localStorage.setItem('tinnitoff_onboarded', 'true');
            onComplete();
        } else {
            setCurrentSlide(currentSlide + 1);
        }
    };

    const handleSkip = () => {
        localStorage.setItem('tinnitoff_onboarded', 'true');
        onComplete();
    };

    const slide = SLIDES[currentSlide];

    return (
        <div className="onboarding-container">
            <button className="onboarding-skip" onClick={handleSkip}>
                Saltar
            </button>

            <div className="onboarding-slide animate-fade" key={currentSlide}>
                <img src={slide.image} alt={slide.title} className="onboarding-illustration" />
                <h2 className="onboarding-title">{slide.title}</h2>
                <p className="onboarding-desc">{slide.desc}</p>
            </div>

            <div className="onboarding-dots">
                {SLIDES.map((_, i) => (
                    <div
                        key={i}
                        className={`onboarding-dot ${i === currentSlide ? 'active' : ''}`}
                    />
                ))}
            </div>

            <button className="btn btn-primary onboarding-next" onClick={handleNext}>
                {isLast ? 'Empezar' : 'Siguiente'}
                <ChevronRight size={20} />
            </button>
        </div>
    );
};

export default Onboarding;
