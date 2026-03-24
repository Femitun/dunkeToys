const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const registerUser = async (req, res) => {
  try {
    // 1. Grab the data from the request
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // 2. Hash the password
    // "Salt rounds" determine how much time the algorithm takes to calculate the hash.
    // 10 is the industry standard balance between security and performance.
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 3. Save the user to the database with the HASHED password
    const queryText = `
      INSERT INTO users (email, password_hash, role) 
      VALUES ($1, $2, $3) 
      RETURNING id, email, role, created_at; -- Notice we deliberately omit password_hash here!
    `;
    
    // We default to 'customer' if no role is provided
    const values = [email, passwordHash, role || 'customer'];

    const result = await pool.query(queryText, values);

    // 4. Return the safely created user profile
    res.status(201).json(result.rows[0]);

  } catch (error) {
    // Error code 23505 means Unique Violation (the email already exists)
    if (error.code === '23505') {
      return res.status(400).json({ error: 'A user with this email already exists.' });
    }
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  registerUser,
};