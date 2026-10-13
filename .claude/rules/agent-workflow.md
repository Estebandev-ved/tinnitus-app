# Flujo de Agentes – TinnitOff

## Agentes disponibles (`.claude/agents/`)

| Agente | Responsabilidad | Lista de tareas |
|---|---|---|
| `security-agent` | Reglas Firestore, JWT, backend, secretos | `.claude/tasks/security.md` |
| `ai-proxy-agent` | Proxy de IA (Azure), seguridad del chat | `.claude/tasks/ai-proxy.md` |
| `compliance-agent` | Privacidad, borrado de cuenta, moderación, crisis | `.claude/tasks/compliance.md` |
| `frontend-qa-agent` | Lint, tests, accesibilidad, i18n, limpieza | `.claude/tasks/frontend-qa.md` |
| `design-agent` | Stitch (MCP) + implementación del rediseño | `.claude/tasks/design.md` |
| `experience-agent` | Personajes, escenas interactivas y eventos (Stitch + Framer Motion) | `.claude/tasks/experience.md` |
| `stitch-to-code-agent` | Replica en React/CSS las pantallas aprobadas de Stitch | `.claude/tasks/stitch-to-code.md` |
| `release-agent` | Build, versiones, assets y envío a tiendas | `.claude/tasks/release.md` |

## Reglas para el chat principal

1. Cuando el usuario pida algo que encaje con un agente, **delegar con la herramienta Agent** usando su `subagent_type`.
   Si abarca varios, lanzarlos en paralelo (áreas independientes).
2. Cada agente trabaja **solo su lista de tareas**. Si descubre trabajo de otra área, lo anota como
   handoff en `daily_log.md` y en la lista del agente correspondiente (línea nueva bajo "Pendientes").
3. **Todo** lo hecho se registra en `.claude/daily_log.md` (los agentes lo hacen ellos mismos; el chat
   registra lo que hace directamente).
4. Al terminar un turno de trabajo, el chat resume al usuario: qué se hizo, qué quedó bloqueado y qué sigue.
5. Nunca hacer `git commit`, `git push`, `firebase deploy`, ni acciones en Play Console sin confirmación
   explícita del usuario en el chat.
6. Tareas marcadas 🧑 requieren decisión o acción humana: los agentes las dejan preparadas y avisan.

## Formato de tarea (en `.claude/tasks/*.md`)

`- [ ] ID · Título — detalle breve` (P0 = bloqueante de lanzamiento, P1 = importante, P2 = mejora)
Al completar: cambiar a `- [x]` y añadir `(hecho 2026-MM-DD)`.
