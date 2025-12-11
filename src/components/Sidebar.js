import React from 'react';
import '../styles/sidebar.css';
import { AiOutlineHome, AiOutlineHistory, AiOutlineEnvironment, AiOutlineSetting, AiOutlineQrcode } from 'react-icons/ai';

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
        <a className="sidebar-cedar__link" href="#maps">
          <AiOutlineEnvironment className="sidebar-cedar__icon" />
          <span>Maps</span>
        </a>
        <button className="sidebar-cedar__link sidebar-cedar__logout-btn" onClick={onLogout}>
          <AiOutlineSetting className="sidebar-cedar__icon" />
          <span>Logout</span>
        </button>
      </nav>
      <div className="sidebar-cedar__foot">v1.0</div>
    </aside>
  );
}
