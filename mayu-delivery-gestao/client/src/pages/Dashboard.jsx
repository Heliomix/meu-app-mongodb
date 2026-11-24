import { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#fbbf24', '#f59e0b', '#ef4444', '#3b82f6'];

export default function Dashboard() {
 const [data, setData] = useState(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState(null);

 useEffect(() => {
 fetchDashboard();
 }, []);

 const fetchDashboard = async () => {
 try {
 setLoading(true);
 setError(null);
 const token = localStorage.getItem('token');
 if (!token) {
 setError('Token não encontrado. Faça login novamente.');
 return;
 }
 console.log('Buscando dados do dashboard...');
 const response = await axios.get('/api/dashboard', {
 headers: { Authorization: `Bearer ${token}` }
 });
 console.log('Dados do dashboard recebidos');
 setData(response.data);
 } catch (error) {
 console.error('Erro ao buscar dashboard:', error);
 setError(`Erro ao carregar dashboard: ${error.message}`);
 } finally {
 setLoading(false);
 }
 };

 if (loading) {
 return <div className="card" style={{ textAlign: 'center', padding: '3rem' }}><p>Carregando dashboard...</p></div>;
 }

 if (error) {
 return (
 <div className="card" style={{ background: '#fee2e2', color: '#991b1b', padding: '1rem', margin: '1rem' }}>
 <strong>Erro:</strong> {error}
 <button onClick={fetchDashboard} style={{ marginLeft: '1rem', padding: '0.5rem 1rem' }}>Tentar Novamente</button>
 </div>
 );
 }

 const lowStockProducts = data?.low_stock_products || [];
 const zeroStockProducts = data?.zero_stock_products || [];

 // Preparar dados para gráfico de categorias
 const categoryData = [];
 const productsByCategory = {};

 if (data?.products) {
 data.products.forEach(product => {
 const category = product.category?.name || 'Sem categoria';
 if (!productsByCategory[category]) {
 productsByCategory[category] = 0;
 }
 productsByCategory[category]++;
 });

 Object.entries(productsByCategory).forEach(([name, value]) => {
 categoryData.push({ name, value });
 });
 }

 // Preparar dados para gráfico de movimentações
 const movementData = [];
 if (data?.recent_movements) {
 const movementsByType = {};
 data.recent_movements.forEach(mov => {
 if (!movementsByType[mov.type]) {
 movementsByType[mov.type] = 0;
 }
 movementsByType[mov.type] += mov.quantity;
 });

 Object.entries(movementsByType).forEach(([name, quantity]) => {
 movementData.push({ name, quantidade: quantity });
 });
 }

 return (
 <div>
 <h1>Dashboard</h1>

 {/* Alertas de Estoque */}
 {(lowStockProducts.length > 0 || zeroStockProducts.length > 0) && (
 <div className="alert-panel">
 <div className="alert-list">
 {zeroStockProducts.map((product, index) => (
 <div key={`zero-${index}`} className="alert-item">
 <div className="alert-dot"></div>
 <div className="alert-copy">
 <strong>{product.name}</strong>
 <small>Estoque zerado - reposição urgente necessária</small>
 </div>
 <span className="alert-qty">0 {product.unit}</span>
 </div>
 ))}
 {lowStockProducts.map((product, index) => (
 <div key={`low-${index}`} className="alert-item low">
 <div className="alert-dot"></div>
 <div className="alert-copy">
 <strong>{product.name}</strong>
 <small>Estoque abaixo do mínimo ({product.min_quantity} {product.unit})</small>
 </div>
 <span className="alert-qty">{product.current_quantity} {product.unit}</span>
 </div>
 ))}
 </div>
 </div>
 )}

 {/* Cards de Indicadores */}
 <div className="grid grid-4">
 <div className="card">
 <p className="stat-label">Total de Produtos</p>
 <p className="stat-value" style={{ color: 'var(--accent-primary)' }}>
 {data?.total_products || 0}
 </p>
 </div>

 <div className="card">
 <p className="stat-label">Estoque Baixo</p>
 <p className="stat-value" style={{ color: 'var(--warning)' }}>
 {data?.low_stock || 0}
 </p>
 </div>

 <div className="card">
 <p className="stat-label">Produtos Zerados</p>
 <p className="stat-value" style={{ color: 'var(--danger)' }}>
 {data?.zero_stock || 0}
 </p>
 </div>

 <div className="card">
 <p className="stat-label">Valor do Estoque</p>
 <p className="stat-value" style={{ color: 'var(--success)' }}>
 R$ {(data?.total_value || 0).toFixed(2)}
 </p>
 </div>
 </div>

 {/* Gráficos */}
 <div className="grid grid-2">
 {categoryData.length > 0 && (
 <div className="card">
 <h2 className="card-title">Produtos por Categoria</h2>
 <ResponsiveContainer width="100%" height={300}>
 <PieChart>
 <Pie
 data={categoryData}
 cx="50%"
 cy="50%"
 labelLine={false}
 label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
 outerRadius={80}
 fill="#8884d8"
 dataKey="value"
 >
 {categoryData.map((entry, index) => (
 <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
 ))}
 </Pie>
 <Tooltip />
 <Legend />
 </PieChart>
 </ResponsiveContainer>
 </div>
 )}

 {movementData.length > 0 && (
 <div className="card">
 <h2 className="card-title">Movimentações por Tipo</h2>
 <ResponsiveContainer width="100%" height={300}>
 <BarChart data={movementData}>
 <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
 <XAxis dataKey="name" stroke="var(--text-secondary)" />
 <YAxis stroke="var(--text-secondary)" />
 <Tooltip
 contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
 labelStyle={{ color: 'var(--text-primary)' }}
 />
 <Bar dataKey="quantidade" fill="var(--accent-primary)" />
 </BarChart>
 </ResponsiveContainer>
 </div>
 )}
 </div>

 {/* Produtos Próximos do Vencimento */}
 {data?.expiring_products && data.expiring_products.length > 0 && (
 <div className="card">
 <h2 className="card-title">Produtos Próximos do Vencimento</h2>
 <div className="table-container">
 <table>
 <thead>
 <tr>
 <th>Produto</th>
 <th>Lote</th>
 <th>Validade</th>
 <th>Quantidade</th>
 </tr>
 </thead>
 <tbody>
 {data.expiring_products.map((item, index) => (
 <tr key={index}>
 <td>{item.name}</td>
 <td>{item.batch_number || '-'}</td>
 <td>{new Date(item.expiration_date).toLocaleDateString('pt-BR')}</td>
 <td>{item.quantity}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 )}

 {/* Últimas Movimentações */}
 {data?.recent_movements && data.recent_movements.length > 0 && (
 <div className="card">
 <h2 className="card-title">Últimas Movimentações</h2>
 <div className="table-container">
 <table>
 <thead>
 <tr>
 <th>Data</th>
 <th>Produto</th>
 <th>Tipo</th>
 <th>Quantidade</th>
 <th>Responsável</th>
 </tr>
 </thead>
 <tbody>
 {data.recent_movements.map((mov, index) => (
 <tr key={index}>
 <td>{new Date(mov.created_at).toLocaleDateString('pt-BR')}</td>
 <td>{mov.product_name}</td>
 <td>
 <span className={`badge ${
 mov.type === 'entrada' ? 'badge-success' :
 mov.type === 'saida' ? 'badge-warning' : 'badge-danger'
 }`}>
 {mov.type}
 </span>
 </td>
 <td>{mov.quantity}</td>
 <td>{mov.user_name}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 )}
 </div>
 );
}