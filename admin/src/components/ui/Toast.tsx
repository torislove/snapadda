import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

export interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 3000 }) => {
  const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 768);
  
  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  React.useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const isSuccess = type === 'success';

  return (
    <motion.div
      initial={{ opacity: 0, y: isMobile ? 50 : 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: isMobile ? 30 : 20, scale: 0.95 }}
      style={{
        position: 'fixed',
        bottom: isMobile ? 'calc(var(--bottom-nav-h, 0px) + 16px)' : '24px',
        right: isMobile ? '16px' : '24px',
        left: isMobile ? '16px' : 'auto',
        zIndex: 9999,
        minWidth: isMobile ? 'calc(100% - 32px)' : '300px',
        background: isSuccess ? 'rgba(16, 217, 140, 0.1)' : 'rgba(245, 57, 123, 0.1)',
        backdropFilter: 'blur(20px) saturate(180%)',
        border: `1px solid ${isSuccess ? 'rgba(16, 217, 140, 0.3)' : 'rgba(245, 57, 123, 0.3)'}`,
        borderRadius: '16px',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        color: isSuccess ? '#10d98c' : '#f5397b'
      }}
    >
      <div style={{
        background: isSuccess ? 'rgba(16, 217, 140, 0.2)' : 'rgba(245, 57, 123, 0.2)',
        padding: '8px',
        borderRadius: '10px',
        display: 'flex'
      }}>
        {isSuccess ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
      </div>
      
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'white' }}>
          {isSuccess ? 'Success' : 'Attention Needed'}
        </div>
        <div style={{ fontSize: '0.8rem', opacity: 0.8, color: 'white' }}>{message}</div>
      </div>

      <button 
        onClick={onClose}
        style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: '4px' }}
      >
        <X size={16} />
      </button>
      
      {/* Progress Bar */}
      <motion.div 
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: duration / 1000, ease: 'linear' }}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          height: '3px',
          background: isSuccess ? '#10d98c' : '#f5397b',
          borderRadius: '0 0 0 16px'
        }}
      />
    </motion.div>
  );
};

export const useToast = () => {
  const [toast, setToast] = React.useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  const showToast = React.useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  }, []);
  
  const closeToast = React.useCallback(() => setToast(null), []);
  
  const ToastComponent = React.useCallback(() => (
    <AnimatePresence>
      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}
    </AnimatePresence>
  ), [toast, closeToast]);
  
  return { showToast, ToastComponent };
};
