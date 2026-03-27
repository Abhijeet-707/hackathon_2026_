// db/setup.js — Run ONCE to build the full Placement Management System DB
// Usage: node db/setup.js

const { Client } = require('pg');
const seedData = require('./seed_data.json');

const credentials = {
  user: 'postgres',
  host: 'localhost',
  password: 'Abhijeet@2004',
  port: 5432,
};

async function setup() {
  // Step 1: Create DB
  const admin = new Client({ ...credentials, database: 'postgres' });
  await admin.connect();
  const dbExists = await admin.query(`SELECT 1 FROM pg_database WHERE datname='placement_tracker'`);
  if (dbExists.rowCount === 0) {
    await admin.query('CREATE DATABASE placement_tracker');
    console.log('Database created.');
  } else {
    console.log('ℹ️  Database already exists.');
  }
  await admin.end();

  // Step 2: Connect and setup schema
  const db = new Client({ ...credentials, database: 'placement_tracker' });
  await db.connect();

  // Drop old tables cleanly
  await db.query(`
    DROP TABLE IF EXISTS applications CASCADE;
    DROP TABLE IF EXISTS companies CASCADE;
    DROP TABLE IF EXISTS students CASCADE;
    DROP TABLE IF EXISTS users CASCADE;
    DROP TABLE IF EXISTS colleges CASCADE;
  `);
  console.log('Dropped old tables.');

  // Colleges
  await db.query(`
    CREATE TABLE colleges (
      id SERIAL PRIMARY KEY,
      name VARCHAR(200) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  // Users
  await db.query(`
    CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(200) NOT NULL,
      email VARCHAR(200) UNIQUE NOT NULL,
      password VARCHAR(200) NOT NULL,
      role VARCHAR(50) NOT NULL CHECK (role IN ('owner','admin','student')),
      college_id INT REFERENCES colleges(id) ON DELETE SET NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  // Students (extended profile)
  await db.query(`
    CREATE TABLE students (
      id SERIAL PRIMARY KEY,
      user_id INT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      enrollment VARCHAR(100),
      course VARCHAR(100),
      branch VARCHAR(100),
      division VARCHAR(10),
      tenth_percent NUMERIC(5,2) DEFAULT 0,
      twelfth_percent NUMERIC(5,2) DEFAULT 0,
      cgpa NUMERIC(4,2) DEFAULT 0
    );
  `);

  // Companies
  await db.query(`
    CREATE TABLE companies (
      id SERIAL PRIMARY KEY,
      college_id INT REFERENCES colleges(id) ON DELETE CASCADE,
      name VARCHAR(200) NOT NULL,
      role VARCHAR(200) NOT NULL,
      package VARCHAR(100),
      jd TEXT,
      min_10 NUMERIC(5,2) DEFAULT 0,
      min_12 NUMERIC(5,2) DEFAULT 0,
      min_cgpa NUMERIC(4,2) DEFAULT 0,
      allowed_branches TEXT[],
      allowed_courses TEXT[],
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  // Applications
  await db.query(`
    CREATE TABLE applications (
      id SERIAL PRIMARY KEY,
      student_id INT REFERENCES students(id) ON DELETE CASCADE,
      company_id INT REFERENCES companies(id) ON DELETE CASCADE,
      status VARCHAR(50) DEFAULT 'Applied' CHECK (status IN ('Applied','Interview','Selected','Rejected')),
      interview_date DATE,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(student_id, company_id)
    );
  `);

  console.log('✅ All tables created.');

  // Seed Colleges
  for (const c of seedData.colleges) {
    await db.query(`INSERT INTO colleges (name) VALUES ($1);`, [c.name]);
  }

  // Seed Users
  for (const u of seedData.users) {
    await db.query(
      `INSERT INTO users (name, email, password, role, college_id) VALUES ($1, $2, $3, $4, $5);`,
      [u.name, u.email, u.password, u.role, u.college_id]
    );
  }

  // Seed Student Profile
  for (const s of seedData.students) {
    await db.query(
      `INSERT INTO students (user_id, enrollment, course, branch, division, tenth_percent, twelfth_percent, cgpa)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8);`,
      [s.user_id, s.enrollment, s.course, s.branch, s.division, s.tenth_percent, s.twelfth_percent, s.cgpa]
    );
  }

  // Seed Companies
  for (const c of seedData.companies) {
    await db.query(
      `INSERT INTO companies (college_id, name, role, package, jd, min_10, min_12, min_cgpa, allowed_branches, allowed_courses)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);`,
      [c.college_id, c.name, c.role, c.package, c.jd, c.min_10, c.min_12, c.min_cgpa, c.allowed_branches, c.allowed_courses]
    );
  }

  console.log('✅ Seed data inserted from seed_data.json.');
  await db.end();
  console.log('\n Setup complete! Run: node index.js');
}

setup().catch(err => {
  console.error('Setup failed:', err.message);
  process.exit(1);
});