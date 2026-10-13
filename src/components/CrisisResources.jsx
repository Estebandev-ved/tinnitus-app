import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Phone, HeartHandshake, ExternalLink } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { CRISIS_COUNTRIES, CRISIS_DIRECTORY, detectCountry } from '../data/crisisResources';
import './CrisisResources.css';

const STORAGE_KEY = 'tinnitoff_crisis_country';

const readStoredCountry = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored && CRISIS_COUNTRIES[stored] ? stored : null;
  } catch {
    return null;
  }
};

// Calm list of support lines by country. Country is a non-sensitive preference.
const CrisisResources = ({ compact }) => {
  const { t, language } = useLanguage();
  const [country, setCountry] = useState(
    () => readStoredCountry() || detectCountry(typeof navigator !== 'undefined' ? navigator.language : '', language)
  );
  const data = CRISIS_COUNTRIES[country];

  const onChange = (e) => {
    setCountry(e.target.value);
    try { localStorage.setItem(STORAGE_KEY, e.target.value); } catch { /* storage unavailable */ }
  };

  const callLabel = (num) => t('crisis_call', { number: num });

  return (
    <div className={`crisis-res ${compact ? 'crisis-res--compact' : ''}`}>
      {!compact && (
        <p className="crisis-res-intro">
          <HeartHandshake size={18} aria-hidden="true" /> {t('crisis_intro')}
        </p>
      )}

      <label className="crisis-res-field">
        <span>{t('crisis_country')}</span>
        <select value={country} onChange={onChange}>
          {Object.entries(CRISIS_COUNTRIES).map(([code, c]) => (
            <option key={code} value={code}>{c.name[language] || c.name.es}</option>
          ))}
        </select>
      </label>

      <ul className="crisis-res-list">
        {data.lines.map((line) => (
          <li key={line.number} className="crisis-res-item">
            <div className="crisis-res-text">
              <strong>{line.label[language] || line.label.es}</strong>
              <span>{line.note[language] || line.note.es}</span>
            </div>
            <a className="crisis-res-call" href={`tel:${line.number}`} aria-label={callLabel(line.display || line.number)}>
              <Phone size={18} aria-hidden="true" /> {line.display || line.number}
            </a>
          </li>
        ))}
        <li className="crisis-res-item">
          <div className="crisis-res-text">
            <strong>{data.emergency.label[language] || data.emergency.label.es}</strong>
            <span>{t('crisis_emergency_note')}</span>
          </div>
          <a className="crisis-res-call crisis-res-call--alt" href={`tel:${data.emergency.number}`} aria-label={callLabel(data.emergency.number)}>
            <Phone size={18} aria-hidden="true" /> {data.emergency.number}
          </a>
        </li>
      </ul>

      <a className="crisis-res-dir" href={CRISIS_DIRECTORY.url} target="_blank" rel="noopener noreferrer">
        <ExternalLink size={16} aria-hidden="true" /> {CRISIS_DIRECTORY.label[language] || CRISIS_DIRECTORY.label.es}
      </a>

      {!compact && <p className="crisis-res-disclaimer">{t('crisis_disclaimer')}</p>}
    </div>
  );
};

CrisisResources.propTypes = {
  compact: PropTypes.bool,
};

CrisisResources.defaultProps = {
  compact: false,
};

export default CrisisResources;
