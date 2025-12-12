import React, { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import '../styles/registrationForm.css';

function TeacherForm({ onComplete }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter your name');
      return;
    }

    setLoading(true);
    try {
      const userId = `teacher_${Date.now()}`;
      const userData = {
        id: userId,
        name: name.trim(),
        type: 'teacher',
        registeredAt: new Date().toISOString()
      };

      // Save to Firestore
      await setDoc(doc(db, 'users', userId), userData);

      // Save to localStorage for persistence
      localStorage.setItem('userData', JSON.stringify(userData));

      onComplete(userData);
    } catch (error) {
      console.error('Error saving teacher data:', error);
      alert('Failed to register. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="registration-container">
      <div className="registration-box">
        <h2 className="registration-title">Teacher Registration</h2>
        <form onSubmit={handleSubmit} className="registration-form">
          <div className="form-group">
            <label htmlFor="name" className="form-label">Full Name</label>
            <input
              id="name"
              type="text"
              className="form-input"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="form-btn"
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default TeacherForm;
