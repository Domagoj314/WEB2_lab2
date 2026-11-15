import express from 'express';
import path from 'path/win32';
import { fileURLToPath } from 'url';
import { testConnection } from './db.js';
import { initDb } from './db.js';
import { pool } from './db.js';


const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
testConnection();
initDb();

app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));


app.get('/', (req, res) => {
    res.render('index');
});

app.get('/login', (req, res) => {
  res.render('login', { sqliEnabled: true });
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const sqliEnabled = req.body.sqli_enabled === 'on';
  let sql: string;
  let user;

  if (sqliEnabled) {
    sql = `SELECT * FROM users WHERE username='${username}' AND password='${password}'`;
    const result = await pool.query(sql);
    user = result.rows[0];
  } else {
    sql = `SELECT * FROM users WHERE username=$1 AND password=$2`;
    const result = await pool.query(sql, [username, password]);
    user = result.rows[0];
  }

  res.render('login', { user, sql, sqliEnabled });
});


const externalUrl = process.env.RENDER_EXTERNAL_URL;
const port = externalUrl && process.env.PORT ? parseInt(process.env.PORT) : 4080;
const hostname = externalUrl ? '0.0.0.0' : '127.0.0.1';

app.listen(port, hostname, () => {
    console.log(`Server je pokrenut na http://${hostname}:${port}`);
    if (externalUrl) console.log(`Vanjska URL adresa: ${externalUrl}`);
})