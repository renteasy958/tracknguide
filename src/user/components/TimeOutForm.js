import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import '../styles/registrationForm.css';

export default function TimeOutForm({ onComplete }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Automatically record timeout on mount
    const recordTimeOut = async () => {
      try {
        // Get user data from localStorage
        const savedData = localStorage.getItem('userData');
        
        if (!savedData) {
          setError('No active session found. Please scan the Time In QR code first.');
          setLoading(false);
          return;
        }

        const userData = JSON.parse(savedData);
        const nameTrimmed = userData.name.trim();
        
        console.log('Looking for visits for:', nameTrimmed);

        // Find the user's most recent visit without a timeout
        const visitsRef = collection(db, 'visits');
        const q = query(visitsRef, orderBy('timeIn', 'desc'));

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
          setError('No active time in record found. Please ensure you have timed in first.');
          setLoading(false);
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
        
        // Clear localStorage after successful timeout
        localStorage.removeItem('userData');
        localStorage.removeItem('lastVisitTime');
        
        // Call onComplete with success
        onComplete({ success: true, name: nameTrimmed, timeOut: timeOutStr });

      } catch (err) {
        console.error('Error recording time out:', err);
        setError('An error occurred. Please try again.');
        setLoading(false);
      }
    };

    recordTimeOut();
  }, [onComplete]);

  if (loading) {
    return (
      <div className="registration-container">
        <div className="registration-box">
          <h2 className="registration-title">Recording Time Out...</h2>
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div className="spinner" style={{ margin: '0 auto' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="registration-container">
        <div className="registration-box">
          <h2 className="registration-title">Time Out</h2>
          
          <div style={{ 
            padding: '20px', 
            marginTop: '20px',
            backgroundColor: '#fee', 
            color: '#c00', 
            borderRadius: '4px',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
