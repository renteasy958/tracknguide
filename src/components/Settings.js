import React from 'react';
import '../styles/settings.css';

export default function Settings({ onLogout }){
  return (
    <section className="settings-glow">
      <h2 className="settings-glow__title">Settings</h2>
      <div className="settings-glow__grid">
        <label className="settings-glow__row">Theme: <select><option>Light</option><option>Dark</option></select></label>
        <label className="settings-glow__row">Notifications: <input type="checkbox" defaultChecked /></label>
        <div className="settings-glow__row">
          <button className="settings-glow__logout" onClick={onLogout}>Logout</button>
        </div>
      </div>
    </section>
  );
}
