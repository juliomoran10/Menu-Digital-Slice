import express from 'slicejs-web-framework/api/framework/express.js';
import { getPool } from '../db.js';

const router = express.Router();

router.get('/restaurant', async (req, res) => {
  try {
    const result = await getPool().query('SELECT * FROM restaurants ORDER BY id LIMIT 1');
    res.json(result.rows[0] || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/restaurant', async (req, res) => {
  try {
    const { name, logo_url, base_currency } = req.body;
    const result = await getPool().query(
      'UPDATE restaurants SET name = COALESCE($1, name), logo_url = COALESCE($2, logo_url), base_currency = COALESCE($3, base_currency) WHERE id = (SELECT id FROM restaurants ORDER BY id LIMIT 1) RETURNING *',
      [name, logo_url, base_currency]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/categories', async (req, res) => {
  try {
    const result = await getPool().query(
      'SELECT * FROM categories WHERE restaurant_id = (SELECT id FROM restaurants ORDER BY id LIMIT 1) ORDER BY sort_order'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/categories', async (req, res) => {
  try {
    const { name } = req.body;
    const restResult = await getPool().query('SELECT id FROM restaurants ORDER BY id LIMIT 1');
    const restId = restResult.rows[0]?.id;
    if (!restId) return res.status(400).json({ error: 'No restaurant found' });
    const result = await getPool().query(
      "INSERT INTO categories (restaurant_id, name, sort_order) VALUES ($1, $2, (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM categories WHERE restaurant_id = $1)) RETURNING *",
      [restId, name]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/categories/:id', async (req, res) => {
  try {
    await getPool().query('DELETE FROM categories WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/dishes', async (req, res) => {
  try {
    const { category_id } = req.query;
    let query = "SELECT d.*, c.name as category_name FROM dishes d JOIN categories c ON d.category_id = c.id WHERE c.restaurant_id = (SELECT id FROM restaurants ORDER BY id LIMIT 1)";
    const params = [];
    if (category_id) {
      query += ' AND d.category_id = $1';
      params.push(category_id);
    }
    query += ' ORDER BY c.sort_order, d.id';
    const result = await getPool().query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/dishes', async (req, res) => {
  try {
    const { category_id, name, description, base_price, image_url } = req.body;
    const result = await getPool().query(
      'INSERT INTO dishes (category_id, name, description, base_price, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [category_id, name, description, base_price, image_url || '']
    );
    const dish = result.rows[0];
    const catResult = await getPool().query('SELECT name FROM categories WHERE id = $1', [category_id]);
    dish.category_name = catResult.rows[0]?.name || '';
    res.json(dish);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/dishes/:id', async (req, res) => {
  try {
    const { name, description, base_price, available, category_id, image_url } = req.body;
    const result = await getPool().query(
      "UPDATE dishes SET name = COALESCE($1, name), description = COALESCE($2, description), base_price = COALESCE($3, base_price), available = COALESCE($4, available), category_id = COALESCE($5, category_id), image_url = COALESCE($6, image_url) WHERE id = $7 RETURNING *",
      [name, description, base_price, available, category_id, image_url, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/dishes/:id', async (req, res) => {
  try {
    await getPool().query('DELETE FROM dishes WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/dishes/:id/toggle', async (req, res) => {
  try {
    const result = await getPool().query(
      'UPDATE dishes SET available = NOT available WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/combos', async (req, res) => {
  try {
    const combos = await getPool().query(
      "SELECT * FROM combos WHERE restaurant_id = (SELECT id FROM restaurants ORDER BY id LIMIT 1) AND active = true ORDER BY id"
    );
    for (const combo of combos.rows) {
      const items = await getPool().query(
        'SELECT ci.*, d.name as dish_name, d.base_price FROM combo_items ci JOIN dishes d ON ci.dish_id = d.id WHERE ci.combo_id = $1',
        [combo.id]
      );
      combo.items = items.rows;
    }
    res.json(combos.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/combos', async (req, res) => {
  try {
    const { name, description, total_price, items } = req.body;
    const restResult = await getPool().query('SELECT id FROM restaurants ORDER BY id LIMIT 1');
    const restId = restResult.rows[0]?.id;
    if (!restId) return res.status(400).json({ error: 'No restaurant found' });

    const comboResult = await getPool().query(
      'INSERT INTO combos (restaurant_id, name, description, total_price) VALUES ($1, $2, $3, $4) RETURNING *',
      [restId, name, description, total_price]
    );
    const combo = comboResult.rows[0];

    if (items && items.length > 0) {
      for (const item of items) {
        await getPool().query(
          'INSERT INTO combo_items (combo_id, dish_id, quantity) VALUES ($1, $2, $3)',
          [combo.id, item.dish_id, item.quantity || 1]
        );
      }
    }

    combo.items = items || [];
    res.json(combo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/combos/:id', async (req, res) => {
  try {
    await getPool().query('DELETE FROM combos WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rates proxy - evita CORS y agrega monedas LATAM
router.get('/rates', async (req, res) => {
  try {
    const base = req.query.from || 'USD';
    const frankResp = await fetch(`https://api.frankfurter.app/latest?from=${base}`);
    const frankData = await frankResp.json();
    const rates = frankData.rates;

    try {
      const vesResp = await fetch('https://ve.dolarapi.com/v1/dolares/oficial');
      const vesData = await vesResp.json();
      rates.VES = vesData.promedio || 607.39;
    } catch {
      rates.VES = 607.39;
    }
    rates.COP = 4100.00;
    rates.ARS = 850.00;
    rates.USD = 1.00;

    res.json({ base: rates });
  } catch (err) {
    res.json({
      base: {
        USD: 1, EUR: 0.87, MXN: 17.34, BRL: 5.16, VES: 607.39, COP: 4100, ARS: 850
      }
    });
  }
});

router.get('/orders', async (req, res) => {
  try {
    const result = await getPool().query(
      "SELECT * FROM orders WHERE restaurant_id = (SELECT id FROM restaurants ORDER BY id LIMIT 1) ORDER BY created_at DESC LIMIT 50"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/orders', async (req, res) => {
  try {
    const { items, total, currency } = req.body;
    const restResult = await getPool().query('SELECT id FROM restaurants ORDER BY id LIMIT 1');
    const restId = restResult.rows[0]?.id;
    if (!restId) return res.status(400).json({ error: 'No restaurant found' });
    const result = await getPool().query(
      'INSERT INTO orders (restaurant_id, items, total, currency) VALUES ($1, $2, $3, $4) RETURNING *',
      [restId, JSON.stringify(items), total, currency || 'USD']
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
