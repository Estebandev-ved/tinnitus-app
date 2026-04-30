// Generado por ORQUESTADOR
// Fases: 1. Percepción (Días 1-7), 2. Atención (Días 8-14), 3. Emoción (Días 15-21), 4. Habituación (Días 22-30)

export const sessionProgram = [
  // FASE 1: PERCEPCIÓN (Semana 1: Notar sin asustar)
  { day: 1, title: 'Efecto Nevera', steps: [{ type: 'nevera', duration: 180 }] },
  { day: 2, title: 'Efecto Nevera II', steps: [{ type: 'nevera', duration: 180 }] },
  { day: 3, title: 'Conoce el Mezclador', steps: [{ type: 'mezclador', duration: 240 }] },
  { day: 4, title: 'Mezcla y Suelta', steps: [{ type: 'mezclador', duration: 240 }] },
  { day: 5, title: 'Linterna Básica', steps: [{ type: 'linterna', duration: 120 }] },
  { day: 6, title: 'Linterna Media', steps: [{ type: 'linterna', duration: 180 }] },
  { day: 7, title: 'Repaso Semana 1', steps: [{ type: 'nevera', duration: 120 }, { type: 'mezclador', duration: 120 }] },

  // FASE 2: ATENCIÓN (Semana 2: Cambiar foco auditivo)
  { day: 8, title: 'Escucha Periférica', steps: [{ type: 'periferica', duration: 180 }] },
  { day: 9, title: 'Escucha Periférica II', steps: [{ type: 'periferica', duration: 240 }] },
  { day: 10, title: 'Linterna Avanzada', steps: [{ type: 'linterna', duration: 240 }] },
  { day: 11, title: 'Mezclador Activo', steps: [{ type: 'mezclador', duration: 180 }] },
  { day: 12, title: 'El Monstruo Llega', steps: [{ type: 'monstruo', duration: 120 }] },
  { day: 13, title: 'Combate Monstruo', steps: [{ type: 'monstruo', duration: 180 }] },
  { day: 14, title: 'Repaso Semana 2', steps: [{ type: 'periferica', duration: 180 }, { type: 'monstruo', duration: 120 }] },

  // FASE 3: EMOCIÓN (Semana 3: Quitar miedo)
  { day: 15, title: 'Monstruo Real', steps: [{ type: 'monstruo', duration: 180 }] },
  { day: 16, title: 'Monstruo Débil', steps: [{ type: 'monstruo', duration: 240 }] },
  { day: 17, title: 'Efecto Nevera III', steps: [{ type: 'nevera', duration: 180 }] },
  { day: 18, title: 'Mezclador Emocional', steps: [{ type: 'mezclador', duration: 240 }] },
  { day: 19, title: 'Linterna y Foco', steps: [{ type: 'linterna', duration: 240 }] },
  { day: 20, title: 'Escucha Periférica III', steps: [{ type: 'periferica', duration: 180 }] },
  { day: 21, title: 'Repaso Semana 3', steps: [{ type: 'monstruo', duration: 180 }, { type: 'linterna', duration: 120 }] },

  // FASE 4: HABITUACIÓN (Semana 4: Integración final)
  { day: 22, title: 'Mezclador Final', steps: [{ type: 'mezclador', duration: 240 }] },
  { day: 23, title: 'Periférica Final', steps: [{ type: 'periferica', duration: 240 }] },
  { day: 24, title: 'Monstruo Vencido', steps: [{ type: 'monstruo', duration: 180 }] },
  { day: 25, title: 'Linterna Maestra', steps: [{ type: 'linterna', duration: 240 }] },
  { day: 26, title: 'Efecto Nevera IV', steps: [{ type: 'nevera', duration: 180 }] },
  { day: 27, title: 'Prueba Aleatoria', steps: [{ type: 'mezclador', duration: 120 }, { type: 'periferica', duration: 120 }] },
  { day: 28, title: 'Prueba Aleatoria II', steps: [{ type: 'monstruo', duration: 120 }, { type: 'linterna', duration: 120 }] },
  { day: 29, title: 'Prueba Final', steps: [{ type: 'nevera', duration: 120 }, { type: 'monstruo', duration: 120 }] },
  { day: 30, title: 'Graduación', steps: [{ type: 'mezclador', duration: 180 }, { type: 'periferica', duration: 180 }] },
];
