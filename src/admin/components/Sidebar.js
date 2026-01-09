import React from 'react';
import '../styles/sidebar.css';
import { AiOutlineHome, AiOutlineHistory, AiOutlineEnvironment, AiOutlineSetting, AiOutlineQrcode } from 'react-icons/ai';
import { FaUserGraduate, FaChalkboardTeacher } from 'react-icons/fa';

export default function Sidebar({ onNavigate, onLogout }){
  return (
    <aside className="sidebar-cedar">
      <div className="sidebar-cedar__brand">Track & Guide</div>
      <nav className="sidebar-cedar__nav">
        <a className="sidebar-cedar__link" href="#home">
          <AiOutlineHome className="sidebar-cedar__icon" />
          <span>Home</span>
        </a>
        <a className="sidebar-cedar__link" href="#qrcode">
          <AiOutlineQrcode className="sidebar-cedar__icon" />
          <span>QR Code</span>
        </a>
        <a className="sidebar-cedar__link" href="#history">
          <AiOutlineHistory className="sidebar-cedar__icon" />
          <span>History</span>
        </a>
        <a className="sidebar-cedar__link" href="#addstudent" onClick={e => { e.preventDefault(); onNavigate && onNavigate('addstudent'); }}>
          <FaUserGraduate className="sidebar-cedar__icon" />
          <span>Students</span>
        </a>
        <a className="sidebar-cedar__link" href="#teachers" onClick={e => { e.preventDefault(); onNavigate && onNavigate('teachers'); }}>
          <FaChalkboardTeacher className="sidebar-cedar__icon" />
          <span>Teachers</span>
        </a>
        <button className="sidebar-cedar__link sidebar-cedar__logout-btn" onClick={onLogout}>
          <AiOutlineSetting className="sidebar-cedar__icon" />
          <span>Logout</span>
        </button>
      </nav>
    </aside>
  );
}
