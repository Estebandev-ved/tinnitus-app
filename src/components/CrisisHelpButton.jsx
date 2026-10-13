import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { LifeBuoy, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import CrisisResources from './CrisisResources';
import './CrisisResources.css';

// Persistent, low-key entry point to support lines. Opens an accessible dialog.
const CrisisHelpButton = ({ variant, className }) => {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const closeRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    closeRef.current?.focus();
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    const trigger = triggerRef.current;
    return () => {
      document.removeEventListener('keydown', onKey);
      trigger?.focus();
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={`crisis-help-btn crisis-help-btn--${variant} ${className}`}
        onClick={() => setOpen(true)}
      >
        <LifeBuoy size={16} aria-hidden="true" /> <span>{t('crisis_help_button')}</span>
      </button>
      {open && (
        <div className="crisis-overlay" onClick={() => setOpen(false)}>
          <div
            className="crisis-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="crisis-dialog-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="crisis-dialog-head">
              <h2 id="crisis-dialog-title">{t('crisis_title')}</h2>
              <button ref={closeRef} type="button" className="crisis-dialog-close" onClick={() => setOpen(false)} aria-label={t('crisis_close')}>
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            <CrisisResources />
          </div>
        </div>
      )}
    </>
  );
};

CrisisHelpButton.propTypes = {
  variant: PropTypes.oneOf(['link', 'card']),
  className: PropTypes.string,
};

CrisisHelpButton.defaultProps = {
  variant: 'link',
  className: '',
};

export default CrisisHelpButton;
