import React from 'react';

export const InsightCard = ({ insightText, date }) => {
  return (
    <div className="insight-card draggable-item wide anim-stagger-2">
      <div className="insight-icon" aria-hidden="true">💡</div>
      <div className="insight-content">
        <h3 className="text-lg font-bold">Daily Insight</h3>
        <p className="text-sec mt-2">{insightText}</p>
        <time dateTime={date} className="text-xs text-sec mt-4 block">Updated {date}</time>
      </div>
    </div>
  );
};
