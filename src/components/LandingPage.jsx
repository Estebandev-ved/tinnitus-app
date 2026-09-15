import React, { useEffect, useRef, useState, useCallback } from 'react';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { FirestoreService } from '../services/firestoreService';
import {
  Shield, Download, Cpu, Headphones, Play, Sparkles, HelpCircle, Smartphone,
  CheckCircle, ArrowRight, Moon, LineChart, Users,
} from 'lucide-react';
import SoundJourneyEar from './SoundJourneyEar';
import './LandingPage.css';

/* ------------------------------------------------------------------
 * Static content for the scroll journey. Each stop pairs a short piece
 * of copy with a camera preset (position/look-at/hologram-intensity)
 * consumed by SoundJourneyEar. Presets 0..6 = hero + the 6 stops.
 * ------------------------------------------------------------------ */
const CAMERA_PRESETS = [
  { pos: [-0.35, 0.4, 7.4], look: [-0.55, -0.05, 0.05], style: 0.05 }, // hero
  { pos: [1.7, -0.15, 3.05], look: [0.65, -0.35, 0.15], style: 0.18 }, // pabellón
  { pos: [-0.25, 0.4, 2.0], look: [-0.6, -0.07, 0.2], style: 0.38 }, // canal
  { pos: [-1.1, 0.35, 1.15], look: [-1.1, -0.05, 0.08], style: 0.55 }, // tímpano
  { pos: [-1.25, 0.65, 0.95], look: [-1.15, 0.2, 0.02], style: 0.7 }, // osículos
  { pos: [-2.15, 0.55, 1.3], look: [-2.1, -0.1, 0.05], style: 0.88 }, // cóclea
  { pos: [-2.55, -0.15, 1.05], look: [-2.35, -0.8, -0.04], style: 1.0 }, // nervio auditivo
];

const STOPS = [
  {
    label: '01 · Pabellón auricular',
    title: 'La antena que recibe todo',
    color: '#00e8ff',
    body: [
      'El sonido —y tu acúfeno— entra por aquí. Esta forma de embudo recoge y ' +
        'dirige las ondas hacia el canal.',
      'Es también donde probamos el sonido espacial 3D: si el cerebro puede ' +
        'localizarlo afuera, deja de sentirlo como una alarma interna.',
    ],
  },
  {
    label: '02 · Canal auditivo',
    title: 'El conducto que amplifica',
    color: '#00e8ff',
    body: [
      'Un tubo de apenas 2.5 cm que resuena y amplifica ciertas frecuencias ' +
        'antes de llegar al tímpano.',
      'Aquí es donde el Mascarador SOS introduce sonido de banda ancha para ' +
        'competir con el acúfeno en tiempo real.',
    ],
  },
  {
    label: '03 · Tímpano',
    title: 'Donde el aire se vuelve vibración',
    color: '#00e8ff',
    body: [
      'La membrana convierte ondas de presión en vibración mecánica. Es la ' +
        'primera traducción del sonido a una señal física.',
      'Sensible por diseño: por eso el volumen de toda la app está limitado a ' +
        'niveles seguros para el oído.',
    ],
  },
  {
    label: '04 · Osículos',
    title: 'La palanca más pequeña del cuerpo',
    color: '#00e8ff',
    body: [
      'Martillo, yunque y estribo —los tres huesos más pequeños del cuerpo ' +
        'humano— multiplican la fuerza de la vibración.',
      'Este relevo mecánico es también donde más se degrada la señal con la ' +
        'edad o el ruido; de ahí nace buena parte del acúfeno.',
    ],
  },
  {
    label: '05 · Cóclea',
    title: 'Donde nace la mayoría de los acúfenos',
    color: '#ff4b4b',
    body: [
      'Miles de células ciliadas traducen cada frecuencia en un impulso ' +
        'eléctrico distinto. Cuando algunas se dañan, el cerebro «rellena» el ' +
        'hueco con un pitido propio.',
      'El Filtro de Frecuencia IA identifica exactamente qué frecuencia de ' +
        'esta espiral es la afectada, y calibra la terapia sobre ese punto exacto.',
    ],
  },
  {
    label: '06 · Nervio auditivo',
    title: 'La señal que llega al cerebro',
    color: '#b583ff',
    body: [
      'El impulso eléctrico viaja desde la cóclea hasta la corteza auditiva, ' +
        'donde se interpreta como sonido —o como acúfeno.',
      'La habituación ocurre exactamente aquí: con exposición guiada y ' +
        'constante, el cerebro reclasifica la señal como irrelevante y baja el ' +
        'volumen que le presta atención.',
    ],
  },
];

const PILLARS = [
  {
    Icon: Cpu, title: 'Filtro de Frecuencia IA', tone: 'cyan',
    text: 'Identifica y replica la frecuencia exacta de tu acúfeno para calibrar la terapia de reentrenamiento.',
  },
  {
    Icon: Headphones, title: 'Paisajes Sonoros 3D', tone: 'purple',
    text: 'Sonido binaural espacial modelado clínicamente para relajar la corteza auditiva hiperactiva.',
  },
  {
    Icon: Play, title: 'Mascarador SOS', tone: 'orange',
    text: 'Alivio acústico instantáneo para modular picos elevados de acúfeno y reducir el estrés auditivo.',
  },
  {
    Icon: Moon, title: 'Terapia de Sueño', tone: 'cyan',
    text: 'Sesiones guiadas para conciliar el sueño cuando el silencio de la noche amplifica el pitido.',
  },
  {
    Icon: LineChart, title: 'Seguimiento Clínico', tone: 'purple',
    text: 'Registro diario de intensidad y estado de ánimo, con reportes listos para tu especialista.',
  },
  {
    Icon: Users, title: 'Modo Cuidador', tone: 'orange',
    text: 'Acceso controlado para que un familiar acompañe el progreso y las crisis sin invadir tu espacio.',
  },
];

const TICKER_ITEMS = [
  'TERAPIA DE REENTRENAMIENTO AUDITIVO',
  'SONIDO BINAURAL 3D CON HRTF',
  'FILTRO DE FRECUENCIA ADAPTATIVO POR IA',
  'MASCARADOR SOS PARA CRISIS DE ACÚFENO',
  'SEGUIMIENTO CLÍNICO DIARIO',
  'MODO CUIDADOR PARA ACOMPAÑANTES',
];

function lerp3(a, b, f) {
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
}

/* ------------------------------------------------------------------
 * Small embedded preview of the spatial-audio therapy (Web Audio API,
 * HRTF panning). This is a standalone, simplified version for the
 * landing page — the full guided experience still lives in
 * SpatialAudio.jsx inside the app.
 * ------------------------------------------------------------------ */
function SpatialAudioPreview() {
  const arenaRef = useRef(null);
  const dotRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const posRef = useRef({ x: 0, y: -70 });
  const ctxRef = useRef(null);
  const oscRef = useRef(null);
  const pannerRef = useRef(null);
  const draggingRef = useRef(false);

  const placeDot = useCallback(() => {
    if (dotRef.current) {
      const { x, y } = posRef.current;
      dotRef.current.style.transform = `translate(calc(-50% + ${x}px), calc(-58% + ${y}px))`;
    }
  }, []);

  useEffect(() => {
    placeDot();
  }, [placeDot]);

  const updatePanner = useCallback((x, y) => {
    const panner = pannerRef.current;
    const ctx = ctxRef.current;
    if (!panner || !ctx) return;
    const scale = 0.09;
    panner.positionX.setTargetAtTime(x * scale, ctx.currentTime, 0.08);
    panner.positionY.setTargetAtTime(0, ctx.currentTime, 0.08);
    panner.positionZ.setTargetAtTime(y * scale, ctx.currentTime, 0.08);
  }, []);

  const moveTo = useCallback((clientX, clientY) => {
    const el = arenaRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const cx = r.width / 2;
    const cy = r.height / 2;
    let nx = clientX - r.left - cx;
    let ny = clientY - r.top - cy;
    const radius = r.width / 2 - 14;
    const d = Math.sqrt(nx * nx + ny * ny);
    if (d > radius) {
      nx = (nx / d) * radius;
      ny = (ny / d) * radius;
    }
    posRef.current = { x: nx, y: ny };
    placeDot();
    if (playing) updatePanner(nx, ny);
  }, [placeDot, playing, updatePanner]);

  const start = useCallback(() => {
    const ctx = ctxRef.current || new (window.AudioContext || window.webkitAudioContext)();
    ctxRef.current = ctx;
    const gain = ctx.createGain();
    gain.gain.value = 0.18;
    const panner = ctx.createPanner();
    panner.panningModel = 'HRTF';
    panner.distanceModel = 'inverse';
    panner.refDistance = 1;
    panner.maxDistance = 10000;
    panner.rolloffFactor = 1;
    pannerRef.current = panner;
    const l = ctx.listener;
    if (l.positionX) {
      l.positionX.setValueAtTime(0, ctx.currentTime);
      l.positionY.setValueAtTime(0, ctx.currentTime);
      l.positionZ.setValueAtTime(0, ctx.currentTime);
      l.forwardX.setValueAtTime(0, ctx.currentTime);
      l.forwardY.setValueAtTime(0, ctx.currentTime);
      l.forwardZ.setValueAtTime(-1, ctx.currentTime);
      l.upX.setValueAtTime(0, ctx.currentTime);
      l.upY.setValueAtTime(1, ctx.currentTime);
      l.upZ.setValueAtTime(0, ctx.currentTime);
    }
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 4000;
    osc.connect(panner);
    panner.connect(gain);
    gain.connect(ctx.destination);
    oscRef.current = osc;
    updatePanner(posRef.current.x, posRef.current.y);
    osc.start();
    setPlaying(true);
  }, [updatePanner]);

  const stop = useCallback(() => {
    if (oscRef.current) {
      oscRef.current.stop();
      oscRef.current.disconnect();
      oscRef.current = null;
    }
    setPlaying(false);
  }, []);

  useEffect(() => () => {
    if (oscRef.current) {
      try {
        oscRef.current.stop();
      } catch {
        /* already stopped */
      }
    }
    if (ctxRef.current && ctxRef.current.state !== 'closed') ctxRef.current.close();
  }, []);

  const onDown = (e) => {
    draggingRef.current = true;
    const p = e.touches ? e.touches[0] : e;
    moveTo(p.clientX, p.clientY);
  };
  const onMove = (e) => {
    if (!draggingRef.current) return;
    const p = e.touches ? e.touches[0] : e;
    moveTo(p.clientX, p.clientY);
  };
  const onUp = () => {
    draggingRef.current = false;
  };

  return (
    <div className="demo-arena-wrap">
      <div
        className="arena"
        ref={arenaRef}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onTouchStart={onDown}
        onTouchMove={onMove}
        onTouchEnd={onUp}
      >
        <div className="guide v" />
        <div className="guide h" />
        <div className="head">TÚ</div>
        <div className="sound-dot" ref={dotRef}>
          {playing && <div className="pulse-ring" />}
        </div>
      </div>
      <button className={`demo-btn ${playing ? 'playing' : ''}`} onClick={playing ? stop : start}>
        {playing ? '■ Detener' : '▶ Iniciar sonido'}
      </button>
      <span className="demo-hint">Arrastra el punto cian</span>
    </div>
  );
}

export default function LandingPage({ onGoToApp }) {
  const [referrer, setReferrer] = useState('direct');
  const [apkUrl, setApkUrl] = useState('');
  const [appVersion, setAppVersion] = useState('1.0.0');
  const [downloading, setDownloading] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  const heroRef = useRef(null);
  const stopRefs = useRef([]);
  const pillarsRef = useRef(null);
  const sceneStageRef = useRef(null);
  const journeyState = useRef({
    camPos: CAMERA_PRESETS[0].pos,
    camLook: CAMERA_PRESETS[0].look,
    style: CAMERA_PRESETS[0].style,
  });
  const statRef = useRef(null);
  const [statAnimated, setStatAnimated] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const refParam = params.get('ref');
    if (refParam) setReferrer(refParam);

    const fetchMetadata = async () => {
      try {
        const configRef = doc(db, 'app_config', 'metadata');
        const docSnap = await getDoc(configRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setApkUrl(data.download_url || '');
          setAppVersion(data.latest_version || '1.0.0');
        }
      } catch (err) {
        console.error('Error reading app config metadata:', err);
      }
    };
    fetchMetadata();
  }, []);

  const handleDownloadClick = async () => {
    setDownloading(true);
    try {
      const userAgent = navigator.userAgent;
      const platform = navigator.platform || 'unknown';
      await FirestoreService.logDownloadAttribution(referrer, userAgent, platform);
    } catch (err) {
      console.error('Error recording download click:', err);
    }
    if (apkUrl) {
      setTimeout(() => {
        window.location.href = apkUrl;
        setDownloading(false);
        setShowInstructions(true);
      }, 1000);
    } else {
      alert('La URL de descarga no está disponible en este momento.');
      setDownloading(false);
    }
  };

  /* ---- scroll-driven 3D camera + hologram intensity ---- */
  useEffect(() => {
    let breakpoints = [];
    const computeBreakpoints = () => {
      const heroTop = heroRef.current ? heroRef.current.offsetTop : 0;
      const stopTops = stopRefs.current.map((el) => (el ? el.offsetTop : 0));
      const pillarsTop = pillarsRef.current ? pillarsRef.current.offsetTop : heroTop + 1;
      breakpoints = [heroTop, ...stopTops, pillarsTop];
    };
    computeBreakpoints();

    let raf = null;
    const update = () => {
      raf = null;
      const y = window.scrollY || window.pageYOffset;
      const segCount = breakpoints.length - 1;
      let t = 0;
      for (let i = 0; i < segCount; i++) {
        const a = breakpoints[i];
        const b = breakpoints[i + 1];
        if (y >= a && y < b) {
          t = i + (y - a) / Math.max(1, b - a);
          break;
        }
        if (y >= b && i === segCount - 1) t = segCount;
      }
      if (y < breakpoints[0]) t = 0;

      const lastIdx = CAMERA_PRESETS.length - 1;
      const st = journeyState.current;
      if (t <= lastIdx) {
        let i0 = Math.min(Math.floor(t), CAMERA_PRESETS.length - 2);
        i0 = Math.max(0, i0);
        const f = t - i0;
        const A = CAMERA_PRESETS[i0];
        const B = CAMERA_PRESETS[i0 + 1];
        st.camPos = lerp3(A.pos, B.pos, f);
        st.camLook = lerp3(A.look, B.look, f);
        st.style = A.style + (B.style - A.style) * f;
        if (sceneStageRef.current) sceneStageRef.current.style.opacity = '1';
      } else {
        const last = CAMERA_PRESETS[lastIdx];
        st.camPos = last.pos;
        st.camLook = last.look;
        st.style = last.style;
        const fadeSeg = t - lastIdx;
        if (sceneStageRef.current) {
          sceneStageRef.current.style.opacity = String(Math.max(0, 1 - fadeSeg));
        }
      }
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', computeBreakpoints);
    const settleTimer = setTimeout(computeBreakpoints, 350);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', computeBreakpoints);
      clearTimeout(settleTimer);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  /* ---- reveal stop panels + count-up stat when scrolled into view ---- */
  useEffect(() => {
    const panels = Array.from(document.querySelectorAll('.stop-panel'));
    let io;
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add('in-view');
        });
      }, { threshold: 0.35 });
      panels.forEach((p) => io.observe(p));
    } else {
      panels.forEach((p) => p.classList.add('in-view'));
    }
    return () => io && io.disconnect();
  }, []);

  useEffect(() => {
    if (!statRef.current || statAnimated) return;
    const el = statRef.current;
    let io;
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setStatAnimated(true);
            io.disconnect();
          }
        });
      }, { threshold: 0.6 });
      io.observe(el);
      return () => io.disconnect();
    }
    setStatAnimated(true);
  }, [statAnimated]);

  return (
    <div className="landing-page-container">
      <div className="landing-scene-stage" ref={sceneStageRef} aria-hidden="true">
        <SoundJourneyEar stateRef={journeyState} />
      </div>

      <div className="ticker-bar" aria-hidden="true">
        <div className="ticker-track">
          {[0, 1].map((r) => TICKER_ITEMS.map((t, i) => <span key={`${r}-${i}`}>{t}</span>))}
        </div>
      </div>

      <header className="landing-header glass">
        <div className="landing-logo">
          <Headphones size={28} className="logo-icon animate-pulse" />
          <span className="logo-text">Tinnit<span>Off</span></span>
        </div>
        <button className="btn-app-access glass" onClick={onGoToApp}>
          Acceder a la Web App <ArrowRight size={16} />
        </button>
      </header>

      <main className="landing-main">
        <section className="hero-section" ref={heroRef}>
          <div className="badge-promo glass animate-fade">
            <Sparkles size={14} className="sparkle-icon" />
            <span>Terapia digital avanzada para el oído</span>
          </div>

          <h1 className="hero-title animate-slide-up">
            Un oído. Todo el camino <span className="highlight-text">del sonido.</span>
          </h1>

          <p className="hero-sub animate-slide-up">
            Sigue el recorrido real de una onda sonora —y de tu acúfeno— por el oído,
            tramo a tramo. Descarga TinnitOff y experimenta terapias acústicas
            tridimensionales personalizadas, enmascaramiento clínico avanzado y
            monitoreo de estrés en tiempo real.
          </p>

          <div className="download-cta-box glass animate-slide-up">
            <div className="cta-header">
              <Smartphone size={24} className="cta-icon" />
              <div>
                <h3>Instalador Oficial TinnitOff Android</h3>
                <p>Versión actual: v{appVersion} • Archivo APK Seguro</p>
              </div>
            </div>

            {referrer !== 'direct' && (
              <div className="referrer-badge-glow">
                Invitado especial por: <span className="ref-name">{referrer}</span>
              </div>
            )}

            <button
              className={`btn-main-download ${downloading ? 'loading' : ''}`}
              onClick={handleDownloadClick}
              disabled={downloading}
            >
              {downloading ? (
                <>Generando enlace seguro...</>
              ) : (
                <><Download size={20} /> Descargar TinnitOff APK</>
              )}
            </button>
            <p className="download-notice">Descarga libre de anuncios y virus. Certificado HTTPS.</p>
          </div>

          <div className="hero-stats animate-fade" ref={statRef}>
            <div className="stat">
              <span className="stat-num">{statAnimated ? '94%' : '0%'}</span>
              <span className="stat-label">Habituación rápida</span>
            </div>
            <div className="stat">
              <span className="stat-num">3D</span>
              <span className="stat-label">Sonido binaural</span>
            </div>
            <div className="stat">
              <span className="stat-num">IA</span>
              <span className="stat-label">Filtro adaptativo</span>
            </div>
          </div>

          <div className="scroll-cue">
            <span>Baja para empezar el recorrido</span>
            <span className="arrow">↓</span>
          </div>
        </section>

        {showInstructions && (
          <section className="instructions-section glass animate-slide-up">
            <h3><CheckCircle size={22} color="#34c759" /> ¡Tu descarga ha comenzado!</h3>
            <p>Sigue estos sencillos pasos para instalar TinnitOff en tu celular:</p>
            <div className="steps-grid">
              <div className="step-card">
                <span className="step-num">1</span>
                <h4>Abre el archivo</h4>
                <p>
                  Busca el archivo <code>tinnitoff.apk</code> descargado en tus
                  notificaciones o gestor de descargas.
                </p>
              </div>
              <div className="step-card">
                <span className="step-num">2</span>
                <h4>Permite orígenes</h4>
                <p>
                  Si tu sistema lo solicita, activa "Permitir desde esta fuente" para
                  autorizar la instalación manual.
                </p>
              </div>
              <div className="step-card">
                <span className="step-num">3</span>
                <h4>Disfruta la app</h4>
                <p>Inicia la aplicación, crea tu cuenta o inicia sesión y comienza tu viaje hacia el alivio.</p>
              </div>
            </div>
          </section>
        )}

        <section className="journey-section">
          {STOPS.map((s, i) => (
            <div className="stop" key={s.label} ref={(el) => (stopRefs.current[i] = el)}>
              <div className="stop-panel" style={{ '--stop-color': s.color }}>
                <span className="stop-index">{s.label}</span>
                <h3>{s.title}</h3>
                {s.body.map((b, j) => <p key={j}>{b}</p>)}
              </div>
            </div>
          ))}
        </section>

        <section className="pillars-section" ref={pillarsRef}>
          <div className="section-head">
            <span className="eyebrow"><HelpCircle size={14} /> La terapia</span>
            <h2>Un sistema, no una lista de funciones.</h2>
            <p>
              Cada pilar actúa sobre un tramo distinto del camino que acabas de recorrer:
              desde cómo capturas el sonido hasta cómo tu cerebro deja de darle importancia.
            </p>
          </div>
          <div className="features-grid">
            {PILLARS.map(({ Icon, title, text, tone }) => (
              <div className="feature-card glass" key={title}>
                <div className={`f-icon-box ${tone}`}><Icon size={24} /></div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="demo-section">
          <div className="section-head">
            <span className="eyebrow"><Shield size={14} /> Demo en vivo</span>
            <h2>Sácalo de tu cabeza.</h2>
            <p>
              Alejar el sonido de tu cabeza «engaña» a tu cerebro y facilita la
              habituación. Pruébalo tú mismo: arrastra el punto alrededor de la cabeza.
            </p>
          </div>
          <div className="demo-wrap">
            <div className="demo-text">
              <p>
                Este es el mismo motor de audio espacial (Web Audio API + panning HRTF)
                que usa la app para la Terapia de Sonido 3D. Muévelo mientras suena y
                notarás cómo el tono parece moverse físicamente a tu alrededor.
              </p>
              <div className="warn">
                <Headphones size={16} /> Usa audífonos: el efecto 3D (HRTF) solo funciona
                con sonido estéreo real en cada oído.
              </div>
            </div>
            <SpatialAudioPreview />
          </div>
        </section>

        <section className="final-cta-section">
          <span className="eyebrow" style={{ margin: '0 auto 20px' }}>Fin del recorrido</span>
          <h2>Esto es solo el mapa.<br />La app ya hace el viaje.</h2>
          <p>TinnitOff acompaña cada tramo que acabas de ver: captura, conducción, cóclea y habituación.</p>
          <button className="final-btn" onClick={handleDownloadClick} disabled={downloading}>
            <Download size={18} /> {downloading ? 'Generando enlace seguro...' : 'Descargar TinnitOff APK'}
          </button>
        </section>
      </main>

      <footer className="landing-footer">
        <p>© 2026 TinnitOff. Todos los derechos reservados. Diseñado para el alivio permanente.</p>
        <div className="footer-links">
          <a
            href="#disclaimer"
            onClick={(e) => {
              e.preventDefault();
              alert(
                'TinnitOff es una herramienta de apoyo acústico y no sustituye el ' +
                  'diagnóstico médico profesional.'
              );
            }}
          >
            Cláusula Médica
          </a>
          <span>•</span>
          <a
            href="#app"
            onClick={(e) => {
              e.preventDefault();
              onGoToApp();
            }}
          >
            Acceso Directo
          </a>
        </div>
      </footer>
    </div>
  );
}
