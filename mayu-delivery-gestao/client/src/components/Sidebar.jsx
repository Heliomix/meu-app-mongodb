import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  CubeIcon,
  ArchiveBoxIcon,
  ShoppingCartIcon,
  BuildingStorefrontIcon,
  DocumentTextIcon,
  UsersIcon,
  UserCircleIcon,
  ArrowLeftOnRectangleIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../App';

const menuItems = [
  { path: '/', label: 'Dashboard', icon: HomeIcon },
  { path: '/products', label: 'Produtos', icon: CubeIcon },
  { path: '/stock', label: 'Estoque', icon: ArchiveBoxIcon },
  { path: '/purchase-orders', label: 'Pedidos de Compra', icon: ShoppingCartIcon },
  { path: '/suppliers', label: 'Fornecedores', icon: BuildingStorefrontIcon },
  { path: '/invoice-history', label: 'Histórico de Notas', icon: DocumentTextIcon },
  { path: '/users', label: 'Usuários', icon: UsersIcon },
  { path: '/profile', label: 'Meu Perfil', icon: UserCircleIcon },
];

export default function Sidebar({ isOpen, setIsOpen, user, onLogout }) {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 40,
            display: 'none'
          }}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`sidebar ${isOpen ? 'open' : 'closed'}`}
        style={{
          width: isOpen ? '250px' : '0',
          backgroundColor: '#064e3b',
          color: 'white',
          position: 'fixed',
          height: '100vh',
          left: 0,
          top: 0,
          overflow: 'hidden',
          transition: 'width 0.3s ease',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Logo/Header */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Mayu Delivery</h1>
          <p style={{ fontSize: '0.75rem', opacity: 0.8 }}>Gestão de Estoque</p>
        </div>

        {/* Menu Items */}
        <nav style={{ flex: 1, padding: '1rem 0' }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => window.innerWidth < 768 && setIsOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.75rem 1.5rem',
                  color: isActive ? 'white' : 'rgba(255, 255, 255, 0.7)',
                  backgroundColor: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                  borderLeft: isActive ? '3px solid white' : '3px solid transparent'
                }}
              >
                <Icon style={{ width: '1.25rem', height: '1.25rem', marginRight: '0.75rem' }} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <div style={{ marginBottom: '0.75rem' }}>
            <p style={{ fontSize: '0.875rem', fontWeight: '500' }}>{user?.name}</p>
            <p style={{ fontSize: '0.75rem', opacity: 0.7 }}>{user?.role}</p>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            style={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              padding: '0.5rem 0',
              background: 'none',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.7)',
              cursor: 'pointer',
              fontSize: '0.875rem',
              marginBottom: '0.5rem'
            }}
          >
            {theme === 'dark' ? (
              <>
                <SunIcon style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
                Modo Claro
              </>
            ) : (
              <>
                <MoonIcon style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
                Modo Escuro
              </>
            )}
          </button>

          <button
            onClick={onLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              padding: '0.5rem 0',
              background: 'none',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.7)',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            <ArrowLeftOnRectangleIcon style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
            Sair
          </button>
        </div>
      </aside>

      {/* Botão de toggle para mobile */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          top: '1rem',
          left: isOpen ? '260px' : '1rem',
          zIndex: 60,
          background: '#064e3b',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: '0.5rem',
          cursor: 'pointer',
          display: 'none'
        }}
        className="mobile-menu-toggle"
      >
        ☰
      </button>

      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-toggle {
            display: block !important;
          }

          .sidebar.open {
            width: 100% !important;
          }
        }
      `}</style>
    </>
  );
}