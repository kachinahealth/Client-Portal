import React, { useState } from 'react';

export default function KachinaHealthLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = '/clienthome.html';
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Invalid email or password');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #2196f3 0%, #26a69a 50%, #66bb6a 100%)',
      height: '100vh',
      width: '100vw',
      margin: 0,
      padding: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'fixed',
      top: 0,
      left: 0,
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      <meta charSet="UTF-8" />
      <title>KachinaHealth - Client Portal</title>

      {/* Professional Login Form */}
      <div style={{
        background: '#000000',
        padding: '3rem',
        width: '400px',
        maxWidth: '90vw',
        textAlign: 'center',
        border: '1px solid #333333'
      }}>
        <img
          src="/logos/logo.png"
          alt="KachinaHealth Logo"
          style={{
            width: '140px',
            height: '140px',
            marginBottom: '1.5rem',
            objectFit: 'contain'
          }}
        />

        <h1 style={{
          color: '#ffffff',
          fontSize: '1.8rem',
          fontWeight: '700',
          margin: '0 0 2rem 0',
          letterSpacing: '1px'
        }}>
          Client Portal
        </h1>

        {error && (
          <div style={{
            background: '#ff4444',
            color: '#ffffff',
            padding: '1rem',
            marginBottom: '1.5rem',
            fontSize: '0.9rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              style={{
                width: '100%',
                padding: '1rem',
                border: '2px solid #555555',
                background: '#333333',
                color: '#ffffff',
                fontSize: '1rem',
                boxSizing: 'border-box',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              style={{
                width: '100%',
                padding: '1rem',
                border: '2px solid #555555',
                background: '#333333',
                color: '#ffffff',
                fontSize: '1rem',
                boxSizing: 'border-box',
                outline: 'none'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '1rem',
              background: '#1976d2',
              color: '#ffffff',
              border: 'none',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: 'pointer',
              boxSizing: 'border-box'
            }}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
