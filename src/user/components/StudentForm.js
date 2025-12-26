import React, { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import '../styles/registrationForm.css';

function StudentForm({ onComplete }) {
  const [name, setName] = useState('');
  const [year, setYear] = useState('');
  const [course, setCourse] = useState('');
  const [loading, setLoading] = useState(false);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);

  React.useEffect(() => {
    const saved = localStorage.getItem('userData');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.type === 'student') {
          setAlreadyRegistered(true);
        }
      } catch {}
    }
  }, []);

  const courses = ['BSIT', 'BSBA', 'BSHM', 'BEED', 'BSED'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !year || !course) {
      alert('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const userId = `student_${Date.now()}`;
      const userData = {
        id: userId,
        name: name.trim(),
        year: year,
        course: course,
        type: 'student',
        registeredAt: new Date().toISOString()
      };

      // Save to Firestore
      await setDoc(doc(db, 'users', userId), userData);

      // Save to localStorage for persistence
      localStorage.setItem('userData', JSON.stringify(userData));

      onComplete(userData);
    } catch (error) {
      console.error('Error saving student data:', error);
      alert('Failed to register. Please try again.');
      setLoading(false);
    }
  };

  if (alreadyRegistered) {
    return (
      <div className="registration-container">
        <div className="registration-box">
          <h2 className="registration-title">Already Registered</h2>
          <p className="registration-message">You are already registered as a student. Please proceed to the next step or logout to register a new user.</p>
        </div>
      </div>
    );
  }
  return (
    <div className="registration-container">
      <div className="registration-box">
        <h2 className="registration-title">Student Registration</h2>
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
            <label htmlFor="year" className="form-label">Year Level</label>
            <input
              id="year"
              type="number"
              className="form-input"
              placeholder="Enter year (1-4)"
              min="1"
              max="4"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="course" className="form-label">Course</label>
            <select
              id="course"
              className="form-input"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              disabled={loading}
              required
            >
              <option value="">Select your course</option>
              {courses.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
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

export default StudentForm;
