const { Pool } = require('pg');

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "placement_tracker",
    password: "Abhijeet@2004",
    port: 5432,
});

pool.on('connect', () => {
    console.log('Connected to PostgreSQL - placement_tracker');
});

pool.on('error', (err) => {
    console.error('PostgreSQL pool error:', err.message);
});

module.exports = pool;