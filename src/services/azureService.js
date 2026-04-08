export const AzureService = {
    /**
     * Sends a message to Azure OpenAI and gets a response.
     * @param {string} userMessage - The user's input.
     * @param {object} context - User context (stress, sleep, medical profile, etc.)
     * @param {object} config - { apiKey, endpoint, deployment }
     * @param {Array} conversationHistory - Previous messages for memory [{sender, text}]
     */
    async sendMessage(userMessage, context, config, conversationHistory = []) {
        if (!config.apiKey || !config.endpoint || !config.deployment) {
            throw new Error("Faltan credenciales de Azure.");
        }

        // Clean Endpoint (remove trailing slash)
        const cleanEndpoint = config.endpoint.replace(/\/+$/, "");

        // Build medical context
        const medProfile = context?.medicalProfile;
        const medContext = medProfile ? `
        - Años con tinnitus: ${medProfile.years || 'No especificado'}
        - Oído afectado: ${medProfile.ear || 'No especificado'}
        - Medicamentos: ${medProfile.medications || 'Ninguno'}
        - Doctor: ${medProfile.doctor || 'No especificado'}
        - Notas personales: ${medProfile.notes || 'Ninguna'}` : '- Perfil médico: No completado';

        // Build Progress Notes Context
        const recentNotes = context?.recentNotes || [];
        const notesContext = recentNotes.length > 0
            ? recentNotes.map(n => `- (${new Date(n.timestamp).toLocaleDateString()}): [${n.mood}] ${n.text}`).join('\n')
            : "No hay notas recientes.";

        const systemPrompt = `
        Eres 'TinnitOff AI', un asistente experto en Tinnitus.
        Tu tono es empático, profesional, cercano y calmado.
        Responde SIEMPRE en español.
        
        CONTEXTO DEL USUARIO (para tu referencia interna, NO lo menciones a menos que sea relevante):
        - Promedio de Estrés (última semana): ${context?.avgStress ? context.avgStress.toFixed(0) : 'Desconocido'}/100
        - Promedio de Zumbido: ${context?.avgTinnitus ? context.avgTinnitus.toFixed(0) : 'Desconocido'}/100
        - Sueño promedio: ${context?.avgSleep ? context.avgSleep.toFixed(1) : 'Desconocido'} horas
        - Racha de registro: ${context?.streakCount || 0} días consecutivos
        - Total de registros esta semana: ${context?.totalLogs || 0}
        - PERFIL ACUFENOMÉTRICO: ${context?.tinnitusFrequency ? context.tinnitusFrequency + ' Hz' : 'No realizado'}
        ${medContext}

        NOTAS RECIENTES DEL DIARIO DE PROGRESO:
        ${notesContext}
  
        REGLAS DE CONVERSACIÓN (MUY IMPORTANTE — sigue este orden):
        1. **PRIMERO CONVERSA**: Cuando el usuario te salude o hable casualmente ("hola", "qué tal", "cómo estás", etc.), responde de forma natural y amigable. Pregúntale cómo se siente, cómo ha estado su día, etc. NO le recetes nada ni le hables de terapias de inmediato.
        2. **ESCUCHA ACTIVAMENTE**: Deja que el usuario hable. Hazle preguntas abiertas. Muestra interés genuino. Sé empático.
        3. **RECOMIENDA SOLO CUANDO SEA APROPIADO**: Solo sugiere terapias de sonido, respiración o técnicas cuando:
           - El usuario PIDA ayuda explícitamente ("qué me recomiendas", "necesito ayuda", "qué puedo hacer")
           - El usuario describa síntomas claros ("me suena mucho", "no puedo dormir por el zumbido", "estoy muy estresado")
           - La conversación natural lleve a ese punto después de varias interacciones
        4. **NUNCA recetes en la primera respuesta** a un saludo casual.

        INSTRUCCIONES CLÍNICAS (solo cuando vayas a recomendar):
        1. Nunca des diagnósticos médicos definitivos. Usa "podría indicar" o "sugiere".
        2. ADAPTACIÓN AL TONO cuando recetes:
           - Si el usuario tiene tinnitus AGUDO (>3000Hz): Prioriza 'white' (Ruido Blanco) o 'rain' (Lluvia).
           - Si es GRAVE (<1000Hz): Prioriza 'pink' (Ruido Rosa), 'ocean' (Olas) o 'fan' (Ventilador).
        3. Para recetar, usa ESTRICTAMENTE este formato al final: (SOUND: id_sonido | minutos)
           - IDs Disponibles: 'white', 'pink', 'rain', 'ocean', 'fan', 'cafe'.
           - Ejemplo: "Te vendría bien relajarte. (SOUND: rain | 15)"
        4. Si el usuario tiene doctor registrado, puedes mencionarlo cuando sea relevante.
        5. Sé conciso (máximo 3-4 frases).
        6. Sé cálido y humano, como un amigo que también es profesional de salud.
      `;

        const url = `${cleanEndpoint}/openai/deployments/${config.deployment}/chat/completions?api-version=2024-04-01-preview`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': config.apiKey
                },
                body: JSON.stringify({
                    messages: [
                        { role: "system", content: systemPrompt },
                        // Include conversation history for memory (last 20 messages max)
                        ...conversationHistory.slice(-20).map(msg => ({
                            role: msg.sender === 'user' ? 'user' : 'assistant',
                            content: msg.text
                        })),
                        { role: "user", content: userMessage }
                    ],
                    max_completion_tokens: 16384,
                    model: config.deployment
                })
            });

            if (!response.ok) {
                const err = await response.json();
                console.error("Azure Error Detail:", err);
                const msg = err.error?.message || `Error ${response.status}: ${response.statusText}`;
                throw new Error(msg);
            }

            const data = await response.json();
            return data.choices[0].message.content;

        } catch (error) {
            console.error("Azure Service Error:", error);
            throw error;
        }
    }
};
