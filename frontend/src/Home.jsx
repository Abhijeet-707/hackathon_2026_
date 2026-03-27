import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { GraduationCap } from 'lucide-react';

const API = 'http://localhost:3000/api';

export default function Home({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await axios.post(`${API}/auth/login`, { email, password });
      const user = res.data.user;
      localStorage.setItem('user', JSON.stringify(user));
      if (onLogin) onLogin();
      if (user.role === 'owner') navigate('/owner');
      else if (user.role === 'admin') navigate('/admin');
      else navigate('/user');
    } catch {
      setError('Invalid email or password. Please try again.');
    } finally { setLoading(false); }
  };

  const quickLogin = (e, p) => { setEmail(e); setPassword(p); };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4f46e5 100%)'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', width: '100%', maxWidth: '440px', padding: '1rem' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '1rem', display: 'inline-flex', marginBottom: '1rem', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
            <GraduationCap size={36} color="#4f46e5" />
          </div>
          <h1 style={{ color: 'white', fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>PlacementPro</h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', marginTop: '0.25rem', fontSize: '0.95rem' }}>College Placement Management System</p>
        </div>

        {/* Card */}
        <div style={{ background: 'white', borderRadius: '20px', padding: '2.5rem', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
          <h2 style={{ marginBottom: '1.5rem', textAlign: 'center', fontSize: '1.2rem', color: '#1e1b4b' }}>Sign in to your account</h2>
          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label className="input-label">Email Address</label>
              <input type="email" required className="input-field" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="input-group">
              <label className="input-label">Password</label>
              <input type="password" required className="input-field" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            {error && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '1rem', background: '#fef2f2', padding: '0.5rem 0.75rem', borderRadius: '8px' }}>{error}</p>}
            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '0.5rem', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

          {/* Quick Login */}
          <div style={{ marginTop: '2rem', borderTop: '1px solid #e5e7eb', paddingTop: '1.5rem' }}>
            <p style={{ color: '#6b7280', fontSize: '0.8rem', textAlign: 'center', marginBottom: '0.75rem' }}>Quick Login (Demo)</p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {[
                { label: '👑 Owner', email: 'owner@tracker.com', pw: '123' },
                { label: '🏛️ Admin', email: 'admin@tracker.com', pw: '123' },
                { label: '🎓 Student', email: 'student@tracker.com', pw: '123' },
              ].map(d => (
                <button key={d.label} onClick={() => quickLogin(d.email, d.pw)} style={{
                  flex: 1, padding: '0.5rem', borderRadius: '8px', border: '1px solid #e5e7eb',
                  background: '#f9fafb', cursor: 'pointer', fontSize: '0.75rem', color: '#374151', fontWeight: 500, transition: 'all 0.2s'
                }} onMouseEnter={e => e.currentTarget.style.borderColor = '#4f46e5'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#e5e7eb'}>
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}