import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, where, orderBy, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
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
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Parse URL to detect form type from hash - ROBUST VERSION
    const parseFormType = () => {
      const fullUrl = window.location.href;
      const hash = window.location.hash.toLowerCase();
      
      console.log('=== FORM TYPE DETECTION ===');
      console.log('Full URL:', fullUrl);
      console.log('Hash:', hash);
      
      // Check if URL contains "timeout" anywhere
      if (fullUrl.includes('timeout') || hash.includes('timeout')) {
        setFormType('timeout');
        console.log('✓✓✓ DETECTED TIMEOUT - Setting formType to "timeout"');
        alert('TIMEOUT mode detected!');
      } 
      // Check if URL contains "timein" 
      else if (fullUrl.includes('timein') || hash.includes('timein')) {
        setFormType('timein');
        console.log('✓✓✓ DETECTED TIMEIN - Setting formType to "timein"');
      }
      // Default to timein
      else {
        setFormType('timein');
        console.log('⚠ No type detected - defaulting to TIMEIN');
      }
    };

    // Parse immediately
    parseFormType();
    
    // Parse multiple times to catch any delayed hash loading
    setTimeout(parseFormType, 50);
    setTimeout(parseFormType, 200);
    setTimeout(parseFormType, 500);
    
    // Listen for hash changes
    window.addEventListener('hashchange', parseFormType);
    
    return () => {
      window.removeEventListener('hashchange', parseFormType);
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      if (formType === 'timein') {
        if (!formData.name || (formData.type === 'Visitor' && !formData.room)) {
          setErrorMessage('Please fill in all required fields');
          return;
        }

        const now = new Date();
        const timeInStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // Add new time in record to Firestore
        await addDoc(collection(db, 'visits'), {
          name: formData.name,
          type: formData.type,
          timeIn: now.toISOString(),
          timeInFormatted: timeInStr,
          date: now.toLocaleDateString(),
          timeOut: null,
          room: formData.type === 'Visitor' ? formData.room : null
        });

        console.log('Time in visit added successfully');
        setSubmitted(true);
      } else if (formType === 'timeout') {
        if (!formData.name) {
          setErrorMessage('Please enter your name');
          return;
        }

        const nameTrimmed = formData.name.trim();
        console.log('Looking for visits for:', nameTrimmed);

        // Find the user's most recent visit without a timeout
        const visitsRef = collection(db, 'visits');
        const q = query(
          visitsRef,
          orderBy('timeIn', 'desc')
        );

        const querySnapshot = await getDocs(q);
        
        console.log('Total visits found:', querySnapshot.docs.length);
        
        // Filter for matching name (case-insensitive) and no timeout
        const activeVisit = querySnapshot.docs.find(docSnap => {
          const data = docSnap.data();
          const nameMatch = data.name && data.name.trim().toLowerCase() === nameTrimmed.toLowerCase();
          const noTimeout = !data.timeOut;
          console.log('Checking visit:', docSnap.id, 'name:', data.name, 'match:', nameMatch, 'noTimeout:', noTimeout);
          return nameMatch && noTimeout;
        });
        
        if (!activeVisit) {
          console.log('No active visit found for name:', nameTrimmed);
          setErrorMessage('No active time in record found for this name. Please ensure you have timed in first.');
          return;
        }

        console.log('Updating visit:', activeVisit.id);

        // Update the visit with timeout
        const now = new Date();
        const timeOutStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        const updateData = {
          timeOut: now.toISOString(),
          timeOutFormatted: timeOutStr
        };
        
        console.log('Update data:', updateData);
        
        await updateDoc(doc(db, 'visits', activeVisit.id), updateData);

        console.log('✓ Visit updated successfully with timeout:', timeOutStr);
        
        // Verify the update by reading the document back
        const updatedDoc = await getDocs(query(collection(db, 'visits'), where('__name__', '==', activeVisit.id)));
        if (!updatedDoc.empty) {
          console.log('✓ Verified updated document:', updatedDoc.docs[0].data());
        }

        setSubmitted(true);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrorMessage('An error occurred. Please try again.');
    }
  };

  return (
    <section className="qrform">
      <div className="qrform__container">
        {/* Debug info */}
        <div style={{ 
          background: formType === 'timeout' ? '#ffebee' : '#e8f5e9', 
          padding: '10px', 
          marginBottom: '10px', 
          fontSize: '12px',
          border: '2px solid ' + (formType === 'timeout' ? '#f44336' : '#4caf50'),
          borderRadius: '4px'
        }}>
          <strong>DEBUG INFO:</strong><br/>
          Form Type: <strong>{formType}</strong><br/>
          URL Hash: {window.location.hash}<br/>
          <div style={{ marginTop: '10px' }}>
            <button 
              type="button"
              onClick={() => { 
                console.log('Setting to TIMEIN'); 
                setFormType('timein'); 
                setErrorMessage('');
              }}
              style={{ marginRight: '10px', padding: '5px 10px', background: formType === 'timein' ? '#4caf50' : '#ccc', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Time In Mode
            </button>
            <button 
              type="button"
              onClick={() => { 
                console.log('Setting to TIMEOUT'); 
                setFormType('timeout'); 
                setErrorMessage('');
                alert('Switched to Time Out Mode. The box should now be RED and say "Form Type: timeout"');
              }}
              style={{ padding: '5px 10px', background: formType === 'timeout' ? '#f44336' : '#ccc', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Time Out Mode
            </button>
          </div>
        </div>
        
        {submitted ? (
          <div className="qrform__success">
            <div className="qrform__success-icon">✓</div>
            <h1 className="qrform__success-title">
              {formType === 'timein' ? 'Your Time In Has Been Recorded' : 'Your Time Out Has Been Recorded'}
            </h1>
            <p className="qrform__success-message">Thank you!</p>
            <button 
              className="qrform__submit" 
              onClick={() => window.location.reload()}
              style={{ marginTop: '20px' }}
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <h1 className="qrform__title">
              {formType === 'timein' ? 'Time In Form' : 'Time Out Form'}
            </h1>

            {errorMessage && (
              <div className="qrform__error">
                {errorMessage}
              </div>
            )}

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
                <>
                  <div className="qrform__info-box">
                    <p className="qrform__info-text">
                      Please enter your name to record your time out.
                    </p>
                  </div>
                  
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
                </>
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
