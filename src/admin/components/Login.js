import React, { useState } from 'react';
import '../styles/login.css';
import bg from '../images/bg.png';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const VALID_USERNAME = 'lccisabela@gmail.com';
    const VALID_PASSWORD = 'lcci';

    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
      const user = { username };
      localStorage.setItem('loggedInUser', JSON.stringify(user));
      if (onLogin) onLogin(user);
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="login-root">
      <div className="login-image" aria-hidden="true">
        <img src={bg} alt="LCC Isabela background" />
      </div>
      <form className="login-box" onSubmit={handleSubmit}>
        <h2 className="login-title">Please sign in</h2>

        {error && <div className="login-error">{error}</div>}

        <label className="login-label">Username
          <input
            className="login-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
          />
        </label>

        <label className="login-label">Password
          <input
            type="password"
            className="login-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        <div className="login-actions">
          <button className="login-btn" type="submit">Sign in</button>
        </div>
      </form>
    </div>
  );
}
