import React from 'react';
import '../styles/typeSelection.css';

function TypeSelection({ onSelectType }) {
  return (
    <div className="type-selection-container">
      <div className="type-selection-box">
        <h1 className="type-selection-title">Welcome to Track N Guide</h1>
        <p className="type-selection-subtitle">Please select your role</p>
        
        <div className="type-buttons">
          <button 
            className="type-btn teacher-btn"
            onClick={() => onSelectType('teacher')}
          >
            <span className="type-icon">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z" />
              </svg>
            </span>
            <span className="type-label">Teacher</span>
          </button>
          
          <button 
            className="type-btn student-btn"
            onClick={() => onSelectType('student')}
          >
            <span className="type-icon">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L1 7l11 5 9-4.09V17h2V7L12 2zM11 13.5L3.5 9 11 5.5 18.5 9 11 13.5z" />
              </svg>
            </span>
            <span className="type-label">Student</span>
          </button>
          
          <button 
            className="type-btn visitor-btn"
            onClick={() => onSelectType('visitor')}
          >
            <span className="type-icon">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z" />
              </svg>
            </span>
            <span className="type-label">Visitor</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default TypeSelection;
