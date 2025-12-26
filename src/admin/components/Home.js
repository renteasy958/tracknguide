import React, { useState } from 'react';
import '../styles/home.css';
import logo from '../images/lcc.png';

export default function Home({ visits = [] }){
  const today = new Date();
  const dateStr = today.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // Helper to check if a visit is from today
  function isToday(visit) {
    const raw = visit.timeInRaw || visit.timeIn;
    if (!raw) return false;
    const visitDate = new Date(raw);
    return (
      visitDate.getFullYear() === today.getFullYear() &&
      visitDate.getMonth() === today.getMonth() &&
      visitDate.getDate() === today.getDate()
    );
  }

  const [filter, setFilter] = useState(null);
  const todayVisits = visits.filter(isToday);
  const filteredVisits = filter && filter !== 'all' ? todayVisits.filter(v => v.type && v.type.toLowerCase() === filter) : [];
  const studentsCount = todayVisits.filter(v => v.type && v.type.toLowerCase() === 'student').length;
  const visitorsCount = todayVisits.filter(v => v.type && v.type.toLowerCase() === 'visitor').length;
  const teachersCount = todayVisits.filter(v => v.type && v.type.toLowerCase() === 'teacher').length;
  return (
    <section className="home">
      <div className="home__hero">
        <h1 className="home__title">LA CONSOLACION COLLEGE ISABELA</h1>

        <div className="home__logo" aria-hidden="true">
          <img src={logo} alt="LCC Isabela logo" />
        </div>

        <div className="home__meta">
          <div className="home__date">{dateStr}</div>
          <div className="home__counts">
            <div className={`home__count${filter === 'student' ? ' home__count--active' : ''}`} onClick={() => setFilter('student')} style={{cursor:'pointer'}}>
              <div className="home__count-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="home__icon">
                  <path d="M12 2L1 7l11 5 9-4.09V17h2V7L12 2zM11 13.5L3.5 9 11 5.5 18.5 9 11 13.5z" />
                </svg>
              </div>
              <div className="home__count-body">
                <div className="home__count-num">{studentsCount}</div>
                <div className="home__count-label">Students</div>
              </div>
            </div>

            <div className={`home__count${filter === 'teacher' ? ' home__count--active' : ''}`} onClick={() => setFilter('teacher')} style={{cursor:'pointer'}}>
              <div className="home__count-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="home__icon">
                  <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z" />
                </svg>
              </div>
              <div className="home__count-body">
                <div className="home__count-num">{teachersCount}</div>
                <div className="home__count-label">Teachers</div>
              </div>
            </div>

            <div className={`home__count${filter === 'visitor' ? ' home__count--active' : ''}`} onClick={() => setFilter('visitor')} style={{cursor:'pointer'}}>
              <div className="home__count-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="home__icon">
                  <path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z" />
                </svg>
              </div>
              <div className="home__count-body">
                <div className="home__count-num">{visitorsCount}</div>
                <div className="home__count-label">Visitors</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="home__loglist">
        <div className="home__logwrap">
          <table className="home__table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Time In</th>
                <th>Time Out</th>
                <th>{filter === 'teacher' ? 'Department' : 'Room'}</th>
              </tr>
            </thead>
            <tbody>
              {filteredVisits.length === 0 ? (
                <tr><td colSpan="5" style={{textAlign:'center',color:'#888'}}>No data to display</td></tr>
              ) : (
                filteredVisits.map((v, i) => (
                  <tr key={i} className="home__row">
                    <td>{v.name}</td>
                    <td>{v.type}</td>
                    <td>{v.timeInFormatted || v.timeIn || '-'}</td>
                    <td>{v.timeOutFormatted || v.timeOut || '-'}</td>
                    <td>
                      {v.type && v.type.toLowerCase() === 'teacher'
                        ? (v.department || '-')
                        : (v.room || '-')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
