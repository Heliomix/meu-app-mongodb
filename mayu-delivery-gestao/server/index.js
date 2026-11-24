const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Importar rotas
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const supplierRoutes = require('./routes/suppliers');
const stockRoutes = require('./routes/stock');
const purchaseOrderRoutes = require('./routes/purchaseOrders');
const invoiceRoutes = require('./routes/invoices');
const dashboardRoutes = require('./routes/dashboard');
const userRoutes = require('./routes/users');
const ocrRoutes = require('./routes/ocr');

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/purchase-orders', purchaseOrderRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ocr', ocrRoutes);

// Rota de teste
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Mayu Delivery Gestão API - Servidor ativo!' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Mayu Delivery Gestão API está rodando!' });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor Mayu Delivery Gestão rodando na porta ${PORT}`);
  console.log(`Acesso pela rede: http://192.168.4.10:${PORT}`);
});
module.exports = app;