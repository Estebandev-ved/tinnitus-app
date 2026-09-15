import React from 'react';
import { Lock, Crown, ChevronLeft, Check } from 'lucide-react';
import { PLANS, PLAN_PREMIUM } from '../config/plans';
import './PremiumLock.css';

// Pantalla/candado que se muestra cuando un usuario intenta usar una función
// que su plan no incluye. `requiredPlan` decide qué plan sugerir.
const PremiumLock = ({
    title = 'Función Premium',
    description = 'Mejora tu plan para desbloquear esta función.',
    requiredPlan = PLAN_PREMIUM,
    onUpgrade,
    onClose,
}) => {
    const plan = PLANS[requiredPlan] || PLANS[PLAN_PREMIUM];

    return (
        <div className="lock-container animate-fade">
            {onClose && (
                <header className="lock-header">
                    <button className="lock-back-btn" onClick={onClose}>
                        <ChevronLeft />
                    </button>
                </header>
            )}

            <div className="lock-content">
                <div className="lock-icon" style={{ '--plan-color': plan.color }}>
                    <Lock size={40} />
                </div>

                <h2 className="lock-title">{title}</h2>
                <p className="lock-desc">{description}</p>

                <div className="lock-plan-card" style={{ '--plan-color': plan.color }}>
                    <div className="lock-plan-head">
                        <Crown size={20} />
                        <span>Plan {plan.name}</span>
                        <span className="lock-plan-price">{plan.price}<small>{plan.period}</small></span>
                    </div>
                    <ul className="lock-plan-features">
                        {plan.features.slice(0, 4).map((f, i) => (
                            <li key={i}><Check size={15} /> {f}</li>
                        ))}
                    </ul>
                </div>

                <button className="lock-upgrade-btn" onClick={onUpgrade} style={{ '--plan-color': plan.color }}>
                    Ver planes y mejorar
                </button>
                {onClose && (
                    <button className="lock-later-btn" onClick={onClose}>
                        Ahora no
                    </button>
                )}
            </div>
        </div>
    );
};

export default PremiumLock;
