import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Briefcase, CheckCircle } from 'lucide-react';

const API = 'http://localhost:3000/api';
const getUser = () => JSON.parse(localStorage.getItem('user') || '{}');

export default function StudentCompanies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applied, setApplied] = useState({});
  const [confirmCompany, setConfirmCompany] = useState(null);
  const [successCompany, setSuccessCompany] = useState(null);
  const user = getUser();
  const studentId = user.student_record_id;

  const fetch = () => {
    if (!studentId) { setLoading(false); return; }
    axios.get(`${API}/student/companies?student_id=${studentId}`)
      .then(r => { setCompanies(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  };
  useEffect(() => { fetch(); }, []);

  const executeApply = async () => {
    if (!confirmCompany) return;
    try {
      await axios.post(`${API}/student/apply`, { student_id: studentId, company_id: confirmCompany.id });
      setApplied(prev => ({ ...prev, [confirmCompany.id]: true }));
      setSuccessCompany(confirmCompany);
      setConfirmCompany(null);
      fetch();
    } catch (err) {
      if (err.response?.status === 409) {
        setApplied(prev => ({ ...prev, [confirmCompany.id]: true }));
        setConfirmCompany(null);
      } else {
        alert('Failed to apply. Please try again.');
      }
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Available Companies</h1>
          <p>Companies you are eligible for based on your academic profile</p>
        </div>
        <span style={{ background: '#ede9fe', color: '#4f46e5', padding: '0.5rem 1rem', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 600 }}>
          {companies.length} Eligible
        </span>
      </div>

      {loading && <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>Loading eligible companies...</div>}

      {!loading && !studentId && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>Your student profile is not complete. Please contact your admin to set up your academic details.</p>
        </div>
      )}

      {!loading && studentId && companies.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Briefcase size={40} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--text-muted)' }}>No eligible companies found. Check back later or contact your admin.</p>
        </div>
      )}

      <div className="grid-cards">
        {companies.map(c => {
          const isApplied = c.already_applied || applied[c.id];
          return (
            <div key={c.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderTop: `4px solid ${isApplied ? '#22c55e' : '#4f46e5'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ background: isApplied ? '#dcfce7' : '#ede9fe', padding: '0.65rem', borderRadius: '10px' }}>
                    {isApplied ? <CheckCircle size={20} color="#22c55e" /> : <Briefcase size={20} color="#4f46e5" />}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', marginBottom: '0.1rem' }}>{c.name}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{c.role}</p>
                  </div>
                </div>
                <span style={{ background: '#f0fdf4', color: '#166534', padding: '0.25rem 0.65rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 700, whiteSpace: 'nowrap' }}>💰 {c.package}</span>
              </div>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{c.jd || 'No job description provided.'}</p>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                <span style={{ background: '#fefce8', color: '#713f12', padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.72rem' }}>CGPA ≥ {c.min_cgpa}</span>
                {(c.allowed_branches || []).map(b => <span key={b} style={{ background: '#ede9fe', color: '#4f46e5', padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.72rem' }}>{b}</span>)}
              </div>
              <button
                onClick={() => !isApplied && setConfirmCompany(c)}
                disabled={isApplied}
                style={{
                  padding: '0.65rem 1rem', borderRadius: '10px', border: 'none', cursor: isApplied ? 'default' : 'pointer',
                  background: isApplied ? '#dcfce7' : 'var(--primary)', color: isApplied ? '#166534' : 'white',
                  fontWeight: 600, fontSize: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  transition: 'all 0.2s', marginTop: 'auto'
                }}>
                {isApplied ? '✅ Applied' : '👉 Apply Now'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Confirmation Modal */}
      {confirmCompany && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '20px', maxWidth: '400px', width: '90%', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <div style={{ background: '#ede9fe', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <Briefcase size={28} color="#4f46e5" />
            </div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#111827' }}>Confirm Application</h2>
            <p style={{ color: '#4b5563', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              Are you sure you want to officially submit your profile to <strong>{confirmCompany.name}</strong> for the <strong>{confirmCompany.role}</strong> position?
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button 
                onClick={executeApply}
                style={{ flex: 1, padding: '0.75rem', borderRadius: '12px', background: '#4f46e5', color: 'white', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'background 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#4338ca'}
                onMouseLeave={e => e.currentTarget.style.background = '#4f46e5'}>
                Yes, Apply Now
              </button>
              <button 
                onClick={() => setConfirmCompany(null)}
                style={{ flex: 1, padding: '0.75rem', borderRadius: '12px', background: '#f3f4f6', color: '#4b5563', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'background 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#e5e7eb'}
                onMouseLeave={e => e.currentTarget.style.background = '#f3f4f6'}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {successCompany && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'white', padding: '2.5rem 2rem', borderRadius: '20px', maxWidth: '400px', width: '90%', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <div style={{ background: '#dcfce7', width: '70px', height: '70px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <CheckCircle size={36} color="#22c55e" />
            </div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#166534' }}>Application Sent!</h2>
            <p style={{ color: '#4b5563', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '2rem' }}>
              Thank you for applying to <strong>{successCompany.name}</strong>. Your academic profile has been securely forwarded to their recruitment queue. Further information and interview schedules will be shared shortly via your dashboard.
            </p>
            <button 
              onClick={() => setSuccessCompany(null)}
              style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', background: '#22c55e', color: 'white', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: '1rem', transition: 'background 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#16a34a'}
              onMouseLeave={e => e.currentTarget.style.background = '#22c55e'}>
              Awesome, Got it!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
