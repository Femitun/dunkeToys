// 1. Import the tools we installed
const express = require('express');
const { Pool } = require('pg');
require('dotenv').config(); // Loads the variables from your .env file

// 2. Initialize the Express application
const app = express();

// 3. Allow Express to understand JSON (when React sends data later)
app.use(express.json());

// 4. Set up the Database Connection Pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// 5. Test the Database Connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error connecting to the database:', err.stack);
  } else {
    console.log('Successfully connected to the PostgreSQL Docker database!');
    release(); // Returns the connection back to the pool
  }
});

// Import the category routes
const categoryRoutes = require('./routes/categoryRoutes');

// Tell Express to use these routes for anything starting with /api/categories
app.use('/api/categories', categoryRoutes);

// Import the product routes
const productRoutes = require('./routes/productRoutes');

// Tell Express to use these routes for anything starting with /api/products
app.use('/api/products', productRoutes);

// Import the product variant routes
const productVariantRoutes = require('./routes/productVariantRoutes');

// Tell Express to use these routes for anything starting with /api/variants
app.use('/api/variants', productVariantRoutes);

// Import the user routes
const userRoutes = require('./routes/userRoutes');

// Tell Express to use these routes for anything starting with /api/users
app.use('/api/users', userRoutes);

const orderRoutes = require('./routes/orderRoutes');
app.use('/api/orders', orderRoutes);

// 6. Create a simple test route so we can check it in the browser
app.get('/', (req, res) => {
  res.send('Mum Store API is running!');
});

// 7. Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});