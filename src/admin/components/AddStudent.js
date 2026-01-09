import React, { useState, useEffect } from 'react';
import { FaTrash } from 'react-icons/fa';
import '../styles/addStudent.css';
import '../styles/globalNoScroll.css';



import { collection, getDocs, setDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase'; // will update below


const StudentRow = ({ student, onDelete }) => {
  return (
    <tr>
      <td style={{ padding: '10px 24px', borderRight: '16px solid transparent' }}>{student.name}</td>
      <td style={{ padding: '10px 24px' }}>{student.course}</td>
      <td style={{ padding: '10px 24px' }}>{student.year}</td>
      <td style={{ padding: '10px 24px', maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{student.email}</td>
      <td style={{ padding: '10px 24px', textAlign: 'right', width: 60, minWidth: 60, maxWidth: 60 }}>
        <button
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#d32f2f',
            fontSize: '1.3rem',
            padding: 0,
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Delete"
          onClick={onDelete}
        >
          <FaTrash />
        </button>
      </td>
    </tr>
  );
};

const AddStudent = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalForm, setModalForm] = useState({ name: '', course: 'BSIT', year: '1', email: '' });
  // Filter state
  const [filterCourse, setFilterCourse] = useState('all');
  const [filterYear, setFilterYear] = useState('all');
  // Fetch students from Firestore on mount
  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const studentsData = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.type === 'student') {
            studentsData.push(data);
          }
        });
        setStudents(studentsData.reverse());
      } catch (err) {
        // Optionally handle error
        console.error('Error fetching students from Firestore:', err);
      }
      setLoading(false);
    };
    fetchStudents();
  }, []);

  const handleModalChange = (e) => {
    setModalForm({ ...modalForm, [e.target.name]: e.target.value });
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    // Save to Firestore first
    const userId = `student_${Date.now()}`;
    const studentData = {
      id: userId,
      name: modalForm.name,
      email: modalForm.email,
      course: modalForm.course,
      year: modalForm.year,
      type: 'student',
      registeredAt: new Date().toISOString()
    };
    try {
      await setDoc(doc(db, 'users', userId), studentData);
      // Re-fetch students from Firestore
      const querySnapshot = await getDocs(collection(db, 'users'));
      const studentsData = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.type === 'student') {
          studentsData.push(data);
        }
      });
      setStudents(studentsData.reverse());
      // Generate QR code data as JSON string for student, including name, course, and year
      const qrData = JSON.stringify({
        name: modalForm.name,
        course: modalForm.course,
        year: modalForm.year,
        type: 'student'
      });
      // Validate required fields before sending email
      if (!modalForm.name || !modalForm.email) {
        alert('Name and email are required to send the QR code email.');
      } else {
        // Debug: log payload
        const payload = {
          name: modalForm.name,
          email: modalForm.email,
          qrData
        };
        console.log('Sending QR email payload:', payload);
        // Send to backend for QR email with QR data
        await fetch('http://localhost:5000/send-student-qr-link', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
    } catch (err) {
      // Optionally handle error (e.g., show a message)
      console.error('Failed to add student or send email:', err);
    }
    setShowModal(false);
    setModalForm({ name: '', course: 'BSIT', year: '1', email: '' });
  };

  // Filtered students
  const filteredStudents = students.filter(s =>
    (filterCourse === 'all' || s.course === filterCourse) &&
    (filterYear === 'all' || s.year === filterYear)
  );

  // Unique course and year options
  const courseOptions = ['BSIT', 'BSBA', 'BSHM', 'TED'];
  const yearOptions = ['1', '2', '3', '4'];

  return (
    <div style={{ padding: '32px 32px 0 32px' }}>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
        flexWrap: 'wrap',
        gap: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <span style={{ fontSize: '2rem', fontWeight: 700, color: '#222b45', marginRight: 18 }}>Student</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <label style={{ fontWeight: 500, marginRight: 4 }}>Course:</label>
            <select value={filterCourse} onChange={e => setFilterCourse(e.target.value)} style={{ padding: '4px 10px', borderRadius: 5, border: '1px solid #d1d5db', fontSize: '1rem', minWidth: 80 }}>
              <option value="all">All</option>
              {courseOptions.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 10 }}>
            <label style={{ fontWeight: 500, marginRight: 4 }}>Year:</label>
            <select value={filterYear} onChange={e => setFilterYear(e.target.value)} style={{ padding: '4px 10px', borderRadius: 5, border: '1px solid #d1d5db', fontSize: '1rem', minWidth: 60 }}>
              <option value="all">All</option>
              {yearOptions.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <span style={{ fontWeight: 600, color: '#1976d2', marginLeft: 18, fontSize: '1.1rem' }}>
            Total: {filteredStudents.length}
          </span>
        </div>
        <button
          style={{ padding: '10px 24px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 2px 8px rgba(25, 118, 210, 0.08)' }}
          onClick={() => setShowModal(true)}
        >
          Add Student
        </button>
      </div>

      <table style={{ borderCollapse: 'collapse', minWidth: 500, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(25, 118, 210, 0.08)' }}>
        <thead>
          <tr style={{ background: '#f4f6fa', color: '#222b45' }}>
            <th style={{ padding: '12px 24px', textAlign: 'left', fontWeight: 600, borderRight: '16px solid transparent' }}>Name</th>
            <th style={{ padding: '12px 24px', textAlign: 'left', fontWeight: 600 }}>Course</th>
            <th style={{ padding: '12px 24px', textAlign: 'left', fontWeight: 600 }}>Year</th>
            <th style={{ padding: '12px 24px', textAlign: 'left', fontWeight: 600, maxWidth: 220 }}>Email</th>
            <th style={{ padding: '12px 24px', textAlign: 'right', fontWeight: 600, width: 60, minWidth: 60, maxWidth: 60 }}></th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan="4" style={{ textAlign: 'center', color: '#888', padding: 24 }}>Loading students...</td></tr>
          ) : filteredStudents.length === 0 ? (
            <tr><td colSpan="4" style={{ textAlign: 'center', color: '#888', padding: 24 }}>No students found for this filter.</td></tr>
          ) : (
            filteredStudents.map((student, idx) => (
              <StudentRow
                key={student.id || idx}
                student={student}
                onDelete={async () => {
                  // Remove from Firestore
                  if (student.id) {
                    await deleteDoc(doc(db, 'users', student.id));
                  }
                  // Re-fetch students from Firestore
                  const querySnapshot = await getDocs(collection(db, 'users'));
                  const studentsData = [];
                  querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    if (data.type === 'student') {
                      studentsData.push(data);
                    }
                  });
                  setStudents(studentsData.reverse());
                }}
              />
            ))
          )}
        </tbody>
      </table>

      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ background: '#fff', borderRadius: 10, padding: 32, minWidth: 340, boxShadow: '0 4px 24px rgba(0,0,0,0.13)' }}>
            <div style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: 18 }}>Add Student</div>
            <form onSubmit={handleModalSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontWeight: 500, marginBottom: 6 }}>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={modalForm.name}
                  onChange={handleModalChange}
                  required
                  style={{ width: '100%', padding: 8, borderRadius: 5, border: '1px solid #d1d5db', fontSize: '1rem' }}
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontWeight: 500, marginBottom: 6 }}>Course</label>
                <select
                  name="course"
                  value={modalForm.course}
                  onChange={handleModalChange}
                  required
                  style={{ width: '100%', padding: 8, borderRadius: 5, border: '1px solid #d1d5db', fontSize: '1rem' }}
                >
                  <option value="BSIT">BSIT</option>
                  <option value="BSBA">BSBA</option>
                  <option value="TED">TED</option>
                  <option value="BSHM">BSHM</option>
                </select>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontWeight: 500, marginBottom: 6 }}>Year</label>
                <select
                  name="year"
                  value={modalForm.year}
                  onChange={handleModalChange}
                  required
                  style={{ width: '100%', padding: 8, borderRadius: 5, border: '1px solid #d1d5db', fontSize: '1rem' }}
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                </select>
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontWeight: 500, marginBottom: 6 }}>Email</label>
                <input
                  type="email"
                  name="email"
                  value={modalForm.email}
                  onChange={handleModalChange}
                  required
                  style={{ width: '100%', padding: 8, borderRadius: 5, border: '1px solid #d1d5db', fontSize: '1rem' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '8px 18px', background: '#eee', color: '#333', border: 'none', borderRadius: 5, fontWeight: 500, fontSize: '1rem', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 18px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 5, fontWeight: 500, fontSize: '1rem', cursor: 'pointer' }}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddStudent;
