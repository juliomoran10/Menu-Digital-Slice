import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

let pool;

export function getPool() {
  if (!pool) {
    pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      max: 5,
      idleTimeoutMillis: 30000,
    });
  }
  return pool;
}

export async function initDatabase() {
  const client = getPool();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS restaurants (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL DEFAULT 'Mi Restaurante',
        logo_url TEXT DEFAULT '',
        base_currency VARCHAR(3) DEFAULT 'USD',
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS dishes (
        id SERIAL PRIMARY KEY,
        category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT DEFAULT '',
        base_price DECIMAL(10,2) NOT NULL DEFAULT 0,
        available BOOLEAN DEFAULT true,
        image_url TEXT DEFAULT '',
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS combos (
        id SERIAL PRIMARY KEY,
        restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT DEFAULT '',
        total_price DECIMAL(10,2) NOT NULL DEFAULT 0,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS combo_items (
        id SERIAL PRIMARY KEY,
        combo_id INTEGER REFERENCES combos(id) ON DELETE CASCADE,
        dish_id INTEGER REFERENCES dishes(id) ON DELETE CASCADE,
        quantity INTEGER DEFAULT 1
      );

      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE,
        items JSONB NOT NULL DEFAULT '[]',
        total DECIMAL(10,2) NOT NULL DEFAULT 0,
        currency VARCHAR(3) DEFAULT 'USD',
        status VARCHAR(20) DEFAULT 'completed',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    const existing = await client.query('SELECT id FROM restaurants LIMIT 1');
    if (existing.rows.length === 0) {
      const rest = await client.query(
        "INSERT INTO restaurants (name, base_currency) VALUES ('Mi Restaurante', 'USD') RETURNING id"
      );
      const restId = rest.rows[0].id;

      const cats = ['Entradas', 'Platos Fuertes', 'Bebidas', 'Postres'];
      for (let i = 0; i < cats.length; i++) {
        await client.query(
          'INSERT INTO categories (restaurant_id, name, sort_order) VALUES ($1, $2, $3)',
          [restId, cats[i], i + 1]
        );
      }

      const dishesData = [
        { cat: 'Entradas', name: 'Tequeños', desc: 'Palitos de queso frito', price: 5.00 },
        { cat: 'Entradas', name: 'Ceviche', desc: 'Pescado marinado con limón', price: 8.50 },
        { cat: 'Platos Fuertes', name: 'Parrilla Mixta', desc: 'Carne, pollo y chorizo a la parrilla', price: 18.00 },
        { cat: 'Platos Fuertes', name: 'Hamburguesa Clásica', desc: 'Carne 200g con queso, lechuga y tomate', price: 12.00 },
        { cat: 'Platos Fuertes', name: 'Pizza Pepperoni', desc: 'Pizza familiar de pepperoni con queso mozzarella', price: 15.00 },
        { cat: 'Bebidas', name: 'Limonada Natural', desc: 'Limonada fresca con hierbabuena', price: 3.50 },
        { cat: 'Bebidas', name: 'Coca Cola 500ml', desc: 'Refresco personal', price: 2.50 },
        { cat: 'Bebidas', name: 'Jugo de Naranja', desc: 'Jugo natural de naranja', price: 4.00 },
        { cat: 'Postres', name: 'Tres Leches', desc: 'Pastel bañado en tres leches', price: 6.00 },
        { cat: 'Postres', name: 'Flan Napolitano', desc: 'Flan cremoso con caramelo', price: 5.50 },
      ];

      for (const d of dishesData) {
        const catResult = await client.query(
          'SELECT id FROM categories WHERE restaurant_id = $1 AND name = $2',
          [restId, d.cat]
        );
        if (catResult.rows[0]) {
          await client.query(
            'INSERT INTO dishes (category_id, name, description, base_price) VALUES ($1, $2, $3, $4)',
            [catResult.rows[0].id, d.name, d.desc, d.price]
          );
        }
      }

      const combos = [
        { name: 'Combo Familiar', desc: 'Parrilla mixta + 4 tequeños + 4 limonadas', price: 35.00 },
        { name: 'Combo Hamburguesa', desc: 'Hamburguesa clásica + papas + Coca Cola', price: 15.00 },
        { name: 'Combo Pizza', desc: 'Pizza pepperoni + 2 Coca Colas + flan de postre', price: 22.00 },
      ];

      for (const c of combos) {
        await client.query(
          'INSERT INTO combos (restaurant_id, name, description, total_price) VALUES ($1, $2, $3, $4)',
          [restId, c.name, c.desc, c.price]
        );
      }
    }

    console.log('✅ Database initialized successfully');
  } catch (err) {
    console.error('❌ Database initialization error:', err.message);
  }
}
