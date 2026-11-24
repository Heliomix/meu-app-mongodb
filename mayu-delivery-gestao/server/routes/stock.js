const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Registrar movimentação de estoque
router.post('/movements', authenticateToken, async (req, res) => {
 try {
 const { product_id, type, quantity, reason, batch_number, expiration_date } = req.body;
 const user_id = req.user.id;

 // Buscar quantidade atual do produto
 const productResult = await pool.query('SELECT current_quantity FROM products WHERE id = $1', [product_id]);
 if (productResult.rows.length === 0) {
 return res.status(404).json({ error: 'Produto não encontrado' });
 }

 let newQuantity = productResult.rows[0].current_quantity;

 // Calcular nova quantidade baseado no tipo
 if (type === 'entrada') {
 newQuantity += parseFloat(quantity);
 } else if (['saida', 'perda', 'descarte'].includes(type)) {
 newQuantity -= parseFloat(quantity);
 if (newQuantity < 0) {
 return res.status(400).json({ error: 'Quantidade insuficiente em estoque' });
 }
 } else if (type === 'ajuste') {
 newQuantity = parseFloat(quantity);
 }

 // Iniciar transação
 const client = await pool.connect();
 try {
 await client.query('BEGIN');

 // Atualizar quantidade do produto
 await client.query('UPDATE products SET current_quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [newQuantity, product_id]);

 // Registrar movimentação
 await client.query(
 `INSERT INTO stock_movements (product_id, type, quantity, reason, user_id, batch_number, expiration_date)
 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
 [product_id, type, quantity, reason, user_id, batch_number, expiration_date]
 );

 await client.query('COMMIT');
 res.status(201).json({ message: 'Movimentação registrada com sucesso', new_quantity: newQuantity });
 } catch (error) {
 await client.query('ROLLBACK');
 throw error;
 } finally {
 client.release();
 }
 } catch (error) {
 console.error('Erro ao registrar movimentação:', error);
 res.status(500).json({ error: 'Erro interno do servidor' });
 }
});

// Listar movimentações de um produto
router.get('/movements/:product_id', authenticateToken, async (req, res) => {
 try {
 const { product_id } = req.params;
 const result = await pool.query(`
 SELECT sm.*, u.name as user_name, p.name as product_name
 FROM stock_movements sm
 JOIN users u ON sm.user_id = u.id
 JOIN products p ON sm.product_id = p.id
 WHERE sm.product_id = $1
 ORDER BY sm.created_at DESC
 `, [product_id]);
 res.json(result.rows);
 } catch (error) {
 console.error('Erro ao buscar movimentações:', error);
 res.status(500).json({ error: 'Erro interno do servidor' });
 }
});

module.exports = router;