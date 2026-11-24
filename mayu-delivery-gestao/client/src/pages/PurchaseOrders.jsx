import { useState, useEffect } from 'react';
import axios from 'axios';

export default function PurchaseOrders() {
 const [products, setProducts] = useState([]);
 const [categories, setCategories] = useState([]);
 const [suppliers, setSuppliers] = useState([]);
 const [orders, setOrders] = useState([]);
 const [selectedSupplier, setSelectedSupplier] = useState('');
 const [selectedCategory, setSelectedCategory] = useState('');
 const [orderItems, setOrderItems] = useState([]);
 const [showOrderForm, setShowOrderForm] = useState(false);
 const [buyerPhone, setBuyerPhone] = useState('');
 const [currentProductIndex, setCurrentProductIndex] = useState(0);
 const [tempQuantity, setTempQuantity] = useState('');
 const [tempUnit, setTempUnit] = useState('unidade');
 const [error, setError] = useState(null);
 const [loading, setLoading] = useState(true);

 // Filtrar produtos pela categoria selecionada
 const filteredProducts = selectedCategory
 ? products.filter(p => p.category_id == selectedCategory || (p.category && p.category.toLowerCase() === selectedCategory.toLowerCase()))
 : products;

 // Produto atual baseado no filtro
 const displayProduct = filteredProducts.length > 0 ? filteredProducts[currentProductIndex] : null;
 const displayItem = displayProduct ? orderItems.find(item => item.product_id === displayProduct.id) : null;

 useEffect(() => {
 fetchData();
 }, []);

 const fetchData = async () => {
 try {
 setError(null);
 setLoading(true);
 const token = localStorage.getItem('token');
 if (!token) {
 setError('Token não encontrado. Faça login novamente.');
 return;
 }

 console.log('Iniciando busca de dados...');
 const [productsRes, categoriesRes, suppliersRes, ordersRes] = await Promise.all([
 axios.get('/api/products', { headers: { Authorization: `Bearer ${token}` } }),
 axios.get('/api/categories', { headers: { Authorization: `Bearer ${token}` } }),
 axios.get('/api/suppliers', { headers: { Authorization: `Bearer ${token}` } }),
 axios.get('/api/purchase-orders', { headers: { Authorization: `Bearer ${token}` } })
 ]);

 console.log('Dados recebidos:', {
 products: productsRes.data?.length,
 categories: categoriesRes.data?.length,
 suppliers: suppliersRes.data?.length,
 orders: ordersRes.data?.length
 });

 setProducts(productsRes.data || []);
 setCategories(categoriesRes.data || []);
 setSuppliers(suppliersRes.data || []);
 setOrders(ordersRes.data || []);
 } catch (error) {
 console.error('Erro ao buscar dados:', error);
 setError(`Erro ao carregar dados: ${error.message}. Verifique sua conexão.`);
 } finally {
 setLoading(false);
 }
 };

 const addToOrder = () => {
 if (!displayProduct) return;

 const qty = parseFloat(tempQuantity);
 if (!qty || qty <= 0) {
 alert('Informe uma quantidade válida');
 return;
 }

 const existingItem = orderItems.find(item => item.product_id === displayProduct.id);
 if (existingItem) {
 setOrderItems(prev => prev.map(item =>
 item.product_id === displayProduct.id
 ? { ...item, quantity: qty, unit_type: tempUnit }
 : item
 ));
 } else {
 setOrderItems(prev => [...prev, {
 product_id: displayProduct.id,
 product_name: displayProduct.name,
 quantity: qty,
 unit_type: tempUnit,
 current_stock: displayProduct.current_quantity || 0,
 unit_price: parseFloat(displayProduct.last_purchase_price) || 0
 }]);
 }

 // Limpar campos e pular para o próximo produto automaticamente
 setTempQuantity('');
 setTempUnit('unidade');
 setCurrentProductIndex(prev => Math.min(filteredProducts.length - 1, prev + 1));
 };

 const removeFromOrder = (productId) => {
 setOrderItems(prev => prev.filter(item => item.product_id !== productId));
 };

 const updateItemQuantity = (productId, newQuantity) => {
 const qty = parseFloat(newQuantity);
 if (qty > 0) {
 setOrderItems(prev => prev.map(item =>
 item.product_id === productId
 ? { ...item, quantity: qty }
 : item
 ));
 }
 };

 const calculateTotal = () => {
 return orderItems.reduce((total, item) => total + (item.quantity * item.unit_price), 0);
 };

 const sendToWhatsApp = () => {
 if (orderItems.length === 0) {
 alert('Adicione produtos ao pedido antes de enviar');
 return;
 }

 const supplier = selectedSupplier ? suppliers.find(s => s.id === parseInt(selectedSupplier)) : null;
 const date = new Date().toLocaleDateString('pt-BR');

 let message = `*PEDIDO DE COMPRA - MAYU DELIVERY*\n\n`;
 message += `Data: ${date}\n`;
 if (supplier) {
 message += `Fornecedor: ${supplier.company_name}\n\n`;
 }
 message += `*ITENS DO PEDIDO:*\n\n`;

 orderItems.forEach((item, index) => {
 message += `${index + 1}. ${item.product_name}\n`;
 message += ` Quantidade: ${item.quantity} ${item.unit_type}\n`;
 message += ` Estoque Atual: ${item.current_stock}\n`;
 message += ` Preço Unit.: R$ ${item.unit_price.toFixed(2)}\n`;
 message += ` Total: R$ ${(item.quantity * item.unit_price).toFixed(2)}\n\n`;
 });

 message += `\n*TOTAL ESTIMADO: R$ ${calculateTotal().toFixed(2)}*`;

 const phone = buyerPhone || supplier?.whatsapp;
 if (!phone) {
 alert('Informe o número do WhatsApp');
 return;
 }

 // Usar App Launcher do Capacitor se disponível, senão fallback para window.open
 const cleanPhone = phone.replace(/\D/g, '');
 const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

 try {
 if (window.Capacitor) {
 window.open(whatsappUrl, '_system');
 } else {
 window.open(whatsappUrl, '_blank');
 }
 } catch (e) {
 window.location.href = whatsappUrl;
 }
 };

 const saveOrder = async () => {
 if (orderItems.length === 0) {
 alert('Adicione produtos ao pedido');
 return;
 }

 try {
 const token = localStorage.getItem('token');
 await axios.post('/api/purchase-orders', {
 supplier_id: selectedSupplier || null,
 items: orderItems,
 notes: 'Pedido gerado pelo sistema Mayu Delivery'
 }, {
 headers: { Authorization: `Bearer ${token}` }
 });

 alert('Pedido salvo com sucesso!');
 setOrderItems([]);
 setSelectedSupplier('');
 setShowOrderForm(false);
 setCurrentProductIndex(0);
 setTempQuantity('');
 setTempUnit('unidade');
 fetchData();
 } catch (error) {
 console.error('Erro ao salvar pedido:', error);
 alert('Erro ao salvar pedido');
 }
 };

 // Atualizar valores temporários quando mudar de produto ou categoria
 useEffect(() => {
 if (displayItem) {
 setTempQuantity(displayItem.quantity.toString());
 setTempUnit(displayItem.unit_type);
 } else {
 setTempQuantity('');
 setTempUnit('unidade');
 }
 }, [currentProductIndex, displayItem, selectedCategory]);

 if (loading) {
 return <div className="card" style={{ textAlign: 'center', padding: '3rem' }}><p>Carregando dados...</p></div>;
 }

 return (
 <div>
 <h1>Pedidos de Compra</h1>

 {error && (
 <div className="card" style={{ background: '#fee2e2', color: '#991b1b', padding: '1rem', marginBottom: '1rem' }}>
 <strong>Erro:</strong> {error}
 </div>
 )}

 {!showOrderForm ? (
 <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
 <h2 className="card-title">Criar Novo Pedido</h2>
 <p style={{ color: '#64748b', marginBottom: '2rem' }}>
 Adicione produtos um por vez ao seu pedido
 </p>
 <button className="btn btn-primary" onClick={() => setShowOrderForm(true)}>
 + Novo Pedido
 </button>
 </div>
 ) : (
 <div className="grid grid-2">
 {/* Produto Atual */}
 <div className="card">
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
 <h2 className="card-title">Novo Pedido</h2>
 <button className="btn btn-secondary btn-sm" onClick={() => {
 setShowOrderForm(false);
 setOrderItems([]);
 setCurrentProductIndex(0);
 setSelectedCategory('');
 setTempQuantity('');
 setTempUnit('unidade');
 }}>
 Cancelar
 </button>
 </div>

 {/* Seletor de Categoria */}
 <div className="form-group" style={{ marginBottom: '1.5rem' }}>
 <label className="form-label">Filtrar por Categoria</label>
 <select
 className="form-input"
 value={selectedCategory}
 onChange={(e) => {
 setSelectedCategory(e.target.value);
 setCurrentProductIndex(0);
 }}
 >
 <option value="">Todas as categorias</option>
 {categories.map((cat) => (
 <option key={cat.id || cat.name} value={cat.id || cat.name}>
 {cat.name}
 </option>
 ))}
 </select>
 </div>

 {displayProduct ? (
 <div>
 <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '12px', marginBottom: '1.5rem' }}>
 <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem', color: '#0f172a' }}>{displayProduct.name}</h3>
 <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
 Estoque atual: {displayProduct.current_quantity || 0} {displayProduct.unit || 'unidade'}
 </p>
 <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
 Preço último: R$ {parseFloat(displayProduct.last_purchase_price || 0).toFixed(2)}
 </p>
 </div>

 <div className="form-group">
 <label className="form-label">Quantidade</label>
 <input
 type="number"
 step="0.001"
 min="0"
 placeholder="0,00"
 value={tempQuantity}
 onChange={(e) => setTempQuantity(e.target.value)}
 className="form-input"
 />
 </div>

 <div className="form-group">
 <label className="form-label">Unidade</label>
 <select
 value={tempUnit}
 onChange={(e) => setTempUnit(e.target.value)}
 className="form-input"
 >
 <option value="kg">kg</option>
 <option value="unidade">unidade</option>
 <option value="caixa">caixa</option>
 <option value="fardo">fardo</option>
 </select>
 </div>

 <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
 <button
 className="btn btn-secondary"
 style={{ flex: 1 }}
 onClick={() => {
 setTempQuantity('');
 setTempUnit('unidade');
 setCurrentProductIndex(prev => Math.min(filteredProducts.length - 1, prev + 1));
 }}
 >
 Pular este produto
 </button>
 <button
 className="btn btn-primary"
 style={{ flex: 1 }}
 onClick={addToOrder}
 >
 {displayItem ? 'Atualizar Item' : 'Adicionar ao Pedido'}
 </button>
 </div>

 <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
 <button
 className="btn btn-secondary"
 onClick={() => setCurrentProductIndex(prev => Math.max(0, prev - 1))}
 disabled={currentProductIndex === 0}
 style={{ flex: 1 }}
 >
 ← Anterior
 </button>
 <button
 className="btn btn-primary"
 onClick={() => setCurrentProductIndex(prev => Math.min(filteredProducts.length - 1, prev + 1))}
 disabled={currentProductIndex === filteredProducts.length - 1}
 style={{ flex: 1 }}
 >
 Próximo →
 </button>
 </div>
 </div>
 ) : (
 <p className="empty-state">Nenhum produto encontrado nesta categoria</p>
 )}
 </div>

 {/* Resumo do Pedido */}
 <div className="card">
 <h2 className="card-title">Itens do Pedido ({orderItems.length})</h2>

 <div className="form-group">
 <label className="form-label">Fornecedor (Opcional)</label>
 <select
 className="form-input"
 value={selectedSupplier}
 onChange={(e) => setSelectedSupplier(e.target.value)}
 >
 <option value="">Sem fornecedor específico</option>
 {suppliers.map((supplier) => (
 <option key={supplier.id} value={supplier.id}>
 {supplier.company_name}
 </option>
 ))}
 </select>
 </div>

 <div className="form-group">
 <label className="form-label">WhatsApp para envio</label>
 <input
 type="tel"
 className="form-input"
 value={buyerPhone}
 onChange={(e) => setBuyerPhone(e.target.value)}
 placeholder="(11) 99999-9999"
 />
 </div>

 {orderItems.length > 0 ? (
 <>
 <div style={{ maxHeight: '400px', overflow: 'auto', marginBottom: '1rem' }}>
 {orderItems.map((item) => (
 <div key={item.product_id} style={{
 display: 'flex',
 alignItems: 'center',
 justifyContent: 'space-between',
 padding: '0.75rem',
 borderBottom: '1px solid #e2e8f0',
 background: '#f8fafc',
 borderRadius: '8px',
 marginBottom: '0.5rem'
 }}>
 <div style={{ flex: 1 }}>
 <p style={{ fontWeight: '600', fontSize: '0.875rem', color: '#0f172a' }}>{item.product_name}</p>
 <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem', alignItems: 'center' }}>
 <input
 type="number"
 step="0.001"
 value={item.quantity}
 onChange={(e) => updateItemQuantity(item.product_id, e.target.value)}
 style={{ width: '70px', padding: '0.25rem' }}
 className="form-input"
 />
 <span className="badge badge-info">{item.unit_type}</span>
 <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
 R$ {(item.quantity * item.unit_price).toFixed(2)}
 </span>
 </div>
 </div>
 <button
 onClick={() => removeFromOrder(item.product_id)}
 className="btn btn-sm"
 style={{ background: '#fee2e2', color: '#991b1b', marginLeft: '0.5rem' }}
 >
 Remover
 </button>
 </div>
 ))}
 </div>

 <div style={{ borderTop: '2px solid var(--accent-primary)', paddingTop: '1rem', marginTop: '1rem' }}>
 <p style={{ fontSize: '1.25rem', fontWeight: 'bold', textAlign: 'right', color: '#0f172a' }}>
 Total: R$ {calculateTotal().toFixed(2)}
 </p>
 </div>

 <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexDirection: 'column' }}>
 <button className="btn btn-primary" onClick={saveOrder}>
 Salvar Pedido
 </button>
 <button className="btn btn-whatsapp" onClick={sendToWhatsApp}>
 📱 Enviar via WhatsApp
 </button>
 </div>
 </>
 ) : (
 <p className="empty-state">
 Nenhum produto adicionado ainda. Selecione a quantidade e clique em "Adicionar ao Pedido".
 </p>
 )}
 </div>
 </div>
 )}
 </div>
 );
}