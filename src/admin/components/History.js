import React, { useEffect, useState } from 'react';
import '../styles/history.css';

export default function History({ visits = [] }) {
  const [history, setHistory] = useState([]);
  // Only use one selected day state for calendar
  const [selectedDay, setSelectedDay] = useState(null);
  const now = new Date();
  const [monthIndex, setMonthIndex] = useState(now.getMonth()); // 0-11, show current month by default
  const [year, setYear] = useState(now.getFullYear());
  const [selectedRole, setSelectedRole] = useState('All');

  useEffect(() => {
    // Use all visits for the calendar view
    if (visits && visits.length > 0) {
      setHistory(visits);
      return;
    }

    setHistory([]);
  }, [visits]);

  // helpers
  const pad = (n) => String(n).padStart(2, '0');
  const monthNumber = monthIndex + 1; // 1-12
  const daysInMonth = new Date(year, monthNumber, 0).getDate();
  const monthName = new Date(year, monthIndex, 1).toLocaleString(undefined, { month: 'long' }).toUpperCase();

  // attempt to extract ISO date (YYYY-MM-DD) from a visit object
  const extractISODate = (v) => {
    if (!v) return null;
    
    // First check if date field exists and convert to ISO format
    if (v.date && typeof v.date === 'string') {
      // If it's already in ISO format (YYYY-MM-DD)
      if (/\d{4}-\d{2}-\d{2}/.test(v.date)) {
        return v.date.split('T')[0];
      }
      // If it's in local format like "12/12/2025", convert it
      try {
        const dateObj = new Date(v.date);
        if (!isNaN(dateObj.getTime())) {
          const y = dateObj.getFullYear();
          const m = pad(dateObj.getMonth() + 1);
          const d = pad(dateObj.getDate());
          return `${y}-${m}-${d}`;
        }
      } catch (e) {
        // ignore
      }
    }
    
    if (v.createdAt && typeof v.createdAt === 'string' && /\d{4}-\d{2}-\d{2}/.test(v.createdAt)) {
      return v.createdAt.split('T')[0];
    }
    
    // search any string field for ISO date
    for (const val of Object.values(v)) {
      if (typeof val === 'string') {
        const m = val.match(/(\d{4}-\d{2}-\d{2})/);
        if (m) return m[1];
      }
      if (val instanceof Date) return val.toISOString().split('T')[0];
    }
    return null;
  };

  // derive available years from history/visits (fallback to a small range)
  const years = [2025, 2026, 2027, 2028, 2029, 2030];
  // apply role filter to history for counting and display
  const filteredHistory = history.filter(h => {
    if (!selectedRole || selectedRole === 'All') return true;
    const t = (h.type || '').toString().toLowerCase();
    return t === selectedRole.toString().toLowerCase();
  });

  // build map of counts per day for the displayed month (from filtered history)
  const countsByDay = {};
  const calendarData = {};
  filteredHistory.forEach(entry => {
    const iso = extractISODate(entry);
    if (!iso) return;
    const [y, m, d] = iso.split('-');
    if (Number(y) === year && Number(m) === monthNumber) {
      const day = Number(d);
      countsByDay[day] = (countsByDay[day] || 0) + 1;
      if (!calendarData[iso]) calendarData[iso] = [];
      calendarData[iso].push(entry);
    }
  });

  const handleDayClick = (day) => {
    const iso = `${year}-${pad(monthNumber)}-${pad(day)}`;
    setSelectedDay(prev => (prev === iso ? null : iso));
  };

  const handleMonthChange = (e) => {
    const mi = Number(e.target.value);
    setMonthIndex(mi);
    setSelectedDay(null);
  };

  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value);
    setSelectedDay(null);
  };

  const handleYearChange = (e) => {
    const y = Number(e.target.value);
    setYear(y);
    setSelectedDay(null);
  };

  const selectedEntries = selectedDay ? calendarData[selectedDay] || [] : [];

  return (
    <section className="history-echo">
      <div className="history-echo__controls">
        <label className="history-echo__label">Month:
          <select className="history-echo__select" value={monthIndex} onChange={handleMonthChange}>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={i}>{new Date(0, i).toLocaleString(undefined, { month: 'long' })}</option>
            ))}
          </select>
        </label>
        <label className="history-echo__label">Year:
          <select className="history-echo__select" value={year} onChange={handleYearChange}>
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </label>
        <label className="history-echo__label">Role:
          <select className="history-echo__select" value={selectedRole} onChange={handleRoleChange}>
            <option value="All">All</option>
            <option value="Student">Students</option>
            <option value="Visitor">Visitors</option>
            <option value="Teacher">Teachers</option>
          </select>
        </label>
      </div>
      <h2 className="history-echo__title">{monthName} {year}</h2>
      {/* Calendar header row: Sunday to Saturday */}
      <div className="history-echo__calendar-header">
        {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(dayName => (
          <div key={dayName} className="history-echo__calendar-header-cell">{dayName}</div>
        ))}
      </div>
      <div className="history-echo__calendar-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
        {/* Empty cells for days before the first of the month */}
        {Array.from({ length: new Date(year, monthIndex, 1).getDay() }, (_, i) => (
          <div key={`empty-${i}`} className="history-echo__calendar-cell empty"></div>
        ))}
        {/* Calendar dates aligned to days */}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
          <div key={day} className="history-echo__calendar-cell">
            <button
                className={`history-echo__date-btn ${selectedDay === `${year}-${pad(monthNumber)}-${pad(day)}` ? 'is-open' : ''}`}
                style={{ fontFamily: 'Poppins, Arial, Helvetica, sans-serif' }}
              onClick={() => handleDayClick(day)}
            >
              <span>{day}</span>
              {countsByDay[day] ? (
                <span className="history-echo__date-count">{countsByDay[day]}</span>
              ) : null}
            </button>
          </div>
        ))}
      </div>
      {/* Data for selected day below the calendar */}
      {selectedDay && (
        <div className="history-echo__day-entries">
          {selectedEntries.length === 0 ? (
            <p className="history-echo__empty">No entries for this day.</p>
          ) : (
            <div className="home__logwrap">
              <table className="home__table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Time In</th>
                    <th>Time Out</th>
                    {selectedRole === 'All' && <th>Room</th>}
                    {(selectedRole === 'All' || selectedRole === 'Teacher') && <th>Department</th>}
                    {selectedRole === 'Visitor' && <th>Room</th>}
                  </tr>
                </thead>
                <tbody>
                  {selectedEntries.map((v, i) => (
                    <tr key={v.id || i} className="home__row">
                      <td>{v.name || v.text || '—'}</td>
                      <td>{v.type || '—'}</td>
                      <td>{v.timeInFormatted || v.timeIn || v.time || '—'}</td>
                      <td>{v.timeOutFormatted || v.timeOut || '—'}</td>
                      {selectedRole === 'All' && <td>{v.room || '—'}</td>}
                      {(selectedRole === 'All' || selectedRole === 'Teacher') && <td>{v.department || '—'}</td>}
                      {selectedRole === 'Visitor' && <td>{v.room || '—'}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
