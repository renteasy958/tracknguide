import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

const QrPage = () => {
  const { userId } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const docRef = doc(db, 'users', userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setStudent(docSnap.data());
        } else {
          setError('Student not found');
        }
      } catch (err) {
        setError('Error fetching student');
      }
      setLoading(false);
    };
    fetchStudent();
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!student) return null;

  // QR code data (same as backend)
  const qrData = JSON.stringify({ email: student.email, token: student.id });

  return (
    <div style={{ textAlign: 'center', marginTop: 40 }}>
      <h2>{student.name}'s QR Code</h2>
      <QRCodeCanvas value={qrData} size={256} />
      <p style={{ marginTop: 24 }}>Use this QR code for timein and timeout.</p>
    </div>
  );
};

export default QrPage;
