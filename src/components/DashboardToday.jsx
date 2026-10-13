import React from 'react';
import PropTypes from 'prop-types';
import { Flame, AudioLines, Play, Wind } from 'lucide-react';
import Companion from './Companion';
import { useLanguage } from '../contexts/LanguageContext';
import './DashboardToday.css';

// Stitch "Inicio": Lumi hero + "Tu día" summary + primary actions.
// Only real data is shown (streak, measured frequency); no invented metrics.
const DashboardToday = ({ streak, matchedFrequency, dailyTip, isNight, onNavigate }) => {
    const { t } = useLanguage();

    return (
        <div className="dt-root">
            <section className="dt-hero">
                <div className="dt-lumi">
                    <Companion state={isNight ? 'resting' : 'calm'} size={112} />
                </div>
                <p className="dt-bubble">{t(isNight ? 'home_lumi_night' : 'home_lumi_day')}</p>
                {dailyTip && (
                    <p className="dt-tip">
                        <strong>{t('home_daily_tip')}:</strong> {dailyTip}
                    </p>
                )}
            </section>

            <section className="dt-day" aria-labelledby="dt-day-title">
                <h3 id="dt-day-title" className="dt-day-title">{t('home_your_day')}</h3>
                <div className="dt-stats">
                    <div className="dt-stat">
                        <span className="dt-stat-label">
                            <Flame size={16} aria-hidden="true" /> {t('home_streak_label')}
                        </span>
                        <span className="dt-stat-value">{t('home_streak_value', { n: streak || 0 })}</span>
                        <span className="dt-stat-hint">{t('home_streak_hint')}</span>
                    </div>
                    <button
                        type="button"
                        className="dt-stat dt-stat--action"
                        onClick={() => onNavigate('matcher')}
                    >
                        <span className="dt-stat-label">
                            <AudioLines size={16} aria-hidden="true" /> {t('home_freq_label')}
                        </span>
                        <span className="dt-stat-value">
                            {matchedFrequency ? `${matchedFrequency.frequency} Hz` : t('home_freq_none')}
                        </span>
                        <span className="dt-stat-hint">{t('home_freq_hint')}</span>
                    </button>
                </div>
            </section>

            <div className="dt-actions">
                <button type="button" className="dt-btn dt-btn--primary" onClick={() => onNavigate('library')}>
                    <Play size={20} aria-hidden="true" /> {t('home_start_sound')}
                </button>
                <button type="button" className="dt-btn dt-btn--ghost" onClick={() => onNavigate('guided_sessions')}>
                    <Wind size={20} aria-hidden="true" /> {t('home_breathe_2min')}
                </button>
            </div>
        </div>
    );
};

DashboardToday.propTypes = {
    streak: PropTypes.number,
    matchedFrequency: PropTypes.shape({ frequency: PropTypes.oneOfType([PropTypes.number, PropTypes.string]) }),
    dailyTip: PropTypes.string,
    isNight: PropTypes.bool,
    onNavigate: PropTypes.func.isRequired,
};

DashboardToday.defaultProps = {
    streak: 0,
    matchedFrequency: null,
    dailyTip: '',
    isNight: false,
};

export default DashboardToday;
