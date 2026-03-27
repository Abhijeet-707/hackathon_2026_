import React, { useState } from 'react';
import axios from 'axios';
import { Settings, Shield, Bell, HardDrive, Download, AlertTriangle } from 'lucide-react';

const API = 'http://localhost:3000/api';

export default function OwnerSettings() {
  const [loading, setLoading] = useState(false);

  const handleBackup = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/owner/backup-db`);
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(res.data, null, 2));
      const node = document.createElement('a');
      node.setAttribute("href", dataStr);
      node.setAttribute("download", `placement_backup_${new Date().toISOString().slice(0,10)}.json`);
      document.body.appendChild(node);
      node.click();
      node.remove();
    } catch (err) {
      alert('Failed to backup database');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm("⚠️ WARNING: Are you absolutely sure? This will wipe the entire database and reset to factory defaults! This CANNOT be undone.")) return;
    try {
      setLoading(true);
      const res = await axios.post(`${API}/owner/reset-db`);
      alert(res.data.message);
      window.location.reload();
    } catch (err) {
      alert('Failed to reset database');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Platform Settings</h1>
          <p>Manage global configuration and platform preferences</p>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        
        {/* Account Settings */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)', marginBottom: '1.5rem' }}>
            <div style={{ background: '#ede9fe', padding: '0.5rem', borderRadius: '8px' }}><Shield size={20} color="#4f46e5" /></div>
            <h3 style={{ margin: 0, fontSize: '1rem' }}>Security Configuration</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">SuperAdmin Email</label>
              <input className="input-field" disabled value="owner@placementpro.com" />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Password Policy</label>
              <select className="input-field" defaultValue="strong">
                <option value="basic">Basic (Minimum 6 chars)</option>
                <option value="strong">Strong (Alphanumeric + Special)</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
              <input type="checkbox" id="2fa" defaultChecked />
              <label htmlFor="2fa" style={{ fontSize: '0.875rem' }}>Require 2FA for College Admins</label>
            </div>
            <button className="btn-primary" style={{ marginTop: '0.5rem' }}>Update Security</button>
          </div>
        </div>

        {/* DB Settings */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)', marginBottom: '1.5rem' }}>
            <div style={{ background: '#fef3c7', padding: '0.5rem', borderRadius: '8px' }}><HardDrive size={20} color="#d97706" /></div>
            <h3 style={{ margin: 0, fontSize: '1rem' }}>Database Management</h3>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: 1.5 }}>
            Automated backups run every 24 hours. You can manually download a full JSON snapshot or factory-reset the platform to wipe all data.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn-secondary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }} onClick={handleBackup} disabled={loading}>
              <Download size={16} /> Backup
            </button>
            <button className="btn-secondary" style={{ flex: 1, color: '#ef4444', borderColor: '#fca5a5', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }} onClick={handleReset} disabled={loading}>
              <AlertTriangle size={16} /> Factory Reset
            </button>
          </div>
        </div>

        {/* Preferences */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)', marginBottom: '1.5rem' }}>
            <div style={{ background: '#fce7f3', padding: '0.5rem', borderRadius: '8px' }}><Bell size={20} color="#db2777" /></div>
            <h3 style={{ margin: 0, fontSize: '1rem' }}>Global Notifications</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center',gap: '0.75rem' }}>
              <input type="checkbox" id="n1" defaultChecked />
              <label htmlFor="n1" style={{ fontSize: '0.875rem' }}>Email alerts on new College Registration</label>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <input type="checkbox" id="n2" defaultChecked />
              <label htmlFor="n2" style={{ fontSize: '0.875rem' }}>Weekly Placement Summary Reports</label>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
