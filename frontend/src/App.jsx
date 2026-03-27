import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './Home';
import Layout from './Layout';
import OwnerDashboard from './OwnerDashboard';
import OwnerColleges from './OwnerColleges';
import OwnerSettings from './OwnerSettings';
import AdminDashboard from './AdminDashboard';
import AdminStudents from './AdminStudents';
import AdminCompanies from './AdminCompanies';
import AdminApplications from './AdminApplications';
import AdminReports from './AdminReports';
import StudentDashboard from './dbinteraction';
import StudentCompanies from './StudentCompanies';
import StudentApplications from './StudentApplications';
import StudentProfile from './StudentProfile';
import './index.css';

const getUser = () => {
  const u = localStorage.getItem('user');
  return u ? JSON.parse(u) : null;
};

function ProtectedRoute({ children, allowedRoles }) {
  const user = getUser();
  if (!user) return <Navigate to="/" />;
  const role = user.role === 'student' ? 'student' : user.role;
  if (!allowedRoles.includes(role)) return <Navigate to="/" />;
  return children;
}

function App() {
  const [, forceRender] = useState(0);
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home onLogin={() => forceRender(n => n + 1)} />} />
        <Route element={<Layout />}>
          {/* Owner routes */}
          <Route path="/owner" element={<ProtectedRoute allowedRoles={['owner']}><OwnerDashboard /></ProtectedRoute>} />
          <Route path="/owner/colleges" element={<ProtectedRoute allowedRoles={['owner']}><OwnerColleges /></ProtectedRoute>} />
          <Route path="/owner/settings" element={<ProtectedRoute allowedRoles={['owner']}><OwnerSettings /></ProtectedRoute>} />
          {/* Admin routes */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/students" element={<ProtectedRoute allowedRoles={['admin']}><AdminStudents /></ProtectedRoute>} />
          <Route path="/admin/companies" element={<ProtectedRoute allowedRoles={['admin']}><AdminCompanies /></ProtectedRoute>} />
          <Route path="/admin/applications" element={<ProtectedRoute allowedRoles={['admin']}><AdminApplications /></ProtectedRoute>} />
          <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['admin']}><AdminReports /></ProtectedRoute>} />
          {/* Student routes */}
          <Route path="/user" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
          <Route path="/user/companies" element={<ProtectedRoute allowedRoles={['student']}><StudentCompanies /></ProtectedRoute>} />
          <Route path="/user/applications" element={<ProtectedRoute allowedRoles={['student']}><StudentApplications /></ProtectedRoute>} />
          <Route path="/user/profile" element={<ProtectedRoute allowedRoles={['student']}><StudentProfile /></ProtectedRoute>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
