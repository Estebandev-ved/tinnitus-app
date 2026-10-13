# Tareas – stitch-to-code-agent

Proyecto Stitch `17807983649510366296` · design system `assets/8635978786255707827` (TinnitOff Calm Dark) · todas MOBILE.
Usar `get_screen` con el ID (list_screens está desactualizado).
Pantallas aprobadas por el usuario en EXP-05; ajustes pendientes: quitar "48 dB" inventado, tabs según el sistema de diseño,
copy de "líneas de ayuda" a cargo de compliance (CMP-02).

## Pendientes
> Decisión del usuario (2026-09-29): se MANTIENE la paleta actual de la app (azul/teal de `index.css`); no migrar a la paleta Stitch. Replicar layout, jerarquía, radios, espaciado y tipografía con variables existentes; `--ds-*` solo para lo no-color.
- [x] S2C-01 · P0 · Preparación: `get_screen` de las 5 pantallas, guardar capturas en el scratchpad, y extraer tokens (colores, tipografía, radios, espaciado). Listar tokens que faltan en `src/index.css` y añadirlos como variables. (hecho 2026-09-29)
- [x] S2C-02 · P1 · (hecho 2026-09-29) **Inicio** `4faffd3fc5fe4b5dae0cea34df2a05f9` → `DashboardHome` (Lumi + estado del día). Tabs: usar los del sistema de diseño, no los del mockup 🧑 si hay conflicto.
- [ ] S2C-03 · P1 · **Sesión de sonido con escena** `42115cd6aefc4bda99d23fbd57af33fe` → `SoundLibrary`/`SpatialAudio`. Sin datos inventados (dB); volumen real y seguro.
- [ ] S2C-04 · P1 · **Respiración guiada** `39ee5849c4254143a48fd84af501b6ed` → `BreathingGuide` / base `BreathingPacer` (fases ≥ 4 s, reduced-motion, guía visual y textual).
- [ ] S2C-05 · P1 · **Logro/racha** `11ad87930cb641698927ffacea739920` → `Achievements`/`ChestAnimation`; tono compasivo, sin urgencia.
- [ ] S2C-06 · P1 · **Modo calma/crisis** `b1b738bbf2734e60bf05a5733f6b4bd3` → `RescueMode`; copy de "líneas de ayuda": lo decide el proyecto; `compliance-agent` elige la mejor opción (CMP-02), ya no requiere 🧑.
- [ ] S2C-07 · P1 · Revisión responsive y de estados (loading/error/vacío) de las 5 pantallas a 360/375/414 px y en modo "reducir movimiento".
- [ ] S2C-08 · P2 · Pantallas restantes de la app (Tracker, Progreso, Perfil, Comunidad, Login/Onboarding): tras generar y aprobar su diseño en Stitch (handoff a `design-agent`), replicarlas una por una.
- [ ] S2C-09 · P2 · Guía corta en `DELIVERABLES/` de cómo replicar una pantalla nueva de Stitch (para mantener el proceso).

## Hechas
_(vacío)_
