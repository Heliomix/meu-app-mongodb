import { useState, useEffect } from 'react';
import axios from 'axios';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { BiometricAuth } from '@aparajita/capacitor-biometric-auth';
import { SecureStorage } from '@aparajita/capacitor-secure-storage';

const CREDENTIALS_KEY = 'saved_credentials';

export default function Login({ onLogin }) {
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [showPassword, setShowPassword] = useState(false);
 const [error, setError] = useState('');
 const [loading, setLoading] = useState(false);
 const [biometricAvailable, setBiometricAvailable] = useState(false);
 const [saveCredentials, setSaveCredentials] = useState(false);

 useEffect(() => {
   checkBiometric();
   loadSavedCredentials();
 }, []);

 const checkBiometric = async () => {
   try {
     const result = await BiometricAuth.isAvailable();
     setBiometricAvailable(result.available);
   } catch (err) {
     console.error('Biometria não disponível:', err);
   }
 };

 const loadSavedCredentials = async () => {
   try {
     const saved = await SecureStorage.get({ key: CREDENTIALS_KEY });
     if (saved.value) {
       const creds = JSON.parse(saved.value);
       setEmail(creds.email);
       setPassword(creds.password);
       setSaveCredentials(true);
     }
   } catch (err) {
     console.error('Erro ao carregar credenciais:', err);
   }
 };

 const saveUserCredentials = async (email, password) => {
   try {
     if (saveCredentials) {
       await SecureStorage.set({
         key: CREDENTIALS_KEY,
         value: JSON.stringify({ email, password })
       });
     } else {
       await SecureStorage.remove({ key: CREDENTIALS_KEY });
     }
   } catch (err) {
     console.error('Erro ao salvar credenciais:', err);
   }
 };

 const loginWithBiometric = async () => {
   try {
     await BiometricAuth.authenticate({
       reason: 'Autenticar para acessar Mayu Delivery',
       cancelLabel: 'Cancelar'
     });

     const saved = await SecureStorage.get({ key: CREDENTIALS_KEY });
     if (saved.value) {
       const creds = JSON.parse(saved.value);
       await performLogin(creds.email, creds.password);
     } else {
       setError('Nenhuma credencial salva. Faça login manualmente primeiro.');
     }
   } catch (err) {
     setError('Autenticação biométrica falhou ou foi cancelada');
   }
 };

 const performLogin = async (email, password) => {
   setError('');
   setLoading(true);

   try {
     console.log('Tentando login em:', axios.defaults.baseURL + '/api/auth/login');
     const response = await axios.post('/api/auth/login', {
       email,
       password
     });

     console.log('Login bem-sucedido:', response.data);
     await saveUserCredentials(email, password);
     onLogin(response.data.token, response.data.user);
   } catch (err) {
     console.error('Erro completo no login:', err);
     const msg = err.response?.data?.error || err.message || 'Erro desconhecido ao fazer login';
     setError(`Falha: ${msg}`);
   } finally {
     setLoading(false);
   }
 };

 const handleSubmit = async (e) => {
   e.preventDefault();
   await performLogin(email, password);
 };

 return (
 <div style={{
 minHeight: '100vh',
 display: 'flex',
 alignItems: 'center',
 justifyContent: 'center',
 backgroundColor: '#0a0a0a',
 padding: '1rem'
 }}>
 <div style={{
 background: '#1e1e1e',
 borderRadius: '16px',
 padding: '2.5rem',
 width: '100%',
 maxWidth: '400px',
 boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
 border: '1px solid #2a2a2a'
 }}>
 <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
 <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#fbbf24' }}>
 Mayu Delivery
 </h1>
 <p style={{ color: '#a3a3a3', marginTop: '0.5rem' }}>Gestão de Estoque</p>
 </div>

 {error && (
 <div style={{
 backgroundColor: 'rgba(239, 68, 68, 0.1)',
 color: '#ef4444',
 padding: '0.75rem',
 borderRadius: '8px',
 marginBottom: '1rem',
 fontSize: '0.875rem',
 border: '1px solid rgba(239, 68, 68, 0.3)'
 }}>
 {error}
 </div>
 )}

 <form onSubmit={handleSubmit}>
 <div className="form-group">
 <label className="form-label">Email</label>
 <input
 type="email"
 className="form-input"
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 placeholder="admin@mayudelvery.com"
 required
 />
 </div>

 <div className="form-group">
 <label className="form-label">Senha</label>
 <div style={{ position: 'relative' }}>
 <input
 type={showPassword ? 'text' : 'password'}
 className="form-input"
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 placeholder="••••••••"
 required
 style={{ paddingRight: '3rem' }}
 />
 <button
 type="button"
 onClick={() => setShowPassword(!showPassword)}
 style={{
 position: 'absolute',
 right: '0.75rem',
 top: '50%',
 transform: 'translateY(-50%)',
 background: 'none',
 border: 'none',
 cursor: 'pointer',
 color: '#a3a3a3',
 padding: '0.25rem',
 display: 'flex',
 alignItems: 'center'
 }}
 >
 {showPassword ? (
 <EyeSlashIcon style={{ width: '1.25rem', height: '1.25rem' }} />
 ) : (
 <EyeIcon style={{ width: '1.25rem', height: '1.25rem' }} />
 )}
 </button>
 </div>
 </div>

 <button
 type="submit"
 className="btn btn-primary"
 style={{ width: '100%', marginTop: '1rem' }}
 disabled={loading}
 >
 {loading ? 'Entrando...' : 'Entrar'}
 </button>

 {biometricAvailable && (
 <button
 type="button"
 onClick={loginWithBiometric}
 className="btn btn-secondary"
 style={{ width: '100%', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
 >
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '1.25rem', height: '1.25rem' }}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M7.864 4.243A7.5 7.5 0 0 1 19.5 12c0 2.04-.52 3.97-1.44 5.657a.75.75 0 0 1-1.308-.728A9.46 9.46 0 0 0 18 12a6 6 0 1 0-12 0c0 1.66.42 3.22 1.15 4.58a.75.75 0 0 1-1.32.7 7.46 7.46 0 0 1-1.33-5.28 7.5 7.5 0 0 1 3.364-7.757Zm2.12 3.713A4.5 4.5 0 0 1 16.5 12c0 1.23-.3 2.39-.83 3.417a.75.75 0 0 1-1.33-.683A3.001 3.001 0 0 0 15 12a3 3 0 0 0-6 0c0 .52.1 1.02.29 1.48a.75.75 0 0 1-1.38.58A4.5 4.5 0 0 1 10.015 7.957ZM12 10.5a1.5 1.5 0 0 1 1.5 1.5v1.5a.75.75 0 0 1-1.5 0V12a1.5 1.5 0 0 1 1.5-1.5Zm0 4.5a1.5 1.5 0 0 1 1.5 1.5v1.5a.75.75 0 0 1-1.5 0V16.5a1.5 1.5 0 0 1 1.5-1.5Z" />
 </svg>
 Entrar com Biometria
 </button>
 )}

 <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
 <input
 type="checkbox"
 id="saveCredentials"
 checked={saveCredentials}
 onChange={(e) => setSaveCredentials(e.target.checked)}
 style={{ width: '1rem', height: '1rem' }}
 />
 <label htmlFor="saveCredentials" style={{ fontSize: '0.875rem', color: '#a3a3a3', cursor: 'pointer' }}>
 Salvar credenciais para login rápido
 </label>
 </div>
 </form>

 <div style={{
 marginTop: '1.5rem',
 textAlign: 'center',
 fontSize: '0.75rem',
 color: '#737373'
 }}>
 <p>Demo: admin@mayudelvery.com / admin123</p>
 </div>
 </div>
 </div>
 );
}