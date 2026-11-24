import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Users() {
 const [users, setUsers] = useState([]);
 const [showModal, setShowModal] = useState(false);
 const [newUser, setNewUser] = useState({
 name: '',
 email: '',
 password: '',
 role: 'user'
 });
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 fetchData();
 }, []);

 const fetchData = async () => {
 try {
 const token = localStorage.getItem('token');
 const response = await axios.get('/api/users', {
 headers: { Authorization: `Bearer ${token}` }
 });
 setUsers(response.data);
 } catch (error) {
 console.error('Erro ao buscar usuários:', error);
 } finally {
 setLoading(false);
 }
 };

 const handleSubmit = async (e) => {
 e.preventDefault();
 try {
 const token = localStorage.getItem('token');
 await axios.post('/api/users', newUser, {
 headers: { Authorization: `Bearer ${token}` }
 });
 setShowModal(false);
 setNewUser({ name: '', email: '', password: '', role: 'user' });
 fetchData();
 alert('Usuário criado com sucesso!');
 } catch (error) {
 console.error('Erro ao criar usuário:', error);
 alert(error.response?.data?.error || 'Erro ao criar usuário');
 }
 };

 const handleDelete = async (id, name) => {
 if (!confirm(`Tem certeza que deseja excluir o usuário "${name}"?`)) return;

 try {
 const token = localStorage.getItem('token');
 await axios.delete(`/api/users/${id}`, {
 headers: { Authorization: `Bearer ${token}` }
 });
 fetchData();
 alert('Usuário excluído com sucesso!');
 } catch (error) {
 console.error('Erro ao excluir usuário:', error);
 alert('Erro ao excluir usuário');
 }
 };

 if (loading) {
 return <div className="loading">Carregando usuários...</div>;
 }

 return (
 <div>
 <div className="header-actions">
 <h1>Gerenciamento de Usuários</h1>
 <button className="btn btn-primary" onClick={() => setShowModal(true)}>
 + Novo Usuário
 </button>
 </div>

 <div className="card">
 <div className="table-container">
 <table>
 <thead>
 <tr>
 <th>Nome</th>
 <th>Email</th>
 <th>Função</th>
 <th>Status</th>
 <th>Ações</th>
 </tr>
 </thead>
 <tbody>
 {users.map((user) => (
 <tr key={user.id}>
 <td>{user.name}</td>
 <td>{user.email}</td>
 <td>
 <span className={`badge ${user.role === 'admin' ? 'badge-info' : 'badge-secondary'}`}>
 {user.role === 'admin' ? 'Administrador' : 'Usuário'}
 </span>
 </td>
 <td>
 <span className={`badge ${user.active ? 'badge-success' : 'badge-danger'}`}>
 {user.active ? 'Ativo' : 'Inativo'}
 </span>
 </td>
 <td>
 <button
 onClick={() => handleDelete(user.id, user.name)}
 className="btn btn-sm"
 style={{ background: '#fee2e2', color: '#991b1b' }}
 >
 Excluir
 </button>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>

 {/* Modal de Novo Usuário */}
 {showModal && (
 <div className="modal-overlay" onClick={() => setShowModal(false)}>
 <div className="modal-content" onClick={(e) => e.stopPropagation()}>
 <div className="modal-header">
 <h2 className="modal-title">Novo Usuário</h2>
 </div>
 <div className="modal-body">
 <form onSubmit={handleSubmit}>
 <div className="form-group">
 <label className="form-label">Nome</label>
 <input
 type="text"
 className="form-input"
 value={newUser.name}
 onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
 required
 />
 </div>

 <div className="form-group">
 <label className="form-label">Email</label>
 <input
 type="email"
 className="form-input"
 value={newUser.email}
 onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
 required
 />
 </div>

 <div className="form-group">
 <label className="form-label">Senha</label>
 <input
 type="password"
 className="form-input"
 value={newUser.password}
 onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
 required
 minLength="6"
 />
 </div>

 <div className="form-group">
 <label className="form-label">Função</label>
 <select
 className="form-input"
 value={newUser.role}
 onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
 >
 <option value="user">Usuário</option>
 <option value="admin">Administrador</option>
 </select>
 </div>

 <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
 <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
 Cancelar
 </button>
 <button type="submit" className="btn btn-primary">
 Criar Usuário
 </button>
 </div>
 </form>
 </div>
 </div>
 </div>
 )}
 </div>
 );
}