import React, { useState } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import Home from './components/Home';
import QRCode from './components/QRCode';
import QRForm from './components/QRForm';
import History from './components/History';
import Login from './components/Login';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [visits, setVisits] = useState([
    { name: 'Juan Dela Cruz', type: 'Student', timeIn: '08:12', timeOut: '12:00', room: 'Room 101' },
    { name: 'Maria Santos', type: 'Visitor', timeIn: '09:05', timeOut: '10:30', room: 'Office' },
    { name: 'Pedro Reyes', type: 'Student', timeIn: '07:58', timeOut: '11:30', room: 'Room 204' },
    { name: 'Ms. Carla Ramos', type: 'Teacher', timeIn: '08:30', timeOut: '12:15', room: 'Room 101' },
    { name: 'Anna Lee', type: 'Visitor', timeIn: '10:20', timeOut: '11:10', room: 'Library' }
  ]);

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return !!localStorage.getItem('loggedInUser');
    } catch (e) { return false; }
  });

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
    if (visitData.timeOut === true) {
      // Update the last visit with time out
      const now = new Date();
      const timeOutStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      setVisits(prevVisits => {
        const updatedVisits = [...prevVisits];
        if (updatedVisits.length > 0) {
          updatedVisits[updatedVisits.length - 1] = {
            ...updatedVisits[updatedVisits.length - 1],
            timeOut: timeOutStr
          };
        }
        return updatedVisits;
      });
      alert('Time Out recorded successfully!');
    } else {
      // Add new visit
      setVisits(prevVisits => [visitData, ...prevVisits]);
    }
  };

  // Handle hash-based routing
  React.useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) || 'home';
      const basePage = hash.split('?')[0];
      setCurrentPage(basePage);
    };

    window.addEventListener('hashchange', handleHashChange);
    const initialHash = window.location.hash.slice(1) || 'home';
    const basePage = initialHash.split('?')[0];
    setCurrentPage(basePage);

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
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

export default App;
