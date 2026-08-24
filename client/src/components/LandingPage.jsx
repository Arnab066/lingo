import React, { useState } from 'react';
import { useSound } from '../hooks/useSound';
import { Sparkles, Star } from 'lucide-react';

const LandingPage = ({ onAuthSuccess }) => {
  const { playClick, playCorrect } = useSound();
  const [tab, setTab] = useState('register'); // register or login
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleTabChange = (selectedTab) => {
    playClick();
    setTab(selectedTab);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    playClick();
    setLoading(true);
    setError('');

    const endpoint = tab === 'register' ? 'register' : 'login';
    const payload = tab === 'register' 
      ? { username: formData.username, email: formData.email, password: formData.password }
      : { email: formData.email, password: formData.password };

    try {
      const response = await fetch(`http://localhost:5000/api/auth/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        playCorrect();
        // Save JWT to LocalStorage
        localStorage.setItem('lingo_token', data.token);
        onAuthSuccess(data.user, data.token);
      } else {
        setError(data.msg || 'Authentication failed. Please verify credentials.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection failure connecting to database backend.');
    }
    setLoading(false);
  };

  return (
    <div className="landing-container">
      {/* Landing Header */}
      <header className="landing-header">
        <div className="logo">
          <span>🦉</span>
          <span>Lingo</span>
        </div>
        <div style={{ display: 'flex', gap: '8px', fontSize: '14px', color: 'var(--color-super)', fontWeight: '800' }}>
          <Sparkles size={16} />
          <span>MERN JWT Stack Active</span>
        </div>
      </header>

      {/* Hero section */}
      <main className="landing-hero">
        <div className="landing-mascot-area">
          {/* Custom cartoon owl SVG mascot representation */}
          <svg className="landing-mascot" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Body */}
            <rect x="35" y="45" width="130" height="130" rx="65" fill="#58cc02" />
            
            {/* Soft Chest */}
            <rect x="55" y="100" width="90" height="65" rx="32.5" fill="#ffffff" />
            {/* Scale details */}
            <path d="M75 115 C 80 125, 90 125, 95 115" stroke="#e5e5e5" strokeWidth="4" strokeLinecap="round" />
            <path d="M105 115 C 110 125, 120 125, 125 115" stroke="#e5e5e5" strokeWidth="4" strokeLinecap="round" />
            <path d="M90 135 C 95 145, 105 145, 110 135" stroke="#e5e5e5" strokeWidth="4" strokeLinecap="round" />

            {/* Eyes */}
            <circle cx="70" cy="80" r="30" fill="#ffffff" />
            <circle cx="70" cy="80" r="14" fill="#5c3600" />
            <circle cx="65" cy="75" r="5" fill="#ffffff" />

            <circle cx="130" cy="80" r="30" fill="#ffffff" />
            <circle cx="130" cy="80" r="14" fill="#5c3600" />
            <circle cx="125" cy="75" r="5" fill="#ffffff" />

            {/* Beak */}
            <path d="M90 88 L110 88 L100 108 Z" fill="#ff9600" />

            {/* Feet */}
            <circle cx="75" cy="178" r="12" fill="#ff9600" />
            <circle cx="125" cy="178" r="12" fill="#ff9600" />
          </svg>
          
          <h2 style={{ fontSize: '18px', color: 'var(--color-gray-dark)', marginTop: '20px', textAlign: 'center' }}>
            Meet Duo's cousin! The fun way to learn languages.
          </h2>
        </div>

        <div className="landing-action-area">
          <h1 className="landing-title">
            The free, fun, and effective way to learn a language!
          </h1>

          <div className="landing-auth-card">
            <div className="auth-tabs">
              <div 
                className={`auth-tab ${tab === 'register' ? 'active' : ''}`}
                onClick={() => handleTabChange('register')}
              >
                Get Started
              </div>
              <div 
                className={`auth-tab ${tab === 'login' ? 'active' : ''}`}
                onClick={() => handleTabChange('login')}
              >
                Log In
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              {error && <div className="auth-error">{error}</div>}

              {tab === 'register' && (
                <div className="form-group">
                  <label>Username</label>
                  <input 
                    type="text" 
                    name="username" 
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="LingoLearner"
                    required
                  />
                </div>
              )}

              <div className="form-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="name@domain.com"
                  required
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input 
                  type="password" 
                  name="password" 
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  required
                />
              </div>

              <button 
                type="submit" 
                className="btn-3d btn-green"
                style={{ width: '100%', marginTop: '16px', padding: '14px', fontSize: '16px' }}
                disabled={loading}
              >
                {loading ? 'Connecting...' : (tab === 'register' ? 'Create Account' : 'Sign In')}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
