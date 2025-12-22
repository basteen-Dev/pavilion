const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://root:gdF4CHLIrUX0JMFop11SW8tr9Y6Tk67d@dpg-d534alggjchc73eu0eeg-a.virginia-postgres.render.com/pavilion_npg7',
  ssl: { rejectUnauthorized: false }
});

async function disableMFA() {
  try {
    await pool.query('UPDATE users SET mfa_enabled = false, mfa_secret = NULL WHERE email = $1', ['admin@pavilion.com']);
    console.log('MFA disabled for admin user');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

disableMFA();
