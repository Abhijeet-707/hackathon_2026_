# PlacementPro - Frontend View 🖥️

This folder contains the **React.js** frontend for the Placement Management System.

## 🚀 How to start the frontend:
1. Make sure you have installed the packages by running:
 `npm install`
2. Start the development server by running:
 `npm run dev`
3. Open your browser to the URL printed in the terminal (usually `http://localhost:5173`).

### 📂 What is inside here?
*   `src/App.jsx` - This handles all the secure routing. It checks who is logged in and sends them to the correct dashboard.
*   `src/Home.jsx` - The beautiful login page where everyone signs in.
*   `src/Owner*.jsx` - All the pages meant ONLY for the Super Admin Owner (Colleges, Admins, Analytics).
*   `src/Admin*.jsx` - All the pages meant ONLY for the College Admin (Students, Companies, Applications, Reports).
*   `src/Student*.jsx` - All the pages meant ONLY for the Student (Companies they are eligible for, their applications, and their profile).
*   `src/Sidebar.jsx` - The side navigation menu that changes automatically based on your role.

*Note: For the full project explanation, please read the main `README.md` in the root folder.*
