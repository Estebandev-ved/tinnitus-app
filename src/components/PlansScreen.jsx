import React, { useState } from 'react';
import { ChevronLeft, Check, X as XIcon, Crown, Sparkles, Clock } from 'lucide-react';
import { usePlan } from '../contexts/PlanContext';
import { PLAN_LIST, PLAN_FREE, planRank } from '../config/plans';
import './PlansScreen.css';

const PlansScreen = ({ onClose }) => {
    const { effectivePlan, basePlan, trialActive, trialDaysLeft, setPlan } = usePlan();
    const [working, setWorking] = useState(null);

    const handleChoose = async (planId) => {
        if (planId === PLAN_FREE || planId === basePlan) return;
        // NOTA: aún no hay pago real. Por ahora esto cambia el plan directamente
        // (útil para probar el gating). Al integrar Google Play / Stripe se
        // reemplaza este handler por el flujo de compra.
        const ok = confirm(`Activar el plan seleccionado?\n\n(Modo de prueba: aún no hay cobro real. Al conectar la pasarela de pago, aquí se abrirá la compra.)`);
        if (!ok) return;
        setWorking(planId);
        try {
            await setPlan(planId);
            alert('¡Plan activado!');
        } finally {
            setWorking(null);
        }
    };

    return (
        <div className="plans-container animate-fade">
            <header className="plans-header">
                <button className="plans-back-btn" onClick={onClose}>
                    <ChevronLeft />
                </button>
                <h2>Planes y Suscripción</h2>
            </header>

            <div className="plans-scroll">
                {trialActive && (
                    <div className="plans-trial-banner">
                        <Clock size={18} />
                        <span>Tu prueba Premium termina en <strong>{trialDaysLeft} día{trialDaysLeft !== 1 ? 's' : ''}</strong>. ¡Aprovéchala!</span>
                    </div>
                )}

                <p className="plans-intro">
                    Empieza gratis, prueba la terapia completa y quédate con el plan que te dé resultados.
                </p>

                {PLAN_LIST.map(plan => {
                    const isCurrent = plan.id === effectivePlan;
                    const isDowngrade = planRank(plan.id) < planRank(basePlan);
                    return (
                        <div
                            key={plan.id}
                            className={`plan-card ${plan.highlight ? 'highlight' : ''} ${isCurrent ? 'current' : ''}`}
                            style={{ '--plan-color': plan.color }}
                        >
                            {plan.highlight && (
                                <div className="plan-ribbon"><Sparkles size={13} /> Más popular</div>
                            )}

                            <div className="plan-card-head">
                                <div className="plan-name-row">
                                    {plan.id !== PLAN_FREE && <Crown size={18} />}
                                    <h3>{plan.name}</h3>
                                </div>
                                <span className="plan-tagline">{plan.tagline}</span>
                                <div className="plan-price">
                                    {plan.price}<small>{plan.period}</small>
                                </div>
                            </div>

                            <ul className="plan-features">
                                {plan.features.map((f, i) => (
                                    <li key={i}><Check size={15} /> {f}</li>
                                ))}
                                {plan.notIncluded?.map((f, i) => (
                                    <li key={`n${i}`} className="not-included"><XIcon size={15} /> {f}</li>
                                ))}
                            </ul>

                            {isCurrent ? (
                                <button className="plan-btn current-btn" disabled>
                                    {trialActive && plan.id !== basePlan ? 'Activo (prueba)' : 'Tu plan actual'}
                                </button>
                            ) : plan.id === PLAN_FREE ? (
                                <button className="plan-btn free-btn" disabled>
                                    {isDowngrade ? 'Plan base' : 'Gratis'}
                                </button>
                            ) : (
                                <button
                                    className="plan-btn choose-btn"
                                    onClick={() => handleChoose(plan.id)}
                                    disabled={working === plan.id}
                                >
                                    {working === plan.id ? 'Activando...' : `Elegir ${plan.name}`}
                                </button>
                            )}
                        </div>
                    );
                })}

                <p className="plans-note">
                    Los pagos se habilitarán próximamente. Puedes cancelar cuando quieras.
                </p>
            </div>
        </div>
    );
};

export default PlansScreen;
