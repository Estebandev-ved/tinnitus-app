import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import SoundJourneyEar from './SoundJourneyEar';
import './SoundJourney.css';

/**
 * SoundJourney
 * ------------------------------------------------------------------
 * The interactive 3D centerpiece of the Tinnitoff homepage: as the
 * visitor scrolls, a pinned WebGL scene (SoundJourneyEar) carries them
 * through the real anatomical path a sound — and a tinnitus signal —
 * takes through the ear, while a caption panel explains what Tinnitoff
 * does at each stop. Inspired by the scroll-driven storytelling of
 * sites like unitedcarriers.com, reinterpreted around hearing.
 *
 * Self-contained: drop <SoundJourney /> anywhere in a page. It reserves
 * its own scroll height and releases the sticky pin normally afterwards,
 * so it never affects the sections around it.
 * ------------------------------------------------------------------ */

const STOPS = [
  {
    label: 'Pabellón auricular',
    title: 'La antena que recibe todo',
    color: '#00e8ff',
    body: [
      'El sonido —y tu acúfeno— entra por aquí. Esta forma de embudo recoge y dirige ' +
        'las ondas hacia el canal.',
      'Es también donde actúa la Terapia de Sonido 3D: si el cerebro puede localizar ' +
        'el sonido afuera, deja de sentirlo como una alarma interna.',
    ],
  },
  {
    label: 'Canal auditivo',
    title: 'El conducto que amplifica',
    color: '#00e8ff',
    body: [
      'Un tubo de apenas 2.5 cm que resuena y amplifica ciertas frecuencias antes de ' +
        'llegar al tímpano.',
      'Aquí el Modo Rescate introduce sonido de banda ancha para competir con el ' +
        'acúfeno en tiempo real.',
    ],
  },
  {
    label: 'Tímpano',
    title: 'Donde el aire se vuelve vibración',
    color: '#00e8ff',
    body: [
      'La membrana convierte ondas de presión en vibración mecánica: la primera ' +
        'traducción del sonido a una señal física.',
      'Sensible por diseño — por eso el volumen de toda la app se mantiene en niveles ' +
        'seguros para el oído.',
    ],
  },
  {
    label: 'Osículos',
    title: 'La palanca más pequeña del cuerpo',
    color: '#00e8ff',
    body: [
      'Martillo, yunque y estribo —los tres huesos más pequeños del cuerpo humano— ' +
        'multiplican la fuerza de la vibración.',
      'Este relevo mecánico es también donde más se degrada la señal con la edad o el ' +
        'ruido; de ahí nace buena parte del acúfeno.',
    ],
  },
  {
    label: 'Cóclea',
    title: 'Donde nace la mayoría de los acúfenos',
    color: '#ff4b4b',
    body: [
      'Miles de células ciliadas traducen cada frecuencia en un impulso eléctrico ' +
        'distinto. Cuando algunas se dañan, el cerebro «rellena» el hueco con un pitido propio.',
      'El Matcher de Frecuencia identifica exactamente qué punto de esta espiral está ' +
        'afectado, y calibra la terapia sobre él.',
    ],
  },
  {
    label: 'Nervio auditivo',
    title: 'La señal que llega al cerebro',
    color: '#b583ff',
    body: [
      'El impulso viaja desde la cóclea hasta la corteza auditiva, donde se interpreta ' +
        'como sonido —o como acúfeno.',
      'La habituación ocurre exactamente aquí: con exposición guiada y constante, el ' +
        'cerebro reclasifica la señal como irrelevante.',
    ],
  },
];

// preset 0 = wide establishing shot; presets 1..6 = the 6 stops above
const CAMERA_PRESETS = [
  { pos: [-0.35, 0.4, 7.4], look: [-0.55, -0.05, 0.05], style: 0.05 },
  { pos: [1.7, -0.15, 3.05], look: [0.65, -0.35, 0.15], style: 0.18 },
  { pos: [-0.25, 0.4, 2.0], look: [-0.6, -0.07, 0.2], style: 0.38 },
  { pos: [-1.1, 0.35, 1.15], look: [-1.1, -0.05, 0.08], style: 0.55 },
  { pos: [-1.25, 0.65, 0.95], look: [-1.15, 0.2, 0.02], style: 0.7 },
  { pos: [-2.15, 0.55, 1.3], look: [-2.1, -0.1, 0.05], style: 0.88 },
  { pos: [-2.55, -0.15, 1.05], look: [-2.35, -0.8, -0.04], style: 1.0 },
];

const N = CAMERA_PRESETS.length - 1; // 6 transitions
const SCREENS = N + 1; // total vh-units of scroll distance reserved

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function lerp3(a, b, f) {
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
}

export default function SoundJourney() {
  const reduce = useReducedMotion();
  const wrapRef = useRef(null);
  const journeyState = useRef({
    camPos: CAMERA_PRESETS[0].pos,
    camLook: CAMERA_PRESETS[0].look,
    style: CAMERA_PRESETS[0].style,
  });
  const [activeIndex, setActiveIndex] = useState(-1); // -1 = intro, 0..5 = STOPS index

  useEffect(() => {
    let raf = null;
    const update = () => {
      raf = null;
      const el = wrapRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const wrapTop = rect.top + window.scrollY;
      const scrollableRange = Math.max(1, el.offsetHeight - window.innerHeight);
      const localY = clamp((window.scrollY || window.pageYOffset) - wrapTop, 0, scrollableRange);
      const t = (localY / scrollableRange) * N;

      const i0 = clamp(Math.floor(t), 0, CAMERA_PRESETS.length - 2);
      const f = t - i0;
      const A = CAMERA_PRESETS[i0];
      const B = CAMERA_PRESETS[i0 + 1];
      const st = journeyState.current;
      st.camPos = lerp3(A.pos, B.pos, f);
      st.camLook = lerp3(A.look, B.look, f);
      st.style = A.style + (B.style - A.style) * f;

      const nextIndex = t < 0.5 ? -1 : clamp(Math.round(t) - 1, 0, STOPS.length - 1);
      setActiveIndex((prev) => (prev === nextIndex ? prev : nextIndex));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const stop = activeIndex >= 0 ? STOPS[activeIndex] : null;

  return (
    <section
      className="sound-journey"
      id="inicio"
      ref={wrapRef}
      style={{ height: `${SCREENS * 100}vh` }}
      aria-label="Recorrido interactivo del sonido por el oído"
    >
      <div className="sound-journey-sticky">
        <div className="sj-canvas" aria-hidden="true">
          <SoundJourneyEar stateRef={journeyState} />
        </div>
        <div className="sj-scrim" aria-hidden="true" />

        <div className="sj-copy">
          <span className="sj-eyebrow" style={{ color: stop ? stop.color : '#c3b7ea' }}>
            {stop ? `${String(activeIndex + 1).padStart(2, '0')} · ${stop.label}` : 'El recorrido del sonido'}
          </span>

          <AnimatePresence mode="wait">
            {stop ? (
              <motion.div
                key={activeIndex}
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: -16 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                <h3>{stop.title}</h3>
                {stop.body.map((b, i) => (
                  <p key={i}>{b}</p>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="intro"
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: -16 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                <h1>Sigue el camino real de una onda sonora</h1>
                <p>
                  Desliza para recorrer tu oído tramo a tramo, desde el pabellón hasta el nervio
                  auditivo, y descubre dónde actúa cada terapia de Tinnitoff.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="sj-progress" aria-hidden="true">
          {STOPS.map((s, i) => (
            <span
              key={s.label}
              className={`sj-dot ${i === activeIndex ? 'active' : ''}`}
              style={{ '--dot-color': s.color }}
            />
          ))}
        </div>

        <div className="sj-scrollhint">
          <span>{stop ? 'Sigue bajando' : 'Desliza para empezar'}</span>
          <span className="sj-arrow">↓</span>
        </div>
      </div>
    </section>
  );
}
