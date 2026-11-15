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