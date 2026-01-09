import React, { useState, useContext } from 'react';
import { collection, addDoc, query, orderBy, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
// You need to install 'react-qr-reader' for this to work
// npm install react-qr-reader
import { QrReader } from 'react-qr-reader';
import { ScanContext } from '../../ScanContext';

export default function QRScanner() {
  const [scanResult, setScanResult] = useState('');
  const [status, setStatus] = useState('');
  const { setScanned } = useContext(ScanContext);


  const handleResult = async (result, error) => {
    if (!!result) {
      const data = result?.text;
      console.log('[QRScanner] Scanned data:', data);
      setScanResult(data);
      setStatus('Processing...');
      try {
        // Assume QR code contains JSON: { name, type }
        const parsed = JSON.parse(data);
        const name = parsed.name;
        const type = (parsed.type || 'student').toLowerCase();
        if (!name) {
          setStatus('Invalid QR data: missing name');
          console.warn('[QRScanner] Invalid QR data, missing name:', parsed);
          return;
        }
        const now = new Date();
        // Check for active visit (no timeOut)
        const visitsRef = collection(db, 'visits');
        const q = query(visitsRef, orderBy('timeIn', 'desc'));
        const querySnapshot = await getDocs(q);
        const nameTrimmed = name.trim().toLowerCase();
        const activeVisit = querySnapshot.docs.find(docSnap => {
          const data = docSnap.data();
          return data.name && data.name.trim().toLowerCase() === nameTrimmed && !data.timeOut;
        });
        if (activeVisit) {
          // Register time out
          const visitDoc = doc(db, 'visits', activeVisit.id);
          await updateDoc(visitDoc, {
            timeOut: now.toISOString(),
            timeOutFormatted: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          });
          setStatus('Time out registered!');
          console.log('[QRScanner] Time out registered for', name);
          setScanned({ name, timeIn: activeVisit.data().timeIn });
        } else {
          // Register time in
          const visitData = {
            name,
            type,
            timeIn: now.toISOString(),
            timeInFormatted: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            date: now.toLocaleDateString(),
            timeOut: null,
            timeOutFormatted: null,
            room: parsed.room || '-',
            department: parsed.department || (type === 'teacher' ? (parsed.department || '-') : undefined)
          };
          console.log('[QRScanner] Writing visit to Firestore:', visitData);
          const docRef = await addDoc(collection(db, 'visits'), visitData);
          setStatus('Time in registered!');
          console.log('[QRScanner] Time in registered for', name, 'with doc id', docRef.id, 'data:', visitData);
          setScanned({ name, timeIn: now.toISOString() });
        }
      } catch (err) {
        setStatus('Error: ' + err.message);
        console.error('[QRScanner] Error during scan processing:', err);
      }
    }
    if (!!error) {
      setStatus('QR Scan Error: ' + error.message);
    }
  };

  const handleError = (err) => {
    setStatus('QR Scan Error: ' + err.message);
  };

  return (
    <div style={{ textAlign: 'center', marginTop: 40 }}>
      <h2>QR Code Scanner (Automatic)</h2>
      <QrReader
        onResult={handleResult}
        style={{ width: '300px', margin: 'auto' }}
      />
      <div style={{ marginTop: 20 }}>
        <strong>Status:</strong> {status}
      </div>
      {scanResult && (
        <div style={{ marginTop: 10 }}>
          <strong>Scanned Data:</strong> {scanResult}
        </div>
      )}
    </div>
  );
}
