const { Pool } = require('pg');

// We connect to the pool again so this file can talk to the database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// This is the function that handles the creation logic
const createCategory = async (req, res) => {
  try {
    // 1. Grab the data the user sent in the request body
    const { name, description } = req.body;

    // 2. Validate the data (Don't let them create a blank category)
    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    // 3. Write the SQL Query (Using $1, $2 prevents SQL injection hackers!)
    const queryText = `
      INSERT INTO categories (name, description) 
      VALUES ($1, $2) 
      RETURNING *;
    `;
    const values = [name, description];

    // 4. Send the query to PostgreSQL
    const result = await pool.query(queryText, values);

    // 5. Send the newly created category back to the user
    res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// This function handles fetching all categories
const getAllCategories = async (req, res) => {
  try {
    // 1. Write the SQL Query to get everything, ordered by their ID
    const queryText = 'SELECT * FROM categories ORDER BY id ASC;';
    
    // 2. Send the query to PostgreSQL
    const result = await pool.query(queryText);

    // 3. Send the array of categories back to the user
    // We use status 200 (OK) for successful retrievals
    res.status(200).json(result.rows);
    
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Export the function so our Route can use it
module.exports = {
  createCategory,
  getAllCategories,
};