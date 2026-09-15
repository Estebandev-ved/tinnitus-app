import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { FirestoreService } from '../services/firestoreService';
import {
    PLAN_FREE,
    TRIAL_PLAN,
    planRank,
    planAllows,
    limitsFor,
} from '../config/plans';

const PlanContext = createContext();

export function usePlan() {
    return useContext(PlanContext);
}

export function PlanProvider({ children }) {
    const { currentUser } = useAuth();
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        async function load() {
            if (!currentUser) {
                setSubscription(null);
                setLoading(false);
                return;
            }
            setLoading(true);
            // Crea la prueba de 30 días si es un usuario nuevo.
            const sub = await FirestoreService.ensureSubscription(currentUser.uid);
            if (active) {
                setSubscription(sub);
                setLoading(false);
            }
        }
        load();
        return () => { active = false; };
    }, [currentUser]);

    const toMillis = (ts) => {
        if (!ts) return 0;
        if (typeof ts.toMillis === 'function') return ts.toMillis();
        if (ts.seconds) return ts.seconds * 1000;
        return Number(ts) || 0;
    };

    const trialEndsMs = toMillis(subscription?.trialEndsAt);
    const trialActive = trialEndsMs > Date.now();
    const basePlan = subscription?.plan || PLAN_FREE;
    const trialPlan = subscription?.trialPlan || TRIAL_PLAN;

    // Plan efectivo: durante la prueba se usa el mayor entre el plan pagado y el de prueba.
    const effectivePlan = (trialActive && planRank(trialPlan) > planRank(basePlan))
        ? trialPlan
        : basePlan;

    const trialDaysLeft = trialActive
        ? Math.ceil((trialEndsMs - Date.now()) / (24 * 60 * 60 * 1000))
        : 0;

    const can = useCallback((feature) => planAllows(effectivePlan, feature), [effectivePlan]);

    const refresh = useCallback(async () => {
        if (!currentUser) return;
        const sub = await FirestoreService.getSubscription(currentUser.uid);
        setSubscription(sub);
    }, [currentUser]);

    const setPlan = useCallback(async (plan) => {
        if (!currentUser) return;
        await FirestoreService.setUserPlan(currentUser.uid, plan);
        await refresh();
    }, [currentUser, refresh]);

    const value = {
        loading,
        plan: effectivePlan,
        basePlan,
        effectivePlan,
        trialActive,
        trialDaysLeft,
        isPremium: planRank(effectivePlan) >= 1,
        isSuper: planRank(effectivePlan) >= 2,
        limits: limitsFor(effectivePlan),
        can,
        refresh,
        setPlan,
    };

    return (
        <PlanContext.Provider value={value}>
            {children}
        </PlanContext.Provider>
    );
}
