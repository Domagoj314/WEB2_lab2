import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
  ssl: process.env.RENDER_EXTERNAL_URL ? { rejectUnauthorized: false } : false,
});

export async function testConnection() {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('Baza spojena:', result.rows[0]);
  } catch (err) {
    console.error('Greška pri spajanju na bazu:', err);
  }
}

export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      email TEXT,
      role TEXT
    )
  `);

  const { rows } = await pool.query('SELECT COUNT(*) FROM users');
  if (Number(rows[0].count) === 0) {
    await pool.query(`
      INSERT INTO users (username, password, email, role) VALUES
        ('admin', 'admin123', 'admin@web2.local', 'admin'),
        ('pero',  'pero123',  'pero@web2.local',  'user')
    `);
    console.log('Seed korisnici ubaceni.');
  }
}