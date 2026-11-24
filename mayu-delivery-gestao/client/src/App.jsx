import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect, createContext, useContext } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Stock from './pages/Stock';
import PurchaseOrders from './pages/PurchaseOrders';
import Suppliers from './pages/Suppliers';
import InvoiceHistory from './pages/InvoiceHistory';
import Users from './pages/Users';
import Profile from './pages/Profile';
import Sidebar from './components/Sidebar';
import Toast, { useToast } from './components/Toast';
import './App.css';

const ThemeContext = createContext();

export function useTheme() {
  return useContext(ThemeContext);
}

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleLogin = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
    addToast(`Bem-vindo, ${userData.name}!`, 'success');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    addToast('Logout realizado com sucesso', 'info');
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className="app-container">
        <Sidebar
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
          user={user}
          onLogout={handleLogout}
        />
        <main className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/stock" element={<Stock />} />
            <Route path="/purchase-orders" element={<PurchaseOrders />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/invoice-history" element={<InvoiceHistory />} />
            <Route path="/users" element={<Users />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        {toasts.map(toast => (
          <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ThemeContext.Provider>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;