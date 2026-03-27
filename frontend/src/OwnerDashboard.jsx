import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Building2, Users, CheckCircle, BarChart3 } from 'lucide-react';

const API = 'http://localhost:3000/api';

export default function OwnerDashboard() {
  const [stats, setStats] = useState({});
  const [colleges, setColleges] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);

  useEffect(() => {
    axios.get(`${API}/dashboard`).then(r => setStats(r.data)).catch(console.error);
    axios.get(`${API}/colleges`).then(r => setColleges(r.data)).catch(console.error);
    axios.get(`${API}/owner/recent-users`).then(r => setRecentUsers(r.data)).catch(console.error);
  }, []);

  const placementRate = stats.total_students > 0
    ? Math.round(((stats.selected_count || 0) / stats.total_students) * 100) : 0;

  const cards = [
    { label: 'Active Colleges', value: stats.total_colleges || 0, color: '#4f46e5', icon: <Building2 size={22} /> },
    { label: 'Total Students', value: stats.total_students || 0, color: '#3b82f6', icon: <Users size={22} /> },
    { label: 'Total Placements', value: stats.selected_count || 0, color: '#22c55e', icon: <CheckCircle size={22} /> },
    { label: 'Platform Rate', value: placementRate + '%', color: '#f59e0b', icon: <BarChart3 size={22} /> },
  ];

  return (
    <div>
      <div className="page-header">
        <div><h1>Owner Dashboard</h1><p>Platform-wide overview and performance metrics</p></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {cards.map(c => (
          <div key={c.label} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: c.color + '18', color: c.color, padding: '0.9rem', borderRadius: '14px' }}>{c.icon}</div>
            <div><p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{c.label}</p>
              <p style={{ fontWeight: 700, fontSize: '1.6rem' }}>{c.value}</p></div>
          </div>
        ))}
      </div>
      {/* Quick College Summary */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)' }}><h3>College Summary</h3></div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: '#f9fafb' }}>
            {['College', 'Admin Email', 'Students', 'Placed', 'Rate'].map(h => (
              <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {colleges.map(c => {
              const rate = c.total_students > 0 ? Math.round((c.placed_students / c.total_students) * 100) : 0;
              return (
                <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{c.name}</td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{c.admin_email || '—'}</td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>{c.total_students}</td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: '#22c55e', fontWeight: 600 }}>{c.placed_students}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ flex: 1, height: '6px', background: '#e5e7eb', borderRadius: '999px' }}>
                        <div style={{ width: rate + '%', height: '100%', background: rate >= 70 ? '#22c55e' : rate >= 40 ? '#f59e0b' : '#ef4444', borderRadius: '999px' }} />
                      </div>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: rate >= 70 ? '#22c55e' : rate >= 40 ? '#f59e0b' : '#ef4444' }}>{rate}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Global Recent Registrations Log */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginTop: '2rem' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Global Recent Registrations</h3>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Real-time database reflection of the last 30 added admins and students.</p>
          </div>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4f46e5', background: '#ede9fe', padding: '0.3rem 0.6rem', borderRadius: '6px' }}>Live Connection</span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: '#f9fafb' }}>
            {['Name', 'Role', 'Assigned College', 'Email Address', 'Creation Time'].map(h => (
              <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {recentUsers.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}
                onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                onMouseLeave={e => e.currentTarget.style.background = ''}>
                <td style={{ padding: '0.75rem 1rem', fontWeight: 500, color: '#111827' }}>{u.name}</td>
                <td style={{ padding: '0.75rem 1rem' }}>
                  <span style={{ 
                    background: u.role === 'admin' ? '#fef3c7' : '#e0e7ff', 
                    color: u.role === 'admin' ? '#92400e' : '#3730a3', 
                    padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize' 
                  }}>{u.role}</span>
                </td>
                <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{u.college_name || '—'}</td>
                <td style={{ padding: '0.75rem 1rem', color: '#4b5563', fontSize: '0.85rem', fontFamily: 'monospace' }}>{u.email}</td>
                <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  {new Date(u.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                </td>
              </tr>
            ))}
            {recentUsers.length === 0 && <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No live records found yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
