import React from 'react';
import '../Styles/dashboard.css';

// Metric card with horizontal scroll support and 48px touch targets
export const MetricCard = ({ title, value, status, colorKey, animationDelayClass }) => {
  return (
    <div className={`metric-card ${animationDelayClass} scroll-snap-align-start`}>
      <header className="metric-header">
        <h3>{title}</h3>
      </header>
      <div className="metric-body" style={{ color: `var(--${colorKey})` }}>
        <span className="metric-value">{value}</span>
        <span className="metric-status">{status}</span>
      </div>
      {/* 48x48 Minimum touch target for actions */}
      <button className="card-action" aria-label={`View details for ${title}`}>
        <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24">
          <path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
};
