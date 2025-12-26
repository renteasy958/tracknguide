import React, { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import '../styles/registrationForm.css';

function TeacherForm({ onComplete }) {
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [loading, setLoading] = useState(false);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);

  React.useEffect(() => {
    const saved = localStorage.getItem('userData');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.type === 'teacher') {
          setAlreadyRegistered(true);
        }
      } catch {}
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('Please enter your name');
      return;
    }
    if (!department) {
      alert('Please select your department');
      return;
    }

    setLoading(true);
    try {
      const userId = `teacher_${Date.now()}`;

      const userData = {
        id: userId,
        name: name.trim(),
        type: 'teacher',
        department: department,
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

  if (alreadyRegistered) {
    return (
      <div className="registration-container">
        <div className="registration-box">
          <h2 className="registration-title">Already Registered</h2>
          <p className="registration-message">You are already registered as a teacher. Please proceed to the next step or logout to register a new user.</p>
        </div>
      </div>
    );
  }
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
          <div className="form-group">
            <label htmlFor="department" className="form-label">Department</label>
            <select
              id="department"
              className="form-input"
              value={department}
              onChange={e => setDepartment(e.target.value)}
              disabled={loading}
              required
            >
              <option value="">Select department</option>
              <option value="College">College</option>
              <option value="Highschool">Highschool</option>
            </select>
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
