/**
 * Base de datos estructurada de planes semanales y tareas guiadas para el tinnitus.
 * Combina Terapia de Reentrenamiento del Tinnitus (TRT), TCC Auditiva y Neuroplasticidad.
 *
 * Cada tarea incluye metadata enriquecida:
 * - categoryLabel: nombre legible de la categoría
 * - categoryColor: color hex de la categoría
 * - difficulty: basic | intermediate | advanced
 * - benefit: beneficio clínico en 1 línea
 * - tip: consejo práctico para el usuario
 */

export const CATEGORY_META = {
  sound:       { label: 'Terapia de Sonido', color: '#00B4D8', gradient: 'linear-gradient(135deg, #00B4D8, #0077B6)' },
  relaxation:  { label: 'Respiración',       color: '#2DD4BF', gradient: 'linear-gradient(135deg, #2DD4BF, #14B8A6)' },
  cbt:         { label: 'TCC',               color: '#A78BFA', gradient: 'linear-gradient(135deg, #A78BFA, #8B5CF6)' },
  journal:     { label: 'Diario Clínico',    color: '#F472B6', gradient: 'linear-gradient(135deg, #F472B6, #EC4899)' },
  tracker:     { label: 'Seguimiento',        color: '#FBBF24', gradient: 'linear-gradient(135deg, #FBBF24, #F59E0B)' },
  somatic:     { label: 'Somático',           color: '#FB923C', gradient: 'linear-gradient(135deg, #FB923C, #F97316)' },
  audio_check: { label: 'Calibración',        color: '#38BDF8', gradient: 'linear-gradient(135deg, #38BDF8, #0EA5E9)' },
  ai_chat:     { label: 'Asistente IA',       color: '#C084FC', gradient: 'linear-gradient(135deg, #C084FC, #A855F7)' },
};

export const WEEKLY_EXERCISES_DATABASE = {
  1: {
    weekTitle: 'Semana 1: Calibración y Desacople de Alarma',
    weekSubtitle: 'Comprende tu tinnitus y reduce la respuesta inicial de alerta del sistema nervioso.',
    days: {
      1: {
        title: 'Evaluación y Primer Sonido Terapéutico',
        subtitle: 'Inicio de la habituación auditiva y calma física.',
        focus: 'Primer contacto con la terapia sonora',
        totalMinutes: 23,
        tasks: [
          {
            id: 'w1d1_t1',
            title: 'Terapia Sonora Notched Inicial',
            category: 'sound',
            durationMinutes: 15,
            icon: 'Headphones',
            description: 'Escucha el ruido enmascarador configurado a tu frecuencia medida para desensibilizar la corteza auditiva.',
            targetComponent: 'custom_noise',
            props: { preset: 'pink_notched' },
            categoryLabel: 'Terapia de Sonido',
            categoryColor: '#00B4D8',
            difficulty: 'basic',
            benefit: 'Reduce la hipersensibilidad cortical a tu frecuencia específica',
            tip: 'Usa auriculares cómodos y mantén un volumen suave',
          },
          {
            id: 'w1d1_t2',
            title: 'Respiración Anti-Alarma (4-7-8)',
            category: 'relaxation',
            durationMinutes: 5,
            icon: 'Wind',
            description: 'Activa el sistema nervioso parasimpático para reducir la tensión que amplifica la percepción del pitido.',
            targetComponent: 'breathing',
            categoryLabel: 'Respiración',
            categoryColor: '#2DD4BF',
            difficulty: 'basic',
            benefit: 'Calma la respuesta de estrés que intensifica el tinnitus',
            tip: 'Busca un lugar tranquilo y mantén los hombros relajados',
          },
          {
            id: 'w1d1_t3',
            title: 'Diario de Impacto Inicial',
            category: 'journal',
            durationMinutes: 3,
            icon: 'Mic',
            description: 'Graba o escribe brevemente cómo se siente tu oído hoy y tu nivel de molestia (0 a 10).',
            targetComponent: 'voice_diary',
            categoryLabel: 'Diario Clínico',
            categoryColor: '#F472B6',
            difficulty: 'basic',
            benefit: 'Establece una línea base para medir tu progreso',
            tip: 'Sé honesto con tu valoración, no hay respuestas incorrectas',
          }
        ]
      },
      2: {
        title: 'Psicoeducación Auditiva y Filtro Sonoro',
        subtitle: 'Cambiando la etiqueta de peligro en el cerebro.',
        focus: 'Aprender la neurociencia detrás del tinnitus',
        totalMinutes: 24,
        tasks: [
          {
            id: 'w1d2_t1',
            title: 'Lectura Guiada: La Neurociencia del Tinnitus',
            category: 'cbt',
            durationMinutes: 7,
            icon: 'BookOpen',
            description: 'Aprende por qué el filtro tálamo-cortical detecta el tinnitus y cómo podemos reprogramarlo.',
            targetComponent: 'education',
            props: { articleId: 'neuroscience_basics' },
            categoryLabel: 'TCC',
            categoryColor: '#A78BFA',
            difficulty: 'basic',
            benefit: 'Comprender reduce el miedo y facilita la habituación',
            tip: 'Tómate tu tiempo para internalizar cada concepto',
          },
          {
            id: 'w1d2_t2',
            title: 'Sesión de Lluvia Notch / Agua Fluyente',
            category: 'sound',
            durationMinutes: 15,
            icon: 'Volume2',
            description: 'Sonido de lluvia natural ajustado para crear un contraste auditivo suave sin tapar totalmente tu acúfeno.',
            targetComponent: 'sound_library',
            props: { track: 'soft_rain' },
            categoryLabel: 'Terapia de Sonido',
            categoryColor: '#00B4D8',
            difficulty: 'basic',
            benefit: 'Enriquecimiento ambiental que desactiva la alerta auditiva',
            tip: 'Escucha a volumen bajo, como un fondo natural',
          },
          {
            id: 'w1d2_t3',
            title: 'Chequeo Diario de Molestia',
            category: 'tracker',
            durationMinutes: 2,
            icon: 'Calendar',
            description: 'Registra tus detonantes del día (estrés, cafeína, ruido).',
            targetComponent: 'daily_tracker',
            categoryLabel: 'Seguimiento',
            categoryColor: '#FBBF24',
            difficulty: 'basic',
            benefit: 'Identificar patrones te ayuda a controlar los brotes',
            tip: 'Registra también el sueño y el nivel de energía',
          }
        ]
      },
      3: {
        title: 'Desacople de Pensamientos Catastróficos',
        subtitle: 'TCC: Rompiendo el bucle atencional.',
        focus: 'Reestructurar pensamientos negativos sobre el tinnitus',
        totalMinutes: 25,
        tasks: [
          {
            id: 'w1d3_t1',
            title: 'Ejercicio TCC: Identificación de Filtros Mentales',
            category: 'cbt',
            durationMinutes: 10,
            icon: 'Brain',
            description: 'Identifica frases como "este ruido no me dejará dormir jamás" y reemplázalas por afirmaciones neutras.',
            targetComponent: 'cbt_session',
            props: { module: 'reframing_1' },
            categoryLabel: 'TCC',
            categoryColor: '#A78BFA',
            difficulty: 'intermediate',
            benefit: 'Rompe el ciclo de catastrofización que amplifica el sufrimiento',
            tip: 'Escribe las frases y sus reemplazos para mayor efectividad',
          },
          {
            id: 'w1d3_t2',
            title: 'Inmersión Sonora Espacial 3D',
            category: 'sound',
            durationMinutes: 15,
            icon: 'Headphones',
            description: 'Mueve el foco de atención en un entorno 3D para entrenar a tu cerebro a desplazar el tinnitus fuera del centro.',
            targetComponent: 'spatial_audio',
            categoryLabel: 'Terapia de Sonido',
            categoryColor: '#00B4D8',
            difficulty: 'intermediate',
            benefit: 'Entrena la plasticidad auditiva y la reorientación atencional',
            tip: 'Intenta distinguir los sonidos de izquierda y derecha',
          }
        ]
      },
      4: {
        title: 'Relajación de ATM y Músculos Cervicales',
        subtitle: 'Modulación somatosensorial del tinnitus.',
        focus: 'Liberar tensión facial que intensifica el tinnitus',
        totalMinutes: 23,
        tasks: [
          {
            id: 'w1d4_t1',
            title: 'Escaneo Facial y Tensión de Mandíbula',
            category: 'somatic',
            durationMinutes: 8,
            icon: 'ScanFace',
            description: 'Verifica la tensión bruxista y muscular facial que intensifica el ruido por la vía del nervio trigémino.',
            targetComponent: 'facial_monitor',
            categoryLabel: 'Somático',
            categoryColor: '#FB923C',
            difficulty: 'basic',
            benefit: 'Reduce la modulación somatosensorial del tinnitus',
            tip: 'Mastica suavemente y relaja la mandíbula al respirar',
          },
          {
            id: 'w1d4_t2',
            title: 'Terapia de Ruido Blanco Táctil',
            category: 'sound',
            durationMinutes: 15,
            icon: 'Sliders',
            description: 'Ajuste fino de ecualización personalizada para neutralizar picos auditivos.',
            targetComponent: 'custom_noise',
            categoryLabel: 'Terapia de Sonido',
            categoryColor: '#00B4D8',
            difficulty: 'intermediate',
            benefit: 'Ajuste personalizado que maximiza el confort sonoro',
            tip: 'Experimenta con diferentes configuraciones de ecualización',
          }
        ]
      },
      5: {
        title: 'Higiene del Sueño y Descanso Activo',
        subtitle: 'Preparando el entorno nocturno.',
        focus: 'Dormir mejor con tinnitus',
        totalMinutes: 20,
        tasks: [
          {
            id: 'w1d5_t1',
            title: 'Configuración de Audio Nocturno',
            category: 'sound',
            durationMinutes: 15,
            icon: 'Moon',
            description: 'Establece tu temporizador de sonido enriquecido para evitar el silencio absoluto al ir a dormir.',
            targetComponent: 'sound_library',
            props: { preset: 'night_masking' },
            categoryLabel: 'Terapia de Sonido',
            categoryColor: '#00B4D8',
            difficulty: 'basic',
            benefit: 'Elimina el silencio que intensifica el tinnitus nocturno',
            tip: 'Configura el temporizador para que se apague gradualmente',
          },
          {
            id: 'w1d5_t2',
            title: 'Respiración Guiada Diafragmática',
            category: 'relaxation',
            durationMinutes: 5,
            icon: 'Wind',
            description: 'Calma el nervio vago antes de acostarte.',
            targetComponent: 'breathing',
            categoryLabel: 'Respiración',
            categoryColor: '#2DD4BF',
            difficulty: 'basic',
            benefit: 'Activa el sistema parasimpático para un sueño profundo',
            tip: 'Practica en la cama, con las luces bajas',
          }
        ]
      },
      6: {
        title: 'Reorientación Atencional Guiada',
        subtitle: 'Entrenando la plasticidad del cerebro.',
        focus: 'Afinar la percepción auditiva y reflexionar',
        totalMinutes: 15,
        tasks: [
          {
            id: 'w1d6_t1',
            title: 'Sesión de Frecuencia Fina',
            category: 'audio_check',
            durationMinutes: 10,
            icon: 'Sliders',
            description: 'Recalibra tu tono si ha cambiado su tono o intensidad esta semana.',
            targetComponent: 'frequency_matcher',
            categoryLabel: 'Calibración',
            categoryColor: '#38BDF8',
            difficulty: 'intermediate',
            benefit: 'Ajustar la terapia a cambios sutiles en tu percepción',
            tip: 'Hazlo en un ambiente silencioso para mayor precisión',
          },
          {
            id: 'w1d6_t2',
            title: 'Diario de Reflexión Emocional',
            category: 'journal',
            durationMinutes: 5,
            icon: 'Mic',
            description: 'Registra cómo ha cambiado la forma en que reaccionas ante el zumbido.',
            targetComponent: 'voice_diary',
            categoryLabel: 'Diario Clínico',
            categoryColor: '#F472B6',
            difficulty: 'basic',
            benefit: 'Consolida los aprendizajes y refuerza los cambios positivos',
            tip: 'Menciona momentos en que olvidaste el tinnitus',
          }
        ]
      },
      7: {
        title: 'Evaluación de Progreso Semanal',
        subtitle: 'Midiendo la desensibilización.',
        focus: 'Revisar logros y preparar la siguiente semana',
        totalMinutes: 25,
        tasks: [
          {
            id: 'w1d7_t1',
            title: 'Registro de Habituación Semanal',
            category: 'tracker',
            durationMinutes: 5,
            icon: 'Trophy',
            description: 'Revisa tu racha y tus gráficos de avance durante los últimos 7 días.',
            targetComponent: 'daily_tracker',
            categoryLabel: 'Seguimiento',
            categoryColor: '#FBBF24',
            difficulty: 'basic',
            benefit: 'Visualizar el progreso refuerza la motivación',
            tip: 'Compara tu nivel de molestia con el Día 1',
          },
          {
            id: 'w1d7_t2',
            title: 'Sesión Guiada de Integración Sonora',
            category: 'sound',
            durationMinutes: 20,
            icon: 'Headphones',
            description: 'Consolida lo aprendido en la Semana 1 con tu mapa sonoro completo.',
            targetComponent: 'guided_session',
            categoryLabel: 'Terapia de Sonido',
            categoryColor: '#00B4D8',
            difficulty: 'advanced',
            benefit: 'Integra todos los sonidos terapéuticos en una sesión completa',
            tip: 'Es la sesión más larga de la semana, relájate y disfrútala',
          }
        ]
      }
    }
  },
  2: {
    weekTitle: 'Semana 2: Desensibilización Auditiva Profunda',
    weekSubtitle: 'Modula la atención periférica y fortalece la tolerancia consciente.',
    days: {
      1: {
        title: 'Inmersión Notched Ampliada',
        subtitle: 'Incrementando progresivamente el tiempo de filtro.',
        focus: 'Fortalecer la terapia sonora con sesiones más largas',
        totalMinutes: 28,
        tasks: [
          {
            id: 'w2d1_t1',
            title: 'Terapia Notched 20 min',
            category: 'sound',
            durationMinutes: 20,
            icon: 'Headphones',
            description: 'Estimulación auditiva continua con muesca espectral en tu frecuencia exacta.',
            targetComponent: 'custom_noise',
            categoryLabel: 'Terapia de Sonido',
            categoryColor: '#00B4D8',
            difficulty: 'intermediate',
            benefit: 'Mayor tiempo de exposición acelera la habituación cortical',
            tip: 'Puedes hacer otras actividades tranquilas mientras escuchas',
          },
          {
            id: 'w2d1_t2',
            title: 'TCC: Desencuadre de Catástrofe',
            category: 'cbt',
            durationMinutes: 8,
            icon: 'Brain',
            description: 'Estrategias de desacople de la emoción del sonido.',
            targetComponent: 'cbt_session',
            categoryLabel: 'TCC',
            categoryColor: '#A78BFA',
            difficulty: 'intermediate',
            benefit: 'Aprende a separar el sonido de la emoción negativa',
            tip: 'Repite los ejercicios de reframing mental cuando sientas ansiedad',
          }
        ]
      },
      2: {
        title: 'Discriminación Atencional Bimodal',
        subtitle: 'Alternando el foco entre sonidos externos y música.',
        focus: 'Entrenar la atención selectiva auditiva',
        totalMinutes: 21,
        tasks: [
          {
            id: 'w2d2_t1',
            title: 'Audio Espacial 3D Avanzado',
            category: 'sound',
            durationMinutes: 15,
            icon: 'Headphones',
            description: 'Práctica de atención focalizada en estímulos binaurales periféricos.',
            targetComponent: 'spatial_audio',
            categoryLabel: 'Terapia de Sonido',
            categoryColor: '#00B4D8',
            difficulty: 'advanced',
            benefit: 'Desarrolla la capacidad de dirigir la atención auditiva',
            tip: 'Cierra los ojos y visualiza las fuentes de sonido en 3D',
          },
          {
            id: 'w2d2_t2',
            title: 'Respiración de Coherencia Cardíaca',
            category: 'relaxation',
            durationMinutes: 6,
            icon: 'Wind',
            description: 'Normalización del ritmo cardíaco y presión sanguínea.',
            targetComponent: 'breathing',
            categoryLabel: 'Respiración',
            categoryColor: '#2DD4BF',
            difficulty: 'intermediate',
            benefit: 'Sincroniza corazón y respiración para máxima calma',
            tip: 'Inhala 5s, exhala 5s durante 6 minutos',
          }
        ]
      },
      3: {
        title: 'Control de Somatización y Cuello',
        subtitle: 'Reduciendo modulación cervicogénica.',
        focus: 'Aliviar la tensión física que alimenta el tinnitus',
        totalMinutes: 23,
        tasks: [
          {
            id: 'w2d3_t1',
            title: 'Monitoreo de Tensión Bio-Facial',
            category: 'somatic',
            durationMinutes: 8,
            icon: 'ScanFace',
            description: 'Detección visual de micro-expresiones de estrés auditivo.',
            targetComponent: 'facial_monitor',
            categoryLabel: 'Somático',
            categoryColor: '#FB923C',
            difficulty: 'intermediate',
            benefit: 'Identificar y liberar la tensión que intensifica el acúfeno',
            tip: 'Masajea suavemente los músculos marked como tensos',
          },
          {
            id: 'w2d3_t2',
            title: 'Sonido de Enmascaramiento Dinámico',
            category: 'sound',
            durationMinutes: 15,
            icon: 'Volume2',
            description: 'Uso de ondas marinas moduladas a tu frecuencia.',
            targetComponent: 'sound_library',
            categoryLabel: 'Terapia de Sonido',
            categoryColor: '#00B4D8',
            difficulty: 'intermediate',
            benefit: 'Enmascaramiento dinámico que se adapta a tu percepción',
            tip: 'Ajusta el volumen según tu nivel de comodidad',
          }
        ]
      },
      4: {
        title: 'Asistente Virtual e IA Terapéutica',
        subtitle: 'Resuelve dudas clínicas de tu caso.',
        focus: 'Aprovechar la inteligencia artificial para tu tratamiento',
        totalMinutes: 10,
        tasks: [
          {
            id: 'w2d4_t1',
            title: 'Consulta Guiada con la IA TinnitOff',
            category: 'ai_chat',
            durationMinutes: 10,
            icon: 'Brain',
            description: 'Hazle preguntas sobre tus síntomas o sensaciones de hoy a nuestro modelo entrenado.',
            targetComponent: 'ai_chat',
            categoryLabel: 'Asistente IA',
            categoryColor: '#C084FC',
            difficulty: 'basic',
            benefit: 'Clarifica dudas y obtén orientación personalizada',
            tip: 'Describe tus síntomas con el mayor detalle posible',
          }
        ]
      },
      5: {
        title: 'Habituación Nocturna Avanzada',
        subtitle: 'Entrenando la desconexión pre-sueño.',
        focus: 'Dormir plenamente con tinnitus',
        totalMinutes: 20,
        tasks: [
          {
            id: 'w2d5_t1',
            title: 'Paisaje Sonoro de Confort Nocturno',
            category: 'sound',
            durationMinutes: 20,
            icon: 'Moon',
            description: 'Mezcla de ruídos ambientales para acelerar la latencia de sueño.',
            targetComponent: 'sound_library',
            categoryLabel: 'Terapia de Sonido',
            categoryColor: '#00B4D8',
            difficulty: 'intermediate',
            benefit: 'Crea un entorno sonoro que favorece el sueño reparador',
            tip: 'Combina con respiración diafragmática para mejores resultados',
          }
        ]
      },
      6: {
        title: 'Diario de Progreso y Resiliencia',
        subtitle: 'Consolidando hábitos positivos.',
        focus: 'Reconocer y celebrar los avances',
        totalMinutes: 5,
        tasks: [
          {
            id: 'w2d6_t1',
            title: 'Registro de Logros Auditivos',
            category: 'journal',
            durationMinutes: 5,
            icon: 'Mic',
            description: 'Anota los momentos del día en que pasaste por alto el tinnitus.',
            targetComponent: 'voice_diary',
            categoryLabel: 'Diario Clínico',
            categoryColor: '#F472B6',
            difficulty: 'basic',
            benefit: 'Refuerza positivamente los momentos de habituación natural',
            tip: 'Incluso 5 minutos sin pensar en el tinnitus es un logro',
          }
        ]
      },
      7: {
        title: 'Cierre de Semana 2 y Reevaluación',
        subtitle: 'Verificando la bajada en el impacto THI.',
        focus: 'Medir el progreso y planificar la siguiente fase',
        totalMinutes: 5,
        tasks: [
          {
            id: 'w2d7_t1',
            title: 'Revisión de Racha y Estadísticas',
            category: 'tracker',
            durationMinutes: 5,
            icon: 'Trophy',
            description: 'Constata la evolución de tus días con menos intrusividad.',
            targetComponent: 'daily_tracker',
            categoryLabel: 'Seguimiento',
            categoryColor: '#FBBF24',
            difficulty: 'basic',
            benefit: 'Ver el progreso cuantitativo motiva a continuar',
            tip: 'Compara tu THI actual con el de la semana 1',
          }
        ]
      }
    }
  }
};

/**
 * Obtiene el objeto de día y tareas para una semana y día específicos.
 * Si excede las semanas de la BD, aplica una rotación dinámica inteligente.
 */
export const getDayExercisePlan = (weekNumber = 1, dayNumber = 1) => {
  const maxWeeksInDb = Object.keys(WEEKLY_EXERCISES_DATABASE).length;
  const effectiveWeek = ((weekNumber - 1) % maxWeeksInDb) + 1;
  const weekData = WEEKLY_EXERCISES_DATABASE[effectiveWeek] || WEEKLY_EXERCISES_DATABASE[1];

  const clampedDay = Math.max(1, Math.min(7, dayNumber));
  const dayPlan = weekData.days[clampedDay] || weekData.days[1];

  return {
    weekNumber,
    weekTitle: weekData.weekTitle,
    weekSubtitle: weekData.weekSubtitle,
    dayNumber: clampedDay,
    dayTitle: dayPlan.title,
    daySubtitle: dayPlan.subtitle,
    dayFocus: dayPlan.focus || '',
    dayTotalMinutes: dayPlan.totalMinutes || dayPlan.tasks.reduce((s, t) => s + t.durationMinutes, 0),
    tasks: dayPlan.tasks
  };
};
