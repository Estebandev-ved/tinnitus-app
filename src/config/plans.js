// src/config/plans.js
// Configuración central de planes / suscripciones de TinnitOff.
// Todo el gating (candados) se decide con este archivo.

export const PLAN_FREE = 'free';
export const PLAN_PREMIUM = 'premium';
export const PLAN_SUPER = 'super';

// Prueba gratuita: los usuarios nuevos reciben 30 días de PREMIUM para
// que sientan resultados; al terminar bajan a Gratis (FOMO → suscripción).
export const TRIAL_DAYS = 30;
export const TRIAL_PLAN = PLAN_PREMIUM;

// Jerarquía de planes (mayor número = más acceso)
export const PLAN_ORDER = {
    [PLAN_FREE]: 0,
    [PLAN_PREMIUM]: 1,
    [PLAN_SUPER]: 2,
};

// Plan mínimo requerido por cada función bloqueable.
export const FEATURES = {
    create_sounds: PLAN_PREMIUM,      // Terapia Acústica (crear tus propios sonidos)
    notch_full: PLAN_PREMIUM,         // Notch con tu frecuencia medida en todos los sonidos
    save_mixes: PLAN_PREMIUM,         // Guardar mezclas
    sleep_timer: PLAN_PREMIUM,        // Temporizador de sueño
    spatial_audio: PLAN_PREMIUM,      // Audio espacial
    thi_unlimited: PLAN_PREMIUM,      // Test THI ilimitado + historial
    ai_chat_unlimited: PLAN_PREMIUM,  // Asistente IA sin límite diario
    digital_twin: PLAN_SUPER,         // Gemelo auditivo
    crisis_prediction: PLAN_SUPER,    // Predicción de crisis
    doctor_report: PLAN_SUPER,        // Reporte médico PDF
    caregiver: PLAN_SUPER,            // Modo cuidador
    voice_diary: PLAN_SUPER,          // Diario de voz con IA
    notch_advanced: PLAN_SUPER,       // Notch avanzado (ancho ajustable, multi-frecuencia)
};

// Límites numéricos por plan (para funciones que no se bloquean del todo).
export const LIMITS = {
    [PLAN_FREE]:    { aiMessagesPerDay: 3, thiCount: 1, notchDefaultFreq: 4000 },
    [PLAN_PREMIUM]: { aiMessagesPerDay: Infinity, thiCount: Infinity, notchDefaultFreq: null },
    [PLAN_SUPER]:   { aiMessagesPerDay: Infinity, thiCount: Infinity, notchDefaultFreq: null },
};

// Datos para mostrar la pantalla de planes / paywall.
export const PLANS = {
    [PLAN_FREE]: {
        id: PLAN_FREE,
        name: 'Gratis',
        price: '$0',
        period: 'siempre',
        color: '#8E8E93',
        tagline: 'Prueba la app',
        features: [
            'Sonidos base (blanco, rosa, lluvia, olas...)',
            'Calibración Hz (mide tu tinnitus)',
            'Test THI (1 vez)',
            'Notch en versión demo (limitado)',
            'Modo Rescate SOS básico',
        ],
        notIncluded: [
            'Crear tus propios sonidos',
            'Notch con tu frecuencia real',
            'Guardar mezclas',
        ],
    },
    [PLAN_PREMIUM]: {
        id: PLAN_PREMIUM,
        name: 'Premium',
        price: '$4.99',
        period: '/mes',
        color: '#00B4D8',
        tagline: 'La terapia completa',
        highlight: true,
        features: [
            'Todo lo del plan Gratis',
            'Notch completo con TU frecuencia en todos los sonidos',
            'Crea tus propios sonidos (Terapia Acústica)',
            'Guarda mezclas ilimitadas + temporizador de sueño',
            'Test THI ilimitado con historial de evolución',
            'Asistente IA ampliado',
            'Audio espacial · Sin anuncios',
        ],
    },
    [PLAN_SUPER]: {
        id: PLAN_SUPER,
        name: 'Super Premium',
        price: '$9.99',
        period: '/mes',
        color: '#C8B6FF',
        tagline: 'Nivel clínico',
        features: [
            'Todo lo del plan Premium',
            'Notch avanzado (ancho ajustable, multi-frecuencia)',
            'Gemelo auditivo y predicción de crisis',
            'Reporte médico PDF para tu doctor',
            'Modo cuidador (comparte con familiar/médico)',
            'Diario de voz con IA · Soporte prioritario',
        ],
    },
};

export const PLAN_LIST = [PLANS[PLAN_FREE], PLANS[PLAN_PREMIUM], PLANS[PLAN_SUPER]];

export function planRank(plan) {
    return PLAN_ORDER[plan] ?? 0;
}

// ¿El plan dado permite usar `feature`?
export function planAllows(plan, feature) {
    const required = FEATURES[feature];
    if (!required) return true; // función no bloqueable
    return planRank(plan) >= planRank(required);
}

export function limitsFor(plan) {
    return LIMITS[plan] || LIMITS[PLAN_FREE];
}
