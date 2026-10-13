import { useState } from 'react';
import PropTypes from 'prop-types';
import { AlertTriangle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { deleteAccount, getPrimaryProvider } from '../services/accountDeletionService';
import { auth } from '../firebase';

const DeleteAccountModal = ({ onClose, onDeleted }) => {
  const { t } = useLanguage();
  const [typed, setTyped] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const provider = getPrimaryProvider(auth.currentUser);
  const word = t('delete_account_word');
  const canConfirm =
    typed.trim().toUpperCase() === word && (provider !== 'password' || password.length > 0) && !busy;

  const handleDelete = async () => {
    setBusy(true);
    setError('');
    try {
      await deleteAccount(password);
      onDeleted();
    } catch {
      setError(t('delete_account_error'));
      setBusy(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 10000 }} role="dialog" aria-modal="true"
      aria-labelledby="delete-account-title"
      onKeyDown={(e) => { if (e.key === 'Escape' && !busy) onClose(); }}>
      <div className="modal card" style={{ maxWidth: 420, margin: '0 auto', padding: 20 }}>
        <h3 id="delete-account-title" style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#F87171' }}>
          <AlertTriangle size={20} aria-hidden="true" /> {t('delete_account_title')}
        </h3>
        <p style={{ fontSize: 14, lineHeight: 1.5 }}>{t('delete_account_warning')}</p>

        <label style={{ fontSize: 12, display: 'block', marginTop: 12 }} htmlFor="delete-confirm-word">
          {t('delete_account_type_prompt', { word })}
        </label>
        <input id="delete-confirm-word" className="input" value={typed} autoComplete="off"
          onChange={(e) => setTyped(e.target.value)} style={{ width: '100%' }} />

        {provider === 'password' && (
          <input type="password" className="input" value={password} autoComplete="current-password"
            aria-label={t('delete_account_password')} placeholder={t('delete_account_password')}
            onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', marginTop: 12 }} />
        )}
        {provider === 'google' && (
          <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{t('delete_account_google_note')}</p>
        )}

        {error && <p role="alert" style={{ color: '#F87171', fontSize: 13 }}>{error}</p>}

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 16 }}>
          <button className="btn btn-ghost" onClick={onClose} disabled={busy} style={{ minHeight: 44 }}>
            {t('delete_account_cancel_btn')}
          </button>
          <button onClick={handleDelete} disabled={!canConfirm}
            style={{ minHeight: 44, padding: '0 16px', borderRadius: 12, border: '1px solid #F87171',
              background: 'rgba(248,113,113,0.15)', color: '#F87171', fontWeight: 600,
              opacity: canConfirm ? 1 : 0.4 }}>
            {busy ? t('delete_account_progress') : t('delete_account_confirm_btn')}
          </button>
        </div>
      </div>
    </div>
  );
};

DeleteAccountModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onDeleted: PropTypes.func.isRequired,
};

export default DeleteAccountModal;
