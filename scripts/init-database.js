// Database initialization script
const { initializeDatabase } = require('../lib/db');

async function initDatabase() {
  try {
    console.log('Initializing database schema...');
    await initializeDatabase();
    console.log('Database schema initialized successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Database initialization error:', error);
    process.exit(1);
  }
}

initDatabase();
