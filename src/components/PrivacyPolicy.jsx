import PropTypes from 'prop-types';
import { useEffect, useRef } from 'react';
import { ChevronLeft, Shield } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { PRIVACY_CONTENT } from '../data/privacyPolicyContent';

const listStyle = { paddingLeft: 18, lineHeight: 1.8, marginTop: 8 };

const Section = ({ section }) => (
  <section style={{ marginBottom: 20 }}>
    <h3 style={{ fontSize: 15, marginBottom: 8, color: 'var(--text-primary)' }}>{section.title}</h3>
    <div style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
      {(section.paragraphs || []).map((p) => (
        <p key={p} style={{ marginBottom: 8 }}>{p}</p>
      ))}
      {section.items && (
        <ul style={listStyle}>
          {section.items.map(([lead, text]) => (
            <li key={lead + text}>
              {lead ? <strong>{lead}: </strong> : null}
              {text}
            </li>
          ))}
        </ul>
      )}
      {(section.after || []).map((p) => (
        <p key={p} style={{ marginTop: 8 }}>{p}</p>
      ))}
    </div>
  </section>
);

Section.propTypes = {
  section: PropTypes.shape({
    title: PropTypes.string.isRequired,
    paragraphs: PropTypes.arrayOf(PropTypes.string),
    items: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)),
    after: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
};

const PrivacyPolicy = ({ onClose }) => {
  const { language } = useLanguage();
  const content = PRIVACY_CONTENT[language] || PRIVACY_CONTENT.es;
  const closeRef = useRef(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }} role="dialog" aria-modal="true" aria-label={content.title}>
      <div className="modal card" style={{ maxHeight: '90vh', overflowY: 'auto', maxWidth: 600, margin: '0 auto' }}>
        <div className="modal-header" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <button
            ref={closeRef}
            className="btn btn-ghost"
            onClick={onClose}
            aria-label={content.back}
            style={{ padding: 6, minWidth: 44, minHeight: 44 }}
          >
            <ChevronLeft size={22} aria-hidden="true" />
          </button>
          <Shield size={20} color="#007AFF" aria-hidden="true" />
          <h2 style={{ margin: 0, fontSize: 18 }}>{content.title}</h2>
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 8 }}>{content.updated}</p>
        <p style={{ color: 'var(--text-secondary)', fontSize: 12, marginBottom: 16, fontStyle: 'italic' }}>
          {content.draftNotice}
        </p>

        {content.sections.map((s) => <Section key={s.id} section={s} />)}

        <button className="btn btn-primary" style={{ width: '100%', marginTop: 24, minHeight: 44 }} onClick={onClose}>
          {content.close}
        </button>
      </div>
    </div>
  );
};

PrivacyPolicy.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default PrivacyPolicy;
