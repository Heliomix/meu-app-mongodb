import { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';

export default function Products() {
 const [products, setProducts] = useState([]);
 const [categories, setCategories] = useState([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState(null);
 const [showModal, setShowModal] = useState(false);
 const [searchTerm, setSearchTerm] = useState('');
 const [filteredProducts, setFilteredProducts] = useState([]);
 const [newProduct, setNewProduct] = useState({
  name: '',
  category_id: '',
  unit: 'unid',
  min_quantity: 0,
  ideal_quantity: 0,
  internal_code: '',
  observations: ''
 });

 useEffect(() => {
  fetchData();
 }, []);

 useEffect(() => {
  if (searchTerm) {
   const filtered = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.internal_code?.toLowerCase().includes(searchTerm.toLowerCase())
   );
   setFilteredProducts(filtered);
  } else {
   setFilteredProducts(products);
  }
 }, [searchTerm, products]);

 const fetchData = async () => {
  try {
   setLoading(true);
   setError(null);
   const token = localStorage.getItem('token');
   if (!token) {
    setError('Token não encontrado. Faça login novamente.');
    return;
   }
   console.log('Buscando produtos e categorias...');
   const [productsRes, categoriesRes] = await Promise.all([
    axios.get('/api/products', {
     headers: { Authorization: `Bearer ${token}` }
    }),
    axios.get('/api/categories', {
     headers: { Authorization: `Bearer ${token}` }
    })
   ]);
   console.log('Dados recebidos:', { products: productsRes.data?.length, categories: categoriesRes.data?.length });
   setProducts(productsRes.data || []);
   setFilteredProducts(productsRes.data || []);
   setCategories(categoriesRes.data || []);
  } catch (error) {
   console.error('Erro ao buscar dados:', error);
   setError(`Erro ao carregar dados: ${error.message}`);
  } finally {
   setLoading(false);
  }
 };

 const handleSubmit = async (e) => {
  e.preventDefault();
  try {
   const token = localStorage.getItem('token');
   await axios.post('/api/products', newProduct, {
    headers: { Authorization: `Bearer ${token}` }
   });
   setShowModal(false);
   setNewProduct({
    name: '',
    category_id: '',
    unit: 'unid',
    min_quantity: 0,
    ideal_quantity: 0,
    internal_code: '',
    observations: ''
   });
   fetchData();
  } catch (error) {
   console.error('Erro ao criar produto:', error);
   alert('Erro ao criar produto');
  }
 };

 const handleDelete = async (id, name) => {
  if (!confirm(`Tem certeza que deseja excluir o produto "${name}"?`)) return;

  try {
   const token = localStorage.getItem('token');
   await axios.delete(`/api/products/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
   });
   fetchData();
  } catch (error) {
   console.error('Erro ao excluir produto:', error);
   alert('Erro ao excluir produto');
  }
 };

 const exportToCSV = () => {
  const headers = ['Nome', 'Categoria', 'Unidade', 'Qtd Atual', 'Est. Mínimo', 'Custo Médio'];
  const csvContent = [
   headers.join(';'),
   ...filteredProducts.map(p =>
    `${p.name};${p.category_name || '-'};${p.unit};${p.current_quantity};${p.min_quantity};${parseFloat(p.average_cost || 0).toFixed(2)}`
   )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `produtos_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
 };

 if (loading) {
  return <div className="card" style={{ textAlign: 'center', padding: '3rem' }}><p>Carregando produtos...</p></div>;
 }

 if (error) {
  return (
   <div className="card" style={{ background: '#fee2e2', color: '#991b1b', padding: '1rem', margin: '1rem' }}>
    <strong>Erro:</strong> {error}
    <button onClick={fetchData} style={{ marginLeft: '1rem', padding: '0.5rem 1rem' }}>Tentar Novamente</button>
   </div>
  );
 }

 return (
  <div>
   <div className="header-actions">
    <h1>Produtos</h1>
    <div style={{ display: 'flex', gap: '0.5rem' }}>
     <button
      className="btn btn-secondary"
      onClick={exportToCSV}
      title="Exportar para CSV"
     >
      <ArrowDownTrayIcon style={{ width: '1.25rem', height: '1.25rem' }} />
     </button>
     <button className="btn btn-primary" onClick={() => setShowModal(true)}>
      + Novo Produto
     </button>
    </div>
   </div>

   {/* Campo de Busca */}
   <div className="card" style={{ marginBottom: '1rem' }}>
    <input
     type="text"
     className="form-input"
     placeholder="Buscar por nome, categoria ou código..."
     value={searchTerm}
     onChange={(e) => setSearchTerm(e.target.value)}
    />
   </div>

   <div className="card">
    <div className="table-container">
     <table>
      <thead>
       <tr>
        <th>Nome</th>
        <th>Categoria</th>
        <th>Unidade</th>
        <th>Qtd Atual</th>
        <th>Est. Mínimo</th>
        <th>Custo Médio</th>
        <th>Ações</th>
       </tr>
      </thead>
      <tbody>
       {filteredProducts.length === 0 ? (
        <tr>
         <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
          Nenhum produto encontrado
         </td>
        </tr>
       ) : (
        filteredProducts.map((product) => (
         <tr key={product.id}>
          <td>{product.name}</td>
          <td>{product.category_name || '-'}</td>
          <td>{product.unit}</td>
          <td>{product.current_quantity}</td>
          <td>{product.min_quantity}</td>
          <td>R$ {parseFloat(product.average_cost || 0).toFixed(2)}</td>
          <td>
           <button
            onClick={() => handleDelete(product.id, product.name)}
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

   {/* Modal de Novo Produto */}
   {showModal && (
    <div className="modal-overlay">
     <div className="modal-content">
      <div className="modal-header">
       <h2 className="modal-title">Novo Produto</h2>
      </div>
      <form onSubmit={handleSubmit}>
       <div className="form-group">
        <label className="form-label">Nome</label>
        <input
         type="text"
         className="form-input"
         value={newProduct.name}
         onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
         required
        />
       </div>

       <div className="form-group">
        <label className="form-label">Categoria</label>
        <select
         className="form-input"
         value={newProduct.category_id}
         onChange={(e) => setNewProduct({...newProduct, category_id: e.target.value})}
         required
        >
         <option value="">Selecione...</option>
         {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>{cat.name}</option>
         ))}
        </select>
       </div>

       <div className="form-group">
        <label className="form-label">Unidade</label>
        <select
         className="form-input"
         value={newProduct.unit}
         onChange={(e) => setNewProduct({...newProduct, unit: e.target.value})}
        >
         <option value="unid">Unidade</option>
         <option value="kg">Quilograma</option>
         <option value="g">Grama</option>
         <option value="l">Litro</option>
         <option value="ml">Mililitro</option>
         <option value="cx">Caixa</option>
         <option value="pct">Pacote</option>
        </select>
       </div>

       <div className="grid grid-2">
        <div className="form-group">
         <label className="form-label">Qtd Mínima</label>
         <input
          type="number"
          className="form-input"
          value={newProduct.min_quantity}
          onChange={(e) => setNewProduct({...newProduct, min_quantity: parseFloat(e.target.value)})}
         />
        </div>

        <div className="form-group">
         <label className="form-label">Qtd Ideal</label>
         <input
          type="number"
          className="form-input"
          value={newProduct.ideal_quantity}
          onChange={(e) => setNewProduct({...newProduct, ideal_quantity: parseFloat(e.target.value)})}
         />
        </div>
       </div>

       <div className="form-group">
        <label className="form-label">Código Interno</label>
        <input
         type="text"
         className="form-input"
         value={newProduct.internal_code}
         onChange={(e) => setNewProduct({...newProduct, internal_code: e.target.value})}
        />
       </div>

       <div className="form-group">
        <label className="form-label">Observações</label>
        <textarea
         className="form-input"
         rows="3"
         value={newProduct.observations}
         onChange={(e) => setNewProduct({...newProduct, observations: e.target.value})}
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