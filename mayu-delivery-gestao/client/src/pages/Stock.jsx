import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Stock() {
 const [products, setProducts] = useState([]);
 const [showModal, setShowModal] = useState(false);
 const [selectedProduct, setSelectedProduct] = useState(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState(null);
 const [movement, setMovement] = useState({
  type: 'entrada',
  quantity: 0,
  reason: '',
  batch_number: '',
  expiration_date: ''
 });

 useEffect(() => {
  fetchProducts();
 }, []);

 const fetchProducts = async () => {
  try {
   setLoading(true);
   setError(null);
   const token = localStorage.getItem('token');
   if (!token) {
    setError('Token não encontrado. Faça login novamente.');
    return;
   }
   console.log('Buscando produtos...');
   const response = await axios.get('/api/products', {
    headers: { Authorization: `Bearer ${token}` }
   });
   console.log('Produtos recebidos:', response.data?.length);
   setProducts(response.data || []);
  } catch (error) {
   console.error('Erro ao buscar produtos:', error);
   setError(`Erro ao carregar produtos: ${error.message}`);
  } finally {
   setLoading(false);
  }
 };

 const handleMovement = async (e) => {
  e.preventDefault();
  try {
   const token = localStorage.getItem('token');
   await axios.post('/api/stock/movements', {
    product_id: selectedProduct.id,
    ...movement
   }, {
    headers: { Authorization: `Bearer ${token}` }
   });
   setShowModal(false);
   setMovement({
    type: 'entrada',
    quantity: 0,
    reason: '',
    batch_number: '',
    expiration_date: ''
   });
   fetchProducts();
   alert('Movimentação registrada com sucesso!');
  } catch (error) {
   console.error('Erro ao registrar movimentação:', error);
   alert(error.response?.data?.error || 'Erro ao registrar movimentação');
  }
 };

 if (loading) {
  return <div className="card" style={{ textAlign: 'center', padding: '3rem' }}><p>Carregando estoque...</p></div>;
 }

 if (error) {
  return (
   <div className="card" style={{ background: '#fee2e2', color: '#991b1b', padding: '1rem', margin: '1rem' }}>
    <strong>Erro:</strong> {error}
    <button onClick={fetchProducts} style={{ marginLeft: '1rem', padding: '0.5rem 1rem' }}>Tentar Novamente</button>
   </div>
  );
 }

 return (
  <div>
   <h1>Controle de Estoque</h1>

   <div className="card">
    <div className="table-container">
     <table>
      <thead>
       <tr>
        <th>Produto</th>
        <th>Categoria</th>
        <th>Quantidade</th>
        <th>Mínimo</th>
        <th>Status</th>
        <th>Ações</th>
       </tr>
      </thead>
      <tbody>
       {products.length === 0 ? (
        <tr>
         <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
          Nenhum produto encontrado
         </td>
        </tr>
       ) : (
        products.map((product) => {
         const isLow = product.current_quantity <= product.min_quantity;
         const isZero = product.current_quantity === 0;

         return (
          <tr key={product.id}>
           <td>{product.name}</td>
           <td>{product.category_name || '-'}</td>
           <td>{product.current_quantity} {product.unit}</td>
           <td>{product.min_quantity} {product.unit}</td>
           <td>
            {isZero ? (
             <span className="badge badge-danger">Zerado</span>
            ) : isLow ? (
             <span className="badge badge-warning">Baixo</span>
            ) : (
             <span className="badge badge-success">Normal</span>
            )}
           </td>
           <td>
            <button
             className="btn btn-primary"
             style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}
             onClick={() => {
              setSelectedProduct(product);
              setShowModal(true);
             }}
            >
             Movimentar
            </button>
           </td>
          </tr>
         );
        })
       )}
      </tbody>
     </table>
    </div>
   </div>

   {/* Modal de Movimentação */}
   {showModal && selectedProduct && (
    <div className="modal-overlay">
     <div className="modal-content">
      <div className="modal-header">
       <h2 className="modal-title">Movimentar: {selectedProduct.name}</h2>
      </div>
      <form onSubmit={handleMovement}>
       <div className="form-group">
        <label className="form-label">Tipo de Movimentação</label>
        <select
         className="form-input"
         value={movement.type}
         onChange={(e) => setMovement({...movement, type: e.target.value})}
        >
         <option value="entrada">Entrada</option>
         <option value="saida">Saída</option>
         <option value="perda">Perda</option>
         <option value="descarte">Descarte</option>
         <option value="ajuste">Ajuste de Inventário</option>
        </select>
       </div>

       <div className="form-group">
        <label className="form-label">Quantidade</label>
        <input
         type="number"
         step="0.001"
         className="form-input"
         value={movement.quantity}
         onChange={(e) => setMovement({...movement, quantity: parseFloat(e.target.value)})}
         required
         min="0"
        />
       </div>

       <div className="form-group">
        <label className="form-label">Motivo/Observação</label>
        <textarea
         className="form-input"
         rows="3"
         value={movement.reason}
         onChange={(e) => setMovement({...movement, reason: e.target.value})}
        />
       </div>

       <div className="form-group">
        <label className="form-label">Número do Lote</label>
        <input
         type="text"
         className="form-input"
         value={movement.batch_number}
         onChange={(e) => setMovement({...movement, batch_number: e.target.value})}
        />
       </div>

       <div className="form-group">
        <label className="form-label">Data de Validade</label>
        <input
         type="date"
         className="form-input"
         value={movement.expiration_date}
         onChange={(e) => setMovement({...movement, expiration_date: e.target.value})}
        />
       </div>

       <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
        <button
         type="button"
         className="btn btn-secondary"
         onClick={() => setShowModal(false)}
        >
         Cancelar
        </button>
        <button type="submit" className="btn btn-primary">
         Registrar
        </button>
       </div>
      </form>
     </div>
    </div>
   )}
  </div>
 );
}