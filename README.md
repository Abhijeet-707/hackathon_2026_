# PlacementPro - College Placement Management System 🎓

Welcome to **PlacementPro**, a complete full-stack web application designed to track and manage college placements. This document explains exactly how the project works step-by-step and tells the evaluator exactly which file does what.

---

## 🌟 1. Database & Setup Logic (How data is born)

Before the app runs, it needs data. We created a smart script that creates the PostgreSQL database and fills it with dummy data.

*   **`backend/db/seed_data.json`**: This is a simple text file that holds all our fake students, fake colleges, fake admins, and fake companies.
*   **`backend/db/setup.js`**:
    *   **What it does:** When you run `node db/setup.js`, this file talks to PostgreSQL. It deletes any old tables, creates 5 new tables (`colleges`, `users`, `students`, `companies`, `applications`), and then loops through `seed_data.json` to insert all the fake data.

---

## ⚙️ 2. Backend API Logic (The Brain of the App)

The backend is built with Node.js and Express. It receives requests from the internet (frontend) and talks to the database.

*   **`backend/db/connectionobj.js`**: Connects our Node.js server to the PostgreSQL database safely using credentials from the `.env` file.
*   **`backend/index.js`**:
    *   **What it does:** This is the main server file. It runs on Port 3000. It sets up "Routes" (URLs like `/api/auth/login` or `/api/student/companies`). When the frontend asks for data, this file catches the request and passes it to the database operations file.
*   **`backend/queries/dboperations.js`**:
    *   **What it does:** This file contains all the complex SQL logic. Every time the frontend wants to read or write data, a function here does the hard work.
    *   **The Smartest Code Here:** The `getEligibleCompanies` function. When a student logs in, this SQL query checks the student's 10th marks, 12th marks, CGPA, and Course against the Company's requirements. It only returns companies where the student is 100% eligible.

---

## 🖥️ 3. Frontend React UI (What the user sees)

The frontend is a React.js Single Page Application (SPA). It uses Vite to load instantly.

### Core Architecture & Routing
*   **`frontend/src/App.jsx`**: This is the App Manager. It checks the browser's Local Storage to see "Who is logged in?". If an Admin tries to go to a Student page, this file kicks them out and protects the routes.
*   **`frontend/src/Layout.jsx`** & **`frontend/src/Sidebar.jsx`**: These wrap around every page. `Sidebar.jsx` is smart — it checks your role (Owner, Admin, or Student) and dynamically draws only the menu buttons you are allowed to see.

### User Login Flow
*   **`frontend/src/Home.jsx`**: The Login Page. When a user types their email and password, it sends it to `backend/index.js`. If successful, the backend returns the User Object with their Role ('owner', 'admin', or 'student'). `App.jsx` then redirects them to their specific dashboard.

---

## 🚶‍♂️ Step-by-Step Roles & Which File They Use

### A) Super Owner Flow
The Owner manages the whole platform and registers colleges/admins.
1.  **Dashboard (`OwnerDashboard.jsx`)**: Shows global numbers (Total Colleges, Total Students, Placement %). It fetches data from `/api/dashboard`.
2.  **Colleges (`OwnerColleges.jsx`)**: A table to add new colleges or delete them.
3.  **Admins (`OwnerAdmins.jsx`)**: Forms to create a College Admin. It has a cool feature: it auto-generates a secure password for the new Admin and shows it on screen so the Owner can copy-paste it to them.
4.  **Analytics (`OwnerAnalytics.jsx`)**: Shows beautiful comparison progress bars of which college is performing the best.

### B) College Admin Flow
The Admin manages their specific college students and companies.
1.  **Dashboard (`AdminDashboard.jsx`)**: Shows overview cards for their college only.
2.  **Students (`AdminStudents.jsx`)**: A large form where the Admin registers a student. They input the student's Name, Branch, and most importantly: **10th, 12th, and CGPA marks**.
3.  **Companies (`AdminCompanies.jsx`)**: The Admin creates a job listing here. They set strict **Eligibility Rules** (e.g. Min CGPA: 7.5, Allowed Branches: IT, CS).
4.  **Applications (`AdminApplications.jsx`)**: This is where the Admin tracks progress. They can change a student's status from "Applied" 👉 "Interview" 👉 "Selected".
5.  **Reports (`AdminReports.jsx`)**: A page that turns all the placement data into a clean table and has a button to download it as a CSV (Excel) file.

### C) Student Flow
The Student is looking for a job.
1.  **Profile (`StudentProfile.jsx`)**: Shows the student their academic marks and tells them "✅ Eligible for most companies" or "⚠️ Limited eligibility" based on their CGPA.
2.  **Available Companies (`StudentCompanies.jsx`)**: The most important page. It calls our smart backend logic. If a company requires 80% in 12th, and the student has 75%, this React page will perfectly hide that company from them. They can click "Apply" on matching companies.
3.  **My Applications (`StudentApplications.jsx`)**: Shows the student all jobs they applied to, colored tags for their status (Blue for Applied, Green for Selected), and the date of their interview.

---

## 🚀 How to Run the Project Locally

1. **Database:** Make sure PostgreSQL is installed.
2. **Backend:**
   ```bash
   cd backend
   npm install
   node db/setup.js   # This creates the DB and seeds the data from the JSON file!
   node index.js      # Starts the API server
   ```
3. **Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev        # Starts the React UI on http://localhost:5173
   ```

### 🔑 Demo Logins for Evaluators:
*   **Owner:** `owner@tracker.com` (pw: `123`)
*   **Admin:** `admin@tracker.com` (pw: `123`)
*   **Student:** `student@tracker.com` (pw: `123`)
