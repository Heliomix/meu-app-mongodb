const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Listar todos os produtos
router.get('/', authenticateToken, async (req, res) => {
 try {
 const result = await pool.query(`
 SELECT p.*, c.name as category_name
 FROM products p
 LEFT JOIN categories c ON p.category_id = c.id
 WHERE p.active = true
 ORDER BY p.name
 `);
 res.json(result.rows);
 } catch (error) {
 console.error('Erro ao buscar produtos:', error);
 res.status(500).json({ error: 'Erro interno do servidor' });
 }
});

// Buscar produto por ID
router.get('/:id', authenticateToken, async (req, res) => {
 try {
 const { id } = req.params;
 const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);

 if (result.rows.length === 0) {
 return res.status(404).json({ error: 'Produto não encontrado' });
 }

 res.json(result.rows[0]);
 } catch (error) {
 console.error('Erro ao buscar produto:', error);
 res.status(500).json({ error: 'Erro interno do servidor' });
 }
});

// Criar novo produto
router.post('/', authenticateToken, async (req, res) => {
 try {
 const { name, category_id, unit, min_quantity, ideal_quantity, internal_code, observations } = req.body;

 const result = await pool.query(
 `INSERT INTO products (name, category_id, unit, min_quantity, ideal_quantity, internal_code, observations)
 VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
 [name, category_id, unit, min_quantity || 0, ideal_quantity || 0, internal_code, observations]
 );

 res.status(201).json(result.rows[0]);
 } catch (error) {
 console.error('Erro ao criar produto:', error);
 res.status(500).json({ error: 'Erro interno do servidor' });
 }
});

// Atualizar produto
router.put('/:id', authenticateToken, async (req, res) => {
 try {
 const { id } = req.params;
 const { name, category_id, unit, min_quantity, ideal_quantity, internal_code, observations, active } = req.body;

 const result = await pool.query(
 `UPDATE products
 SET name = COALESCE($1, name),
 category_id = COALESCE($2, category_id),
 unit = COALESCE($3, unit),
 min_quantity = COALESCE($4, min_quantity),
 ideal_quantity = COALESCE($5, ideal_quantity),
 internal_code = COALESCE($6, internal_code),
 observations = COALESCE($7, observations),
 active = COALESCE($8, active),
 updated_at = CURRENT_TIMESTAMP
 WHERE id = $9 RETURNING *`,
 [name, category_id, unit, min_quantity, ideal_quantity, internal_code, observations, active, id]
 );

 if (result.rows.length === 0) {
 return res.status(404).json({ error: 'Produto não encontrado' });
 }

 res.json(result.rows[0]);
 } catch (error) {
 console.error('Erro ao atualizar produto:', error);
 res.status(500).json({ error: 'Erro interno do servidor' });
 }
});

module.exports = router;