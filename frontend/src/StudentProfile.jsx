import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { User, GraduationCap, Award } from 'lucide-react';

const API = 'http://localhost:3000/api';
const getUser = () => JSON.parse(localStorage.getItem('user') || '{}');

export default function StudentProfile() {
  const [profile, setProfile] = useState(null);
  const user = getUser();

  useEffect(() => {
    axios.get(`${API}/student/profile?user_id=${user.id}`).then(r => setProfile(r.data)).catch(console.error);
  }, []);

  if (!profile) return <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>Loading profile...</div>;

  const fields = [
    { label: 'Full Name', value: profile.name },
    { label: 'Email', value: profile.email },
    { label: 'College', value: profile.college_name },
    { label: 'Branch', value: profile.branch },
  ];

  const marks = [
    { label: 'CGPA', value: parseFloat(profile.cgpa || 0).toFixed(2), color: parseFloat(profile.cgpa) >= 7.5 ? '#22c55e' : parseFloat(profile.cgpa) >= 6 ? '#f59e0b' : '#ef4444' },
  ];

  return (
    <div>
      <div className="page-header">
        <div><h1>My Profile</h1><p>Your academic profile used for placement eligibility</p></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Personal Info */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ background: '#ede9fe', borderRadius: '12px', padding: '0.75rem' }}><User size={20} color="#4f46e5" /></div>
            <h3>Personal Information</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {fields.map(f => (
              <div key={f.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid #f3f4f6' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{f.label}</span>
                <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{f.value || '—'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Academic Performance */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ background: '#dcfce7', borderRadius: '12px', padding: '0.75rem' }}><Award size={20} color="#22c55e" /></div>
            <h3>Academic Performance</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {marks.map(m => (
              <div key={m.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{m.label}</span>
                  <span style={{ fontWeight: 700, fontSize: '1rem', color: m.color }}>{m.value}</span>
                </div>
                <div style={{ height: '8px', background: '#e5e7eb', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: '999px', background: m.color, transition: 'width 1s',
                    width: m.label === 'CGPA' ? (parseFloat(m.value) / 10 * 100) + '%' : parseFloat(m.value) + '%'
                  }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f9fafb', borderRadius: '10px' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Eligibility Status</p>
            <p style={{ fontWeight: 600, color: parseFloat(profile.cgpa) >= 6 ? '#22c55e' : '#f59e0b', fontSize: '0.9rem' }}>
              {parseFloat(profile.cgpa) >= 7.5 ? '✅ Eligible for most companies' : parseFloat(profile.cgpa) >= 6 ? '⚠️ Eligible for select companies' : '❌ Limited eligibility — contact admin'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
