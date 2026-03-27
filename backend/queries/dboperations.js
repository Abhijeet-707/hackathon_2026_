const pool = require('../db/connectionobj');
const { sendRegistrationEmail, sendAdminRegistrationEmail } = require('../utils/mailer');
const { exec } = require('child_process');
const path = require('path');

// ═══════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════
const login = (req, res) => {
  const { email, password } = req.body;
  pool.query(
    `SELECT u.id, u.name, u.email, u.role, u.college_id,
            s.id AS student_record_id, s.enrollment, s.course, s.branch,
            s.tenth_percent, s.twelfth_percent, s.cgpa
     FROM users u LEFT JOIN students s ON s.user_id = u.id
     WHERE u.email=$1 AND u.password=$2`,
    [email, password],
    (err, r) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!r.rows.length) return res.status(401).json({ message: 'Invalid credentials' });
      res.json({ message: 'Login successful', user: r.rows[0] });
    }
  );
};

// COLLEGES
const getColleges = (req, res) => {
  pool.query(
    `SELECT c.id, c.name,
       COUNT(DISTINCT u.id) FILTER (WHERE u.role='student') AS total_students,
       COUNT(DISTINCT a.id) FILTER (WHERE a.status='Selected') AS placed_students,
       adm.email AS admin_email
     FROM colleges c
     LEFT JOIN users u ON u.college_id = c.id
     LEFT JOIN students s ON s.user_id = u.id
     LEFT JOIN applications a ON a.student_id = s.id
     LEFT JOIN users adm ON adm.college_id = c.id AND adm.role = 'admin'
     GROUP BY c.id, adm.email ORDER BY c.id`,
    (err, r) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(r.rows);
    }
  );
};

const createCollege = (req, res) => {
  const { name } = req.body;
  pool.query('INSERT INTO colleges (name) VALUES ($1) RETURNING *', [name], (err, r) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json(r.rows[0]);
  });
};

const deleteCollege = async (req, res) => {
  try {
    await pool.query('BEGIN');
    // Delete users associated with the college (Cascades to students and applications)
    await pool.query('DELETE FROM users WHERE college_id=$1', [req.params.id]);
    // Delete the college itself (Cascades to companies via schema config)
    await pool.query('DELETE FROM colleges WHERE id=$1', [req.params.id]);
    await pool.query('COMMIT');
    res.json({ message: 'College and all associated data completely authorized and wiped.' });
  } catch (err) {
    await pool.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  }
};

// ADMIN MANAGEMENT (Owner creates admins)
const createAdmin = (req, res) => {
  const { name, email, password, college_id } = req.body;
  pool.query(
    `INSERT INTO users (name, email, password, role, college_id) VALUES ($1,$2,$3,'admin',$4) RETURNING id, name, email, college_id`,
    [name, email, password, college_id],
    (err, r) => {
      if (err) return res.status(500).json({ error: err.message });
      
      // Dispatch admin welcome email containing credentials
      sendAdminRegistrationEmail(email, name, password).catch(console.error);

      res.status(201).json(r.rows[0]);
    }
  );
};

const getAdmins = (req, res) => {
  pool.query(
    `SELECT u.id, u.name, u.email, u.college_id, c.name AS college_name
     FROM users u LEFT JOIN colleges c ON c.id = u.college_id
     WHERE u.role = 'admin' ORDER BY u.id`,
    (err, r) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(r.rows);
    }
  );
};

const deleteAdmin = (req, res) => {
  pool.query(`DELETE FROM users WHERE id=$1 AND role='admin'`, [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Admin deleted' });
  });
};

// STUDENTS
const getStudents = (req, res) => {
  const { college_id, branch, course } = req.query;
  let q = `SELECT u.id, u.name, u.email, u.college_id,
              s.id AS student_id, s.enrollment, s.course, s.branch, s.division,
              s.tenth_percent, s.twelfth_percent, s.cgpa
           FROM users u JOIN students s ON s.user_id = u.id WHERE u.role='student'`;
  const params = [];
  if (college_id) { params.push(college_id); q += ` AND u.college_id=$${params.length}`; }
  if (branch) { params.push(branch); q += ` AND s.branch=$${params.length}`; }
  if (course) { params.push(course); q += ` AND s.course=$${params.length}`; }
  q += ' ORDER BY u.name';
  pool.query(q, params, (err, r) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(r.rows);
  });
};

const addStudent = async (req, res) => {
  const { name, email, password = '123', college_id, enrollment, course, branch, division, tenth_percent, twelfth_percent, cgpa } = req.body;
  try {
    const userRes = await pool.query(
      `INSERT INTO users (name, email, password, role, college_id) VALUES ($1,$2,$3,'student',$4) RETURNING id`,
      [name, email, password, college_id]
    );
    const userId = userRes.rows[0].id;
    const studentRes = await pool.query(
      `INSERT INTO students (user_id, enrollment, course, branch, division, tenth_percent, twelfth_percent, cgpa)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [userId, enrollment, course, branch, division, parseFloat(tenth_percent)||0, parseFloat(twelfth_percent)||0, parseFloat(cgpa)||0]
    );
    
    // Add non-blocking email call here
    sendRegistrationEmail(email, name, password).catch(console.error);
    
    res.status(201).json({ user_id: userId, ...studentRes.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteStudent = (req, res) => {
  pool.query(`DELETE FROM users WHERE id=$1 AND role='student'`, [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Student deleted' });
  });
};

// COMPANIES
const getCompanies = (req, res) => {
  const { college_id } = req.query;
  let q = 'SELECT * FROM companies';
  const params = [];
  if (college_id) { params.push(college_id); q += ` WHERE college_id=$1`; }
  q += ' ORDER BY created_at DESC';
  pool.query(q, params, (err, r) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(r.rows);
  });
};

const addCompany = (req, res) => {
  const { college_id, name, role, package: pkg, jd, min_10, min_12, min_cgpa, allowed_branches, allowed_courses } = req.body;
  pool.query(
    `INSERT INTO companies (college_id, name, role, package, jd, min_10, min_12, min_cgpa, allowed_branches, allowed_courses)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
    [college_id, name, role, pkg, jd,
     parseFloat(min_10)||0, parseFloat(min_12)||0, parseFloat(min_cgpa)||0,
     Array.isArray(allowed_branches) ? allowed_branches : allowed_branches?.split(',').map(s=>s.trim()) || [],
     Array.isArray(allowed_courses) ? allowed_courses : allowed_courses?.split(',').map(s=>s.trim()) || []],
    (err, r) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json(r.rows[0]);
    }
  );
};

const deleteCompany = (req, res) => {
  pool.query('DELETE FROM companies WHERE id=$1', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Company deleted' });
  });
};

// ELIGIBLE COMPANIES FOR STUDENT
const getEligibleCompanies = (req, res) => {
  const { student_id } = req.query;
  pool.query(
    `SELECT c.*, 
       CASE WHEN a.id IS NOT NULL THEN TRUE ELSE FALSE END AS already_applied
     FROM companies c
     JOIN students s ON s.id = $1
     LEFT JOIN applications a ON a.company_id = c.id AND a.student_id = $1
     WHERE c.college_id = (SELECT college_id FROM users WHERE id = s.user_id)
       AND s.cgpa >= c.min_cgpa
       AND (cardinality(c.allowed_branches) = 0 OR c.allowed_branches IS NULL OR s.branch = ANY(c.allowed_branches))
     ORDER BY c.created_at DESC`,
    [student_id],
    (err, r) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(r.rows);
    }
  );
};


// APPLICATIONS
const applyToCompany = (req, res) => {
  const { student_id, company_id } = req.body;
  pool.query(
    `INSERT INTO applications (student_id, company_id, status) VALUES ($1,$2,'Applied')
     ON CONFLICT (student_id, company_id) DO NOTHING RETURNING *`,
    [student_id, company_id],
    (err, r) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!r.rows.length) return res.status(409).json({ message: 'Already applied' });
      res.status(201).json(r.rows[0]);
    }
  );
};

const getApplications = (req, res) => {
  const { college_id, company_id, status, student_id } = req.query;
  let q = `
    SELECT a.id, a.status, a.interview_date, a.created_at,
           s.id AS student_id, u.name AS student_name, u.email AS student_email,
           st.branch, st.course, st.cgpa,
           c.id AS company_id, c.name AS company_name, c.role AS company_role, c.package
    FROM applications a
    JOIN students s ON s.id = a.student_id
    JOIN users u ON u.id = s.user_id
    JOIN students st ON st.id = a.student_id
    JOIN companies c ON c.id = a.company_id
    WHERE 1=1`;
  const params = [];
  if (college_id) { params.push(college_id); q += ` AND u.college_id=$${params.length}`; }
  if (company_id) { params.push(company_id); q += ` AND a.company_id=$${params.length}`; }
  if (status && status !== 'All') { params.push(status); q += ` AND a.status=$${params.length}`; }
  if (student_id) { params.push(student_id); q += ` AND a.student_id=$${params.length}`; }
  q += ' ORDER BY a.created_at DESC';
  pool.query(q, params, (err, r) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(r.rows);
  });
};

const updateApplicationStatus = (req, res) => {
  const { status, interview_date } = req.body;
  pool.query(
    `UPDATE applications SET status=$1, interview_date=$2 WHERE id=$3 RETURNING *`,
    [status, interview_date || null, req.params.id],
    (err, r) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(r.rows[0]);
    }
  );
};

// STUDENT PROFILE
const getStudentProfile = (req, res) => {
  const { user_id } = req.query;
  pool.query(
    `SELECT u.name, u.email, u.college_id, c.name AS college_name,
            s.enrollment, s.course, s.branch, s.division,
            s.tenth_percent, s.twelfth_percent, s.cgpa
     FROM users u JOIN students s ON s.user_id = u.id
     LEFT JOIN colleges c ON c.id = u.college_id
     WHERE u.id = $1`,
    [user_id],
    (err, r) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(r.rows[0]);
    }
  );
};

// DASHBOARD STATS
const getDashboardStats = (req, res) => {
  const { college_id, student_id } = req.query;
  let filter = '';
  const params = [];

  if (student_id) {
    params.push(student_id);
    filter = `WHERE a.student_id = $${params.length}`;
  } else if (college_id) {
    params.push(college_id);
    filter = `WHERE u.college_id = $${params.length}`;
  }

  pool.query(
    `SELECT
       (SELECT COUNT(*) FROM colleges) AS total_colleges,
       (SELECT COUNT(*) FROM users WHERE role='student' ${college_id ? `AND college_id = ${parseInt(college_id)}` : ''}) AS total_students,
       COUNT(a.id)::int AS total_applications,
       COUNT(a.id) FILTER (WHERE a.status='Applied')::int AS applied_count,
       COUNT(a.id) FILTER (WHERE a.status='Interview')::int AS interview_count,
       COUNT(a.id) FILTER (WHERE a.status='Selected')::int AS selected_count,
       COUNT(a.id) FILTER (WHERE a.status='Rejected')::int AS rejected_count
     FROM applications a
     JOIN students s ON s.id = a.student_id
     JOIN users u ON u.id = s.user_id
     ${filter}`,
    params,
    (err, r) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(r.rows[0]);
    }
  );
};

// ═══════════════════════════════════════════
// PLATFORM SETTINGS (Owner)
// ═══════════════════════════════════════════
const backupDb = async (req, res) => {
  try {
    const backup = { timestamp: new Date().toISOString() };
    backup.colleges = (await pool.query('SELECT * FROM colleges')).rows;
    backup.users = (await pool.query('SELECT * FROM users')).rows;
    backup.students = (await pool.query('SELECT * FROM students')).rows;
    backup.companies = (await pool.query('SELECT * FROM companies')).rows;
    backup.applications = (await pool.query('SELECT * FROM applications')).rows;
    
    res.json(backup);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const resetDb = (req, res) => {
  const setupScriptPath = path.join(__dirname, '../db/setup.js');
  // Execute the seed script to obliterate and refresh the DB
  exec(`node "${setupScriptPath}"`, (err, stdout, stderr) => {
    if (err) {
      console.error(stderr);
      return res.status(500).json({ error: 'Failed to factory reset database.' });
    }
    res.json({ message: 'Database successfull wiped and reset to Factory Seed.' });
  });
};

const getRecentUsers = (req, res) => {
  pool.query(`
    SELECT u.id, u.name, u.email, u.role, c.name as college_name, u.created_at
    FROM users u
    LEFT JOIN colleges c ON c.id = u.college_id
    WHERE u.role != 'owner'
    ORDER BY u.created_at DESC
    LIMIT 30
  `, (err, r) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(r.rows);
  });
};

module.exports = {
  login,
  getColleges, createCollege, deleteCollege,
  createAdmin, getAdmins, deleteAdmin,
  getStudents, addStudent, deleteStudent,
  getCompanies, addCompany, deleteCompany,
  getEligibleCompanies,
  applyToCompany, getApplications, updateApplicationStatus,
  getStudentProfile,
  getDashboardStats,
  backupDb, resetDb, getRecentUsers
};
