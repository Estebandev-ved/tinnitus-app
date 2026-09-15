// Configuración de planes para el sitio web (coherente con la app móvil).
export const PLAN_FREE = 'free';
export const PLAN_PREMIUM = 'premium';
export const PLAN_SUPER = 'super';

export const TRIAL_DAYS = 30;
export const TRIAL_PLAN = PLAN_PREMIUM;

export const PLAN_ORDER = {
    [PLAN_FREE]: 0,
    [PLAN_PREMIUM]: 1,
    [PLAN_SUPER]: 2,
};

export const PLANS = {
    [PLAN_FREE]: {
        id: PLAN_FREE,
        name: 'Gratis',
        color: '#8E8E93',
        tagline: 'Prueba la app',
    },
    [PLAN_PREMIUM]: {
        id: PLAN_PREMIUM,
        name: 'Premium',
        color: '#00B4D8',
        tagline: 'La terapia completa',
        highlight: true,
    },
    [PLAN_SUPER]: {
        id: PLAN_SUPER,
        name: 'Super Premium',
        color: '#C8B6FF',
        tagline: 'Nivel clínico',
    },
};

export function planRank(plan) {
    return PLAN_ORDER[plan] ?? 0;
}

function toMillis(ts) {
    if (!ts) return 0;
    if (typeof ts.toMillis === 'function') return ts.toMillis();
    if (ts.seconds) return ts.seconds * 1000;
    return Number(ts) || 0;
}

// A partir de un documento de suscripción (users/{uid}/meta/subscription)
// devuelve un resumen legible para mostrar en "Mi perfil".
export function describeSubscription(sub) {
    const basePlan = sub?.plan || PLAN_FREE;
    const trialPlan = sub?.trialPlan || TRIAL_PLAN;
    const trialEndsMs = toMillis(sub?.trialEndsAt);
    const trialActive = trialEndsMs > Date.now();

    const effectivePlan = (trialActive && planRank(trialPlan) > planRank(basePlan))
        ? trialPlan
        : basePlan;

    const trialDaysLeft = trialActive
        ? Math.ceil((trialEndsMs - Date.now()) / (24 * 60 * 60 * 1000))
        : 0;

    const meta = PLANS[effectivePlan] || PLANS[PLAN_FREE];

    let statusLabel;
    if (trialActive) {
        statusLabel = `Prueba ${meta.name} · ${trialDaysLeft} ${trialDaysLeft === 1 ? 'día' : 'días'} restantes`;
    } else if (effectivePlan === PLAN_FREE) {
        statusLabel = 'Plan Gratis';
    } else {
        statusLabel = `Plan ${meta.name} activo`;
    }

    return {
        basePlan,
        effectivePlan,
        trialActive,
        trialDaysLeft,
        isPremium: planRank(effectivePlan) >= 1,
        isSuper: planRank(effectivePlan) >= 2,
        planName: meta.name,
        planColor: meta.color,
        planTagline: meta.tagline,
        statusLabel,
    };
}
