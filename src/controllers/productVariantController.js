const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// 1. Create a new physical variant (e.g., A red notebook)
const createVariant = async (req, res) => {
  try {
    const { product_id, sku, price, stock_quantity, attributes } = req.body;

    if (!product_id || !sku || !price) {
      return res.status(400).json({ error: 'product_id, sku, and price are required' });
    }

    const queryText = `
      INSERT INTO product_variants (product_id, sku, price, stock_quantity, attributes) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING *;
    `;
    const values = [product_id, sku, price, stock_quantity || 0, attributes || {}];

    const result = await pool.query(queryText, values);
    res.status(201).json(result.rows[0]);

  } catch (error) {
    if (error.code === '23503') {
      return res.status(400).json({ error: 'Invalid product_id.' });
    }
    if (error.code === '23505') { // Postgres error code for Unique Violation
      return res.status(400).json({ error: 'A variant with this SKU already exists.' });
    }
    console.error('Error creating variant:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// 2. Fetch all variants using an INNER JOIN
const getAllVariants = async (req, res) => {
  try {
    // We join the product_variants (pv) table with the products (p) table
    const queryText = `
      SELECT 
        pv.id, 
        pv.sku, 
        pv.price, 
        pv.stock_quantity, 
        pv.attributes,
        p.name AS parent_product_name
      FROM product_variants pv
      INNER JOIN products p ON pv.product_id = p.id
      ORDER BY pv.id ASC;
    `;
    
    const result = await pool.query(queryText);
    res.status(200).json(result.rows);
    
  } catch (error) {
    console.error('Error fetching variants:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  createVariant,
  getAllVariants,
};