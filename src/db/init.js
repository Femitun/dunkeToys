const { Pool } = require('pg');
require('dotenv').config();

// We create a new pool just for this script
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const createTables = async () => {
  // The multi-line string below contains our raw SQL commands
  const queryText = `
    -- 1. Drop existing tables if they exist (so we can run this script multiple times safely)
    -- CASCADE ensures that if we drop a parent, the children get dropped too.
    DROP TABLE IF EXISTS order_items CASCADE;
    DROP TABLE IF EXISTS orders CASCADE;
    DROP TABLE IF EXISTS product_variants CASCADE;
    DROP TABLE IF EXISTS products CASCADE;
    DROP TABLE IF EXISTS categories CASCADE;
    DROP TABLE IF EXISTS users CASCADE;

    -- 2. Create Users Table
    CREATE TABLE users (
      id SERIAL PRIMARY KEY, -- SERIAL automatically counts up: 1, 2, 3...
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'customer',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- 3. Create Categories Table
    CREATE TABLE categories (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      description TEXT
    );

    -- 4. Create Products Table
    CREATE TABLE products (
      id SERIAL PRIMARY KEY,
      category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL, -- The Foreign Key
      name VARCHAR(255) NOT NULL,
      description TEXT
    );

    -- 5. Create Product Variants Table (The physical items)
    CREATE TABLE product_variants (
      id SERIAL PRIMARY KEY,
      product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
      sku VARCHAR(100) UNIQUE NOT NULL,
      price DECIMAL(10, 2) NOT NULL, -- Handles money up to 99,999,999.99
      stock_quantity INTEGER DEFAULT 0,
      attributes JSONB -- The PostgreSQL superpower for random attributes like { "color": "blue" }
    );

    -- 6. Create Orders Table
    CREATE TABLE orders (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      status VARCHAR(50) DEFAULT 'pending',
      total_amount DECIMAL(10, 2) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- 7. Create Order Items Table (The Price Snapshot)
    CREATE TABLE order_items (
      id SERIAL PRIMARY KEY,
      order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
      variant_id INTEGER REFERENCES product_variants(id) ON DELETE SET NULL,
      quantity INTEGER NOT NULL,
      price_at_purchase DECIMAL(10, 2) NOT NULL
    );
  `;

  try {
    console.log('Running database initialization...');
    await pool.query(queryText);
    console.log('Success: All database tables created!');
  } catch (error) {
    console.error('Error creating tables:', error.stack);
  } finally {
    // This closes the database connection so the script can finish and exit
    pool.end();
  }
};

// Run the function
createTables();