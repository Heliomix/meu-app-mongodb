const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Listar todos os pedidos de compra
router.get('/', authenticateToken, async (req, res) => {
 try {
 const result = await pool.query(`
 SELECT po.*, s.company_name as supplier_name, u.name as user_name
 FROM purchase_orders po
 JOIN suppliers s ON po.supplier_id = s.id
 JOIN users u ON po.user_id = u.id
 ORDER BY po.created_at DESC
 `);
 res.json(result.rows);
 } catch (error) {
 console.error('Erro ao buscar pedidos de compra:', error);
 res.status(500).json({ error: 'Erro interno do servidor' });
 }
});

// Criar pedido de compra
router.post('/', authenticateToken, async (req, res) => {
 try {
 const { supplier_id, items, notes } = req.body;
 const user_id = req.user.id;

 const client = await pool.connect();
 try {
 await client.query('BEGIN');

 // Criar pedido
 const orderResult = await client.query(
 'INSERT INTO purchase_orders (supplier_id, status, notes, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
 [supplier_id, 'rascunho', notes, user_id]
 );
 const orderId = orderResult.rows[0].id;

 let totalEstimated = 0;

 // Adicionar itens
 for (const item of items) {
 const { product_id, quantity, unit_price } = item;
 const total_price = quantity * unit_price;
 totalEstimated += total_price;

 await client.query(
 'INSERT INTO purchase_order_items (purchase_order_id, product_id, quantity, unit_price, total_price) VALUES ($1, $2, $3, $4, $5)',
 [orderId, product_id, quantity, unit_price, total_price]
 );
 }

 // Atualizar total estimado
 await client.query(
 'UPDATE purchase_orders SET total_estimated = $1 WHERE id = $2',
 [totalEstimated, orderId]
 );

 await client.query('COMMIT');
 res.status(201).json({ message: 'Pedido de compra criado com sucesso', order_id: orderId });
 } catch (error) {
 await client.query('ROLLBACK');
 throw error;
 } finally {
 client.release();
 }
 } catch (error) {
 console.error('Erro ao criar pedido de compra:', error);
 res.status(500).json({ error: 'Erro interno do servidor' });
 }
});

module.exports = router;