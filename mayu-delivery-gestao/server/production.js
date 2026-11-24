// Entry point for the hosted web application. Local development keeps index.js.
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

if (process.env.DATABASE_URL) {
  const url = new URL(process.env.DATABASE_URL);
  process.env.DB_HOST = url.hostname;
  process.env.DB_PORT = url.port || '5432';
  process.env.DB_NAME = decodeURIComponent(url.pathname.slice(1));
  process.env.DB_USER = decodeURIComponent(url.username);
  process.env.DB_PASSWORD = decodeURIComponent(url.password);
  if (url.searchParams.has('sslmode')) process.env.PGSSLMODE = url.searchParams.get('sslmode');
}

const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('./config/database');
const { authenticateToken, authorizeRoles } = require('./middleware/auth');
const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});
app.use(express.json({ limit: '12mb' }));
app.use(express.urlencoded({ extended: true, limit: '12mb' }));

// Limit repeated login attempts without retaining submitted credentials.
const attempts = new Map();
app.use('/api/auth/login', (req, res, next) => {
  const now = Date.now();
  for (const [key, value] of attempts) if (value.until <= now) attempts.delete(key);
  const key = req.ip;
  const value = attempts.get(key) || { count: 0, until: now + 15 * 60 * 1000 };
  value.count += 1;
  attempts.set(key, value);
  if (value.count > 30) return res.status(429).json({ error: 'Aguarde alguns minutos antes de tentar novamente.' });
  next();
});

app.get('/api/health', async (req, res) => {
  try { await pool.query('SELECT 1'); res.json({ status: 'ok' }); }
  catch { res.status(503).json({ status: 'unavailable' }); }
});
app.post('/api/auth/register', authenticateToken, authorizeRoles('admin'));
app.use('/api/auth', require('./routes/auth'));
const routes = {
  products: 'products', categories: 'categories', suppliers: 'suppliers',
  stock: 'stock', 'purchase-orders': 'purchaseOrders', invoices: 'invoices',
  dashboard: 'dashboard', users: 'users', ocr: 'ocr'
};
for (const [prefix, moduleName] of Object.entries(routes)) {
  app.use(`/api/${prefix}`, authenticateToken, require(`./routes/${moduleName}`));
}
app.use('/api', (req, res) => res.status(404).json({ error: 'Rota nao encontrada' }));
app.use('/uploads', authenticateToken, express.static(path.join(__dirname, 'uploads')));
const clientDist = path.join(__dirname, '../client/dist');
app.use(express.static(clientDist));
app.get('*', (req, res) => res.sendFile(path.join(clientDist, 'index.html')));
app.use((err, req, res, next) => {
  console.error('Request failed:', err.code || err.name);
  res.status(err.status === 413 ? 413 : 500).json({ error: 'Nao foi possivel concluir a operacao.' });
});

async function initializeDatabase() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock(76429132)');
    const existing = await client.query("SELECT to_regclass('public.users') AS users");
    if (!existing.rows[0].users) {
      let schema = fs.readFileSync(path.join(__dirname, '../database/schema.sql'), 'utf8');
      // Never create the demonstration administrator with a known password.
      schema = schema.replace(/INSERT INTO users\s*\([\s\S]*?;/gi, '');
      await client.query(schema);
    }
    const admins = await client.query("SELECT 1 FROM users WHERE role = 'admin' AND active = true LIMIT 1");
    if (!admins.rowCount) {
      const email = process.env.ADMIN_EMAIL;
      const password = process.env.ADMIN_PASSWORD;
      if (!email || !password || password.length < 14) {
        throw new Error('Configure ADMIN_EMAIL e ADMIN_PASSWORD (minimo de 14 caracteres) para o primeiro acesso.');
      }
      const hash = await bcrypt.hash(password, 12);
      await client.query("INSERT INTO users (name, email, password_hash, role) VALUES ($1,$2,$3,'admin')", ['Administrador Mayu', email, hash]);
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally { client.release(); }
}

async function start() {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('Configure JWT_SECRET com no minimo 32 caracteres.');
  }
  if (!fs.existsSync(path.join(clientDist, 'index.html'))) throw new Error('Execute o build do client antes de iniciar.');
  process.chdir(__dirname);
  fs.mkdirSync(path.join(__dirname, 'uploads/invoices'), { recursive: true });
  await initializeDatabase();
  const server = app.listen(process.env.PORT || 3000, '0.0.0.0', () => console.log('Mayu Delivery online.'));
  process.on('SIGTERM', () => server.close(() => pool.end().finally(() => process.exit(0))));
  return server;
}
if (require.main === module) start().catch(error => { console.error(error.message); pool.end().finally(() => process.exit(1)); });
module.exports = { app, initializeDatabase, start };
