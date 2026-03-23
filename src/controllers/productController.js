const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const createProduct = async (req, res) => {
  try {
    const { name, description, category_id } = req.body;

    // Basic validation
    if (!name || !category_id) {
      return res.status(400).json({ error: 'Product name and category_id are required' });
    }

    // Insert into the products table
    const queryText = `
      INSERT INTO products (name, description, category_id) 
      VALUES ($1, $2, $3) 
      RETURNING *;
    `;
    const values = [name, description, category_id];

    const result = await pool.query(queryText, values);

    res.status(201).json(result.rows[0]);

  } catch (error) {
    // If Postgres throws a Foreign Key violation, it usually has the error code '23503'
    if (error.code === '23503') {
      return res.status(400).json({ error: 'Invalid category_id. That category does not exist.' });
    }
    
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  createProduct,
};