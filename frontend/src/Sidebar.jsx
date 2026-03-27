import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Users, Briefcase, FileText,
  LogOut, GraduationCap, ChevronRight, BarChart3, UserCog, ClipboardList, Settings
} from 'lucide-react';

const ownerNav = [
  { to: '/owner', label: 'Dashboard', icon: <LayoutDashboard size={18} />, end: true },
  { to: '/owner/colleges', label: 'Colleges', icon: <Building2 size={18} /> },
  { to: '/owner/settings', label: 'Platform Settings', icon: <Settings size={18} /> },
];
const adminNav = [
  { to: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={18} />, end: true },
  { to: '/admin/students', label: 'Students', icon: <GraduationCap size={18} /> },
  { to: '/admin/companies', label: 'Companies', icon: <Briefcase size={18} /> },
  { to: '/admin/applications', label: 'Applications', icon: <ClipboardList size={18} /> },
  { to: '/admin/reports', label: 'Reports', icon: <FileText size={18} /> },
];
const studentNav = [
  { to: '/user', label: 'Dashboard', icon: <LayoutDashboard size={18} />, end: true },
  { to: '/user/companies', label: 'Available Companies', icon: <Briefcase size={18} /> },
  { to: '/user/applications', label: 'My Applications', icon: <ClipboardList size={18} /> },
  { to: '/user/profile', label: 'Profile', icon: <Users size={18} /> },
];

const NAV_MAP = { owner: ownerNav, admin: adminNav, student: studentNav };
const ROLE_LABELS = { owner: 'Super Admin', admin: 'College Admin', student: 'Student' };

export default function Sidebar({ role }) {
  const navigate = useNavigate();
  const nav = NAV_MAP[role] || studentNav;

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <aside style={{
      width: '260px', minHeight: '100vh', background: 'linear-gradient(160deg, #1e1b4b 0%, #312e81 60%, #4338ca 100%)',
      display: 'flex', flexDirection: 'column', padding: '1.5rem 0', flexShrink: 0, position: 'sticky', top: 0
    }}>
      {/* Logo */}
      <div style={{ padding: '0 1.5rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: 'white', borderRadius: '10px', padding: '0.5rem', display: 'flex' }}>
            <GraduationCap size={22} color="#4f46e5" />
          </div>
          <div>
            <p style={{ color: 'white', fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.2 }}>PlacementPro</p>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.7rem' }}>{ROLE_LABELS[role] || 'Student'}</p>
          </div>
        </div>
      </div>

      {/* Nav Items */}
      <nav style={{ flex: 1, padding: '1.5rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {nav.map(item => (
          <NavLink key={item.to} to={item.to} end={item.end} style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0.7rem 1rem', borderRadius: '10px', textDecoration: 'none',
            background: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
            color: isActive ? 'white' : 'rgba(255,255,255,0.6)',
            transition: 'all 0.2s', fontWeight: isActive ? 600 : 400, fontSize: '0.875rem',
          })} onMouseEnter={e => { if (!e.currentTarget.dataset.active) e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = ''; }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>{item.icon} {item.label}</span>
            <ChevronRight size={14} style={{ opacity: 0.5 }} />
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <button onClick={handleLogout} style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem',
          padding: '0.7rem 1rem', borderRadius: '10px', border: 'none', cursor: 'pointer',
          background: 'rgba(239,68,68,0.15)', color: '#fca5a5', fontSize: '0.875rem', fontWeight: 500,
          transition: 'all 0.2s'
        }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.25)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.15)'}>
          <LogOut size={18} /> Sign Out
        </button>
      </div>
    </aside>
  );
}
