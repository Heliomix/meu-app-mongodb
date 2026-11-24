import { useState, useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

const toastTypes = {
  success: { icon: CheckCircleIcon, color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.1)' },
  error: { icon: XCircleIcon, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' },
  warning: { icon: ExclamationTriangleIcon, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
  info: { icon: InformationCircleIcon, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' }
};

export default function Toast({ message, type = 'info', duration = 3000, onClose }) {
  const [visible, setVisible] = useState(true);
  const Icon = toastTypes[type]?.icon || InformationCircleIcon;
  const style = toastTypes[type] || toastTypes.info;

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '1rem',
      right: '1rem',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '1rem 1.25rem',
      borderRadius: '0.75rem',
      background: 'var(--surface)',
      border: `1px solid ${style.color}33`,
      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.5)',
      animation: 'slideInRight 0.3s ease',
      maxWidth: '400px'
    }}>
      <Icon style={{ width: '1.5rem', height: '1.5rem', color: style.color }} />
      <span style={{ flex: 1, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{message}</span>
      <button
        onClick={() => { setVisible(false); setTimeout(onClose, 300); }}
        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem' }}
      >
        <XMarkIcon style={{ width: '1.25rem', height: '1.25rem' }} />
      </button>
    </div>
  );
}

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info', duration = 3000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type, duration }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return { toasts, addToast, removeToast };
}