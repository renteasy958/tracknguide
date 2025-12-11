import React, { useEffect, useState } from 'react';
import '../styles/history.css';

export default function History({ visits = [] }) {
  const [history, setHistory] = useState([]);
  const [selectedISODate, setSelectedISODate] = useState(null);
  const now = new Date();
  const [monthIndex, setMonthIndex] = useState(now.getMonth()); // 0-11, show current month by default
  const [year, setYear] = useState(now.getFullYear());
  const [selectedRole, setSelectedRole] = useState('All');

  useEffect(() => {
    // If parent passed visits, use those first
    if (visits && visits.length > 0) {
      setHistory(visits);
      return;
    }

    // Otherwise try reading history from localStorage (common keys), otherwise use sample data
    try {
      const raw = localStorage.getItem('history') || localStorage.getItem('historyData');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setHistory(parsed);
        } else if (typeof parsed === 'object' && parsed !== null) {
          // If stored as an object of date -> entries, normalize to array
          const normalized = Object.keys(parsed).flatMap(date => (
            (parsed[date] || []).map((item, idx) => ({ id: `${date}-${idx}`, date, ...((typeof item === 'string') ? { text: item } : item) }))
          ));
          setHistory(normalized);
        } else {
          setHistory([]);
        }
      } else {
        // Fallback sample data so UI is visible during development
        setHistory([
          { id: 1, date: `${year}-12-11`, name: 'Sample A', type: 'Student', timeIn: '08:12', timeOut: '12:00', room: 'Room 101' },
          { id: 2, date: `${year}-12-10`, name: 'Sample B', type: 'Visitor', timeIn: '09:05', timeOut: '10:30', room: 'Office' },
          { id: 3, date: `${year}-12-10`, name: 'Sample C', type: 'Student', timeIn: '07:58', timeOut: '11:30', room: 'Room 204' },
          { id: 4, date: `${year}-12-09`, name: 'Mr. Jose Perez', type: 'Teacher', timeIn: '08:00', timeOut: '12:00', room: 'Room 201' },
        ]);
      }
    } catch (e) {
      setHistory([]);
    }
  }, [visits, year]);

  // helpers
  const pad = (n) => String(n).padStart(2, '0');
  const monthNumber = monthIndex + 1; // 1-12
  const daysInMonth = new Date(year, monthNumber, 0).getDate();
  const monthName = new Date(year, monthIndex, 1).toLocaleString(undefined, { month: 'long' }).toUpperCase();

  // attempt to extract ISO date (YYYY-MM-DD) from a visit object
  const extractISODate = (v) => {
    if (!v) return null;
    if (v.date && typeof v.date === 'string' && /\d{4}-\d{2}-\d{2}/.test(v.date)) return v.date.split('T')[0];
    if (v.createdAt && typeof v.createdAt === 'string' && /\d{4}-\d{2}-\d{2}/.test(v.createdAt)) return v.createdAt.split('T')[0];
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
  const yearsSet = new Set();
  history.forEach(h => {
    const iso = extractISODate(h);
    if (iso) yearsSet.add(Number(iso.split('-')[0]));
  });
  if (yearsSet.size === 0) {
    const ny = now.getFullYear();
    for (let y = ny - 2; y <= ny + 1; y++) yearsSet.add(y);
  }
  const years = Array.from(yearsSet).sort((a, b) => b - a);
  // apply role filter to history for counting and display
  const filteredHistory = history.filter(h => {
    if (!selectedRole || selectedRole === 'All') return true;
    const t = (h.type || '').toString().toLowerCase();
    return t === selectedRole.toString().toLowerCase();
  });

  // build map of counts per day for the displayed month (from filtered history)
  const countsByDay = {};
  filteredHistory.forEach(entry => {
    const iso = extractISODate(entry);
    if (!iso) return;
    const [y, m, d] = iso.split('-');
    if (Number(y) === year && Number(m) === monthNumber) {
      const day = Number(d);
      countsByDay[day] = (countsByDay[day] || 0) + 1;
    }
  });

  const handleDayClick = (day) => {
    const iso = `${year}-${pad(monthNumber)}-${pad(day)}`;
    setSelectedISODate(prev => (prev === iso ? null : iso));
  };

  const handleMonthChange = (e) => {
    const mi = Number(e.target.value);
    setMonthIndex(mi);
    setSelectedISODate(null);
  };

  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value);
    setSelectedISODate(null);
  };

  const handleYearChange = (e) => {
    const y = Number(e.target.value);
    setYear(y);
    setSelectedISODate(null);
  };

  const getEntriesForISO = (iso) => {
    const matches = filteredHistory.filter(h => extractISODate(h) === iso);
    if (matches.length > 0) return matches;
    // fallback: if no entries are dated, return all visits so user still sees data
    if (history.length > 0 && history.every(h => extractISODate(h) === null)) return history.filter(h => {
      if (!selectedRole || selectedRole === 'All') return true;
      return (h.type || '').toString().toLowerCase() === selectedRole.toString().toLowerCase();
    });
    return [];
  };

  const selectedEntries = selectedISODate ? getEntriesForISO(selectedISODate) : [];

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

      <ul className="history-echo__dates">
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
          <li key={day} className="history-echo__date-item">
            <button
              className={`history-echo__date-btn ${selectedISODate === `${year}-${pad(monthNumber)}-${pad(day)}` ? 'is-open' : ''}`}
              onClick={() => handleDayClick(day)}
            >
              <span>{day}</span>
              <span>{countsByDay[day] ? `(${countsByDay[day]})` : ''}</span>
            </button>

            {selectedISODate === `${year}-${pad(monthNumber)}-${pad(day)}` && (
              <div className="history-echo__day-entries">
                {selectedEntries.length === 0 && (
                  <p className="history-echo__empty">No entries for this day.</p>
                )}

                {selectedEntries.length > 0 && (
                  <div className="home__logwrap">
                    <table className="home__table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Type</th>
                          <th>Time In</th>
                          <th>Time Out</th>
                          <th>Room</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedEntries.map((v, i) => (
                          <tr key={v.id || i} className="home__row">
                            <td>{v.name || v.text || '—'}</td>
                            <td>{v.type || '—'}</td>
                            <td>{v.timeIn || v.time || '—'}</td>
                            <td>{v.timeOut || '—'}</td>
                            <td>{v.room || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
