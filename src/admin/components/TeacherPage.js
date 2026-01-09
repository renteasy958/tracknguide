import React, { useState, useEffect } from 'react';
import { FaTrash } from 'react-icons/fa';
import '../styles/addStudent.css';
import '../styles/globalNoScroll.css';
import { collection, getDocs, setDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';

const TeacherRow = ({ teacher, onDelete }) => (
  <tr>
    <td style={{ padding: '10px 24px', borderRight: '16px solid transparent' }}>{teacher.name}</td>
    <td style={{ padding: '10px 24px' }}>{teacher.department}</td>
    <td style={{ padding: '10px 24px' }}>{teacher.email}</td>
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

const departmentOptions = [
  'Highschool', 'College'
];

const TeacherPage = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalForm, setModalForm] = useState({ name: '', department: departmentOptions[0], email: '' });
  const [filterDepartment, setFilterDepartment] = useState('all');

  useEffect(() => {
    const fetchTeachers = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const teachersData = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.type === 'teacher') {
            teachersData.push(data);
          }
        });
        setTeachers(teachersData.reverse());
      } catch (err) {
        console.error('Error fetching teachers from Firestore:', err);
      }
      setLoading(false);
    };
    fetchTeachers();
  }, []);

  const filteredTeachers = teachers.filter(t =>
    filterDepartment === 'all' || t.department === filterDepartment
  );

  const handleModalChange = (e) => {
    setModalForm({ ...modalForm, [e.target.name]: e.target.value });
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    const userId = `teacher_${Date.now()}`;
    const teacherData = {
      id: userId,
      name: modalForm.name,
      email: modalForm.email,
      department: modalForm.department,
      type: 'teacher',
      registeredAt: new Date().toISOString()
    };
    try {
      await setDoc(doc(db, 'users', userId), teacherData);
      // Generate QR code data as JSON string for teacher
      const qrData = JSON.stringify({ name: modalForm.name, type: 'teacher' });
      // Send to backend for QR email with QR data
      await fetch('http://localhost:5000/send-teacher-qr-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: modalForm.name,
          email: modalForm.email,
          qrData
        })
      });
      const querySnapshot = await getDocs(collection(db, 'users'));
      const teachersData = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.type === 'teacher') {
          teachersData.push(data);
        }
      });
      setTeachers(teachersData.reverse());
    } catch (err) {
      console.error('Failed to add teacher or send email:', err);
    }
    setShowModal(false);
    setModalForm({ name: '', department: departmentOptions[0], email: '' });
  };

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
          <span style={{ fontSize: '2rem', fontWeight: 700, color: '#222b45', marginRight: 18 }}>Teacher</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <label style={{ fontWeight: 500, marginRight: 4 }}>Department:</label>
            <select value={filterDepartment} onChange={e => setFilterDepartment(e.target.value)} style={{ padding: '4px 10px', borderRadius: 5, border: '1px solid #d1d5db', fontSize: '1rem', minWidth: 120 }}>
              <option value="all">All</option>
              {departmentOptions.map(dep => (
                <option key={dep} value={dep}>{dep}</option>
              ))}
            </select>
          </div>
          <span style={{ fontWeight: 600, color: '#1976d2', marginLeft: 18, fontSize: '1.1rem' }}>
            Total: {filteredTeachers.length}
          </span>
        </div>
        <button
          style={{ padding: '10px 24px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 2px 8px rgba(25, 118, 210, 0.08)' }}
          onClick={() => setShowModal(true)}
        >
          Add Teacher
        </button>
      </div>
      <table style={{ borderCollapse: 'collapse', minWidth: 500, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(25, 118, 210, 0.08)' }}>
        <thead>
          <tr style={{ background: '#f4f6fa', color: '#222b45' }}>
            <th style={{ padding: '12px 24px', textAlign: 'left', fontWeight: 600, borderRight: '16px solid transparent' }}>Name</th>
            <th style={{ padding: '12px 24px', textAlign: 'left', fontWeight: 600 }}>Department</th>
            <th style={{ padding: '12px 24px', textAlign: 'left', fontWeight: 600 }}>Email</th>
            <th style={{ padding: '12px 24px', textAlign: 'right', fontWeight: 600, width: 60, minWidth: 60, maxWidth: 60 }}></th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan="4" style={{ textAlign: 'center', color: '#888', padding: 24 }}>Loading teachers...</td></tr>
          ) : filteredTeachers.length === 0 ? (
            <tr><td colSpan="4" style={{ textAlign: 'center', color: '#888', padding: 24 }}>No teachers found for this filter.</td></tr>
          ) : (
            filteredTeachers.map((teacher, idx) => (
              <TeacherRow
                key={teacher.id || idx}
                teacher={teacher}
                onDelete={async () => {
                  if (teacher.id) {
                    await deleteDoc(doc(db, 'users', teacher.id));
                  }
                  const querySnapshot = await getDocs(collection(db, 'users'));
                  const teachersData = [];
                  querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    if (data.type === 'teacher') {
                      teachersData.push(data);
                    }
                  });
                  setTeachers(teachersData.reverse());
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
            <div style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: 18 }}>Add Teacher</div>
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
                <label style={{ display: 'block', fontWeight: 500, marginBottom: 6 }}>Department</label>
                <select
                  name="department"
                  value={modalForm.department}
                  onChange={handleModalChange}
                  required
                  style={{ width: '100%', padding: 8, borderRadius: 5, border: '1px solid #d1d5db', fontSize: '1rem' }}
                >
                  {departmentOptions.map(dep => (
                    <option key={dep} value={dep}>{dep}</option>
                  ))}
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

export default TeacherPage;
