import React, { useState, useEffect } from 'react';
import { doc, setDoc, collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import TypeSelection from './TypeSelection';
import TeacherForm from './TeacherForm';
import StudentForm from './StudentForm';
import VisitorForm from './VisitorForm';
import RoomSelection from './RoomSelection';
import RoomMap from './RoomMap';
import '../styles/userPage.css';

function UserPage() {
  const [step, setStep] = useState('loading'); // loading, type-selection, form, registered, room-selection, map
  const [userData, setUserData] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [visitRecorded, setVisitRecorded] = useState(false);

  useEffect(() => {
    // Check if user data exists in localStorage
    const savedData = localStorage.getItem('userData');
    const lastVisitTime = localStorage.getItem('lastVisitTime');
    const now = new Date().getTime();
    
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setUserData(parsed);
        
        // Check if a visit was recorded in the last 5 minutes
        const timeSinceLastVisit = lastVisitTime ? now - parseInt(lastVisitTime) : Infinity;
        const fiveMinutes = 5 * 60 * 1000;
        
        if (timeSinceLastVisit < fiveMinutes) {
          setVisitRecorded(true);
        }
        
        // Check if this is a visitor
        if (parsed.type === 'visitor') {
          setStep('room-selection');
        } else {
          setStep('registered');
        }
      } catch (error) {
        console.error('Error loading saved data:', error);
        setStep('type-selection');
      }
    } else {
      setStep('type-selection');
    }
  }, []);

  const recordTimeIn = async (user, roomName = null) => {
    // Prevent duplicate recordings
    if (visitRecorded) {
      console.log('Visit already recorded, skipping...');
      return;
    }

    try {
      const now = new Date();
      const visitData = {
        userId: user.id,
        name: user.name,
        type: user.type,
        course: user.course || null,
        year: user.year || null,
        timeIn: now.toISOString(),
        timeInFormatted: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: now.toLocaleDateString(),
        room: roomName || null
      };

      console.log('Recording visit:', visitData);
      
      // Record visit in Firestore
      await addDoc(collection(db, 'visits'), visitData);
      
      // Mark as recorded
      setVisitRecorded(true);
      localStorage.setItem('lastVisitTime', now.getTime().toString());
      
      console.log('Visit recorded successfully');
    } catch (error) {
      console.error('Error recording time in:', error);
    }
  };

  const handleSelectType = (type) => {
    setUserData({ type });
    setStep('form');
  };

  const handleRegistrationComplete = (data) => {
    setUserData(data);
    
    if (data.type === 'visitor') {
      setStep('room-selection');
    } else {
      setStep('registered');
      recordTimeIn(data);
    }
  };

  const handleSelectRoom = async (room) => {
    setSelectedRoom(room);
    
    // Record visitor's destination with room name
    try {
      await recordTimeIn(userData, room.name);
    } catch (error) {
      console.error('Error recording room selection:', error);
    }
    
    setStep('map');
  };

  const handleBackToRooms = () => {
    setStep('room-selection');
    setSelectedRoom(null);
  };

  const handleReset = () => {
    localStorage.removeItem('userData');
    localStorage.removeItem('lastVisitTime');
    setUserData(null);
    setSelectedRoom(null);
    setVisitRecorded(false);
    setStep('type-selection');
  };

  if (step === 'loading') {
    return (
      <div className="user-page-loading">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (step === 'type-selection') {
    return <TypeSelection onSelectType={handleSelectType} />;
  }

  if (step === 'form') {
    if (userData.type === 'teacher') {
      return <TeacherForm onComplete={handleRegistrationComplete} />;
    }
    if (userData.type === 'student') {
      return <StudentForm onComplete={handleRegistrationComplete} />;
    }
    if (userData.type === 'visitor') {
      return <VisitorForm onComplete={handleRegistrationComplete} />;
    }
  }

  if (step === 'registered') {
    return (
      <div className="user-page-success">
        <div className="success-box">
          <div className="success-icon">✓</div>
          <h2 className="success-title">Welcome, {userData.name}!</h2>
          <p className="success-message">Your time in has been recorded.</p>
          
          <div className="user-info">
            <div className="info-row">
              <span className="info-label">Type:</span>
              <span className="info-value">{userData.type}</span>
            </div>
            {userData.course && (
              <div className="info-row">
                <span className="info-label">Course:</span>
                <span className="info-value">{userData.course}</span>
              </div>
            )}
            {userData.year && (
              <div className="info-row">
                <span className="info-label">Year:</span>
                <span className="info-value">{userData.year}</span>
              </div>
            )}
            <div className="info-row">
              <span className="info-label">Time In:</span>
              <span className="info-value">{new Date().toLocaleTimeString()}</span>
            </div>
          </div>

          <button className="reset-btn" onClick={handleReset}>
            Logout / New User
          </button>
        </div>
      </div>
    );
  }

  if (step === 'room-selection') {
    return <RoomSelection onSelectRoom={handleSelectRoom} />;
  }

  if (step === 'map' && selectedRoom) {
    return <RoomMap room={selectedRoom} onBack={handleBackToRooms} onLogout={handleReset} />;
  }

  return null;
}

export default UserPage;
