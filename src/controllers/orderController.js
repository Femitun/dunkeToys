const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const createOrder = async (req, res) => {
  // Check out a dedicated client from the pool for our transaction
  const client = await pool.connect();

  try {
    // We expect the frontend to send an array of items, e.g., [{ variant_id: 1, quantity: 2 }]
    const { items } = req.body; 
    
    // We pull the user ID directly from the JWT via your authMiddleware
    const user_id = req.user.id; 

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain at least one item' });
    }

    // --- 1. BEGIN THE TRANSACTION ---
    await client.query('BEGIN');

    let totalAmount = 0;
    const processedItems = [];

    // --- 2. VERIFY STOCK AND CALCULATE TOTAL ---
    for (const item of items) {
      // The "FOR UPDATE" clause is crucial. It locks this specific row in the database 
      // so if two users try to buy the last abacus at the exact same millisecond, 
      // one is forced to wait in line.
      const variantResult = await client.query(
        'SELECT price, stock_quantity FROM product_variants WHERE id = $1 FOR UPDATE;',
        [item.variant_id]
      );

      if (variantResult.rows.length === 0) {
        throw new Error(`Variant ID ${item.variant_id} does not exist`);
      }

      const variant = variantResult.rows[0];

      if (variant.stock_quantity < item.quantity) {
        throw new Error(`Insufficient stock for Variant ID ${item.variant_id}`);
      }

      const priceAtPurchase = variant.price;
      totalAmount += (priceAtPurchase * item.quantity);

      // Store the verified data to insert later
      processedItems.push({
        variant_id: item.variant_id,
        quantity: item.quantity,
        price_at_purchase: priceAtPurchase
      });
    }

    // --- 3. CREATE THE ORDER ---
    const orderResult = await client.query(
      'INSERT INTO orders (user_id, total_amount) VALUES ($1, $2) RETURNING *;',
      [user_id, totalAmount]
    );
    const orderId = orderResult.rows[0].id;

    // --- 4. CREATE LINE ITEMS & DEDUCT STOCK ---
    for (const pItem of processedItems) {
      // Insert into order_items
      await client.query(
        'INSERT INTO order_items (order_id, variant_id, quantity, price_at_purchase) VALUES ($1, $2, $3, $4);',
        [orderId, pItem.variant_id, pItem.quantity, pItem.price_at_purchase]
      );

      // Deduct the inventory
      await client.query(
        'UPDATE product_variants SET stock_quantity = stock_quantity - $1 WHERE id = $2;',
        [pItem.quantity, pItem.variant_id]
      );
    }

    // --- 5. COMMIT THE TRANSACTION ---
    // If we reach this line, no errors were thrown. Save everything permanently.
    await client.query('COMMIT');

    res.status(201).json({
      message: 'Order placed successfully',
      order: orderResult.rows[0]
    });

  } catch (error) {
    // --- ROLLBACK ON FAILURE ---
    // If anything fails (e.g., insufficient stock, bad ID), instantly undo all database changes
    await client.query('ROLLBACK');
    console.error('Transaction Failed, rolled back:', error.message);
    
    res.status(400).json({ error: error.message });
  } finally {
    // ALWAYS return the client to the pool, even if the transaction crashed
    client.release();
  }
};

module.exports = {
  createOrder,
};