import React from 'react';
import '../styles/home.css';
import logo from '../images/lcc.png';

export default function Home({ visits = [] }){
  const today = new Date();
  const dateStr = today.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const studentsCount = visits.filter(v => v.type && v.type.toLowerCase() === 'student').length;
  const visitorsCount = visits.filter(v => v.type && v.type.toLowerCase() === 'visitor').length;
  const teachersCount = visits.filter(v => v.type && v.type.toLowerCase() === 'teacher').length;
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
            <div className="home__count">
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

            <div className="home__count">
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

            <div className="home__count">
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
                <th>Room</th>
              </tr>
            </thead>
            <tbody>
              {visits.map((v, i) => (
                <tr key={i} className="home__row">
                  <td>{v.name}</td>
                  <td>{v.type}</td>
                  <td>{v.timeInFormatted || v.timeIn || '-'}</td>
                  <td>{v.timeOutFormatted || v.timeOut || '-'}</td>
                  <td>{v.room || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
