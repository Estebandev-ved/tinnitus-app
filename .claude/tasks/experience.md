# Tareas – experience-agent

## Pendientes
- [x] EXP-01 · P0 🧑 · Referencia de estilo: el usuario indica dónde ver "SAAS-Mocoa-medellin" (URL, carpeta o capturas; no está en el Escritorio). El agente resume qué efectos usa (partículas antigravity, personajes, eventos, scroll) y cuáles se adaptan a la app. (hecho 2026-09-29)
- [x] EXP-02 · P0 · (hecho 2026-09-29, informe abajo) Auditar lo existente: `HolographicEar`, `SoundJourneyEar`, `EnhancedDigitalTwin`, `mechanics/*`, `ChestAnimation`, `BadgeDisplay`, uso de Framer Motion (7 archivos). Informe corto de qué reutilizar y qué falta.
- [x] EXP-03 · P1 🧑 · Definir el personaje. (hecho 2026-09-29, elegido: Lumi)
- [x] EXP-04 (hecho 2026-09-29, 5 pantallas, IDs en "Registro EXP-04") · P1 · Stitch: usar el proyecto/sistema de diseño de `design-agent` (o crearlo) y generar pantallas MOBILE con el personaje: Inicio (compañero + estado del día), Sesión de sonido con escena, Respiración guiada, Logro/racha, Modo calma/crisis.
- [x] EXP-05 · P1 🧑 · Aprobación de pantallas de Stitch (`edit_screens` / `generate_variants` hasta que el usuario apruebe). (hecho 2026-09-29: el usuario aprobó en el chat; pendiente de ajustar al implementar: quitar "48 dB" inventado, tabs según el sistema, copy de "líneas de ayuda" con compliance CMP-02)
- [x] EXP-06 · P1 · Componente base `Companion` (React + Framer Motion, SVG/Lottie ligero) con estados calma/escucha/respira/celebra/descansa, PropTypes y `aria-label`; respeta reduced-motion. (hecho 2026-09-29: `src/components/Companion.jsx`, test `src/tests/Companion.test.jsx`, claves i18n `companion_*`; sin integrar aún)
- [ ] EXP-07 · P1 · Fondo interactivo "antigravity": partículas flotantes que reaccionan a toque/arrastre/giroscopio; presupuesto de partículas por dispositivo; pausa fuera de vista.
- [ ] EXP-08 · P1 · Eventos: bienvenida, sesión completada, racha, logro (reutilizar `ChestAnimation`), amanecer/atardecer por hora. Sin sonido súbito, con háptica suave opcional.
- [ ] EXP-09 · P1 · Escenas de terapia de sonido (lluvia/bosque/océano/ruido rosa) sincronizadas con la selección en `SoundLibrary`/`SpatialAudio`.
- [ ] EXP-10 · P1 · Respiración guiada: el compañero respira al ritmo, con guía visual clara y texto alternativo.
- [ ] EXP-11 · P2 · Modo calma/crisis: escena mínima, personaje sereno y recursos de ayuda visibles (coordinar con `compliance-agent`, CMP-02).
- [ ] EXP-12 · P2 · Reacción al ánimo/nivel de tinnitus registrados con tono compasivo; sin culpa por días sin uso.
- [ ] EXP-13 · P2 · Ajuste "Reducir animaciones/efectos" en la app (además del ajuste del sistema) y prueba de rendimiento en Android real 🧑.
- [ ] EXP-14 · P2 · Capturas/animaciones para la ficha de Play Store (coordinar con `release-agent`, REL-06).

## Informe EXP-02 · Auditoría (2026-09-29, solo lectura)

**Inventario (ruta, uso real, notas)**
- `components/HolographicEar.jsx` (437 l., R3F + drei + postprocessing Bloom): props `riskColor`, `probability`. Usado solo en `DigitalTwin.jsx`, import estático (no lazy). Partículas propias (`Particles`, count 40). Sin reduced-motion, sin pausa fuera de pantalla, Bloom costoso en Android medio.
- `components/SoundJourneyEar.jsx` (394 l., R3F): usado en `LandingPage`. Único con `prefers-reduced-motion` (amortigua/oculta wobble); anima por `stateRef` (patrón reutilizable para escenas dirigidas por scroll/estado sin re-render).
- `components/EnhancedDigitalTwin.jsx` (84 l.): NO usa Three ni Framer. "Avatar" = emoji por estado (frustration/anxiety/calm/neutral) + `analyzeEmotion` + `getPrediction`. Textos hardcodeados en español (sin i18n), emojis en UI. Es el mejor punto de enganche para el compañero (ya mapea ánimo -> estado).
- `components/mechanics/`: Linterna, Monstruo, Nevera, Periferica (~45-50 l. c/u, `onComplete`, CSS puro, usados solo por `SessionPlayer`); Mezclador (367 l., AudioEngine, temporizador de sueño con fade-out; reutilizable para "arrastrar para mezclar"); `RescueMode` (185 l. + CSS: animación `breath` 1.5 s alternate, sonido de rescate, guarda en Firestore; base del modo crisis pero ciclo de respiración de 1.5 s es demasiado rápido para calmar y sin reduced-motion).
- `mechanics/ChestAnimation` (49 l. + CSS): usado en `Achievements`. Etapas closed/opening/opened con timers (1 s/2 s), icono `Gift`, estilos Tailwind-like sin definir en el sistema de diseño, colores amarillo fuerte, "+Ecos", texto "Abriendo recompensa..." con `animate-pulse`. Sin Framer, sin reduced-motion. Reutilizar la lógica de etapas, rehacer el estilo.
- `features/gamification/BadgeDisplay.jsx` (41 l.): NO se importa en ningún sitio (código muerto). Datos hardcodeados, estilos inline fuera de paleta, copy poco compasivo ("Tus Medallas de Gloria", "por no rendirte al pitido", "Aún escondido").
- `features/cbt/BreathingPacer.jsx` (51 l.): tampoco se importa en ningún sitio. Framer `scale` 1 <-> 1.5 con fases de 4 s (buena base para EXP-10), pero interval sin sincronizar con la animación, texto sin i18n, sin reduced-motion.

**Framer Motion**: 7 archivos (`App.jsx`, `App.css` [solo comentario/clases], `DashboardHome`, `HomeWidget`, `VibeTripLogger`, `BreathingPacer`, `BadgeDisplay`). Uso en `DashboardHome` con variants (stagger) y whileTap/whileHover. Ningún `useReducedMotion` ni `MotionConfig` en toda `src/`.

**Reutilizar**: patrón `stateRef` + reduced-motion de SoundJourneyEar; `Particles` de HolographicEar como referencia (no el Bloom); lógica de fases 4 s de BreathingPacer; etapas de ChestAnimation; Mezclador (temporizador/fade); RescueMode como esqueleto del modo crisis; `analyzeEmotion`/`getPrediction` para estados del compañero; variants de DashboardHome.

**Falta / riesgos**
1. Personaje `Companion` inexistente (EXP-03/06). 2. Reduced-motion global: añadir `MotionConfig reducedMotion="user"` en la raíz + ajuste en la app (EXP-13); hoy solo lo respeta SoundJourneyEar y 3 reglas de LandingPage. 3. Nada de pausa por visibilidad/fuera de pantalla (IntersectionObserver + `visibilitychange`) en Three ni CSS infinitos. 4. Three cargado estático en `DigitalTwin` (HolographicEar) -> pasar a `React.lazy`. 5. Sin háptica (`@capacitor/haptics` no se usa en `src/`) ni giroscopio (`deviceorientation`; pedir permiso en iOS). 6. Sin capa de partículas 2D ligera (canvas/CSS) con presupuesto por dispositivo; Three sería excesivo para el fondo. 7. i18n: copy de gemelo, cofre y badges hardcodeado y con tono no compasivo; emojis en UI. 8. Colores fuera de la paleta (amarillo cofre, #1E1E1E/#4CA1AF badges). 9. RescueMode: ciclo de respiración 1.5 s (deber ser >=4 s). 10. Animaciones CSS infinitas (`wavePulse` 3 s, `pulse`) sin `@media (prefers-reduced-motion)`. 11. Sin escenas por sonido (SoundLibrary/SpatialAudio no exponen "sonido activo" a la capa visual: definir un contexto/evento ligero).

**Handoffs**: frontend-qa (i18n de DigitalTwin/Chest/Badge, eliminar o adoptar BadgeDisplay/BreathingPacer), compliance (RescueMode/copy de crisis, EXP-11). Sugerencia: EXP-06 debería partir de `EnhancedDigitalTwin` + `BreathingPacer`.

## Hechas
- EXP-02 (2026-09-29): ver informe arriba.


## Informe EXP-01 (2026-09-29) · Referencia de estilo "SAAS-Mocoa-medellin"

**Identificación.** No existe ninguna carpeta ni archivo llamado "SAAS-Mocoa-medellin". El nombre solo aparece como URL de un repositorio git en el `README.md` de "Bot NOMA" (`Estebandev-ved/SAAS-Mocoa-medellin`): es el mismo proyecto NOMA (SaaS de automatización de ventas por WhatsApp, pedidos y domicilios en Mocoa/Medellín). Se analizó el código local: `agency-platform-react/` (landing + panel; React 19, Vite 8, Tailwind 4, framer-motion 12, lucide-react, leaflet, socket.io-client) y `antigravity/frontend/` (panel/admin anterior en CSS plano, sin framer-motion, con recharts). "Antigravity" es el nombre del producto/backend, NO un efecto de partículas flotantes.

**Qué NO hay (importante).** Sin partículas, sin canvas de fondo, sin Three.js/R3F, sin giroscopio, sin parallax de scroll (`useScroll` no se usa), sin sonido ni háptica, sin lottie/rive. El estilo es formal y plano (base negro/gris/blanco, rojo como único acento) con personajes ilustrados como voz de marca. El único canvas es el de `exportAvatar.js` (exportar PNG).

**Efectos y técnicas encontrados**
1. Entrada por scroll: `whileInView` con `viewport once` (30 usos): fade + subida de 24-30 px, stagger por índice (~0.08 s), 0.5-0.8 s.
2. Contador numérico animado (`useMotionValue` + `useTransform` + `animate`, 2 s) en las stats del hero.
3. Fondo del hero: rejilla de puntos estática con degradado; sin movimiento.
4. Ticker/marquesina infinita: `x` lineal de 40 s en bucle, bordes con degradado.
5. Elenco de 4 personajes SVG planos de cuerpo entero (Sofía, Nova, Lucía, Mateo), cada uno = una parte del producto; se muestran con `<img>` SVG (decorativos por defecto); `whileHover` spring (y -6).
6. Avatar editable de la dueña dibujado por capas SVG (piel, pelo, barba, gafas, ropa...), validado en servidor y exportable a PNG.
7. Eventos/hitos: `HitosContext` con cola de logros que se celebran UNA sola vez por cuenta (estado en servidor + copia local); tarjeta flotante inferior donde el personaje salta y luego respira, con sello de check que se "dibuja" (`stroke-dasharray`). Consejos del personaje (`TipNova`) la primera vez que se visita una sección, descartables y persistentes.
8. Micro-animaciones CSS: `noma-hop` (3 saltitos, 0.7 s), `noma-breathe` (escala 1.015, ciclo 3.2 s), `noma-pop` (sello con rebote), `noma-zzz` (personaje dormido en gris con "Zzz"), `pulse-glow` (box-shadow), `animate-ping`, shimmer de skeleton.
9. Toasts, modales y `AnimatePresence` (38 usos); `whileTap` scale 0.98 en botones.
10. Estados vacío/carga/error con ilustraciones de personaje.
11. Tiempo real: socket.io alimenta una tarjeta flotante de pedidos "en vivo" y un chat demo simulado.
12. Movimiento reducido: `useReducedMotion` solo en 2 contextos (hitos y pedidos en vivo) y reglas `prefers-reduced-motion` para las clases `noma-*`; el panel antiguo tiene un bloque global que lleva las animaciones a 0.01 ms. La landing NO lo respeta en Ticker, Hero, Counter ni `whileInView` (deuda: no copiar tal cual).

**Adaptación a TinnitOff (calma, reduced-motion, Android)**

| Técnica | Veredicto | Cómo adaptarla |
|---|---|---|
| Personaje SVG plano por capas con estados | Adoptar | "Eco" (onda/oído) como SVG por capas; estados calma/escucha/respira/celebra/descansa cambiando capas; sin librería nueva. |
| Respiración `noma-breathe` | Adoptar | Ciclo 4-6 s (o al ritmo de BreathingGuide), escala <= 1.03, solo transform/opacity. |
| Hitos de una sola vez + cola | Adoptar con cambios | Tarjeta breve, tono compasivo (nunca por faltar un día); máx. 1 por sesión; estado en Firestore, no localStorage. |
| Consejo del personaje en 1ª visita | Adoptar | "Eco te sugiere..." descartable, sin repetir. |
| `whileInView` fade + subida | Adoptar | 150-400 ms, subida 8-12 px, stagger corto; con reduced-motion aparece sin movimiento. |
| Sello de check que se dibuja | Adoptar | Para completar sesión; 300-400 ms; sin overshoot. |
| Contador animado | Adaptar | Solo en resúmenes no ansiogénicos (minutos de calma), nunca con nivel de tinnitus; reduced-motion -> valor final. |
| Estados vacíos/carga con personaje | Adoptar | Encaja con la regla de empty state (<= 180 pt). |
| Rejilla de puntos estática | Adoptar | Textura de fondo barata, sin animar. |
| Avatar por capas editable | P2 futuro | Personalizar colores de Eco, no rasgos humanos. |
| Personaje que salta 3 veces (`noma-hop`) | Adaptar | Un solo balanceo suave (translateY <= 6 px, >= 600 ms). |
| Personaje dormido gris + Zzz | Adaptar | Estado "descansa" nocturno: atenuar (no gris total), Zzz muy lentos o estáticos. |
| `whileHover` spring | Adaptar | En móvil usar `whileTap` sutil (0.97) + háptica ligera opcional. |
| Marquesina infinita | Descartar en móvil | CPU continua; si se usa, pausar fuera de pantalla y en reduced-motion. |
| `pulse-glow` / `animate-ping` | Descartar | Repintan sombras y llaman la atención; usar opacidad lenta (>= 4 s). |
| Socket "en vivo" + tarjeta emergente | No aplica | TinnitOff no tiene tiempo real; evitar notificaciones emergentes. |
| Partículas/escenas antigravity, giroscopio, escenas por sonido | No existen en la referencia | Diseñar desde cero (EXP-03/04): <= 12-20 elementos en móvil, un solo rAF compartido, pausa con IntersectionObserver y `visibilitychange`, R3F solo donde ya existe (lazy). |

**Presupuesto de rendimiento propuesto (Android medio)**
- Animar solo `transform` y `opacity`; evitar animar `box-shadow`, `filter` o `backdrop-filter` en elementos en movimiento.
- Máx. 3 propiedades animadas a la vez; micro 150 ms, transiciones <= 400 ms; ambiente con ciclos >= 4 s; nunca > 3 parpadeos/s.
- Partículas: tope 12-20 en móvil; pausar fuera de pantalla y en segundo plano; Three.js siempre con `React.lazy`.
- Un `MotionConfig reducedMotion="user"` global (la referencia no lo tiene) más regla CSS `prefers-reduced-motion`, con versión estática equivalente que conserve la información.
- Sin sonido ni háptica por defecto en eventos; opcionales, bajos y respetando el volumen guardado.

**Conclusión.** La referencia aporta el lenguaje de "personajes con voz de marca + hitos de una sola vez + consejos contextuales + micro-animaciones planas", pero no partículas ni escenas interactivas: EXP-03 (Eco), EXP-04 (escenas) y EXP-05 deben diseñarse con la tabla anterior. La paleta de NOMA (rojo/negro/blanco) no aplica; TinnitOff mantiene la de `mobile-design-system.md`.


## Propuestas EXP-03 · Compañero (2026-09-29) · propuestas presentadas, sin elegir

Bocetos estáticos (5 estados cada uno): `.claude/design/characters/eco.svg`, `lumi.svg`, `brote.svg`. Solo colores de la paleta (#4A90D9, #A78BFA, #6EC6A0, #34D399, #FBBF24, neutros). Todos: SVG por capas (halo / cuerpo / cara / extras), sin librería nueva; estado = cambia cara y extras (crossfade de opacidad <= 300 ms) + transform del cuerpo. Solo `transform` y `opacity`, máx. 3 a la vez; ambiente con ciclos >= 4 s; con `useReducedMotion` se muestra la pose estática del estado (la cara y los extras ya llevan la información), sin bucles.

### A. Eco (onda / oído amistoso)
- **Forma**: gota-oído redondeada con curva de pabellón interior y 1-2 arcos de onda a un lado. Coherente con `HolographicEar`. Ligera, lectura clara a 48 px.
- **Paleta**: cuerpo gradiente #4A90D9 -> #A78BFA (135deg); ondas #6EC6A0; brillos #F1F5F9; celebración #FBBF24/#34D399.
- **Estados**: calma (ojos puntos, sonrisa mínima, ondas suaves) · escucha (ojos grandes, inclinación -6deg, ondas más marcadas hacia el sonido) · respira (ojos cerrados, escala 1 <-> 1.04 + anillos concéntricos) · celebra (ojos ^, destellos ámbar/esmeralda, un balanceo) · descansa (opacidad .72, ojos cerrados, "z" lentas).
- **Personalidad/tono**: escucha primero, voz baja y paciente; nunca dramatiza. ES: "Estoy aquí contigo. Vamos al ritmo que tú quieras." / "Hoy fue un día difícil, y aun así viniste. Eso cuenta." EN: "I'm here with you. We'll go at your pace." / "Today was hard, and you still showed up. That counts."
- **Framer Motion**: cuerpo `animate={{scale:[1,1.03,1]}}` transition 6 s easeInOut repeat Infinity (calma); escucha `rotate` -6 (300 ms) + opacidad de ondas; respira: `scale` sincronizado con las fases de 4 s de BreathingPacer + opacidad de anillos; celebra: un `y:[0,-6,0]` de 700 ms una sola vez + opacidad de destellos; descansa: opacidad .72 y "z" con opacidad 6 s. Reduced-motion: `MotionConfig reducedMotion="user"` + sin bucles; cambio de estado por swap instantáneo.
- **Pros**: encaja con la marca (oído/onda), reutiliza el lenguaje de `HolographicEar`, universal y neutro en género, fácil de recolorear (P2 personalizar). **Contras**: puede leerse como "una oreja" y recordar el problema (tinnitus) en vez de alivio; menos expresivo sin extremidades; riesgo de parecer genérico.

### B. Lumi (luciérnaga-orbe de luz)
- **Forma**: orbe redondo con halo doble y una antena corta con punta ámbar; brillo especular. Muy sencillo de animar (círculos).
- **Paleta**: cuerpo radial #34D399 -> #4A90D9; halo #6EC6A0 (opacidad .16-.18); antena #6EC6A0 con punta #FBBF24; destellos #FBBF24/#A78BFA.
- **Estados**: calma (halo estable, ojos puntos) · escucha (ojos grandes, boca "o", ondas a un lado) · respira (halo se expande, anillos #4A90D9/#A78BFA) · celebra (ojos ^, 4 destellos, antena vibra suave) · descansa (opacidad .72, "z", halo tenue).
- **Personalidad/tono**: cálida, curiosa, guía en la oscuridad; ideal para noche y sueño. ES: "Te acompaño con una lucecita. Sin prisa." / "Descansa, yo cuido la luz." EN: "I'll keep you company with a little light. No rush." / "Rest now, I'll watch the glow."
- **Framer Motion**: halo `scale` 1 <-> 1.08 y `opacity` en 6 s (nunca box-shadow ni filter); cuerpo `y:[0,-4,0]` 5 s como flotación antigravity; antena `rotate` +-4 deg; en respira el halo lleva el ritmo. Celebra: destellos con opacidad 0->1->0 (>= 1 s cada uno, sin parpadeo rápido). Reduced-motion: halo fijo y destellos estáticos.
- **Pros**: mejor para escenas antigravity y modo noche/calma, encaja con partículas (mismo lenguaje de luz), coste de render mínimo, no evoca al síntoma. **Contras**: menos vínculo con "audición"; luz/halo debe cuidarse en dark mode para no deslumbrar; puede parecer "app de sueño" genérica.

### C. Brote (semilla con brote)
- **Forma**: guijarro/semilla redondeada con dos hojitas en la cabeza y pies pequeños. Metáfora de crecimiento/habituación.
- **Paleta**: cuerpo #A78BFA -> #4A90D9; hojas #6EC6A0 y #34D399; pies #334155; destellos #FBBF24.
- **Estados**: calma (hojas quietas) · escucha (ojos grandes, ladeo, hojas atentas) · respira (escala 1.04 + anillos) · celebra (ojos ^, destellos, hojas suben) · descansa (opacidad .72, hojas caídas, "z").
- **Personalidad/tono**: paciente, ritmo de jardinero; celebra el progreso pequeño, jamás castiga. ES: "Un poquito cada día también es crecer." / "No pasa nada por descansar; el brote sigue ahí." EN: "A little each day is still growing." / "It's okay to rest; your sprout is still there."
- **Framer Motion**: hojas `rotate` +-5 deg 5-6 s (transformOrigin en la base), cuerpo `scale` 1.03 en respira, celebra: hojas `rotate` -12 y `y` -4 una vez + opacidad de destellos; descansa: hojas rotate +14 (caídas) y opacidad. Reduced-motion: poses estáticas por estado (la posición de las hojas comunica el estado).
- **Pros**: la metáfora de progreso y racha compasiva (el brote crece, no "se pierde") encaja con logros/racha; más expresivo (hojas = lenguaje corporal); diferenciado. **Contras**: más capas (más trabajo SVG, hojas animadas por separado); menos relación con sonido/audición; puede sentirse infantil.

### Recomendación
**Eco como base con toques de Lumi**: Eco tiene el mejor ajuste de marca y de código (HolographicEar, `EnhancedDigitalTwin`), y sus ondas ofrecen el lenguaje visual de "escucha" y de las escenas por sonido. Para mitigar su contra (evocar el síntoma), usar el halo suave de Lumi en noche/respiración y no mostrar nunca las ondas "intensas" con niveles altos de tinnitus. Si el usuario prefiere el enfoque más emocional de progreso/racha, la segunda opción es Brote; Lumi funciona mejor como personaje del modo noche. Decisión pendiente del usuario (🧑) antes de EXP-04/EXP-06.


## Registro EXP-04 · Pantallas Stitch con Lumi (2026-09-29)
Proyecto `17807983649510366296` · design system `assets/8635978786255707827` (TinnitOff Calm Dark) · todas MOBILE. Nota: `list_screens` no muestra estas pantallas (lista desactualizada); usar `get_screen` con el ID. Un timeout en Respiración: se comprobó con list_screens (no aparecía) y se regeneró una vez; puede existir un duplicado huérfano no visible.
- Inicio (compañero + estado del día): `4faffd3fc5fe4b5dae0cea34df2a05f9` (780x2110)
- Sesión de sonido con escena (Lluvia suave): `42115cd6aefc4bda99d23fbd57af33fe` (780x1804)
- Respiración guiada: `39ee5849c4254143a48fd84af501b6ed` (780x1768)
- Logro/racha: `11ad87930cb641698927ffacea739920` (780x1768)
- Modo calma/crisis: `b1b738bbf2734e60bf05a5733f6b4bd3` (780x1768)
URLs de captura (get_screen, screenshot.downloadUrl; pueden caducar, repetir get_screen):
- Inicio: https://lh3.googleusercontent.com/aida/AEtjO1XQh-1OSM_wye1s4CL7ORA8xPnWTrgMloRtvu3KAWkMLUbZs43WzwKgLu_PypfLyNs5bfrvEjRbcKWFHgcFiMBHgYMnrftNf88I7CjyEAEnTB5G_KR0YOzHts3cXLflfWYQmaHBf43t5qq_1hrDVTQBLwOVX82EkHcPdqcRetVuYpV-8M3gETLo25F5Ep7DmKF-3fY4p1rgbrYbqGRjUwX77DgyVTAcMe-IhM6dckHmYN71R757ajns2-C4
- Sonido: https://lh3.googleusercontent.com/aida/AEtjO1UsItcnkYXN4z_sPs_a4Fo4zMQnzL8AQzBwXeTaQf-Q_CzCKBHk5M2_RLy-CY8MtZDdHfs7jQ3V_vOaamE4Bb0doRKqxlu5IRqZpoTydZXoBR6Fe3pb6SQQCOeRHBJFqQVcTafXh-eq9bd3zPHqdJgnFxf_-W491vWLmqVVVmypv28dMNC2yCR_B_okQ15gyY66ba_6o-GX1Q6t77vFJP2mC--hE4_CS2nXvvn-QmKVQ7afVIiPAIwRSow
- Respiración: https://lh3.googleusercontent.com/aida/AEtjO1XzykY1xCOr9qLIhTC-ALc463jqF8pOHlzxBPgXMmQW5O0QiU3vUwI37VI9jggs2Bdto7Nn2aW4SaEMl4wGEDH4MKxCZZ9fgwuD-RB0KLpyKp1h3ihQ891Hv4GsFovIQu4_pJd6czP0JRh8ZiLTjxLBuFSHgEtybcvbeCeFV_9nB0ukc_Xdy9kk8Lv3uMvOk4HtLVajerfKpfK-BKyBGLcwr0KyNutBkqp7_odBkVhMDt6ljiMYuKUfDSY
- Logro: https://lh3.googleusercontent.com/aida/AEtjO1U2LraLIYawYffgNbXVVkn8xdqybG2AnXsrrbcHlyY7ddNbp1vfNoe7EQsa8dH1siWREzAfmoHLB-fmb6aMCEEil9nNPV8uBn7M7vrD61drbgs9SYAPHSanNK5bF2HndFawCQlO8aXIcAsYm0PAXq6QuC2n812IDwY-e4_cHfZQTNaHCcmTfR8Ojfk0C2zAvJcRDRJ1qlSsHyzAIppN1RFhgJ1Mu3Tt4YAp61vk6tfPm4Iv70Ip5s0ezn0K
- Calma/crisis: https://lh3.googleusercontent.com/aida/AEtjO1Xptngsb_t3ne3DP0b5NOXDycSHj_kKloJMRhPkAXQ-dwdyJM0KUosuH8nqvwHd7KuqPq--GbpR3kjL2keOcSZo5kDLprlmrS-l_z-hpHrsfE85CF75PQiKvcY3NZBupkYWbmFZwjHRijUopnfVruI9R-v_wXXTuzVdn6UwuYiWFe1AFPQwwEwy2dKpaXbXY0DGowai93CyFswXdaPX9S-zYFGGXhj4sh1tTpLBiwuzf2BY4mfpgF2uuHtN
Observaciones para EXP-05 (🧑): la pantalla de Inicio usa tabs distintos a los del sistema (Inicio/Progreso/Sonidos/Alivio/Perfil); Modo calma incluye "Ver líneas de ayuda" (coordinar copy con compliance CMP-02); Sesión de sonido muestra 48 dB inventados (revisar).

## Integración de Lumi (2026-09-29) · EXP-05 sigue pendiente 🧑
Integrado en 2 sitios (verificado a 375px):
- `DashboardHome`: banner superior = Lumi (72 px, `calm`; `resting` de 22:00 a 06:00) + mensaje compasivo + consejo diario (claves `home_lumi_day/night`, `home_daily_tip`).
- `RescueMode` pantalla final: Lumi `celebrating` (140 px) en lugar del icono ShieldCheck; texto `rescue_lumi_done` sin dramatismo.
Ajuste: `RescueMode.css` `.pulse-wind` usaba keyframe inexistente `breath` (1.5 s); ahora `rescue-breath` 4 s + `prefers-reduced-motion` (sin transiciones de esfera ni animaciones).
Descartado: Lumi en la respiración de RescueMode (la esfera ya es la guía de 4-4-4 s y ocupa toda la pantalla; dos figuras compiten y confunden el ritmo). Pendiente por diseño: sesión completada/logro (Achievements/ChestAnimation) y estado vacío se dejan para EXP-08 tras aprobar EXP-05.
