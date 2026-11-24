import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Profile() {
 const [user, setUser] = useState(null);
 const [formData, setFormData] = useState({
 name: '',
 email: '',
 password: '',
 confirmPassword: ''
 });
 const [loading, setLoading] = useState(true);
 const [saving, setSaving] = useState(false);

 useEffect(() => {
 const userData = JSON.parse(localStorage.getItem('user'));
 if (userData) {
 setUser(userData);
 setFormData({
 name: userData.name || '',
 email: userData.email || '',
 password: '',
 confirmPassword: ''
 });
 }
 setLoading(false);
 }, []);

 const handleSubmit = async (e) => {
 e.preventDefault();

 if (formData.password && formData.password !== formData.confirmPassword) {
 alert('As senhas não coincidem');
 return;
 }

 setSaving(true);
 try {
 const token = localStorage.getItem('token');
 const response = await axios.put('/api/users/profile', {
 name: formData.name,
 email: formData.email,
 password: formData.password || undefined
 }, {
 headers: { Authorization: `Bearer ${token}` }
 });

 // Atualizar dados no localStorage
 const updatedUser = response.data.user;
 localStorage.setItem('user', JSON.stringify(updatedUser));
 setUser(updatedUser);

 setFormData({
 ...formData,
 password: '',
 confirmPassword: ''
 });

 alert('Perfil atualizado com sucesso!');
 } catch (error) {
 console.error('Erro ao atualizar perfil:', error);
 alert(error.response?.data?.error || 'Erro ao atualizar perfil');
 } finally {
 setSaving(false);
 }
 };

 if (loading) {
 return <div className="loading">Carregando perfil...</div>;
 }

 return (
 <div>
 <h1>Meu Perfil</h1>

 <div className="card" style={{ maxWidth: '600px' }}>
 <h2 className="card-title">Informações do Usuário</h2>

 <form onSubmit={handleSubmit}>
 <div className="form-group">
 <label className="form-label">Nome</label>
 <input
 type="text"
 className="form-input"
 value={formData.name}
 onChange={(e) => setFormData({ ...formData, name: e.target.value })}
 required
 />
 </div>

 <div className="form-group">
 <label className="form-label">Email</label>
 <input
 type="email"
 className="form-input"
 value={formData.email}
 onChange={(e) => setFormData({ ...formData, email: e.target.value })}
 required
 />
 </div>

 <div className="form-group">
 <label className="form-label">Nova Senha (deixe em branco para manter a atual)</label>
 <input
 type="password"
 className="form-input"
 value={formData.password}
 onChange={(e) => setFormData({ ...formData, password: e.target.value })}
 minLength="6"
 placeholder="Mínimo 6 caracteres"
 />
 </div>

 <div className="form-group">
 <label className="form-label">Confirmar Nova Senha</label>
 <input
 type="password"
 className="form-input"
 value={formData.confirmPassword}
 onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
 minLength="6"
 placeholder="Digite a senha novamente"
 />
 </div>

 <div style={{ marginTop: '1.5rem' }}>
 <button
 type="submit"
 className="btn btn-primary"
 disabled={saving}
 style={{ width: '100%' }}
 >
 {saving ? 'Salvando...' : 'Salvar Alterações'}
 </button>
 </div>
 </form>
 </div>

 <div className="card" style={{ maxWidth: '600px', marginTop: '1.5rem' }}>
 <h2 className="card-title">Informações da Conta</h2>
 <div style={{ display: 'grid', gap: '1rem' }}>
 <div>
 <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>Função</p>
 <p style={{ fontWeight: '600' }}>{user?.role === 'admin' ? 'Administrador' : 'Usuário'}</p>
 </div>
 <div>
 <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>Status</p>
 <span className={`badge ${user?.active ? 'badge-success' : 'badge-danger'}`}>
 {user?.active ? 'Ativo' : 'Inativo'}
 </span>
 </div>
 </div>
 </div>
 </div>
 );
}