import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import '../styles/qrcode.css';

export default function QRCode() {
  const baseUrl = window.location.origin;
  const timeInUrl = `${baseUrl}/#qrform-timein`;
  const timeOutUrl = `${baseUrl}/#qrform-timeout`;

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
              onClick={() => downloadQR(timeInRef, 'TimeIn-QRCode.png')}
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
              onClick={() => downloadQR(timeOutRef, 'TimeOut-QRCode.png')}
            >
              Download QR Code
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
