import { useState } from 'react';
import axios from 'axios';

export default function InvoiceUploader({ onProductsExtracted }) {
 const [loading, setLoading] = useState(false);
 const [preview, setPreview] = useState(null);
 const [supplierName, setSupplierName] = useState('');

 const handleFileChange = async (e) => {
 const file = e.target.files[0];
 if (!file) return;

 // Criar preview da imagem
 const reader = new FileReader();
 reader.onloadend = () => setPreview(reader.result);
 reader.readAsDataURL(file);

 setLoading(true);
 try {
 const token = localStorage.getItem('token');

 // 1. Processar a imagem para extrair dados
 const formData = new FormData();
 formData.append('invoice', file);

 const processResponse = await axios.post('/api/ocr/process-invoice', formData, {
 headers: {
 'Authorization': `Bearer ${token}`,
 'Content-Type': 'multipart/form-data'
 }
 });

 if (processResponse.data.success) {
 const extractedData = processResponse.data.extractedData;
 const detectedSupplier = extractedData.supplier?.company_name || supplierName;

 // 2. Atualizar produtos e salvar no histórico de notas fiscais
 await axios.post('/api/ocr/update-products-from-invoice', {
 products: extractedData.products,
 supplierName: detectedSupplier
 }, {
 headers: { Authorization: `Bearer ${token}` }
 });

 onProductsExtracted(extractedData);
 alert('Nota fiscal processada e histórico salvo com sucesso!');
 }
 } catch (error) {
 console.error('Erro ao processar nota fiscal:', error);
 alert('Erro ao processar imagem. Tente uma imagem mais nítida.');
 } finally {
 setLoading(false);
 }
 };

 return (
 <div className="card">
 <h2 className="card-title">Importar Nota Fiscal</h2>
 <div style={{ textAlign: 'center', padding: '2rem', border: '2px dashed #cbd5e1', borderRadius: '12px' }}>
 {preview ? (
 <img src={preview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px', marginBottom: '1rem', borderRadius: '8px' }} />
 ) : (
 <div style={{ fontSize: '3rem', color: '#94a3b8', marginBottom: '1rem' }}></div>
 )}

 <div className="form-group" style={{ marginBottom: '1rem', textAlign: 'left' }}>
 <label className="form-label">Nome do Fornecedor (opcional)</label>
 <input
 type="text"
 className="form-input"
 value={supplierName}
 onChange={(e) => setSupplierName(e.target.value)}
 placeholder="Ex: Distribuidora Silva"
 />
 </div>

 <label className="btn btn-primary" style={{ cursor: 'pointer' }}>
 {loading ? 'Processando...' : 'Fotografar / Selecionar Nota'}
 <input
 type="file"
 accept="image/*"
 capture="environment"
 onChange={handleFileChange}
 disabled={loading}
 style={{ display: 'none' }}
 />
 </label>
 <p style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: '#64748b' }}>
 Tire uma foto clara da nota fiscal para extrair produtos e preços automaticamente
 </p>
 </div>
 </div>
 );
}