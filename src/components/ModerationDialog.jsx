import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Flag, UserX } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { REPORT_REASONS } from '../utils/moderation';
import CrisisHelpButton from './CrisisHelpButton';

// Accessible dialog to report a post/reply or block an author. Escape closes it.
const ModerationDialog = ({ mode, onConfirm, onClose }) => {
  const { t } = useLanguage();
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const firstRef = useRef(null);
  const isReport = mode === 'report';

  useEffect(() => {
    firstRef.current?.focus();
  }, []);

  const handleConfirm = async () => {
    setBusy(true);
    setError('');
    try {
      await onConfirm(isReport ? reason : undefined);
    } catch {
      setError(t('mod_error'));
      setBusy(false);
    }
  };

  const Icon = isReport ? Flag : UserX;
  const canConfirm = !busy && (!isReport || reason);

  return (
    <div className="compose-modal-overlay animate-fade" role="dialog" aria-modal="true"
      aria-labelledby="mod-dialog-title"
      onKeyDown={(e) => { if (e.key === 'Escape' && !busy) onClose(); }}>
      <div className="compose-card glass-card">
        <h3 id="mod-dialog-title" style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
          <Icon size={20} aria-hidden="true" /> {t(isReport ? 'mod_report_title' : 'mod_block_title')}
        </h3>
        <p style={{ fontSize: 14, lineHeight: 1.5, margin: 0 }}>
          {t(isReport ? 'mod_report_intro' : 'mod_block_intro')}
        </p>

        {isReport && (
          <fieldset style={{ border: 'none', padding: 0, margin: 0, display: 'grid', gap: 4 }}>
            <legend style={{ fontSize: 12, marginBottom: 4 }}>{t('mod_reason_label')}</legend>
            {REPORT_REASONS.map((r, i) => (
              <label key={r} style={{ display: 'flex', alignItems: 'center', gap: 10, minHeight: 44, fontSize: 14 }}>
                <input ref={i === 0 ? firstRef : undefined} type="radio" name="mod-reason" value={r}
                  checked={reason === r} onChange={() => setReason(r)} />
                {t(`mod_reason_${r}`)}
              </label>
            ))}
          </fieldset>
        )}

        {isReport && reason === 'harmful' && (
          <div style={{ fontSize: 13 }}>
            <p style={{ margin: '0 0 8px' }}>{t('mod_support_note')}</p>
            <CrisisHelpButton />
          </div>
        )}

        {error && <p role="alert" style={{ color: '#F87171', fontSize: 13, margin: 0 }}>{error}</p>}

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
          <button ref={isReport ? undefined : firstRef} type="button" className="btn btn-ghost"
            onClick={onClose} disabled={busy} style={{ minHeight: 44, minWidth: 44 }}>
            {t('mod_cancel')}
          </button>
          <button type="button" className="btn btn-primary" onClick={handleConfirm}
            disabled={!canConfirm} style={{ minHeight: 44, minWidth: 44 }}>
            {t(isReport ? 'mod_report_confirm' : 'mod_block_confirm')}
          </button>
        </div>
        <p style={{ fontSize: 11, opacity: 0.7, margin: 0 }}>{t('mod_disclaimer')}</p>
      </div>
    </div>
  );
};

ModerationDialog.propTypes = {
  mode: PropTypes.oneOf(['report', 'block']).isRequired,
  onConfirm: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ModerationDialog;
