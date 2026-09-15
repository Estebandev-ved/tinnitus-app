import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Waves, Brain, ShieldCheck } from 'lucide-react';

const slides = [
  { icon: Target, title: 'Matcher de frecuencia', body: 'Encuentra la tonalidad exacta de tu zumbido y genera sonidos de enmascaramiento a medida.' },
  { icon: Waves, title: 'Terapia sonora', body: 'Paisajes y ruido rosa con un notch personalizado para enmascarar el zumbido.' },
  { icon: Brain, title: 'Asistente de IA', body: 'Resuelve dudas y recibe orientación personalizada, 24/7 desde la app.' },
  { icon: ShieldCheck, title: 'Modo rescate', body: 'Respiración y audio espacial para los episodios de mayor intensidad.' },
];

export default function PhoneShowcase() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((p) => (p + 1) % slides.length), 2800);
    return () => clearInterval(id);
  }, []);

  const Slide = slides[i];
  const Icon = Slide.icon;

  return (
    <div className="phone-mock showcase" aria-hidden="true">
      <div className="phone-notch" />
      <div className="phone-screen">
        <div className="phone-statusbar">
          <span className="pill pill-on">Tinnitoff</span>
          <span className="phone-lang">ES</span>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={i}
            className="showcase-slide"
            initial={{ opacity: 0, x: 26 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -26 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="showcase-icon"><Icon size={34} /></span>
            <h4>{Slide.title}</h4>
            <p>{Slide.body}</p>
            <div className="showcase-dots">
              {slides.map((_, d) => (
                <span key={d} className={d === i ? 'dot active' : 'dot'} />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
