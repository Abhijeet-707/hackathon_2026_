# PlacementPro - Backend API ⚙️

This folder contains the **Node.js** and **Express.js** backend for the Placement Management System. It also connects to the **PostgreSQL** database.

## 🚀 How to start the backend:
1. Make sure your PostgreSQL database is running on your computer.
2. If this is your **first time**, you must build the tables. Run:
 `node db/setup.js`
 *(This will automatically build all tables and insert fake students and companies for testing!)*
3. Start the main API server by running:
 `node index.js`
4. The backend runs on `http://localhost:3000`.

### 📂 What is inside here?
*   `index.js` - This is where all the API URLs live (like `/api/auth/login` and `/api/student/companies`).
*   `db/connectionobj.js` - This connects Node.js to PostgreSQL using your password.
*   `db/setup.js` - The magic script that builds the database and inserts fake test data.
*   `db/seed_data.json` - All the fake test data is stored right here. You can change the names and colleges easily!
*   `queries/dboperations.js` - All the complex SQL logic lives here, including the smart eligibility filter that checks if a student's marks match a company's requirements.

*Note: For the full project explanation, please read the main `README.md` in the root folder.*
