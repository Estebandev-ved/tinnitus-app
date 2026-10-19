import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  Radio, Headphones, LineChart, MessageCircle, Wind, Users, ChevronDown,
  Lock, FileText, HeartHandshake, ScanFace, Sparkles, Ear,
} from 'lucide-react';
import './LandingSections.css';

/* ------------------------------------------------------------------
 * Scroll-reveal wrapper (fade + rise once, respects reduced motion via CSS)
 * ------------------------------------------------------------------ */
export function Reveal({ children, className = '', delay = 0 }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) {
      setShown(true);
      return undefined;
    }
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setShown(true);
        io.disconnect();
      }
    }, { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`ls-reveal ${shown ? 'in' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

Reveal.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  delay: PropTypes.number,
};

export function SectionHead({ eyebrow, title, text }) {
  return (
    <div className="section-head">
      <span className="eyebrow"><Sparkles size={14} /> {eyebrow}</span>
      <h2>{title}</h2>
      {text && <p>{text}</p>}
    </div>
  );
}

SectionHead.propTypes = {
  eyebrow: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  text: PropTypes.string,
};

/* Tinnitus level -> color + label (matches the in-app indicator scale) */
function levelInfo(level) {
  if (level <= 2) return { color: '#6EC6A0', label: 'Bajo' };
  if (level <= 4) return { color: '#FBBF24', label: 'Moderado' };
  if (level <= 7) return { color: '#FB923C', label: 'Alto' };
  return { color: '#F87171', label: 'Severo' };
}

/* ------------------------------------------------------------------
 * Phone showcase: each tab swaps the screen inside the phone frame.
 * Screens are lightweight CSS mock-ups, not real screenshots.
 * ------------------------------------------------------------------ */
function FreqScreen() {
  const [hz, setHz] = useState(4000);
  return (
    <div className="ph-screen">
      <span className="ph-title">Calibrar frecuencia</span>
      <div className="ph-hz">{hz.toLocaleString('es')}<small>Hz</small></div>
      <input
        className="ph-range"
        type="range"
        min="500"
        max="12000"
        step="100"
        value={hz}
        onChange={(e) => setHz(Number(e.target.value))}
        aria-label="Frecuencia de ejemplo en hercios"
      />
      <span className="ph-hint">Desliza hasta que coincida con tu zumbido</span>
      <div className="ph-eq" aria-hidden="true">
        {Array.from({ length: 18 }, (_, i) => (
          <i key={i} style={{ animationDelay: `${i * 0.09}s` }} />
        ))}
      </div>
    </div>
  );
}

function SpatialScreen() {
  return (
    <div className="ph-screen">
      <span className="ph-title">Sonido 3D</span>
      <div className="ph-orbit" aria-hidden="true">
        <span className="ring r1" />
        <span className="ring r2" />
        <span className="ph-head">TÚ</span>
        <span className="ph-sound" />
      </div>
      <span className="ph-hint">El sonido viaja fuera de tu cabeza</span>
    </div>
  );
}

const WEEK = [7, 6, 6, 5, 4, 4, 3];
const DAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

function TrackingScreen() {
  return (
    <div className="ph-screen">
      <span className="ph-title">Seguimiento diario</span>
      <div className="ph-bars">
        {WEEK.map((v, i) => (
          <div className="ph-bar-col" key={DAYS[i]}>
            <b className="mono">{v}</b>
            <i style={{ height: `${v * 11}px`, background: levelInfo(v).color }} />
            <em>{DAYS[i]}</em>
          </div>
        ))}
      </div>
      <span className="ph-hint">Datos de ejemplo</span>
    </div>
  );
}

function ChatScreen() {
  return (
    <div className="ph-screen">
      <span className="ph-title">Asistente IA</span>
      <div className="ph-chat">
        <p className="me">Hoy el zumbido está más fuerte.</p>
        <p className="ai">
          Gracias por contármelo. Probemos 5 minutos de respiración y un sonido suave. ¿Empezamos?
        </p>
        <p className="me">Sí, vamos.</p>
      </div>
    </div>
  );
}

function BreathScreen() {
  return (
    <div className="ph-screen">
      <span className="ph-title">Respiración guiada</span>
      <div className="ph-breath" aria-hidden="true">
        <span className="orb" />
        <span className="lbl in">Inhala</span>
        <span className="lbl out">Exhala</span>
      </div>
      <span className="ph-hint">Sigue el ritmo del círculo</span>
    </div>
  );
}

function CommunityScreen() {
  const topics = ['Dormir mejor', 'Manejar los picos', 'Hablar con mi médico', 'Rutinas que ayudan'];
  return (
    <div className="ph-screen">
      <span className="ph-title">Comunidad</span>
      <div className="ph-topics">
        {topics.map((t) => <span key={t}>{t}</span>)}
      </div>
      <span className="ph-hint">No estás solo: comparte lo que te funciona</span>
    </div>
  );
}

const FEATURES = [
  {
    id: 'freq', Icon: Radio, name: 'Calibra tu frecuencia', Screen: FreqScreen,
    text: 'Ajusta un tono hasta igualar tu zumbido. Esa frecuencia guía toda tu terapia.',
  },
  {
    id: 'spatial', Icon: Headphones, name: 'Sonido 3D', Screen: SpatialScreen,
    text: 'Audio espacial con HRTF: ubica el sonido fuera de tu cabeza para que tu cerebro lo sienta menos como alarma.',
  },
  {
    id: 'track', Icon: LineChart, name: 'Seguimiento diario', Screen: TrackingScreen,
    text: 'Registra nivel, triggers y ánimo en un minuto. Descubre qué empeora o alivia tu día.',
  },
  {
    id: 'chat', Icon: MessageCircle, name: 'Asistente IA', Screen: ChatScreen,
    text: 'Una guía conversacional para los momentos difíciles. No sustituye a tu especialista.',
  },
  {
    id: 'breath', Icon: Wind, name: 'Respiración guiada', Screen: BreathScreen,
    text: 'Ejercicios cortos para bajar la tensión que suele acompañar al zumbido.',
  },
  {
    id: 'comm', Icon: Users, name: 'Comunidad', Screen: CommunityScreen,
    text: 'Conecta con otras personas que viven con acúfeno, a tu ritmo y con moderación.',
  },
];

export function PhoneShowcase() {
  const [active, setActive] = useState(FEATURES[0].id);
  const reduce = useReducedMotion();
  const current = FEATURES.find((f) => f.id === active);
  const { Screen } = current;

  return (
    <section className="ls-section ls-showcase" id="funciones">
      <Reveal>
        <SectionHead
          eyebrow="La app por dentro"
          title="Toca una función y mírala funcionar."
          text="Una sola app, seis herramientas pensadas para el acúfeno. Pruébalas aquí antes de instalar."
        />
      </Reveal>
      <div className="ls-showcase-grid">
        <div className="ls-tabs" role="tablist" aria-label="Funciones de TinnitOff">
          {FEATURES.map(({ id, Icon, name, text }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={active === id}
              className={`ls-tab ${active === id ? 'on' : ''}`}
              onClick={() => setActive(id)}
            >
              <span className="ls-tab-icon"><Icon size={20} /></span>
              <span className="ls-tab-body">
                <strong>{name}</strong>
                <small>{text}</small>
              </span>
            </button>
          ))}
        </div>
        <div className="ls-phone-wrap">
          <div className="ls-phone-glow" aria-hidden="true" />
          <div className="ls-phone">
            <div className="ls-notch" aria-hidden="true" />
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                className="ls-phone-screen"
                initial={reduce ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: -10 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
              >
                <Screen />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------
 * "Elige tu zumbido": suggests where to start. Not a diagnosis.
 * ------------------------------------------------------------------ */
const BUZZ = [
  {
    id: 'high', label: 'Pitido agudo',
    tip: 'Empieza calibrando la frecuencia y usa el mascarador de banda ancha para bajar su protagonismo.',
    tools: ['Calibrar frecuencia', 'Mascarador SOS'],
  },
  {
    id: 'low', label: 'Zumbido grave',
    tip: 'Los paisajes sonoros 3D con tonos cálidos suelen ser un buen punto de partida.',
    tools: ['Sonido 3D', 'Terapia de sueño'],
  },
  {
    id: 'pulse', label: 'Latido pulsante',
    tip: 'Registra cuándo aparece y practica respiración guiada. Si late con tu pulso, coméntalo con tu médico.',
    tools: ['Seguimiento diario', 'Respiración guiada'],
  },
  {
    id: 'hiss', label: 'Siseo o estática',
    tip: 'El ruido suave de fondo combina bien con las sesiones guiadas para la hora de dormir.',
    tools: ['Terapia de sueño', 'Mascarador SOS'],
  },
];

export function BuzzPicker() {
  const [sel, setSel] = useState(BUZZ[0].id);
  const cur = BUZZ.find((b) => b.id === sel);
  return (
    <section className="ls-section">
      <Reveal>
        <SectionHead
          eyebrow="Para ti"
          title="¿Cómo suena tu zumbido?"
          text="Elige el que más se parezca y te sugerimos por dónde empezar."
        />
      </Reveal>
      <Reveal className="ls-buzz glass">
        <div className="ls-chips" role="radiogroup" aria-label="Tipo de zumbido">
          {BUZZ.map((b) => (
            <button
              key={b.id}
              type="button"
              role="radio"
              aria-checked={sel === b.id}
              className={`ls-chip ${sel === b.id ? 'on' : ''}`}
              onClick={() => setSel(b.id)}
            >
              <Ear size={16} /> {b.label}
            </button>
          ))}
        </div>
        <p className="ls-buzz-tip" aria-live="polite">{cur.tip}</p>
        <div className="ls-tools">
          {cur.tools.map((t) => <span key={t}>{t}</span>)}
        </div>
        <small className="ls-note">Es una sugerencia para empezar, no un diagnóstico.</small>
      </Reveal>
    </section>
  );
}

/* ------------------------------------------------------------------
 * Illustrative 8-week progress slider + mini breathing circle
 * ------------------------------------------------------------------ */
const PROGRESS = [7, 7, 6, 6, 5, 5, 4, 4, 3];
const CW = 320;
const CH = 150;

function ProgressExample() {
  const [week, setWeek] = useState(0);
  const pts = PROGRESS.map((v, i) => {
    const x = 14 + (i / (PROGRESS.length - 1)) * (CW - 28);
    const y = 14 + (1 - v / 10) * (CH - 28);
    return [x, y];
  });
  const line = pts.map(([x, y]) => `${x},${y}`).join(' ');
  const area = `14,${CH - 14} ${line} ${CW - 14},${CH - 14}`;
  const [px, py] = pts[week];
  const info = levelInfo(PROGRESS[week]);

  return (
    <div className="ls-card glass">
      <div className="ls-card-head">
        <span>Progreso de ejemplo</span>
        <b className="mono" style={{ color: info.color }}>
          {PROGRESS[week]}/10 · {info.label}
        </b>
      </div>
      <svg viewBox={`0 0 ${CW} ${CH}`} className="ls-chart" role="img" aria-label="Gráfica ilustrativa de nivel de acúfeno en 8 semanas">
        <defs>
          <linearGradient id="lsArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6EC6A0" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#6EC6A0" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={area} fill="url(#lsArea)" />
        <polyline points={line} fill="none" stroke="#A78BFA" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={px} cy={py} r="7" fill={info.color} stroke="#0F172A" strokeWidth="3" />
      </svg>
      <input
        className="ph-range"
        type="range"
        min="0"
        max="8"
        value={week}
        onChange={(e) => setWeek(Number(e.target.value))}
        aria-label="Semana del ejemplo"
      />
      <div className="ls-card-foot">
        <span className="mono">Semana {week}</span>
        <small className="ls-note">Ejemplo ilustrativo. No es un resultado clínico.</small>
      </div>
    </div>
  );
}

function BreathMini() {
  const [on, setOn] = useState(false);
  return (
    <div className="ls-card glass ls-breath-card">
      <div className="ls-card-head"><span>Respira conmigo</span></div>
      <div className={`ls-breath-orb ${on ? 'run' : ''}`} aria-hidden="true">
        <span />
      </div>
      <p className="ls-breath-text" aria-live="polite">
        {on ? 'Inhala 4 s · Exhala 6 s' : 'Un minuto basta para empezar'}
      </p>
      <button type="button" className="ls-ghost-btn" onClick={() => setOn((v) => !v)}>
        {on ? 'Detener' : 'Empezar'}
      </button>
    </div>
  );
}

export function TryItSection() {
  return (
    <section className="ls-section">
      <Reveal>
        <SectionHead
          eyebrow="Pruébalo ahora"
          title="Mira cómo se siente el progreso."
          text="Mueve la línea del tiempo y respira un minuto. Así de simple es el día a día en la app."
        />
      </Reveal>
      <Reveal className="ls-two">
        <ProgressExample />
        <BreathMini />
      </Reveal>
    </section>
  );
}

/* ------------------------------------------------------------------
 * Steps, privacy and FAQ
 * ------------------------------------------------------------------ */
const STEPS = [
  { n: '01', title: 'Calibra', text: 'Encuentra la frecuencia de tu zumbido en un par de minutos.' },
  { n: '02', title: 'Escucha', text: 'Sesiones de sonido 3D y enmascarado a un volumen seguro.' },
  { n: '03', title: 'Habitúate', text: 'Registra tu día y deja que tu cerebro aprenda a ignorarlo, a su ritmo.' },
];

export function StepsSection() {
  return (
    <section className="ls-section" id="como-funciona">
      <Reveal>
        <SectionHead eyebrow="Cómo funciona" title="Tres pasos, sin complicarte." />
      </Reveal>
      <div className="ls-steps">
        {STEPS.map((s, i) => (
          <Reveal key={s.n} delay={i * 90} className="ls-step glass">
            <span className="ls-step-n mono">{s.n}</span>
            <h3>{s.title}</h3>
            <p>{s.text}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

const PRIVACY = [
  { Icon: Lock, title: 'Tus datos son tuyos', text: 'Solo tú ves tu historial. Puedes borrar tu cuenta y tus datos cuando quieras.' },
  { Icon: ScanFace, title: 'Análisis en tu dispositivo', text: 'La detección de tensión facial se procesa en tu móvil; la cámara nunca se envía a un servidor.' },
  { Icon: FileText, title: 'Reportes para tu médico', text: 'Genera un PDF con tu evolución para llevarlo a la consulta.' },
  { Icon: HeartHandshake, title: 'Modo cuidador', text: 'Un familiar puede acompañarte con el acceso que tú decidas.' },
];

export function PrivacySection() {
  return (
    <section className="ls-section" id="privacidad">
      <Reveal>
        <SectionHead
          eyebrow="Privacidad"
          title="Hecha para datos de salud."
          text="Tu zumbido es información sensible. La tratamos como tal."
        />
      </Reveal>
      <div className="ls-privacy">
        {PRIVACY.map(({ Icon, title, text }, i) => (
          <Reveal key={title} delay={i * 80} className="ls-priv glass">
            <span className="ls-priv-icon"><Icon size={22} /></span>
            <h3>{title}</h3>
            <p>{text}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

const FAQ = [
  {
    q: '¿TinnitOff reemplaza a mi médico?',
    a: 'No. Es una herramienta de apoyo. Ante un acúfeno nuevo, súbito o en un solo oído, consulta a un especialista.',
  },
  {
    q: '¿Necesito audífonos?',
    a: 'Para el sonido 3D sí: el efecto espacial necesita estéreo real en cada oído. Para el resto basta con tu móvil.',
  },
  {
    q: '¿Es seguro para mi oído?',
    a: 'El volumen de la app está limitado a niveles seguros. Aun así, mantén siempre un volumen cómodo.',
  },
  {
    q: '¿Qué datos guarda la app?',
    a: 'Solo lo necesario para tu seguimiento. El audio se genera en tu dispositivo y puedes eliminar tu cuenta y datos en cualquier momento.',
  },
  {
    q: '¿En qué dispositivos está disponible?',
    a: 'Por ahora la descarga directa es para Android. También puedes usar la versión web.',
  },
];

export function FaqSection() {
  return (
    <section className="ls-section ls-faq-section" id="faq">
      <Reveal>
        <SectionHead eyebrow="Preguntas" title="Lo que suelen preguntarnos." />
      </Reveal>
      <Reveal className="ls-faq">
        {FAQ.map((f) => (
          <details key={f.q} className="ls-faq-item glass">
            <summary>
              {f.q}
              <ChevronDown size={18} aria-hidden="true" />
            </summary>
            <p>{f.a}</p>
          </details>
        ))}
      </Reveal>
    </section>
  );
}
