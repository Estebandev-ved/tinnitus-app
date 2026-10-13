---
description: Jornada automática de agentes — lee tareas pendientes, delega en paralelo y registra en daily_log.md
---

Ejecuta una jornada de trabajo del sistema de agentes de TinnitOff. Argumentos opcionales: $ARGUMENTS
(p. ej. nombres de agentes o áreas; si están vacíos, usa todos).

1. Lee `.claude/rules/agent-workflow.md`, `.claude/daily_log.md` y cada `.claude/tasks/*.md`.
2. Elige por agente la tarea pendiente P0 más importante que **no** esté marcada 🧑 ni bloqueada.
   Las tareas 🧑 se listan al usuario como "necesitan tu decisión".
3. Lanza los agentes correspondientes **en paralelo** (solo los que trabajen áreas independientes;
   si dos tocan los mismos archivos, ejecútalos en secuencia).
4. Verifica que cada agente marcó su tarea y escribió en `daily_log.md`; si no, regístralo tú.
5. Termina con un resumen: hecho hoy, bloqueado, decisiones que necesito del usuario, y qué sigue.
   No hagas commits, pushes ni deploys.
