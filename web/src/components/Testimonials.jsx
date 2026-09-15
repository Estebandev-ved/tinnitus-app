import React from 'react';
import { Quote } from 'lucide-react';
import Reveal from './Reveal';

const testimonials = [
  { name: 'María L.', role: 'Usuario · Colombia', text: 'Después de semanas usando el matcher y la terapia sonora, el zumbido ya no me despierta por la noche.' },
  { name: 'Carlos R.', role: 'Usuario · España', text: 'El asistente de IA me explicó qué hacer en una crisis y me dio calma. Muy útil el modo rescate.' },
  { name: 'Ana G.', role: 'Cuidadora · México', text: 'Uso el modo cuidador para acompañar a mi padre. Ver su evolución THI nos ayuda en las consultas.' },
];

export default function Testimonials() {
  return (
    <section className="section section-alt" id="testimonios">
      <div className="container">
        <Reveal><h2>Lo que dicen quienes lo usan</h2></Reveal>
        <Reveal delay={0.05}>
          <p className="section-lead">Historias reales de personas habituándose al acúfeno, día a día.</p>
        </Reveal>
        <div className="testimonial-grid">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.08}>
              <div className="testimonial">
                <Quote size={22} className="testimonial-quote" />
                <p>{t.text}</p>
                <div className="testimonial-author">
                  <span className="avatar">{t.name.charAt(0)}</span>
                  <div>
                    <strong>{t.name}</strong>
                    <small>{t.role}</small>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
