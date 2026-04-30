import React from 'react';
import '../Styles/dashboard.css';

export const DraggableSection = ({ id, children, isDraggable, title }) => {
  return (
    <section 
      className={`draggable-item ${isDraggable ? 'cursor-grab' : ''}`}
      draggable={isDraggable}
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', id);
        e.currentTarget.style.opacity = '0.4';
      }}
      onDragEnd={(e) => {
        e.currentTarget.style.opacity = '1';
      }}
      aria-labelledby={`heading-${id}`}
    >
      <h2 id={`heading-${id}`} className="sr-only">{title}</h2>
      {children}
    </section>
  );
};
