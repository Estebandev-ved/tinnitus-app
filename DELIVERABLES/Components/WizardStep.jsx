import React from 'react';
import { ChevronRight } from 'lucide-react';
export default function WizardStep({ title, children, onNext, onSkip }) {
  return (
    <div className="wizard-card">
      <div className="wizard-title">{title}</div>
      <div className="wizard-content">
        {children}
      </div>
      <div className="wizard-buttons">
        {onSkip ? (
          <button onClick={onSkip} className="wizard-skip">Saltar (Hint: lo necesitarás)</button>
        ) : <div />}
        <button onClick={onNext} className="btn-wizard-next">
          Siguiente <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
