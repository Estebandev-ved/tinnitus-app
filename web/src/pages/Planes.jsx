import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Sparkles, Crown, HeartHandshake, Loader2, CheckCircle2 } from 'lucide-react';
import Reveal from '../components/Reveal';
import { useUserAuth } from '../context/UserAuthContext';
import { FirestoreService } from '../services/firestoreService';

const planes = [
  {
    id: 'free',
    name: 'Gratis',
    icon: Sparkles,
    tagline: 'Empieza a habituarte hoy',
    monthly: 0,
    features: [
      'Matcher de frecuencia básico',
      'Terapia sonora limitada',
      'Seguimiento diario',
      'Asistente de IA (básico)',
    ],
    cta: 'Descargar gratis',
    highlight: false,
  },
  {
    id: 'premium',
    name: 'Premium',
    icon: Crown,
    tagline: 'Tu aliado diario contra el acúfeno',
    monthly: 9.99,
    annual: 79.99,
    features: [
      'Todo lo de Gratis, sin límites',
      'Biblioteca de terapia sonora completa',
      'Modo rescate y audio espacial',
      'Asistente de IA avanzado 24/7',
      'Test THI ilimitados + gráficas',
    ],
    cta: 'Empezar Premium',
    highlight: true,
  },
  {
    id: 'super',
    name: 'Clínico',
    icon: HeartHandshake,
    tagline: 'Para profesionales y clínicas',
    monthly: 24.99,
    annual: 199.99,
    features: [
      'Todo lo de Premium',
      'Panel para especialistas',
      'Comparte progreso con tu audiólogo',
      'Reportes clínicos exportables',
      'Soporte prioritario',
    ],
    cta: 'Plan clínico',
    highlight: false,
  },
];

export default function Planes() {
  const [annual, setAnnual] = useState(false);
  const [busy, setBusy] = useState(null);
  const [done, setDone] = useState(null);
  const { currentUser } = useUserAuth();
  const navigate = useNavigate();

  async function choose(p) {
    if (p.id === 'free') {
      navigate('/descargas');
      return;
    }
    if (!currentUser) {
      navigate('/ingresar');
      return;
    }
    setBusy(p.id);
    const ok = await FirestoreService.setUserPlan(currentUser.uid, p.id);
    setBusy(null);
    if (ok) setDone(p.id);
  }

  return (
    <section className="section">
      <div className="container narrow">
        <Reveal><h1>Planes y precios</h1></Reveal>
        <Reveal delay={0.05}>
          <p className="section-lead">Elige el acompañamiento que mejor se adapte a tu camino con el acúfeno. Si ya tienes cuenta, tu plan se actualiza al instante.</p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="billing-toggle">
            <span className={!annual ? 'active' : ''}>Mensual</span>
            <button
              className={`switch ${annual ? 'on' : ''}`}
              onClick={() => setAnnual((a) => !a)}
              aria-label="Cambiar facturación"
            >
              <span className="knob" />
            </button>
            <span className={annual ? 'active' : ''}>Anual <em>-20%</em></span>
          </div>
        </Reveal>

        <div className="plans-grid">
          {planes.map((p, i) => {
            const Icon = p.icon;
            const price = annual ? (p.annual ?? p.monthly * 12 * 0.8) : p.monthly;
            const priceLabel = p.monthly === 0 ? 'Gratis' : `$${price.toFixed(2)}`;
            const per = p.monthly === 0 ? '' : annual ? '/año' : '/mes';
            const isDone = done === p.id;
            return (
              <Reveal key={p.id} delay={i * 0.08}>
                <motion.div
                  className={`plan ${p.highlight ? 'plan--highlight' : ''}`}
                  whileHover={{ y: -8 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                >
                  <span className="plan-icon"><Icon size={22} /></span>
                  <h3>{p.name}</h3>
                  <p className="plan-tagline">{p.tagline}</p>
                  <div className="plan-price">
                    <strong>{priceLabel}</strong>{per && <span>{per}</span>}
                  </div>
                  <ul className="plan-features">
                    {p.features.map((f) => (
                      <li key={f}><Check size={16} /> {f}</li>
                    ))}
                  </ul>
                  {isDone ? (
                    <span className="btn btn-primary plan-cta plan-cta--done"><CheckCircle2 size={16} /> Plan activado</span>
                  ) : (
                    <button
                      className={`btn ${p.highlight ? 'btn-primary' : 'btn-ghost'} plan-cta`}
                      onClick={() => choose(p)}
                      disabled={busy === p.id}
                    >
                      {busy === p.id ? <><Loader2 size={16} className="spin" /> Aplicando…</> : p.cta}
                    </button>
                  )}
                </motion.div>
              </Reveal>
            );
          })}
        </div>
        <p className="plans-note">Los precios son demostrativos. La app se distribuye vía APK; las suscripciones se activarán en futuras versiones con pago real.</p>
      </div>
    </section>
  );
}
