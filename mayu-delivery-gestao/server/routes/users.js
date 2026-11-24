const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

// Listar todos os usuários (apenas admin)
router.get('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
 try {
 const result = await pool.query('SELECT id, name, email, role, active, created_at FROM users ORDER BY name');
 res.json(result.rows);
 } catch (error) {
 console.error('Erro ao buscar usuários:', error);
 res.status(500).json({ error: 'Erro interno do servidor' });
 }
});

// Criar novo usuário (apenas admin)
router.post('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
 try {
 const { name, email, password, role } = req.body;

 if (!name || !email || !password) {
 return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
 }

 // Verificar se o email já existe
 const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
 if (existingUser.rows.length > 0) {
 return res.status(400).json({ error: 'Email já cadastrado' });
 }

 // Criptografar a senha
 const hashedPassword = await bcrypt.hash(password, 10);

 // Inserir novo usuário
 const result = await pool.query(
 'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
 [name, email, hashedPassword, role || 'user']
 );

 res.status(201).json({
 success: true,
 message: 'Usuário criado com sucesso',
 user: result.rows[0]
 });

 } catch (error) {
 console.error('Erro ao criar usuário:', error);
 res.status(500).json({ error: 'Erro interno do servidor' });
 }
});

// Atualizar usuário (apenas admin)
router.put('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
 try {
 const { id } = req.params;
 const { name, email, role, active } = req.body;

 const result = await pool.query(
 'UPDATE users SET name = COALESCE($1, name), email = COALESCE($2, email), role = COALESCE($3, role), active = COALESCE($4, active) WHERE id = $5 RETURNING id, name, email, role, active',
 [name, email, role, active, id]
 );

 if (result.rows.length === 0) {
 return res.status(404).json({ error: 'Usuário não encontrado' });
 }

 res.json({
 success: true,
 message: 'Usuário atualizado com sucesso',
 user: result.rows[0]
 });

 } catch (error) {
 console.error('Erro ao atualizar usuário:', error);
 res.status(500).json({ error: 'Erro interno do servidor' });
 }
});

// Excluir usuário (apenas admin)
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
 try {
 const { id } = req.params;

 const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);

 if (result.rows.length === 0) {
 return res.status(404).json({ error: 'Usuário não encontrado' });
 }

 res.json({
 success: true,
 message: 'Usuário excluído com sucesso'
 });

 } catch (error) {
 console.error('Erro ao excluir usuário:', error);
 res.status(500).json({ error: 'Erro interno do servidor' });
 }
});

// Atualizar perfil do próprio usuário (qualquer usuário logado)
router.put('/profile', authenticateToken, async (req, res) => {
 try {
 const userId = req.user.id;
 const { name, email, password } = req.body;

 let updateQuery = 'UPDATE users SET ';
 const params = [];
 let paramCount = 1;

 if (name) {
 updateQuery += `name = $${paramCount}, `;
 params.push(name);
 paramCount++;
 }

 if (email) {
 // Verificar se o email já existe para outro usuário
 const existingEmail = await pool.query('SELECT id FROM users WHERE email = $1 AND id != $2', [email, userId]);
 if (existingEmail.rows.length > 0) {
 return res.status(400).json({ error: 'Email já está em uso' });
 }
 updateQuery += `email = $${paramCount}, `;
 params.push(email);
 paramCount++;
 }

 if (password) {
 const hashedPassword = await bcrypt.hash(password, 10);
 updateQuery += `password = $${paramCount}, `;
 params.push(hashedPassword);
 paramCount++;
 }

 // Remover a última vírgula e espaço
 updateQuery = updateQuery.slice(0, -2);

 updateQuery += ` WHERE id = $${paramCount} RETURNING id, name, email, role`;
 params.push(userId);

 const result = await pool.query(updateQuery, params);

 if (result.rows.length === 0) {
 return res.status(404).json({ error: 'Usuário não encontrado' });
 }

 res.json({
 success: true,
 message: 'Perfil atualizado com sucesso',
 user: result.rows[0]
 });

 } catch (error) {
 console.error('Erro ao atualizar perfil:', error);
 res.status(500).json({ error: 'Erro interno do servidor' });
 }
});

module.exports = router;