// Servicio Azure OpenAI para el asistente IA de la web (igual lógica que la app móvil).
export const AzureService = {
  async sendMessage(userMessage, context, config, conversationHistory = []) {
    if (!config.apiKey || !config.endpoint || !config.deployment) {
      throw new Error('Faltan credenciales de Azure.');
    }

    const cleanEndpoint = config.endpoint.replace(/\/+$/, '');

    const medProfile = context?.medicalProfile;
    const medContext = medProfile
      ? `
        - Años con tinnitus: ${medProfile.years || 'No especificado'}
        - Oído afectado: ${medProfile.ear || 'No especificado'}
        - Medicamentos: ${medProfile.medications || 'Ninguno'}
        - Doctor: ${medProfile.doctor || 'No especificado'}`
      : '- Perfil médico: No completado';

    const recentNotes = context?.recentNotes || [];
    const notesContext = recentNotes.length
      ? recentNotes.map((n) => `- (${new Date(n.timestamp).toLocaleDateString()}): [${n.mood}] ${n.text}`).join('\n')
      : 'No hay notas recientes.';

    const systemPrompt = `
        Eres 'TinnitOff AI', un asistente experto en Tinnitus.
        Tu tono es empático, profesional, cercano y calmado.
        Responde SIEMPRE en español.

        CONTEXTO DEL USUARIO (para tu referencia interna, NO lo menciones a menos que sea relevante):
        - Promedio de Estrés (última semana): ${context?.avgStress ? context.avgStress.toFixed(0) : 'Desconocido'}/100
        - Promedio de Zumbido: ${context?.avgTinnitus ? context.avgTinnitus.toFixed(0) : 'Desconocido'}/100
        - Sueño promedio: ${context?.avgSleep ? context.avgSleep.toFixed(1) : 'Desconocido'} horas
        - Racha de registro: ${context?.streakCount || 0} días consecutivos
        - PERFIL ACUFENOMÉTRICO: ${context?.tinnitusFrequency ? context.tinnitusFrequency + ' Hz' : 'No realizado'}
        ${medContext}

        NOTAS RECIENTES DEL DIARIO DE PROGRESO:
        ${notesContext}

        REGLAS:
        1. PRIMERO CONVERSA de forma natural y amigable. Nunca recetes en la primera respuesta a un saludo casual.
        2. Escucha activamente, haz preguntas abiertas, sé empático.
        3. Recomienda terapias solo cuando el usuario lo pida o describa síntomas claros.
        4. Nunca des diagnósticos definitivos; usa "podría indicar" o "sugiere".
        5. Para recetar sonido usa ESTRICTAMENTE: (SOUND: id | minutos) con id en [white, pink, rain, ocean, fan, cafe].
        6. Para dirigir a una herramienta usa (ACTION: matcher|breathing|tracker|rescue|voice_diary).
        7. Sé conciso (3-4 frases) y cálido.
       `;

    const url = `${cleanEndpoint}/openai/deployments/${config.deployment}/chat/completions?api-version=2024-04-01-preview`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'api-key': config.apiKey },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversationHistory.slice(-20).map((msg) => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text,
          })),
          { role: 'user', content: userMessage },
        ],
        max_completion_tokens: 16384,
        model: config.deployment,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `Error ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  },
};
