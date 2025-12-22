import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import './App.css';
import Sidebar from './admin/components/Sidebar';
import Home from './admin/components/Home';
import QRCode from './admin/components/QRCode';
import QRForm from './admin/components/QRForm';
import History from './admin/components/History';
import Login from './admin/components/Login';
import UserPage from './user/components/UserPage';

// Admin Component
function AdminApp() {
  const [currentPage, setCurrentPage] = useState('home');
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return !!localStorage.getItem('loggedInUser');
    } catch (e) { return false; }
  });

  // Fetch real-time visits from Firestore
  useEffect(() => {
    const q = query(collection(db, 'visits'), orderBy('timeIn', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log('Visits snapshot received, total documents:', snapshot.docs.length);
      const visitsData = snapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Visit document:', doc.id, {
          name: data.name,
          timeIn: data.timeIn,
          timeOut: data.timeOut,
          timeOutFormatted: data.timeOutFormatted
        });
        return {
          id: doc.id,
          ...data,
          timeInRaw: data.timeIn, // ISO string for filtering
          timeIn: data.timeInFormatted || (data.timeIn ? new Date(data.timeIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'),
          timeOut: data.timeOut ? (data.timeOutFormatted || new Date(data.timeOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })) : '-',
          room: data.room || '-'
        };
      });
      console.log('Processed visits data:', visitsData);
      setVisits(visitsData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching visits:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleNavigate = (page) => {
    setCurrentPage(page);
    window.location.hash = `#${page}`;
  };

  const handleLogin = (user) => {
    setIsAuthenticated(true);
    setCurrentPage('home');
  };

  const handleLogout = () => {
    try { localStorage.removeItem('loggedInUser'); } catch (e) {}
    setIsAuthenticated(false);
    setCurrentPage('home');
  };

  const handleAddVisit = (visitData) => {
    // Visits are now handled by Firebase real-time listener
    // No need to manually update state
  };

  React.useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) || 'home';
      const basePage = hash.split('?')[0].split('-')[0]; // Handle qrform-timeout/qrform-timein
      setCurrentPage(basePage);
    };

    window.addEventListener('hashchange', handleHashChange);
    const initialHash = window.location.hash.slice(1) || 'home';
    const basePage = initialHash.split('?')[0].split('-')[0]; // Handle qrform-timeout/qrform-timein
    setCurrentPage(basePage);

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  if (loading) {
    return (
      <div className="app-root">
        <Sidebar onNavigate={handleNavigate} onLogout={handleLogout} />
        <main className="app-main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div>Loading visits...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-root">
      {currentPage !== 'qrform' && <Sidebar onNavigate={handleNavigate} onLogout={handleLogout} />}
      <main className="app-main">
        {currentPage === 'home' && <Home visits={visits} />}
        {currentPage === 'qrcode' && <QRCode onAddVisit={handleAddVisit} />}
        {currentPage === 'history' && <History visits={visits} />}
        {currentPage === 'qrform' && <QRForm onAddVisit={handleAddVisit} />}
      </main>
    </div>
  );
}

// Main App with Router
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<UserPage />} />
        <Route path="/user" element={<UserPage />} />
        <Route path="/admin" element={<AdminApp />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
