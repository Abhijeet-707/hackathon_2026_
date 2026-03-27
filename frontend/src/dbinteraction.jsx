import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Briefcase, CheckCircle, Clock, XCircle } from 'lucide-react';

const API = 'http://localhost:3000/api';
const getUser = () => JSON.parse(localStorage.getItem('user') || '{}');

export default function StudentDashboard() {
  const [stats, setStats] = useState({});
  const [apps, setApps] = useState([]);
  const user = getUser();
  const studentId = user.student_record_id;

  useEffect(() => {
    if (!studentId) return;
    axios.get(`${API}/dashboard?student_id=${studentId}`).then(r => setStats(r.data)).catch(console.error);
    axios.get(`${API}/applications?student_id=${studentId}`).then(r => setApps(r.data)).catch(console.error);
  }, [studentId]);

  const STATUS_COLORS = { Applied: '#3b82f6', Interview: '#f59e0b', Selected: '#22c55e', Rejected: '#ef4444' };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Welcome, {user.name?.split(' ')[0]}! 👋</h1>
          <p>Track your placement journey from here</p>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Applied', value: stats.applied_count || 0, color: '#3b82f6', icon: <Briefcase size={20} /> },
          { label: 'Interview', value: stats.interview_count || 0, color: '#f59e0b', icon: <Clock size={20} /> },
          { label: 'Selected', value: stats.selected_count || 0, color: '#22c55e', icon: <CheckCircle size={20} /> },
          { label: 'Rejected', value: stats.rejected_count || 0, color: '#ef4444', icon: <XCircle size={20} /> },
        ].map(c => (
          <div key={c.label} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: c.color + '18', color: c.color, padding: '0.8rem', borderRadius: '12px' }}>{c.icon}</div>
            <div><p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{c.label}</p>
              <p style={{ fontWeight: 700, fontSize: '1.5rem' }}>{c.value}</p></div>
          </div>
        ))}
      </div>

      {/* Recent Applications */}
      <div className="card">
        <h3 style={{ marginBottom: '1rem' }}>Recent Applications</h3>
        {apps.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>No applications yet. Browse <strong>Available Companies</strong> to apply!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {apps.slice(0, 5).map(a => (
              <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: '#f9fafb', borderRadius: '10px', borderLeft: `3px solid ${STATUS_COLORS[a.status]}` }}>
                <div>
                  <p style={{ fontWeight: 600 }}>{a.company_name}</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{a.company_role} · {a.package}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ background: STATUS_COLORS[a.status] + '20', color: STATUS_COLORS[a.status], padding: '0.2rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600 }}>{a.status}</span>
                  {a.interview_date && <p style={{ color: '#f59e0b', fontSize: '0.75rem', marginTop: '0.25rem' }}>📅 {new Date(a.interview_date).toLocaleDateString()}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}