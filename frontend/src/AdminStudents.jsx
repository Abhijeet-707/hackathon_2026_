import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Trash2, Search, Copy, Eye, EyeOff, UploadCloud, Loader } from 'lucide-react';

const API = 'http://localhost:3000/api';
const getAdmin = () => JSON.parse(localStorage.getItem('user') || '{}');
const emptyForm = { name: '', email: '', branch: '', cgpa: '', password: '123' };
const BRANCHES = ['CE', 'IT', 'ECE', 'ME', 'Civil', 'EE', 'CS'];

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [filterBranch, setFilterBranch] = useState('All');
  const [newCreds, setNewCreds] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const fileRef = React.useRef(null);
  const [visiblePwd, setVisiblePwd] = useState({});
  const [copied, setCopied] = useState('');

  const admin = getAdmin();
  const fetch = () => axios.get(`${API}/admin/students?college_id=${admin.college_id}`).then(r => setStudents(r.data)).catch(console.error);
  useEffect(() => { fetch(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API}/admin/students`, { ...form, college_id: admin.college_id });
      setNewCreds(prev => ({ ...prev, [res.data.user_id]: { email: form.email, password: form.password, name: form.name } }));
      setForm(emptyForm); setShowForm(false); fetch();
    } catch (err) { alert(err.response?.data?.error || 'Error adding student'); }
  };

  const remove = async (id) => { if (!window.confirm('Remove student?')) return; await axios.delete(`${API}/admin/students/${id}`); fetch(); };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const text = await file.text();
      const rows = text.split('\n').map(r => r.trim()).filter(r => r);
      const dataRows = rows.slice(1);
      const created = {};
      for (const row of dataRows) {
        const [name, email, branch, cgpa] = row.split(',').map(s => s?.trim());
        if (!name || !email) continue;
        try {
          const res = await axios.post(`${API}/admin/students`, { name, email, branch: branch || '', cgpa: cgpa || '0', password: '123', college_id: admin.college_id });
          created[res.data.user_id] = { email, password: '123', name };
        } catch (err) { console.error('Failed to import', email); }
      }
      setNewCreds(prev => ({ ...prev, ...created }));
      fetch();
      alert(`Bulk Import Complete! Successfully added ${Object.keys(created).length} students.`);
    } catch (err) { alert('Error parsing CSV'); }
    setIsUploading(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  const copy = (text, key) => { navigator.clipboard.writeText(text); setCopied(key); setTimeout(() => setCopied(''), 2000); };

  const display = students
    .filter(s => filterBranch === 'All' || s.branch === filterBranch)
    .filter(s => !search || s.name?.toLowerCase().includes(search.toLowerCase()) || s.email?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="page-header">
        <div><h1>Student Management</h1><p>Add and manage student records</p></div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <input type="file" accept=".csv" ref={fileRef} style={{ display: 'none' }} onChange={handleFileUpload} />
          <button className="btn-secondary" onClick={() => fileRef.current?.click()} disabled={isUploading}>
            {isUploading ? <Loader size={18} className="spin" /> : <UploadCloud size={18} />} 
            {isUploading ? 'Importing...' : 'Bulk Import CSV'}
          </button>
          <button className="btn-primary" onClick={() => setShowForm(!showForm)} disabled={isUploading}><Plus size={18} /> Add Student</button>
        </div>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.25rem' }}>Register New Student</h3>
          <form onSubmit={handleAdd}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              {[
                { label: 'Full Name *', key: 'name', type: 'text' },
                { label: 'Email *', key: 'email', type: 'email' },
                { label: 'CGPA', key: 'cgpa', type: 'number' },
                { label: 'Default Password', key: 'password', type: 'text' },
              ].map(f => (
                <div key={f.key} className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">{f.label}</label>
                  <input required={f.label.includes('*')} type={f.type} step="0.01" className="input-field" value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
                </div>
              ))}
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Branch *</label>
                <select required className="input-field" value={form.branch} onChange={e => setForm({ ...form, branch: e.target.value })}>
                  <option value="">Select</option>
                  {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
              <button type="submit" className="btn-primary">Add Student</button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {Object.keys(newCreds).length > 0 && (
        <div className="card" style={{ marginBottom: '1.5rem', background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
          <h4 style={{ color: '#166534', marginBottom: '0.75rem' }}>✅ New Student Credentials (share with student)</h4>
          {Object.entries(newCreds).map(([id, c]) => (
            <div key={id} style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
              <strong style={{ color: '#166534', minWidth: '120px' }}>{c.name}</strong>
              <div>Email: <code style={{ background: '#dcfce7', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>{c.email}</code>
                <button onClick={() => copy(c.email, id + 'e')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied === id + 'e' ? '#22c55e' : '#6b7280' }}><Copy size={13} /></button>
              </div>
              <div>Password: <code style={{ background: '#dcfce7', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>{visiblePwd[id] ? c.password : '••••••'}</code>
                <button onClick={() => setVisiblePwd(p => ({ ...p, [id]: !p[id] }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>{visiblePwd[id] ? <EyeOff size={13} /> : <Eye size={13} />}</button>
                <button onClick={() => copy(c.password, id + 'p')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied === id + 'p' ? '#22c55e' : '#6b7280' }}><Copy size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.5rem 1rem', flex: 1, minWidth: '200px' }}>
          <Search size={15} color="var(--text-muted)" />
          <input style={{ border: 'none', outline: 'none', width: '100%', fontFamily: 'inherit', fontSize: '0.875rem' }} placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input-field" style={{ width: 'auto', margin: 0 }} value={filterBranch} onChange={e => setFilterBranch(e.target.value)}>
          <option value="All">All Branches</option>
          {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{display.length} shown</span>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead><tr style={{ background: '#f9fafb' }}>
            {['Name', 'Email', 'Branch', 'CGPA', 'Del'].map(h => (
              <th key={h} style={{ padding: '0.75rem 0.75rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', fontSize: '0.75rem' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {display.map(s => (
              <tr key={s.student_id || s.id} style={{ borderBottom: '1px solid var(--border)' }}
                onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                onMouseLeave={e => e.currentTarget.style.background = ''}>
                <td style={{ padding: '0.65rem 0.75rem', fontWeight: 600 }}>{s.name}</td>
                <td style={{ padding: '0.65rem 0.75rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>{s.email}</td>
                <td style={{ padding: '0.65rem 0.75rem' }}><span style={{ background: '#ede9fe', color: '#4f46e5', padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600 }}>{s.branch}</span></td>
                <td style={{ padding: '0.65rem 0.75rem', fontWeight: 700, color: parseFloat(s.cgpa) >= 7.5 ? '#22c55e' : parseFloat(s.cgpa) >= 6 ? '#f59e0b' : '#ef4444' }}>{s.cgpa}</td>
                <td style={{ padding: '0.65rem 0.75rem' }}><button onClick={() => remove(s.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={15} /></button></td>
              </tr>
            ))}
            {display.length === 0 && <tr><td colSpan={10} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No students found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
