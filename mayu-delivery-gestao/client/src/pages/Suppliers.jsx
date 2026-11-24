import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Suppliers() {
 const [suppliers, setSuppliers] = useState([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState(null);
 const [showModal, setShowModal] = useState(false);
 const [newSupplier, setNewSupplier] = useState({
 company_name: '',
 contact_name: '',
 phone: '',
 whatsapp: '',
 email: '',
 address: '',
 city: '',
 state: '',
 cnpj: '',
 observations: ''
 });

 useEffect(() => {
 fetchSuppliers();
 }, []);

 const fetchSuppliers = async () => {
 try {
 setLoading(true);
 setError(null);
 const token = localStorage.getItem('token');
 if (!token) {
 setError('Token não encontrado. Faça login novamente.');
 return;
 }
 console.log('Buscando fornecedores...');
 const response = await axios.get('/api/suppliers', {
 headers: { Authorization: `Bearer ${token}` }
 });
 console.log('Fornecedores recebidos:', response.data?.length);
 setSuppliers(response.data || []);
 } catch (error) {
 console.error('Erro ao buscar fornecedores:', error);
 setError(`Erro ao carregar fornecedores: ${error.message}`);
 } finally {
 setLoading(false);
 }
 };

 const handleSubmit = async (e) => {
 e.preventDefault();
 try {
 const token = localStorage.getItem('token');
 await axios.post('/api/suppliers', newSupplier, {
 headers: { Authorization: `Bearer ${token}` }
 });
 setShowModal(false);
 setNewSupplier({
 company_name: '',
 contact_name: '',
 phone: '',
 whatsapp: '',
 email: '',
 address: '',
 city: '',
 state: '',
 cnpj: '',
 observations: ''
 });
 fetchSuppliers();
 } catch (error) {
 console.error('Erro ao criar fornecedor:', error);
 alert('Erro ao criar fornecedor');
 }
 };

 const handleDelete = async (id, name) => {
 if (!confirm(`Tem certeza que deseja excluir o fornecedor "${name}"?`)) return;

 try {
 const token = localStorage.getItem('token');
 await axios.delete(`/api/suppliers/${id}`, {
 headers: { Authorization: `Bearer ${token}` }
 });
 fetchSuppliers();
 } catch (error) {
 console.error('Erro ao excluir fornecedor:', error);
 alert('Erro ao excluir fornecedor');
 }
 };

 if (loading) {
 return <div className="card" style={{ textAlign: 'center', padding: '3rem' }}><p>Carregando fornecedores...</p></div>;
 }

 if (error) {
 return (
 <div className="card" style={{ background: '#fee2e2', color: '#991b1b', padding: '1rem', margin: '1rem' }}>
 <strong>Erro:</strong> {error}
 <button onClick={fetchSuppliers} style={{ marginLeft: '1rem', padding: '0.5rem 1rem' }}>Tentar Novamente</button>
 </div>
 );
 }

 return (
 <div>
 <div className="header-actions">
 <h1>Fornecedores</h1>
 <button className="btn btn-primary" onClick={() => setShowModal(true)}>
 + Novo Fornecedor
 </button>
 </div>

 <div className="card">
 <div className="table-container">
 <table>
 <thead>
 <tr>
 <th>Empresa</th>
 <th>Contato</th>
 <th>Telefone</th>
 <th>WhatsApp</th>
 <th>Email</th>
 <th>Ações</th>
 </tr>
 </thead>
 <tbody>
 {suppliers.length === 0 ? (
 <tr>
 <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
 Nenhum fornecedor encontrado
 </td>
 </tr>
 ) : (
 suppliers.map((supplier) => (
 <tr key={supplier.id}>
 <td>{supplier.company_name}</td>
 <td>{supplier.contact_name || '-'}</td>
 <td>{supplier.phone || '-'}</td>
 <td>{supplier.whatsapp || '-'}</td>
 <td>{supplier.email || '-'}</td>
 <td>
 <button
 onClick={() => handleDelete(supplier.id, supplier.company_name)}
 className="btn btn-sm"
 style={{ background: '#fee2e2', color: '#991b1b' }}
 >
 Excluir
 </button>
 </td>
 </tr>
 ))
 )}
 </tbody>
 </table>
 </div>
 </div>

 {/* Modal de Novo Fornecedor */}
 {showModal && (
 <div className="modal-overlay">
 <div className="modal-content">
 <div className="modal-header">
 <h2 className="modal-title">Novo Fornecedor</h2>
 </div>
 <form onSubmit={handleSubmit}>
 <div className="form-group">
 <label className="form-label">Nome da Empresa</label>
 <input
 type="text"
 className="form-input"
 value={newSupplier.company_name}
 onChange={(e) => setNewSupplier({...newSupplier, company_name: e.target.value})}
 required
 />
 </div>

 <div className="form-group">
 <label className="form-label">Nome do Contato</label>
 <input
 type="text"
 className="form-input"
 value={newSupplier.contact_name}
 onChange={(e) => setNewSupplier({...newSupplier, contact_name: e.target.value})}
 />
 </div>

 <div className="grid grid-2">
 <div className="form-group">
 <label className="form-label">Telefone</label>
 <input
 type="tel"
 className="form-input"
 value={newSupplier.phone}
 onChange={(e) => setNewSupplier({...newSupplier, phone: e.target.value})}
 />
 </div>

 <div className="form-group">
 <label className="form-label">WhatsApp</label>
 <input
 type="tel"
 className="form-input"
 value={newSupplier.whatsapp}
 onChange={(e) => setNewSupplier({...newSupplier, whatsapp: e.target.value})}
 />
 </div>
 </div>

 <div className="form-group">
 <label className="form-label">Email</label>
 <input
 type="email"
 className="form-input"
 value={newSupplier.email}
 onChange={(e) => setNewSupplier({...newSupplier, email: e.target.value})}
 />
 </div>

 <div className="form-group">
 <label className="form-label">Endereço</label>
 <input
 type="text"
 className="form-input"
 value={newSupplier.address}
 onChange={(e) => setNewSupplier({...newSupplier, address: e.target.value})}
 />
 </div>

 <div className="grid grid-2">
 <div className="form-group">
 <label className="form-label">Cidade</label>
 <input
 type="text"
 className="form-input"
 value={newSupplier.city}
 onChange={(e) => setNewSupplier({...newSupplier, city: e.target.value})}
 />
 </div>

 <div className="form-group">
 <label className="form-label">Estado</label>
 <input
 type="text"
 className="form-input"
 value={newSupplier.state}
 onChange={(e) => setNewSupplier({...newSupplier, state: e.target.value})}
 />
 </div>
 </div>

 <div className="form-group">
 <label className="form-label">CNPJ</label>
 <input
 type="text"
 className="form-input"
 value={newSupplier.cnpj}
 onChange={(e) => setNewSupplier({...newSupplier, cnpj: e.target.value})}
 />
 </div>

 <div className="form-group">
 <label className="form-label">Observações</label>
 <textarea
 className="form-input"
 rows="3"
 value={newSupplier.observations}
 onChange={(e) => setNewSupplier({...newSupplier, observations: e.target.value})}
 />
 </div>

 <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
 <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
 Cancelar
 </button>
 <button type="submit" className="btn btn-primary">
 Salvar
 </button>
 </div>
 </form>
 </div>
 </div>
 )}
 </div>
 );
}