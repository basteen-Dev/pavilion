const { Pool } = require('pg');
const { createToken, verifyToken } = require('./lib/auth');

const pool = new Pool({
  connectionString: 'postgresql://root:gdF4CHLIrUX0JMFop11SW8tr9Y6Tk67d@dpg-d534alggjchc73eu0eeg-a.virginia-postgres.render.com/pavilion_npg7',
  ssl: { rejectUnauthorized: false }
});

async function testAuth() {
  try {
    // Get admin user
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', ['admin@pavilion.com']);
    const user = userResult.rows[0];
    
    console.log('Admin user:', user.email, user.role);
    
    // Create token
    const token = await createToken({ userId: user.id, email: user.email, role: user.role });
    console.log('Token created:', token.substring(0, 50) + '...');
    
    // Verify token
    const payload = await verifyToken(token);
    console.log('Token verified:', payload);
    
  } catch (error) {
    console.error('Auth test error:', error.message);
  } finally {
    await pool.end();
  }
}

testAuth();
