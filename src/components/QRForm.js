import React, { useState, useEffect } from 'react';
import '../styles/qrform.css';

const ROOMS = [
  'Room 101', 'Room 102', 'Room 103', 'Room 104', 'Room 105',
  'Science Laboratory', 'Room 201', 'High School Lab',
  'IT Lab 1', 'IT Lab 2', 'IT Office', 'Room 301', 'Room 302',
  'Room 303', 'Room 304', 'Library', 'Sports Office', 'SSG Office',
  'Finance', 'Registrar', 'Guidance Office', 'Clinic'
];

export default function QRForm({ onAddVisit }) {
  const [formType, setFormType] = useState('timein');
  const [formData, setFormData] = useState({
    name: '',
    type: 'Student',
    room: ''
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.split('?')[1]);
    const type = params.get('type');
    if (type) {
      setFormType(type);
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formType === 'timein') {
      if (!formData.name || (formData.type === 'Visitor' && !formData.room)) {
        alert('Please fill in all required fields');
        return;
      }

      const now = new Date();
      const timeInStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      onAddVisit({
        name: formData.name,
        type: formData.type,
        timeIn: timeInStr,
        timeOut: '',
        room: formData.type === 'Visitor' ? formData.room : ''
      });

      setSubmitted(true);
      setTimeout(() => {
        window.location.hash = '#home';
      }, 2000);
    } else if (formType === 'timeout') {
      onAddVisit({
        timeOut: true
      });
      setSubmitted(true);
      setTimeout(() => {
        window.location.hash = '#home';
      }, 2000);
    }
  };

  return (
    <section className="qrform">
      <div className="qrform__container">
        {submitted ? (
          <div className="qrform__success">
            <div className="qrform__success-icon">✓</div>
            <h1 className="qrform__success-title">
              {formType === 'timein' ? 'Time In Recorded' : 'Time Out Recorded'}
            </h1>
            <p className="qrform__success-message">Redirecting to home...</p>
          </div>
        ) : (
          <>
            <h1 className="qrform__title">
              {formType === 'timein' ? 'Time In Form' : 'Time Out Form'}
            </h1>

            <form onSubmit={handleSubmit} className="qrform__form">
              {formType === 'timein' && (
                <>
                  <div className="qrform__form-group">
                    <label htmlFor="name" className="qrform__label">Full Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className="qrform__input"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div className="qrform__form-group">
                    <label htmlFor="type" className="qrform__label">Type *</label>
                    <select
                      id="type"
                      name="type"
                      className="qrform__select"
                      value={formData.type}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="Student">Student</option>
                      <option value="Visitor">Visitor</option>
                      <option value="Teacher">Teacher</option>
                    </select>
                  </div>

                  {formData.type === 'Visitor' && (
                    <div className="qrform__form-group">
                      <label htmlFor="room" className="qrform__label">Room *</label>
                      <select
                        id="room"
                        name="room"
                        className="qrform__select"
                        value={formData.room}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select a room</option>
                        {ROOMS.map((room, index) => (
                          <option key={index} value={room}>{room}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </>
              )}

              {formType === 'timeout' && (
                <div className="qrform__info-box">
                  <p className="qrform__info-text">
                    Clicking submit will record your current time out.
                  </p>
                </div>
              )}

              <button type="submit" className="qrform__submit">
                {formType === 'timein' ? 'Record Time In' : 'Record Time Out'}
              </button>
            </form>
          </>
        )}
      </div>
    </section>
  );
}
