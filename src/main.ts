import express from 'express';
import path from 'path/win32';
import session from 'express-session';
import crypto from 'crypto';
import { state } from './state.js';
import { fileURLToPath } from 'url';
import { testConnection } from './db.js';
import { initDb } from './db.js';
import { pool } from './db.js';


const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
testConnection();
initDb();

app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'tajna-za-demo',
  resave: false,
  saveUninitialized: false,
}));

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
  if (user) {
  req.session.user = { id: user.id, username: user.username, email: user.email, role: user.role };
}

  res.render('login', { user, sql, sqliEnabled });
});

app.get('/profile', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(16).toString('hex');
  }
  res.render('profile', {
    user: req.session.user,
    csrfToken: req.session.csrfToken,
    csrfProtected: state.csrfProtected,
  });
});

app.post('/profile/email', async (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  if (state.csrfProtected && req.body._csrf !== req.session.csrfToken) {
    return res.status(403).send('CSRF token nevažeći -> napad spriječen.');
  }

  const { email } = req.body;
  await pool.query('UPDATE users SET email=$1 WHERE id=$2', [email, req.session.user.id]);
  req.session.user.email = email;
  res.redirect('/profile');
});

app.post('/toggle/csrf', (req, res) => {
  state.csrfProtected = req.body.csrf_protected === 'on';
  res.redirect('/profile');
});

app.get('/attacker', (req, res) => {
  res.render('attacker');
});


const externalUrl = process.env.RENDER_EXTERNAL_URL;
const port = externalUrl && process.env.PORT ? parseInt(process.env.PORT) : 4080;
const hostname = externalUrl ? '0.0.0.0' : '127.0.0.1';

app.listen(port, hostname, () => {
    console.log(`Server je pokrenut na http://${hostname}:${port}`);
    if (externalUrl) console.log(`Vanjska URL adresa: ${externalUrl}`);
})