import React, { useState } from 'react';

export default function QuizQuestion({ question, options, onAnswer }) {
  const [selected, setSelected] = useState(null);
  
  const handleAnswer = (opt) => {
    setSelected(opt);
    onAnswer(opt);
  }

  return (
    <div style={{ width: '100%' }}>
      <p style={{marginBottom: '10px', fontSize: '1.15rem', color: '#E4E4E7'}}>{question}</p>
      <div className="quiz-options">
        {options.map((opt, i) => (
          <button 
            key={i} 
            onClick={() => handleAnswer(opt)} 
            className={`quiz-btn ${selected === opt ? 'selected' : ''}`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
