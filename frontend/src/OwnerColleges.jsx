import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Trash2, Building2, Copy, Eye, EyeOff } from 'lucide-react';

const API = 'http://localhost:3000/api';

export default function OwnerColleges() {
  const [colleges, setColleges] = useState([]);
  const [form, setForm] = useState({ collegeName: '', adminName: '', adminEmail: '', adminPassword: '123' });
  const [showForm, setShowForm] = useState(false);
  const [newCreds, setNewCreds] = useState(null);
  const [visiblePwd, setVisiblePwd] = useState(false);
  const [copied, setCopied] = useState('');

  const fetch = () => axios.get(`${API}/colleges`).then(r => setColleges(r.data)).catch(console.error);
  useEffect(() => { fetch(); }, []);

  const add = async (e) => {
    e.preventDefault();
    try {
      const colRes = await axios.post(`${API}/colleges`, { name: form.collegeName });
      const cid = colRes.data.id;
      await axios.post(`${API}/owner/create-admin`, { name: form.adminName, email: form.adminEmail, password: form.adminPassword, college_id: cid });
      setNewCreds({ college: form.collegeName, name: form.adminName, email: form.adminEmail, password: form.adminPassword });
      setForm({ collegeName: '', adminName: '', adminEmail: '', adminPassword: '123' });
      setShowForm(false);
      fetch();
    } catch(err) { alert(err.response?.data?.error || 'Error creating college infrastructure'); }
  };
  
  const copy = (text, key) => { navigator.clipboard.writeText(text); setCopied(key); setTimeout(() => setCopied(''), 2000); };
  const remove = async (id) => {
    if (!window.confirm('Delete college and all associated data?')) return;
    await axios.delete(`${API}/colleges/${id}`); fetch();
  };

  return (
    <div>
      <div className="page-header">
        <div><h1>Colleges</h1><p>Manage all registered colleges on the platform</p></div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}><Plus size={18} /> Add College</button>
      </div>
      {showForm && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.25rem' }}>Create New Environment</h3>
          <form onSubmit={add}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">College Name *</label>
                <input required className="input-field" value={form.collegeName} onChange={e => setForm({ ...form, collegeName: e.target.value })} />
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Admin Name *</label>
                <input required className="input-field" value={form.adminName} onChange={e => setForm({ ...form, adminName: e.target.value })} />
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Admin Email *</label>
                <input required type="email" className="input-field" value={form.adminEmail} onChange={e => setForm({ ...form, adminEmail: e.target.value })} />
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Admin Password *</label>
                <input required className="input-field" value={form.adminPassword} onChange={e => setForm({ ...form, adminPassword: e.target.value })} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="submit" className="btn-primary">Provision Environment</button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {newCreds && (
        <div className="card" style={{ marginBottom: '1.5rem', background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
          <h4 style={{ color: '#166534', marginBottom: '0.75rem' }}>✅ Environment Created: {newCreds.college}</h4>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <strong style={{ color: '#166534' }}>Admin: {newCreds.name}</strong>
            <div>Email: <code style={{ background: '#dcfce7', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>{newCreds.email}</code>
              <button onClick={() => copy(newCreds.email, 'e')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied === 'e' ? '#22c55e' : '#6b7280', marginLeft: '0.5rem' }}><Copy size={13} /></button>
            </div>
            <div>Password: <code style={{ background: '#dcfce7', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>{visiblePwd ? newCreds.password : '••••••'}</code>
              <button onClick={() => setVisiblePwd(!visiblePwd)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', marginLeft: '0.5rem' }}>{visiblePwd ? <EyeOff size={13} /> : <Eye size={13} />}</button>
              <button onClick={() => copy(newCreds.password, 'p')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied === 'p' ? '#22c55e' : '#6b7280', marginLeft: '0.5rem' }}><Copy size={13} /></button>
            </div>
          </div>
        </div>
      )}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
          <h3>All Colleges ({colleges.length})</h3>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: '#f9fafb' }}>
            {['#', 'College Name', 'Admin Email', 'Students', 'Placed', 'Rate', 'Actions'].map(h => (
              <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {colleges.map((c, i) => {
              const rate = c.total_students > 0 ? Math.round((c.placed_students / c.total_students) * 100) : 0;
              return (
                <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{i + 1}</td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Building2 size={16} color="#4f46e5" /> {c.name}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{c.admin_email || '—'}</td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>{c.total_students}</td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: '#22c55e', fontWeight: 600 }}>{c.placed_students}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span style={{ color: rate >= 70 ? '#22c55e' : rate >= 40 ? '#f59e0b' : '#ef4444', fontWeight: 600 }}>{rate}%</span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <button onClick={() => remove(c.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={16} /></button>
                  </td>
                </tr>
              );
            })}
            {colleges.length === 0 && <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No colleges yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
