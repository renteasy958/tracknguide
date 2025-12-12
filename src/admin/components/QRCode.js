import React, { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import '../styles/qrcode.css';

export default function QRCode() {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Update date at midnight
  useEffect(() => {
    const updateDate = () => setCurrentDate(new Date());
    
    // Calculate milliseconds until next midnight
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const msUntilMidnight = tomorrow - now;
    
    // Set timer to update at midnight
    const midnightTimer = setTimeout(() => {
      updateDate();
      // Set interval to update daily
      const dailyInterval = setInterval(updateDate, 24 * 60 * 60 * 1000);
      return () => clearInterval(dailyInterval);
    }, msUntilMidnight);
    
    return () => clearTimeout(midnightTimer);
  }, []);
  
  const getTodayString = () => {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const dateParam = getTodayString();
  const timeInUrl = `https://tracksandguide.web.app/#qr-timein?date=${dateParam}`;
  const timeOutUrl = `https://tracksandguide.web.app/#qr-timeout?date=${dateParam}`;

  const downloadQR = (ref, filename) => {
    const canvas = ref.current.querySelector('canvas');
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
  };

  const timeInRef = React.useRef();
  const timeOutRef = React.useRef();

  return (
    <section className="qrcode">
      <div className="qrcode__container">
        <h1 className="qrcode__title">QR Code Scanner</h1>
        
        <div className="qrcode__info">
          <p>Users can scan these QR codes with their phones to fill up their Time In or Time Out</p>
          <p style={{ marginTop: '10px', fontWeight: 'bold', color: '#1976d2' }}>
            Valid for: {currentDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <p style={{ fontSize: '0.9em', color: '#666', marginTop: '5px' }}>
            ⚠️ QR codes expire at midnight and must be regenerated daily
          </p>
        </div>

        <div className="qrcode__grid">
          <div className="qrcode__card">
            <h2 className="qrcode__card-title">Time In</h2>
            <div className="qrcode__code-container" ref={timeInRef}>
              <QRCodeCanvas 
                value={timeInUrl} 
                size={256} 
                level="H" 
                includeMargin={true}
              />
            </div>
            <button 
              className="qrcode__download-btn"
              onClick={() => downloadQR(timeInRef, `TimeIn-QRCode-${getTodayString()}.png`)}
            >
              Download QR Code
            </button>
          </div>

          <div className="qrcode__card">
            <h2 className="qrcode__card-title">Time Out</h2>
            <div className="qrcode__code-container" ref={timeOutRef}>
              <QRCodeCanvas 
                value={timeOutUrl} 
                size={256} 
                level="H" 
                includeMargin={true}
              />
            </div>
            <button 
              className="qrcode__download-btn"
              onClick={() => downloadQR(timeOutRef, `TimeOut-QRCode-${getTodayString()}.png`)}
            >
              Download QR Code
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
