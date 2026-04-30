import React from 'react';
import '../Styles/dashboard.css';

export const QuickActionFAB = ({ onClick }) => {
  return (
    <button 
      className="fab" 
      onClick={onClick}
      aria-label="Add new entry"
      aria-haspopup="dialog"
    >
      <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24">
         <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  );
};
