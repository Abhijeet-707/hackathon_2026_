require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./queries/dboperations');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => res.send('Placement Management System API 🚀'));

// ─── AUTH ─────────────────────────────────────────────────────
app.post('/api/auth/login', db.login);

// ─── COLLEGES (Owner) ─────────────────────────────────────────
app.get('/api/colleges', db.getColleges);
app.post('/api/colleges', db.createCollege);
app.delete('/api/colleges/:id', db.deleteCollege);

// ─── ADMIN MANAGEMENT (Owner) ─────────────────────────────────
app.get('/api/admins', db.getAdmins);
app.post('/api/owner/create-admin', db.createAdmin);
app.delete('/api/admins/:id', db.deleteAdmin);

// ─── SETTINGS (Owner) ─────────────────────────────────────────
app.get('/api/owner/backup-db', db.backupDb);
app.post('/api/owner/reset-db', db.resetDb);
app.get('/api/owner/recent-users', db.getRecentUsers);

// ─── STUDENTS (Admin) ─────────────────────────────────────────
app.get('/api/admin/students', db.getStudents);
app.post('/api/admin/students', db.addStudent);
app.delete('/api/admin/students/:id', db.deleteStudent);

// ─── COMPANIES (Admin) ────────────────────────────────────────
app.get('/api/companies', db.getCompanies);
app.post('/api/admin/companies', db.addCompany);
app.delete('/api/admin/companies/:id', db.deleteCompany);

// ─── ELIGIBLE COMPANIES (Student) ─────────────────────────────
app.get('/api/student/companies', db.getEligibleCompanies);

// ─── APPLICATIONS ─────────────────────────────────────────────
app.get('/api/applications', db.getApplications);
app.post('/api/student/apply', db.applyToCompany);
app.put('/api/applications/:id/status', db.updateApplicationStatus);

// ─── STUDENT PROFILE ──────────────────────────────────────────
app.get('/api/student/profile', db.getStudentProfile);

// ─── DASHBOARD STATS ──────────────────────────────────────────
app.get('/api/dashboard', db.getDashboardStats);

app.listen(port, () => console.log(`🚀 Server at http://localhost:${port}`));
