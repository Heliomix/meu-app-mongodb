const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Dados do dashboard
router.get('/', authenticateToken, async (req, res) => {
 try {
 // Total de produtos cadastrados
 const totalProductsResult = await pool.query('SELECT COUNT(*) FROM products WHERE active = true');

 // Produtos com estoque baixo
 const lowStockResult = await pool.query(`
 SELECT COUNT(*) FROM products
 WHERE current_quantity <= min_quantity AND current_quantity > 0 AND active = true
 `);

 // Produtos zerados
 const zeroStockResult = await pool.query(`
 SELECT COUNT(*) FROM products
 WHERE current_quantity = 0 AND active = true
 `);

 // Valor total estimado do estoque
 const totalValueResult = await pool.query(`
 SELECT SUM(current_quantity * average_cost) as total_value FROM products WHERE active = true
 `);

 // Pedidos de compra pendentes
 const pendingOrdersResult = await pool.query(`
 SELECT COUNT(*) FROM purchase_orders WHERE status = 'pendente'
 `);

 // Últimas movimentações
 const recentMovementsResult = await pool.query(`
 SELECT sm.*, p.name as product_name, u.name as user_name
 FROM stock_movements sm
 JOIN products p ON sm.product_id = p.id
 JOIN users u ON sm.user_id = u.id
 ORDER BY sm.created_at DESC
 LIMIT 10
 `);

 // Produtos próximos do vencimento (próximos 30 dias)
 const expiringProductsResult = await pool.query(`
 SELECT p.name, sm.batch_number, sm.expiration_date, sm.quantity
 FROM stock_movements sm
 JOIN products p ON sm.product_id = p.id
 WHERE sm.expiration_date IS NOT NULL
 AND sm.expiration_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
 ORDER BY sm.expiration_date ASC
 `);

 res.json({
 total_products: parseInt(totalProductsResult.rows[0].count),
 low_stock: parseInt(lowStockResult.rows[0].count),
 zero_stock: parseInt(zeroStockResult.rows[0].count),
 total_value: parseFloat(totalValueResult.rows[0].total_value) || 0,
 pending_orders: parseInt(pendingOrdersResult.rows[0].count),
 recent_movements: recentMovementsResult.rows,
 expiring_products: expiringProductsResult.rows
 });
 } catch (error) {
 console.error('Erro ao buscar dados do dashboard:', error);
 res.status(500).json({ error: 'Erro interno do servidor' });
 }
});

module.exports = router;