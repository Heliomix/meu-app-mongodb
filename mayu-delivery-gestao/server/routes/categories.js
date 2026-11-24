const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Listar todas as categorias
router.get('/', authenticateToken, async (req, res) => {
 try {
 const result = await pool.query('SELECT * FROM categories ORDER BY name');
 res.json(result.rows);
 } catch (error) {
 console.error('Erro ao buscar categorias:', error);
 res.status(500).json({ error: 'Erro interno do servidor' });
 }
});

module.exports = router;