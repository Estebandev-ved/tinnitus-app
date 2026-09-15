import React from 'react';
import Reveal from '../components/Reveal';

const faqs = [
  { q: '¿Tinnitoff cura el acúfeno?', a: 'No. El acúfeno crónico no tiene cura universal, pero Tinnitoff ayuda a reducir su percepción y molestia mediante terapia de hábituación y seguimiento.' },
  { q: '¿Necesito internet para usarla?', a: 'La terapia sonora y los ejercicios funcionan en el dispositivo. El asistente de IA y la sincronización de datos clínicos requieren conexión.' },
  { q: '¿Mis datos están seguros?', a: 'Los datos clínicos se sincronizan con nuestro backend bajo credenciales. Consulta la sección de privacidad de tu región.' },
  { q: '¿Sirve para niños?', a: 'Está pensada para adolescentes y adultos. En menores, úsala con supervisión de un adulto y bajo indicación profesional.' },
  { q: '¿Qué hago si el zumbido es súbito?', a: 'Busca atención médica inmediata, especialmente si es unilateral, viene con pérdida de audición o mareo.' },
];

export default function Faq() {
  return (
    <section className="section">
      <div className="container narrow">
        <Reveal><h1>Preguntas frecuentes</h1></Reveal>
        <Reveal delay={0.05}>
          <p className="section-lead">Resolvemos las dudas más comunes sobre el acúfeno y el uso de Tinnitoff.</p>
        </Reveal>
        <div className="faq-list">
          {faqs.map((item, i) => (
            <Reveal key={i} delay={i * 0.06}>
              <details className="faq-item">
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
