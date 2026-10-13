// Cliente del proxy de IA (backend). La clave de Azure vive SOLO en el servidor:
// aquí nunca se maneja ninguna credencial de Azure. Se envía el ID token de Firebase
// del usuario y el backend lo verifica, aplica límites de uso y llama a Azure.

const BASE_URL = (import.meta.env.VITE_BACKEND_URL || '').replace(/\/$/, '');
const REQUEST_TIMEOUT_MS = 60000;

export class AiProxyError extends Error {
    /**
     * @param {'not_configured'|'unauthenticated'|'limit'|'unavailable'|'network'} kind
     */
    constructor(kind, message, retryAfterSeconds) {
        super(message);
        this.name = 'AiProxyError';
        this.kind = kind;
        this.retryAfterSeconds = retryAfterSeconds;
    }
}

// Solo datos agregados: sin nombre, email, médico, medicamentos ni notas libres (AI-07).
export function buildMinimalContext(context) {
    const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : undefined);
    const med = context?.medicalProfile;
    return {
        avgStress: num(context?.avgStress),
        avgTinnitus: num(context?.avgTinnitus),
        avgSleep: num(context?.avgSleep),
        streakCount: num(context?.streakCount),
        totalLogs: num(context?.totalLogs),
        tinnitusFrequency: num(Number(context?.tinnitusFrequency)),
        years: med?.years ? String(med.years).slice(0, 40) : undefined,
        ear: med?.ear ? String(med.ear).slice(0, 40) : undefined,
    };
}

export const AzureService = {
    isConfigured() {
        return Boolean(BASE_URL);
    },

    /**
     * Envía un mensaje al asistente a través del proxy.
     * @param {string} userMessage
     * @param {object} context - contexto del usuario (se minimiza antes de enviar)
     * @param {Array} conversationHistory - [{sender, text}]
     * @param {string} idToken - ID token de Firebase del usuario actual
     * @returns {Promise<string>} texto de respuesta
     */
    async sendMessage(userMessage, context, conversationHistory = [], idToken) {
        if (!BASE_URL) throw new AiProxyError('not_configured', 'Backend de IA no configurado.');
        if (!idToken) throw new AiProxyError('unauthenticated', 'Inicia sesión para usar el asistente.');

        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
        let response;
        try {
            response = await fetch(`${BASE_URL}/api/v1/ai/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${idToken}`,
                },
                signal: controller.signal,
                body: JSON.stringify({
                    message: userMessage,
                    history: conversationHistory.slice(-20).map((m) => ({
                        sender: m.sender === 'user' ? 'user' : 'bot',
                        text: String(m.text || '').slice(0, 2000),
                    })),
                    context: buildMinimalContext(context),
                }),
            });
        } catch {
            throw new AiProxyError('network', 'Sin conexión con el asistente.');
        } finally {
            clearTimeout(timer);
        }

        let data = null;
        try {
            data = await response.json();
        } catch {
            data = null;
        }

        if (response.ok) {
            if (!data?.reply) throw new AiProxyError('unavailable', 'Respuesta vacía del asistente.');
            return data.reply;
        }
        if (response.status === 401) {
            throw new AiProxyError('unauthenticated', data?.message || 'Sesión expirada.');
        }
        if (response.status === 429) {
            throw new AiProxyError('limit', data?.message || 'Límite de uso alcanzado.', data?.retryAfterSeconds);
        }
        throw new AiProxyError('unavailable', data?.message || 'El asistente no está disponible.');
    },
};
