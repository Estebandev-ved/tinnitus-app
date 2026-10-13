# Tareas – frontend-qa-agent

## Pendientes
- [x] QA-01 · P0 · hecho en lo propio (2026-10-10): 18 -> 3 warnings (0 errores). `argsIgnorePattern: '^[A-Z_]'` en eslint.config.js elimina los 2 falsos positivos `Icon` (eslint-plugin-react no esta instalado). FacialMonitor (ref en cleanup) y VoiceDiary (synthRef) corregidos; 11 exhaustive-deps riesgosos con `eslint-disable-next-line ... -- motivo` (AdminDashboard, DigitalTwin, FacialMonitor, OnboardingWizard, ProgressNotes, SideQuestsWidget, SoundLibrary, UserProfile, Linterna/Mezclador/Periferica). Quitada la prop muerta `previousTHI` en App.jsx y OnboardingWizard. Quedan 3 en archivos de otros agentes: AIChat:324, RescueMode:81/87.
- [ ] QA-02 · P0 🧑 · Carpeta `web/` (66 archivos versionados, con su propio `package.json`/`node_modules`) duplica `public/`/landing. Investigar qué contiene, proponer eliminarla o separarla, y esperar decisión. Excluirla de eslint mientras tanto.
  - 2026-09-29: investigado, NO borrado. `web/` es un sitio/portal distinto (React 18, admin de 10 páginas, Planes, Legal) y `docker-compose.yml` monta `./web/dist` en nginx; Firebase Hosting sirve `public/*.html`. 🧑 Decidir: adoptar web/ como sitio oficial o descartarlo (y ajustar docker-compose).
- [ ] QA-03 · P1 · Tests de flujos críticos: Login/Onboarding, `GuidedDailySession`, `THIQuestionnaire` (cálculo de puntaje), `DailyTracker`.
- [ ] QA-04 · P1 · Tests de `firestoreService` ampliados (errores de red, usuario sin sesión).
- [ ] QA-05 · P1 · Accesibilidad: `aria-label` en botones de icono, foco atrapado y Escape en modales, alternativa visual a señales de audio.
- [ ] QA-06 · P1 · i18n: buscar textos hardcodeados fuera del sistema de traducciones y migrarlos (ES/EN).
- [ ] QA-07 · P1 · Estados vacío/carga/error en pantallas principales (Dashboard, Tracker, Sonidos, Comunidad); skeletons en vez de spinners.
- [ ] QA-08 · P2 · Rendimiento: lazy-load de Three.js y face-api solo en sus vistas; revisar tamaño de chunks tras `npm run build`.
- [ ] QA-09 · P2 · Dividir archivos gigantes (`VibeTripLogger` 1036 líneas, `AdminDashboard` 945, `AIChat` 758, `App.jsx` 705) sin cambiar comportamiento.
- [ ] QA-10 · P2 · PropTypes faltantes en componentes.

## Hechas
_(vacío)_
