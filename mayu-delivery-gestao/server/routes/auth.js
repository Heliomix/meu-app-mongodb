const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
require('dotenv').config();

// Login
router.post('/login', async (req, res) => {
 try {
 const { email, password } = req.body;

 if (!email || !password) {
 return res.status(400).json({ error: 'Email e senha são obrigatórios' });
 }

 const result = await pool.query('SELECT * FROM users WHERE email = $1 AND active = true', [email]);

 if (result.rows.length === 0) {
 return res.status(401).json({ error: 'Credenciais inválidas' });
 }

 const user = result.rows[0];
 const validPassword = await bcrypt.compare(password, user.password_hash);

 if (!validPassword) {
 return res.status(401).json({ error: 'Credenciais inválidas' });
 }

 const token = jwt.sign(
 { id: user.id, email: user.email, role: user.role },
 process.env.JWT_SECRET,
 { expiresIn: '24h' }
 );

 res.json({
 token,
 user: {
 id: user.id,
 name: user.name,
 email: user.email,
 role: user.role
 }
 });
 } catch (error) {
 console.error('Erro no login:', error);
 res.status(500).json({ error: 'Erro interno do servidor' });
 }
});

// Registrar novo usuário (apenas admin)
router.post('/register', async (req, res) => {
 try {
 const { name, email, password, role } = req.body;

 if (!name || !email || !password || !role) {
 return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
 }

 const hashedPassword = await bcrypt.hash(password, 10);

 const result = await pool.query(
 'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
 [name, email, hashedPassword, role]
 );

 res.status(201).json(result.rows[0]);
 } catch (error) {
 console.error('Erro ao registrar usuário:', error);
 res.status(500).json({ error: 'Erro interno do servidor' });
 }
});

module.exports = router;