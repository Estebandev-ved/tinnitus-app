import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Target, Bot, ClipboardList, Waves, TrendingUp, LifeBuoy,
  AlertTriangle, ArrowRight, Sparkles, HeartPulse, MessageCircleHeart, Users
} from 'lucide-react';
import Reveal from '../components/Reveal';
import Testimonials from '../components/Testimonials';
import SoundJourney from '../components/SoundJourney';

const features = [
  { icon: Target, title: 'Matcher de frecuencia', text: 'Identifica la frecuencia de tu zumbido para generar sonidos de enmascaramiento a medida.' },
  { icon: Bot, title: 'Asistente de IA', text: 'Resuelve dudas y recibe orientación personalizada sobre el manejo del acúfeno.' },
  { icon: ClipboardList, title: 'Test THI', text: 'Cuestionario validado (Tinnitus Handicap Inventory) para medir el impacto en tu vida.' },
  { icon: Waves, title: 'Terapia sonora', text: 'Biblioteca de paisajes y ruido blanco/rosa con notch personalizado.' },
  { icon: TrendingUp, title: 'Seguimiento', text: 'Registra tu evolución diaria y observa tendencias a lo largo del tiempo.' },
  { icon: LifeBuoy, title: 'Modo rescate', text: 'Ejercicios de respiración y audio espacial para episodios de mayor intensidad.' },
];

const queEs = [
  { icon: Sparkles, title: 'Terapia de hábituación', text: 'Expone tu cerebro a sonidos a medida para que deje de prestar atención al zumbido.' },
  { icon: HeartPulse, title: 'Datos clínicos', text: 'Registra frecuencia, intensidad y evolución THI para que tú y tu especialista vean el progreso.' },
  { icon: MessageCircleHeart, title: 'Acompañamiento', text: 'Un asistente de IA responde dudas frecuentes y sugiere ejercicios de regulación.' },
];

const quienPuede = [
  { icon: Users, title: 'Personas con acúfeno', text: 'Quienes conviven con zumbido crónico o intermitente y buscan alivio diario.' },
  { icon: HeartPulse, title: 'Pacientes en seguimiento', text: 'Ideal para llevar registro entre consultas con audiólogos o especialistas.' },
  { icon: Users, title: 'Cuidadores', text: 'Modo cuidador para acompañar a familiares con deterioro auditivo.' },
];

const steps = [
  { n: '1', title: 'Calibras tu frecuencia', text: 'El matcher encuentra la tonalidad de tu zumbido.' },
  { n: '2', title: 'Haces el test THI', text: 'Medimos cuánto afecta a tu vida diaria.' },
  { n: '3', title: 'Recibes terapia sonora', text: 'Sonidos personalizados y ejercicios de respiración.' },
  { n: '4', title: 'Sigues tu evolución', text: 'La app y el panel web registran tu progreso clínico.' },
];

const cardHover = {
  whileHover: { y: -6, boxShadow: '0 18px 40px rgba(15,34,54,0.14)' },
  transition: { type: 'spring', stiffness: 300, damping: 22 },
};

function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const onSubmit = (e) => { e.preventDefault(); if (email.trim()) setDone(true); };
  if (done) {
    return (
      <motion.div className="newsletter-done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
        <Sparkles size={20} /> ¡Listo! Te enviaremos consejos a tu correo.
      </motion.div>
    );
  }
  return (
    <form className="newsletter-form" onSubmit={onSubmit}>
      <input
        type="email"
        required
        placeholder="tu@correo.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button type="submit" className="btn btn-primary">Suscribirme</button>
    </form>
  );
}

export default function Home() {
  const reduce = useReducedMotion();
  return (
    <div className="home">
      <SoundJourney />

      {/* QUÉ ES */}
      <section className="section" id="que-es">
        <div className="container">
          <Reveal><h2>¿Qué es Tinnitoff?</h2></Reveal>
          <Reveal delay={0.05}>
            <p className="section-lead">
              El acúfeno (tinnitus) es la percepción de un sonido —zumbido, pitido o silbido—
              sin una fuente externa. Tinnitoff es una aplicación que complementa el
              tratamiento médico ayudándote a gestionar los síntomas desde el celular.
            </p>
          </Reveal>
          <div className="cards">
            {queEs.map((c, i) => {
              const Icon = c.icon;
              return (
                <Reveal key={c.title} delay={i * 0.08}>
                  <motion.div className="card icon-card" {...cardHover}>
                    <span className="card-ico"><Icon size={20} /></span>
                    <h3>{c.title}</h3>
                    <p>{c.text}</p>
                  </motion.div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* PARA QUÉ SIRVE */}
      <section className="section section-alt" id="para-que">
        <div className="container">
          <Reveal><h2>¿Para qué sirve?</h2></Reveal>
          <Reveal delay={0.05}>
            <p className="section-lead">
              Tinnitoff no elimina el acúfeno, pero reduce su impacto en tu calidad de vida.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <ul className="checklist">
              <li>Reduce la percepción y la molestia del zumbido con sonidos de enmascaramiento.</li>
              <li>Ayuda a dormir mejor con sesiones de respiración y paisajes sonoros.</li>
              <li>Cuantifica tu evolución para compartirla con tu médico o audiología.</li>
              <li>Ofrece estrategias de afrontamiento en momentos de mayor intensidad.</li>
              <li>Educa sobre el acúfeno para disminuir la ansiedad que lo agrava.</li>
            </ul>
          </Reveal>
        </div>
      </section>

      {/* QUIÉN PUEDE USARLO */}
      <section className="section" id="quien-puede">
        <div className="container">
          <Reveal><h2>¿Quién puede usarlo?</h2></Reveal>
          <div className="cards">
            {quienPuede.map((c, i) => {
              const Icon = c.icon;
              return (
                <Reveal key={c.title} delay={i * 0.08}>
                  <motion.div className="card icon-card" {...cardHover}>
                    <span className="card-ico"><Icon size={20} /></span>
                    <h3>{c.title}</h3>
                    <p>{c.text}</p>
                  </motion.div>
                </Reveal>
              );
            })}
            <Reveal delay={quienPuede.length * 0.08}>
              <motion.div className="card warning icon-card" {...cardHover}>
                <span className="card-ico warn"><AlertTriangle size={20} /></span>
                <h3>Aviso médico</h3>
                <p>Es una herramienta de apoyo, no un diagnóstico. Si el zumbido aparece de golpe, es unilateral o viene con pérdida de audición, acude a un profesional.</p>
              </motion.div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section className="section section-alt" id="como-funciona">
        <div className="container">
          <Reveal><h2>¿Cómo funciona?</h2></Reveal>
          <ol className="steps">
            {steps.map((s, i) => (
              <Reveal key={s.n} delay={i * 0.08}>
                <li>
                  <span>{s.n}</span>
                  <div>
                    <h4>{s.title}</h4>
                    <p>{s.text}</p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* FUNCIONES */}
      <section className="section" id="funciones">
        <div className="container">
          <Reveal><h2>Funciones destacadas</h2></Reveal>
          <div className="feature-grid">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <Reveal key={f.title} delay={i * 0.07}>
                  <motion.div className="feature" {...cardHover}>
                    <span className="feature-icon"><Icon size={26} /></span>
                    <h3>{f.title}</h3>
                    <p>{f.text}</p>
                  </motion.div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <Testimonials />

      {/* COMPARACIÓN */}
      <section className="section" id="comparativa">
        <div className="container">
          <Reveal><h2>¿Por qué Tinnitoff?</h2></Reveal>
          <Reveal delay={0.05}>
            <p className="section-lead">Lo que cambia cuando sumas hábituación guiada a tu rutina diaria.</p>
          </Reveal>
          <div className="compare">
            <div className="compare-col compare-col--bad">
              <h3>Sin acompañamiento</h3>
              <ul>
                <li>El zumbido domina tus noches</li>
                <li>Difícil medir tu progreso real</li>
                <li>Ansiedad y sensación de aislamiento</li>
                <li>Consejos dispersos en internet</li>
              </ul>
            </div>
            <div className="compare-col compare-col--good">
              <h3>Con Tinnitoff</h3>
              <ul>
                <li>Terapia sonora a tu medida</li>
                <li>Seguimiento clínico (test THI)</li>
                <li>Asistente de IA disponible 24/7</li>
                <li>Plan y comunidad de apoyo</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="section section-alt" id="newsletter">
        <div className="container narrow">
          <Reveal><h2>Consejos semanales para tu calma</h2></Reveal>
          <Reveal delay={0.05}>
            <p className="section-lead">Recibe ejercicios de hábituación y novedades. Sin spam.</p>
          </Reveal>
          <Reveal delay={0.1}><NewsletterForm /></Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <motion.div
          className="container cta-inner"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2>Empieza hoy tu camino hacia el alivio</h2>
          <Link to="/descargas" className="btn btn-primary">
            Descargar gratis <ArrowRight size={18} style={{ marginLeft: 4 }} />
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
