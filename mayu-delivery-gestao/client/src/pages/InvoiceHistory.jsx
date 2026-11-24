import { useState, useEffect } from 'react';
import axios from 'axios';

export default function InvoiceHistory() {
 const [history, setHistory] = useState([]);
 const [weeklyData, setWeeklyData] = useState(null);
 const [loading, setLoading] = useState(true);
 const [selectedWeek, setSelectedWeek] = useState('');

 useEffect(() => {
 fetchData();
 }, []);

 const fetchData = async () => {
 try {
 const token = localStorage.getItem('token');
 const response = await axios.get('/api/ocr/weekly-expenses', {
 headers: { Authorization: `Bearer ${token}` }
 });
 setWeeklyData(response.data);
 setHistory(response.data.history || []);
 } catch (error) {
 console.error('Erro ao buscar dados:', error);
 } finally {
 setLoading(false);
 }
 };

 const loadWeek = async (week, year) => {
 setLoading(true);
 try {
 const token = localStorage.getItem('token');
 const response = await axios.get(`/api/ocr/weekly-expenses?week=${week}&year=${year}`, {
 headers: { Authorization: `Bearer ${token}` }
 });
 setWeeklyData(response.data);
 setHistory(response.data.history || []);
 } catch (error) {
 console.error('Erro ao buscar dados da semana:', error);
 } finally {
 setLoading(false);
 }
 };

 if (loading) {
 return <div className="loading">Carregando histórico...</div>;
 }

 return (
 <div>
 <h1>Histórico de Notas Fiscais</h1>

 {/* Resumo Semanal */}
 {weeklyData && (
 <div className="grid grid-3">
 <div className="card">
 <h2 className="card-title">Semana Atual</h2>
 <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0f766e' }}>
 Semana {weeklyData.weekNumber}
 </p>
 <p style={{ color: '#64748b' }}>{weeklyData.year}</p>
 </div>

 <div className="card">
 <h2 className="card-title">Total Gasto</h2>
 <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0f766e' }}>
 R$ {weeklyData.totalSpent?.toFixed(2) || '0.00'}
 </p>
 <p style={{ color: '#64748b' }}>Esta semana</p>
 </div>

 <div className="card">
 <h2 className="card-title">Itens Processados</h2>
 <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0f766e' }}>
 {weeklyData.dailyExpenses?.length || 0}
 </p>
 <p style={{ color: '#64748b' }}>Dias com compras</p>
 </div>
 </div>
 )}

 {/* Histórico Detalhado */}
 <div className="card">
 <h2 className="card-title">Histórico de Compras por Dia</h2>

 {weeklyData?.dailyExpenses?.length > 0 ? (
 <div style={{ display: 'grid', gap: '1.5rem' }}>
 {weeklyData.dailyExpenses.map((day, index) => (
 <div key={index} style={{
 border: '1px solid #e2e8f0',
 borderRadius: '0.75rem',
 padding: '1rem',
 background: '#f8fafc'
 }}>
 <div style={{
 display: 'flex',
 justifyContent: 'space-between',
 alignItems: 'center',
 marginBottom: '1rem',
 paddingBottom: '0.5rem',
 borderBottom: '2px solid #0f766e'
 }}>
 <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#0f172a' }}>
 {day.date}
 </h3>
 <span style={{
 fontSize: '1.125rem',
 fontWeight: 'bold',
 color: '#0f766e'
 }}>
 R$ {day.dailyTotal.toFixed(2)}
 </span>
 </div>

 <div className="table-container">
 <table>
 <thead>
 <tr>
 <th>Produto</th>
 <th>Fornecedor</th>
 <th>Qtd</th>
 <th>Preço Unit.</th>
 <th>Total</th>
 </tr>
 </thead>
 <tbody>
 {day.items.map((item, idx) => (
 <tr key={idx}>
 <td>{item.product_name}</td>
 <td>{item.supplier_name}</td>
 <td>{item.quantity}</td>
 <td>R$ {item.unit_price.toFixed(2)}</td>
 <td>R$ {item.total_price.toFixed(2)}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 ))}
 </div>
 ) : (
 <p className="empty-state">Nenhuma nota fiscal processada esta semana</p>
 )}
 </div>

 {/* Tabela Completa de Histórico */}
 <div className="card" style={{ marginTop: '1.5rem' }}>
 <h2 className="card-title">Todas as Notas Fiscais Processadas</h2>
 <div className="table-container">
 <table>
 <thead>
 <tr>
 <th>Data</th>
 <th>Produto</th>
 <th>Fornecedor</th>
 <th>Qtd</th>
 <th>Preço Unit.</th>
 <th>Total</th>
 <th>Semana</th>
 </tr>
 </thead>
 <tbody>
 {history.map((item) => (
 <tr key={item.id}>
 <td>{new Date(item.created_at).toLocaleDateString('pt-BR')}</td>
 <td>{item.product_name}</td>
 <td>{item.supplier_name}</td>
 <td>{item.quantity}</td>
 <td>R$ {parseFloat(item.unit_price).toFixed(2)}</td>
 <td>R$ {parseFloat(item.total_price).toFixed(2)}</td>
 <td>
 <span className="badge badge-info">
 Sem {item.week_number}/{item.year}
 </span>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 );
}