import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import '../styles/roomSelection.css';

function RoomSelection({ onSelectRoom, selectedRoom: selectedRoomProp, onBack }) {
  const [selectedRoom, setSelectedRoom] = useState(() => {
    // Try to restore from localStorage
    const saved = localStorage.getItem('selectedRoom');
    return saved ? JSON.parse(saved) : (selectedRoomProp || null);
  });
  const [imageError, setImageError] = useState("");
  // Always reset selectedRoom on mount to show room grid
  // Save selectedRoom to localStorage whenever it changes
  useEffect(() => {
    if (selectedRoom) {
      localStorage.setItem('selectedRoom', JSON.stringify(selectedRoom));
    } else {
      localStorage.removeItem('selectedRoom');
    }
  }, [selectedRoom]);

  const [showQrScanner, setShowQrScanner] = useState(false);
  const [qrError, setQrError] = useState('');
  const [scannedStudent, setScannedStudent] = useState(null);
  const qrCodeScannerRef = useRef(null);
  const rooms = [
    // Ground Floor
    { id: 'room_101', name: 'Room 101', floor: 'ground' },
    { id: 'room_102', name: 'Room 102', floor: 'ground' },
    { id: 'science_lab', name: 'Science Lab', floor: 'ground' },
    { id: 'room_103', name: 'Room 103', floor: 'ground' },
    { id: 'ssg_office', name: 'SSG Office', floor: 'ground' },
    { id: 'room_104', name: 'Room 104', floor: 'ground' },
    { id: 'room_105', name: 'Room 105', floor: 'ground' },
    { id: 'guidance_office', name: 'Guidance Office', floor: 'ground' },
    { id: 'clinic', name: 'Clinic', floor: 'ground' },
    { id: 'chancellor_office', name: "Chancellor's Office", floor: 'ground' },
    { id: 'finance', name: 'Finance Office', floor: 'ground' },
    { id: 'registrar', name: "Registrar's Office", floor: 'ground' },
    { id: 'hm_lab', name: 'HM Lab', floor: 'ground' },
    { id: 'hot_kitchen', name: 'Hot Kitchen', floor: 'ground' },
    { id: 'hs_room_102', name: 'HS Room 102', floor: 'ground' },
    { id: 'hs_room_103', name: 'HS Room 103', floor: 'ground' },
    { id: 'hs_room_104', name: 'HS Room 104', floor: 'ground' },
    { id: 'hs_room_105', name: 'HS Room 105', floor: 'ground' },
    { id: 'canteen', name: 'Canteen', floor: 'ground' },
    { id: 'chapel', name: 'Chapel', floor: 'ground' },
    // 2nd Floor
    { id: 'room_201', name: 'Room 201', floor: '2nd' },
    { id: 'hs_lab', name: 'HS Laboratory', floor: '2nd' },
    { id: 'complab_1', name: 'Complab 1', floor: '2nd' },
    { id: 'bsit_office', name: 'BSIT Department Office', floor: '2nd' },
    { id: 'complab_2', name: 'Complab 2', floor: '2nd' },
    { id: 'ted_faculty', name: 'Teacher Education Faculty Room', floor: '2nd' },
    { id: 'hbe_faculty', name: 'Hospitality/Business Education  Faculty Room', floor: '2nd' },
    { id: 'mic', name: 'Management Information Center', floor: '2nd' },
    { id: 'deans_office', name: 'Dean’s Office', floor: '2nd' },
    { id: 'outreach', name: 'Outreach Center', floor: '2nd' },
    { id: 'cm_office', name: 'Campus Ministry Office', floor: '2nd' },
    { id: 'aa_office', name: 'Academic Affairs Office', floor: '2nd' },
    { id: 'research_office', name: 'Research, Accreditation and Quality Management Office', floor: '2nd' },
    { id: 'be_faculty', name: 'Basic Education Faculty Room', floor: '2nd' },
    { id: 'sisters_cloister', name: 'Sisters Cloister', floor: '2nd' },
    { id: 'oratory', name: 'Oratory of St. Augustine and Monica', floor: '2nd' },
    { id: 'hs_room_201', name: 'HS Room 201', floor: '2nd' },
    { id: 'hs_room_202', name: 'HS Room 202', floor: '2nd' },
    { id: 'hs_room_203', name: 'HS Room 203', floor: '2nd' },
    { id: 'hs_room_204', name: 'HS Room 204', floor: '2nd' },
    { id: 'hs_room_205', name: 'HS Room 205', floor: '2nd' },
    { id: 'hs_room_206', name: 'HS Room 206', floor: '2nd' },
    { id: 'hs_room_207', name: 'HS Room 207', floor: '2nd' },
    // 3rd Floor
    { id: 'room_301', name: 'Room 301', floor: '3rd' },
    { id: 'room_302', name: 'Room 302', floor: '3rd' },
    { id: 'room_303', name: 'Room 303', floor: '3rd' },
    { id: 'room_304', name: 'Room 304', floor: '3rd' },
    { id: 'sdc', name: 'Sports Development Office', floor: '3rd' },
    { id: 'college_library', name: 'College Library', floor: '3rd' },
    { id: 'bed_library', name: 'BED Library', floor: '3rd' },
  ];

  // Helper to get image file name from room name
  const getImageFileName = (roomName) => {
    // Map room names to image file names as needed
    const groundMap = {
      'Room 101': 'Room 101.png',
      'Room 102': 'Room 102.png',
      'Science Lab': 'Science Lab.png',
      'Room 103': 'Room 103.png',
      'SSG Office': 'SSG Office.png',
      'Room 104': 'Room 104.png',
      'Room 105': 'Room 105.png',
      'Guidance Office': 'Guidance Office.png',
      'Clinic': 'Clinic.png',
      "Chancellor's Office": "Chancellor's Office.png",
      'Finance Office': 'Finance Office.png',
      "Registrar's Office": "Registrar's Office.png",
      'HM Lab': 'HM Lab.png',
      'Hot Kitchen': 'Hot Kitchen.png',
      'HS Room 102': 'HS Room 102.png',
      'HS Room 103': 'HS Room 103.png',
      'HS Room 104': 'HS Room 104.png',
      'HS Room 105': 'HS Room 105.png',
      'Canteen': 'Canteen.png',
      'Chapel': 'Chapel.png',
    };
    const secondMap = {
      'Room 201': 'Room 201.png',
      'HS Laboratory': 'HS Lab.png',
      'Complab 1': 'Complab 1.png',
      'BSIT Department Office': 'BSIT Office.png',
      'Complab 2': 'Complab 2.png',
      'Teacher Education Faculty Room': 'TED Faculty Room.png',
      'Hospitality/Business Education  Faculty Room': 'HBE Faculty Room.png',
      'Management Information Center': 'MIC.png',
      'Dean’s Office': 'Deans Office.png',
      'Outreach Center': 'Outreach Center.png',
      'Campus Ministry Office': 'CM Office.png',
      'Academic Affairs Office': 'AA Office.png',
      'Research, Accreditation and Quality Management Office': 'Research Office.png',
      'Basic Education Faculty Room': 'BE Faculty Room.png',
      'Sisters Cloister': 'Sisters Cloister.png',
      'Oratory of St. Augustine and Monica': 'Oratory.png',
      'HS Room 201': 'HS Room 201.png',
      'HS Room 202': 'HS Room 202.png',
      'HS Room 203': 'HS Room 203.png',
      'HS Room 204': 'HS Room 204.png',
      'HS Room 205': 'HS Room 205.png',
      'HS Room 206': 'HS Room 206.png',
      'HS Room 207': 'HS Room 207.png',
    };
    const thirdMap = {
      'Room 301': 'Room 301.png',
      'Room 302': 'Room 302.png',
      'Room 303': 'Room 303.png',
      'Room 304': 'Room 304.png',
      'Sports Development Office': 'SDC.png',
      'College Library': 'College Library.png',
      'BED Library': 'BED Library.png',
    };
    if (groundMap[roomName]) return 'images/' + groundMap[roomName];
    if (secondMap[roomName]) return 'images/2nd/' + secondMap[roomName];
    if (thirdMap[roomName]) return 'images/3rd/' + thirdMap[roomName];
    return null;
  };

  // QR Scanner effect (must be at top level)
  useEffect(() => {
    if (showQrScanner) {
      let html5QrCode = new Html5Qrcode('qr-reader');
      qrCodeScannerRef.current = html5QrCode;
      window.html5QrCodeScanner = html5QrCode;
      html5QrCode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: 250 },
        async (decodedText) => {
          setShowQrScanner(false);
          html5QrCode.stop().catch(()=>{});
          // Try to parse QR data
          let qrData;
          try {
            qrData = JSON.parse(decodedText);
          } catch {
            setQrError('Invalid QR code format.');
            return;
          }
          if (!qrData.email) {
            setQrError('QR code missing email.');
            return;
          }
          // Fetch student from Firestore by email
          try {
            const q = query(collection(db, 'users'), where('email', '==', qrData.email));
            const querySnapshot = await getDocs(q);
            if (querySnapshot.empty) {
              setQrError('No student found for this QR code.');
              return;
            }
            const student = querySnapshot.docs[0].data();
            setScannedStudent(student);
          } catch (err) {
            setQrError('Error fetching student: ' + err.message);
          }
        },
        (error) => {
          // Optionally handle scan errors
        }
      ).catch(err => {
        setQrError('Camera error: ' + err);
      });
      return () => {
        if (html5QrCode) html5QrCode.stop().catch(()=>{});
      };
    } else {
      // Cleanup if scanner is closed
      if (qrCodeScannerRef.current) {
        qrCodeScannerRef.current.stop().catch(()=>{});
        qrCodeScannerRef.current = null;
      }
    }
    // eslint-disable-next-line
  }, [showQrScanner]);

  return (
    <div className="room-selection-container">
      <div className="room-selection-box">
        {qrError && <div style={{color: 'red', textAlign: 'center', marginBottom: 12}}>{qrError}</div>}
        {scannedStudent && (
          <div style={{background: '#e3f2fd', borderRadius: 8, padding: 20, marginBottom: 16}}>
            <h3 style={{margin: 0, marginBottom: 8}}>Student Found</h3>
            <div><b>Name:</b> {scannedStudent.name}</div>
            <div><b>Email:</b> {scannedStudent.email}</div>
            <div><b>Course:</b> {scannedStudent.course}</div>
            <div><b>Year:</b> {scannedStudent.year}</div>
            {/* You can add time in/out logic here, or call a prop/callback */}
          </div>
        )}
        {rooms.length === 0 && (
          <div style={{color: 'red', textAlign: 'center'}}>No rooms available.</div>
        )}
        {!selectedRoom && rooms.length > 0 ? (
          <>
            <h2 className="room-selection-title">Where would you like to go?</h2>
            <p className="room-selection-subtitle">Select a room to view directions</p>
            <div className="room-grid">
              {rooms.map(room => {
                // ...existing code for icon selection...
                let icon = (
                  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <rect x="4" y="8" width="16" height="10" rx="2" fill="#154084" />
                    <rect x="9" y="13" width="2" height="5" fill="#fff" />
                    <rect x="13" y="13" width="2" height="5" fill="#fff" />
                  </svg>
                );
                // Custom icon overrides for 2nd/3rd Floor and special rooms
                                // Ball icon for Sports Development Office
                                if (room.name === 'Sports Development Office') {
                                  icon = (
                                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                      <circle cx="12" cy="12" r="10" fill="#154084" />
                                      <path d="M12 2a10 10 0 0 1 0 20M2 12a10 10 0 0 1 20 0" stroke="#fff" strokeWidth="2" fill="none" />
                                      <path d="M4 4l16 16M20 4L4 20" stroke="#fff" strokeWidth="2" fill="none" />
                                    </svg>
                                  );
                                } else if (room.name === 'College Library' || room.name === 'BED Library') {
                                  // Books icon
                                  icon = (
                                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                      <rect x="3" y="6" width="6" height="14" rx="1" fill="#154084" />
                                      <rect x="9" y="4" width="6" height="16" rx="1" fill="#154084" />
                                      <rect x="15" y="2" width="6" height="18" rx="1" fill="#154084" />
                                      <rect x="5" y="8" width="2" height="10" fill="#fff" />
                                      <rect x="11" y="6" width="2" height="12" fill="#fff" />
                                      <rect x="17" y="4" width="2" height="14" fill="#fff" />
                                    </svg>
                                  );
                                }
                // Nun icon for Sisters Cloister
                if (room.name === 'Sisters Cloister') {
                  icon = (
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="8" r="4" fill="#154084" />
                      <ellipse cx="12" cy="16" rx="6" ry="5" fill="#154084" />
                      <ellipse cx="12" cy="13" rx="3" ry="2" fill="#fff" />
                      <rect x="10" y="10" width="4" height="3" fill="#fff" />
                    </svg>
                  );
                } else if (room.name === 'Oratory of St. Augustine and Monica') {
                  // Cross icon (reuse Chapel)
                  icon = (
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <rect x="10" y="4" width="4" height="16" fill="#154084" />
                      <rect x="4" y="10" width="16" height="4" fill="#154084" />
                    </svg>
                  );
                } else if (
                  room.name.includes('Faculty Room') ||
                  room.name === 'Teacher Education Faculty Room' ||
                  room.name === 'Hospitality/Business Education  Faculty Room' ||
                  room.name === 'Basic Education Faculty Room'
                ) {
                  // Teacher/faculty icon
                  icon = (
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="8" r="4" fill="#154084" />
                      <rect x="7" y="14" width="10" height="6" rx="3" fill="#154084" />
                      <rect x="10" y="20" width="4" height="2" fill="#154084" />
                    </svg>
                  );
                } else if (
                  room.name.includes('Office') ||
                  room.name === 'Outreach Center' ||
                  room.name === 'Academic Affairs Office' ||
                  room.name === 'Research, Accreditation and Quality Management Office' ||
                  room.name === 'Campus Ministry Office'
                ) {
                  // Briefcase/office icon
                  icon = (
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <rect x="4" y="8" width="16" height="10" rx="2" fill="#154084" />
                      <rect x="8" y="6" width="8" height="4" rx="1" fill="#154084" />
                      <rect x="10" y="2" width="4" height="4" rx="1" fill="#154084" />
                    </svg>
                  );
                } else if (
                  room.name === 'Complab 1' ||
                  room.name === 'Complab 2' ||
                  room.name === 'HS Laboratory'
                ) {
                  // Computer icon
                  icon = (
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <rect x="3" y="6" width="18" height="10" rx="2" fill="#154084" />
                      <rect x="7" y="18" width="10" height="2" fill="#154084" />
                      <rect x="9" y="20" width="6" height="1" fill="#154084" />
                    </svg>
                  );
                } else if (room.name === 'Management Information Center') {
                  // Multimedia icon (play button in a screen)
                  icon = (
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <rect x="4" y="6" width="16" height="10" rx="2" fill="#154084" />
                      <polygon points="11,9 16,12 11,15" fill="#fff" />
                    </svg>
                  );
                } else if (room.name === 'Dean’s Office') {
                  // Principal icon (reuse Chancellor's Office)
                  icon = (
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="10" r="4" fill="#154084" />
                      <rect x="7" y="16" width="10" height="4" rx="2" fill="#154084" />
                      <rect x="9" y="5" width="6" height="2" fill="#222" />
                    </svg>
                  );
                }
                if (room.name === 'Chapel') {
                  icon = (
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <rect x="10" y="4" width="4" height="16" fill="#154084" />
                      <rect x="4" y="10" width="16" height="4" fill="#154084" />
                    </svg>
                  );
                } else if (room.name === 'Finance Office') {
                  icon = (
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <rect x="3" y="7" width="18" height="10" rx="2" fill="#154084" />
                      <circle cx="12" cy="12" r="3" fill="#fff" />
                      <text x="12" y="14" textAnchor="middle" fontSize="6" fill="#154084" fontFamily="Arial">₱</text>
                    </svg>
                  );
                } else if (room.name === "Registrar's Office") {
                  icon = (
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <rect x="5" y="4" width="14" height="16" rx="2" fill="#154084" />
                      <rect x="7" y="8" width="10" height="2" fill="#fff" />
                      <rect x="7" y="12" width="7" height="2" fill="#fff" />
                    </svg>
                  );
                } else if (room.name === "Chancellor's Office") {
                  icon = (
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="10" r="4" fill="#154084" />
                      <rect x="7" y="16" width="10" height="4" rx="2" fill="#154084" />
                      <rect x="9" y="5" width="6" height="2" fill="#222" />
                    </svg>
                  );
                } else if (room.name === 'Canteen') {
                  icon = (
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <rect x="7" y="4" width="2" height="12" rx="1" fill="#154084" />
                      <rect x="15" y="4" width="2" height="12" rx="1" fill="#154084" />
                      <circle cx="8" cy="18" r="2" fill="#154084" />
                      <circle cx="16" cy="18" r="2" fill="#154084" />
                    </svg>
                  );
                } else if (room.name === 'Hot Kitchen') {
                  icon = (
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <rect x="6" y="14" width="12" height="4" rx="2" fill="#154084" />
                      <path d="M9 14V10M12 14V8M15 14V12" stroke="#154084" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  );
                } else if (room.name === 'Clinic') {
                  icon = (
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <rect x="10" y="6" width="4" height="12" fill="#154084" />
                      <rect x="6" y="10" width="12" height="4" fill="#154084" />
                    </svg>
                  );
                } else if (room.name === 'Guidance Office') {
                  icon = (
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <ellipse cx="12" cy="12" rx="8" ry="6" fill="#154084" />
                    </svg>
                  );
                } else if (room.name === 'Science Lab') {
                  icon = (
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <rect x="10" y="4" width="4" height="8" fill="#154084" />
                      <path d="M8 12c0 4 8 4 8 0" stroke="#154084" strokeWidth="2" fill="none" />
                    </svg>
                  );
                }
                return (
                  <button
                    key={room.id}
                    className="room-card"
                    onClick={() => {
                      setSelectedRoom(room);
                      if (onSelectRoom) onSelectRoom(room);
                    }}
                  >
                    <span className="room-icon">{icon}</span>
                    <span className="room-name">{room.name}</span>
                  </button>
                );
              })}
            </div>
          </>
        ) : null}
        {selectedRoom && (
          <div style={{textAlign: 'center', marginTop: '32px'}}>
            <div style={{ fontWeight: 'bold', color: '#000', fontSize: '2em', letterSpacing: '1px', marginBottom: '8px' }}>
              {selectedRoom.floor === '3rd' ? '3RD FLOOR' : selectedRoom.floor === '2nd' ? '2ND FLOOR' : 'GROUND FLOOR'}
            </div>
            <h2 className="room-selection-title">{selectedRoom.name}</h2>
            <p className="room-selection-subtitle" style={{marginBottom: '18px'}}>Follow the red line to reach your destination.</p>
            {(() => { const imgPath = process.env.PUBLIC_URL + '/' + getImageFileName(selectedRoom.name); console.log('Image path for selected room:', imgPath); return null; })()}
            {getImageFileName(selectedRoom.name) ? (
              <>
                <img
                  src={process.env.PUBLIC_URL + '/' + getImageFileName(selectedRoom.name)}
                  alt={selectedRoom.name}
                  style={{
                    display: 'block',
                    maxWidth: '100%',
                    maxHeight: '60vh',
                    width: '100%',
                    height: 'auto',
                    objectFit: 'contain',
                    margin: '16px auto'
                  }}
                  onError={e => {
                    e.target.style.display = 'none';
                    const errorMsg = 'Failed to load image: ' + e.target.src;
                    console.error(errorMsg);
                    setImageError(errorMsg);
                  }}
                />
                {imageError && (
                  <div style={{color: 'red', margin: '8px auto'}}>{imageError}</div>
                )}
              </>
            ) : (
              <div style={{color: 'gray', margin: '16px auto'}}>No image available for this room.</div>
            )}
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'center' }}>
              <button
                className="room-back-btn"
                style={{
                  background: '#154084',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '5px',
                  padding: '10px 20px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                  transition: 'background 0.2s',
                  marginTop: '0'
                }}
                onClick={() => {
                  setSelectedRoom(null);
                  setImageError("");
                  localStorage.removeItem('selectedRoom');
                  if (onBack) onBack();
                }}
                onMouseOver={e => e.currentTarget.style.background = '#1864ab'}
                onMouseOut={e => e.currentTarget.style.background = '#154084'}
              >
                Back to room selection
              </button>
              {/* Time Out button removed as requested */}
            </div>
            {/* Removed duplicate Back to room selection button */}
          </div>
        )}
      </div>
    </div>
  );
}

export default RoomSelection;
