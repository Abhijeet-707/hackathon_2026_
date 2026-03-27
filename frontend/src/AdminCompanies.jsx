import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Trash2, Briefcase } from 'lucide-react';

const API = 'http://localhost:3000/api';
const getAdmin = () => JSON.parse(localStorage.getItem('user') || '{}');
const BRANCHES = ['CE', 'IT', 'ECE', 'ME', 'Civil', 'EE', 'CS'];
const empty = { name: '', role: '', package: '', jd: '', min_cgpa: '', allowed_branches: [] };

export default function AdminCompanies() {
  const [companies, setCompanies] = useState([]);
  const [form, setForm] = useState(empty);
  const [showForm, setShowForm] = useState(false);

  const admin = getAdmin();
  const fetch = () => axios.get(`${API}/companies?college_id=${admin.college_id}`).then(r => setCompanies(r.data)).catch(console.error);
  useEffect(() => { fetch(); }, []);

  const toggleArr = (key, val) => {
    setForm(f => ({
      ...f,
      [key]: f[key].includes(val) ? f[key].filter(v => v !== val) : [...f[key], val]
    }));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/admin/companies`, { ...form, college_id: admin.college_id });
      setForm(empty); setShowForm(false); fetch();
    } catch (err) { alert(err.response?.data?.error || 'Error'); }
  };

  const remove = async (id) => { if (!window.confirm('Delete this company?')) return; await axios.delete(`${API}/admin/companies/${id}`); fetch(); };

  return (
    <div>
      <div className="page-header">
        <div><h1>Company Management</h1><p>Add companies and set eligibility criteria</p></div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}><Plus size={18} /> Add Company</button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.25rem' }}>Add New Company</h3>
          <form onSubmit={handleAdd}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              <div className="input-group"><label className="input-label">Company Name *</label>
                <input required className="input-field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div className="input-group"><label className="input-label">Job Role *</label>
                <input required className="input-field" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} /></div>
              <div className="input-group"><label className="input-label">Package (CTC)</label>
                <input className="input-field" value={form.package} onChange={e => setForm({ ...form, package: e.target.value })} /></div>
              <div className="input-group"><label className="input-label">Min CGPA</label>
                <input type="number" step="0.01" className="input-field" value={form.min_cgpa} onChange={e => setForm({ ...form, min_cgpa: e.target.value })} /></div>
            </div>
            <div className="input-group">
              <label className="input-label">Job Description</label>
              <textarea rows={2} className="input-field" value={form.jd} onChange={e => setForm({ ...form, jd: e.target.value })} />
            </div>
            {/* Branch Selector */}
            <div className="input-group">
              <label className="input-label">Allowed Branches (click to select)</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.3rem' }}>
                {BRANCHES.map(b => (
                  <button key={b} type="button" onClick={() => toggleArr('allowed_branches', b)} style={{
                    padding: '0.3rem 0.75rem', borderRadius: '9999px', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500,
                    background: form.allowed_branches.includes(b) ? '#4f46e5' : '#e5e7eb',
                    color: form.allowed_branches.includes(b) ? 'white' : '#374151'
                  }}>{b}</button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
              <button type="submit" className="btn-primary">Add Company</button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid-cards">
        {companies.map(c => (
          <div key={c.id} className="card" style={{ position: 'relative' }}>
            <button onClick={() => remove(c.id)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={15} /></button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{ background: '#ede9fe', padding: '0.6rem', borderRadius: '10px' }}><Briefcase size={18} color="#4f46e5" /></div>
              <div>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.1rem' }}>{c.name}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{c.role}</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
              <span style={{ background: '#f0fdf4', color: '#166534', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600 }}>💰 {c.package || 'N/A'}</span>
              <span style={{ background: '#fefce8', color: '#713f12', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem' }}>Min CGPA: {c.min_cgpa}</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem', lineHeight: 1.5 }}>{c.jd || 'No JD provided.'}</p>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span>Branches: </span>
              {(c.allowed_branches || []).map(b => (
                <span key={b} style={{ background: '#ede9fe', color: '#4f46e5', padding: '0.15rem 0.4rem', borderRadius: '4px', marginRight: '0.25rem' }}>{b}</span>
              ))}
            </div>
          </div>
        ))}
        {companies.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '3rem', gridColumn: '1 / -1' }}>
            <p style={{ color: 'var(--text-muted)' }}>No companies added yet. Add your first company!</p>
          </div>
        )}
      </div>
    </div>
  );
}
