// Generado por PSICÓLOGO TCC y GAME DESIGNER

export const tccMechanics = {
  // 1. Efecto Nevera (Tinder Swipe)
  nevera: {
    tipo: 'swipe_tinder',
    logica: 'Mostrar tarjeta con sonido escrito. Swipe DERECHA = Alerta (Tigre, Ladrón). Swipe IZQUIERDA = Ignorable (Nevera, Viento, Tinnitus).',
    script_psicologo: 'Tu cerebro filtra ruidos inútiles (como la nevera) y te alerta de peligros. El tinnitus es ruido de nevera. Clasifícalo como "Ignorable" para que el cerebro deje de vigilarlo.',
    tecnico: 'Array de objetos {id, nombre, tipo}. Touch drag event. Actualizar UI según dirección de swipe.'
  },

  // 2. Mezclador (Sliders)
  mezclador: {
    tipo: 'sliders_volumen',
    logica: 'Pantalla con 2 sliders. Slider A: Ruido Blanco/Rosa (sonido de fondo). Slider B: Tinnitus artificial. Tarea: Ajustar fondo para que el tinnitus se escuche pero no moleste (Punto de Mezcla).',
    script_psicologo: 'El error es intentar tapar el tinnitus al 100%. Si lo tapas, el cerebro lo busca más. Mezcla el sonido ambiente para que el zumbido se confunda en el fondo.',
    tecnico: 'AudioEngine.play(ruido_blanco). AudioEngine.play(tono_generado). <input type="range"> vinculados a gainNode.value.'
  },

  // 3. Linterna (Foco Visual)
  linterna: {
    tipo: 'tap_ritmico_visual',
    logica: 'Fondo negro. Círculo luminoso ("Linterna") se mueve aleatorio. Mientras suena ruido constante (Tinnitus sim), el usuario debe hacer TAP dentro de la linterna antes de que desaparezca.',
    script_psicologo: 'La atención es como una linterna. Solo puedes iluminar una cosa a la vez. Cuando enfocas tu linterna visual/motora, tu linterna auditiva se apaga.',
    tecnico: 'Audio loop continuo. Timer aleatorio de render de div redondo. Evento onClick sobre div -> sumar hit, reiniciar timer.'
  },

  // 4. Monstruo de Pensamientos (Destruir Catastrofismo)
  monstruo: {
    tipo: 'destruir_burbujas',
    logica: 'Pensamientos catastróficos bajan lentamente por pantalla ("Nunca se quitará", "Me volveré sordo"). Botones abajo con refutaciones lógicas ("Es solo un sonido", "Mi oído está sano"). Tocar botón correcto destruye pensamiento.',
    script_psicologo: 'El miedo alimenta el tinnitus. Los pensamientos negativos son mentiras que el cerebro asustado crea. Combate la mentira con hechos médicos.',
    tecnico: 'Animación CSS top -> bottom. Lista de pares {pensamiento, refutacion_correcta, refutaciones_falsas}. Comparación de ID on click.'
  },

  // 5. Escucha Periférica (Radar)
  periferica: {
    tipo: 'detectar_click',
    logica: 'Suena ruido de bosque (viento, hojas). Usuario debe hacer TAP rápido cada vez que escuche un sonido ESPECÍFICO aleatorio (crujido de rama, pájaro) ignorando un pitido bajo constante.',
    script_psicologo: 'Entrena tu red auditiva para buscar sonidos en el mundo exterior, sacando la atención del mundo interior (tu oído).',
    tecnico: 'Audio base. setTimeout random para disparar sfx corto. Escuchar click en ventana de 2 segundos post-sfx.'
  },

  // MODO RESCATE (Botón Pánico)
  rescate: {
    tipo: 'flujo_emergencia',
    logica: 'Botón rojo fijo en top-bar. Al click: Muta todo. Pone pantalla azul oscuro. Audio "Respira conmigo" + Ruido Rosa profundo al 60%. Animación expansión/contracción (4-7-8) automática por 5 minutos.',
    tecnico: 'Componente Modal overlay absoluto. Stop todos audios -> Load audio_rescate -> Iniciar CSS keyframes breathing. Bloquear botones.'
  }
};
