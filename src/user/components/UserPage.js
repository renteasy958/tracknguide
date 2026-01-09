import React, { useState, useEffect, useRef } from 'react';
import { doc, setDoc, collection, addDoc, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import VisitorForm from './VisitorForm';
import TimeOutForm from './TimeOutForm';
import RoomSelection from './RoomSelection';
// Removed TypeSelection, TeacherForm, StudentForm
import '../styles/userPage.css';

function UserPage() {
  const scanInputRef = useRef(null);
  const [scanBuffer, setScanBuffer] = useState('');
  const [step, setStep] = useState('loading'); // loading, form, registered
  const [userData, setUserData] = useState(null);
  const [visitRecorded, setVisitRecorded] = useState(false);
  const [roomStep, setRoomStep] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  // Focus the hidden input on mount
  useEffect(() => {
    if (scanInputRef.current) scanInputRef.current.focus();
  }, []);

  // Listen for scanner input (simulate Enter key as scan end)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (document.activeElement !== scanInputRef.current) return;
      if (e.key === 'Enter') {
        handleScan(scanBuffer);
        setScanBuffer('');
      } else {
        setScanBuffer((prev) => prev + e.key);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [scanBuffer]);

  // Handle QR scan logic
  const handleScan = async (data) => {
    try {
      console.log('Scanned data:', data);
      // Parse QR code data (should be JSON with email and token)
      let parsed;
      try {
        parsed = JSON.parse(data);
      } catch {
        alert('Invalid QR code');
        return;
      }
      if (!parsed.email || !parsed.token) {
        alert('Invalid QR code');
        return;
      }
      // Find student by email
      const userQ = query(collection(db, 'users'), where('email', '==', parsed.email));
      const userSnap = await getDocs(userQ);
      if (userSnap.empty) {
        console.log('No student found for email:', parsed.email);
        alert('Student not found');
        return;
      }
      const studentDoc = userSnap.docs[0];
      const student = studentDoc.data();
      console.log('Found student:', student);
      // Instead of recording time-in here, show room selection
      setUserData(student);
      setRoomStep(true);
    } catch (err) {
      console.error('Error processing scan:', err);
      alert('Error processing scan: ' + err.message);
    }
  };
  // Hash-based routing and localStorage check
  useEffect(() => {
    // Check for QR code scan (hash-based routing) FIRST before checking localStorage
    const hash = window.location.hash;
    if (hash.includes('qr-timeout')) {
      setStep('qr-timeout');
      return;
    }
    if (hash.includes('qr-timein')) {
      window.history.replaceState(null, '', window.location.pathname);
      setStep('form');
      return;
    }
    // Check if user data exists in localStorage
    const savedData = localStorage.getItem('userData');
    const lastVisitTime = localStorage.getItem('lastVisitTime');
    const now = new Date().getTime();
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setUserData(parsed);
        setRoomStep(true);
      } catch (error) {
        console.error('Error loading saved data:', error);
        setStep('form');
      }
    } else {
      setStep('form');
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
        department: user.department || null,
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

  const handleRoomSelect = (room) => {
    setSelectedRoom(room);
    // Add room to userData and record time in
    if (userData) {
      const updatedUser = { ...userData, room: room.name };
      setUserData(updatedUser);
      recordTimeIn(updatedUser, room.name);
    }
    // Stay on RoomSelection view (do not show success message)
    setRoomStep(true);
  };

  const handleRegistrationComplete = (data) => {
    console.log('Registration complete:', data);
    setUserData(data);
    setRoomStep(true); // Show room selection after registration
    // Do not call recordTimeIn yet, wait for room selection
  };

  const handleReset = () => {
    localStorage.removeItem('userData');
    localStorage.removeItem('lastVisitTime');
    setUserData(null);
    setVisitRecorded(false);
    setStep('form');
    // Clear hash
    window.history.replaceState(null, '', window.location.pathname);
  };

  const handleTimeOutComplete = (result) => {
    if (result.success) {
      setStep('timeout-success');
      setUserData({ name: result.name, timeOut: result.timeOut });
    }
  };

  // Hidden input for scanner
  const scannerInput = (
    <input
      ref={scanInputRef}
      style={{ position: 'absolute', left: '-9999px' }}
      value={scanBuffer}
      onChange={() => {}}
      tabIndex={0}
      autoFocus
    />
  );

  if (step === 'loading') {
    return (
      <>
        {scannerInput}
        <div className="user-page-loading">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </>
    );
  }



  if (step === 'qr-timeout') {
    return <>{scannerInput}<TimeOutForm onComplete={handleTimeOutComplete} /></>;
  }

  if (step === 'timeout-success') {
    return (
      <>
        {scannerInput}
        <div className="user-page-success">
          <div className="success-box">
            <div className="success-icon">✓</div>
            <h2 className="success-title">Your time out is recorded</h2>
            <p className="success-message">Goodbye, {userData.name}!</p>
            <p className="success-message" style={{ marginTop: '10px', fontSize: '0.9em' }}>Time out recorded at {userData.timeOut}.</p>
            <button className="reset-btn" onClick={handleReset}>
              Done
            </button>
          </div>
        </div>
      </>
    );
  }

  if (roomStep) {
    return <RoomSelection onSelectRoom={handleRoomSelect} selectedRoom={selectedRoom} />;
  }

  // Do not show success message after room selection/time-in

  return null;
}
export default UserPage;
