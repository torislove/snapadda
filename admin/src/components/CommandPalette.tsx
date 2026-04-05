import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Home, MapPin, Users, Settings, ChevronRight } from 'lucide-react';

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Toggle open state on Cmd+K or Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  const rawActions = [
    { id: 'dash', name: 'Go to Dashboard', icon: <Home size={18} />, action: () => navigate('/admin') },
    { id: 'props', name: 'Manage Properties', icon: <MapPin size={18} />, action: () => navigate('/admin/properties') },
    { id: 'leads', name: 'View Leads & Inquiries', icon: <Users size={18} />, action: () => navigate('/admin/leads') },
    { id: 'settings', name: 'Platform Settings', icon: <Settings size={18} />, action: () => navigate('/admin/settings') },
  ];

  const filteredActions = query 
    ? rawActions.filter(a => a.name.toLowerCase().includes(query.toLowerCase()))
    : rawActions;

  return (
    <AnimatePresence>
      {isOpen && (
        <React.Fragment>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            style={{ 
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
              background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', 
              zIndex: 99999 
            }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20, x: '-50%' }}
            animate={{ opacity: 1, scale: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, scale: 0.95, y: -20, x: '-50%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{
              position: 'fixed', top: '20vh', left: '50%',
              width: '90%', maxWidth: '550px',
              background: '#0a0a0f', border: '1px solid rgba(212, 175, 55, 0.3)',
              borderRadius: '16px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
              zIndex: 100000
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <Search size={20} color="var(--gold)" style={{ marginRight: '12px' }} />
              <input 
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type a command or search..."
                style={{ 
                  flex: 1, background: 'transparent', border: 'none', outline: 'none', 
                  color: 'white', fontSize: '1.1rem' 
                }}
              />
              <div style={{ fontSize: '0.7rem', color: 'var(--txt-muted)', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>ESC</div>
            </div>
            
            <div style={{ maxHeight: '300px', overflowY: 'auto', padding: '8px 0' }}>
              {filteredActions.length > 0 ? filteredActions.map((action) => (
                <div 
                  key={action.id}
                  onClick={() => { action.action(); setIsOpen(false); }}
                  style={{ 
                    display: 'flex', alignItems: 'center', padding: '12px 16px', cursor: 'pointer',
                    transition: 'background 0.2s', color: 'var(--txt-secondary)'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(212, 175, 55, 0.1)'; e.currentTarget.style.color = 'white'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--txt-secondary)'; }}
                >
                  <div style={{ marginRight: '12px', opacity: 0.8 }}>{action.icon}</div>
                  <span style={{ flex: 1, fontSize: '0.95rem' }}>{action.name}</span>
                  <ChevronRight size={16} opacity={0.5} />
                </div>
              )) : (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--txt-muted)', fontSize: '0.9rem' }}>
                  No automated commands found for "{query}"
                </div>
              )}
            </div>
          </motion.div>
        </React.Fragment>
      )}
    </AnimatePresence>
  );
}
