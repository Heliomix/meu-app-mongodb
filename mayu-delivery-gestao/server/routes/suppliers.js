const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Listar todos os fornecedores
router.get('/', authenticateToken, async (req, res) => {
 try {
 const result = await pool.query('SELECT * FROM suppliers WHERE active = true ORDER BY company_name');
 res.json(result.rows);
 } catch (error) {
 console.error('Erro ao buscar fornecedores:', error);
 res.status(500).json({ error: 'Erro interno do servidor' });
 }
});

// Criar fornecedor
router.post('/', authenticateToken, async (req, res) => {
 try {
 const { company_name, seller_name, phone, whatsapp, email, cnpj, address, payment_conditions, delivery_time, observations } = req.body;

 const result = await pool.query(
 `INSERT INTO suppliers (company_name, seller_name, phone, whatsapp, email, cnpj, address, payment_conditions, delivery_time, observations)
 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
 [company_name, seller_name, phone, whatsapp, email, cnpj, address, payment_conditions, delivery_time, observations]
 );

 res.status(201).json(result.rows[0]);
 } catch (error) {
 console.error('Erro ao criar fornecedor:', error);
 res.status(500).json({ error: 'Erro interno do servidor' });
 }
});

module.exports = router;