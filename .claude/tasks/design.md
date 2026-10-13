# Tareas – design-agent

## Pendientes
- [x] DSN-01 · P1 · Crear proyecto en Stitch "TinnitOff" y un sistema de diseño a partir de `.claude/rules/mobile-design-system.md` (dark, primario #4A90D9, Inter/Outfit, radios 12–16). Registrar IDs en el log. (hecho 2026-09-29: proyecto `17807983649510366296`, design system `assets/8635978786255707827`)
- [ ] DSN-02 · P1 · Generar en Stitch (MOBILE) 4 pantallas: Dashboard, Sesión diaria guiada, Biblioteca de sonidos, Asistente/Chat. (2026-09-29 parcial: Chat `01167e07888b413298dd5b7933baf09d` OK; Sesión diaria `f050dc1cad724dde956461db3659b07e` salió DESKTOP, regenerar MOBILE; Dashboard y Sonidos dieron timeout; list_screens devolvió vacío, reverificar antes de reintentar) (2026-09-29 #2: list_screens sigue vacío; Dashboard reintento dio ECONNRESET, posible creación sin ID recuperable; 🧑 confirmar en la UI de Stitch qué pantallas existen antes de generar Dashboard/Sesión/Sonidos)
- [ ] DSN-03 · P1 🧑 · Presentar las pantallas al usuario y recoger aprobación/cambios (`edit_screens` / `generate_variants`).
- [ ] DSN-04 · P1 · Trasladar tokens aprobados (colores, tipografía, radios, espaciado) a variables CSS en `src/index.css`, sin romper el tema actual.
- [ ] DSN-05 · P2 · Implementar pantallas aprobadas en React, una por una, sin cambiar lógica; verificar con build y navegador móvil (375px).
- [ ] DSN-06 · P2 · Estados vacíos con ilustración (ver mobile-design-system.md §10) y onboarding de máx. 4 pantallas.
- [ ] DSN-07 · P2 · Gráficas de salud (Recharts) con colores y bandas de referencia según §7 del sistema de diseño.
- [ ] DSN-08 · P2 · Pantalla de recursos de crisis y de "beta/experimental" con tono calmado (coordinar con `compliance-agent`).

## Hechas
_(vacío)_
