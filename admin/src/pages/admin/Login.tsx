import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { Logo } from '../../components/ui/Logo';
import { ShieldCheck, ArrowLeft, Loader2, Mail, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { adminLogin } = useAdminAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok && data.token) {
        adminLogin(data.user, data.token);
        navigate('/admin');
      } else {
        setError(data.message || 'Access Denied: Admin authorization required.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection failure. Ensure backend services are active.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-login-page-premium" style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: '#020205', 
      padding: '1.5rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Royal Admin Accent */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #9e822a, #f1d592, #9e822a)' }} />
      
      <motion.div 
        className="admin-login-box-premium glass-heavy"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ 
          maxWidth: '460px', 
          width: '100%', 
          borderRadius: '32px', 
          padding: '4rem 3rem',
          border: '1px solid rgba(232, 184, 75, 0.15)',
          boxShadow: '0 50px 120px rgba(0,0,0,0.9)',
          textAlign: 'center',
          position: 'relative',
          zIndex: 10
        }}
      >
        <div className="flex flex-col items-center mb-10">
          <div style={{ background: 'rgba(232, 184, 75, 0.1)', padding: '1rem', borderRadius: '24px', marginBottom: '1.5rem', border: '1px solid rgba(232, 184, 75, 0.2)' }}>
            <Logo size={48} />
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em' }}>
            Snap<span className="text-royal-gold">Adda</span> Console
          </h1>
          <p style={{ color: 'var(--txt-muted)', marginTop: '0.75rem', fontSize: '0.95rem' }}>
            Authorized Personnel Only
          </p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ marginBottom: '2rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '16px', color: '#fca5a5', fontSize: '0.85rem', fontWeight: 600 }}
          >
            {error}
          </motion.div>
        )}

        <div className="admin-auth-container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ position: 'relative', padding: '4px', background: 'rgba(232, 184, 75, 0.05)', borderRadius: '20px', border: '1px solid rgba(232, 184, 75, 0.2)' }}>
            {isLoading ? (
              <div style={{ padding: '0.85rem', color: 'var(--gold)', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <Loader2 className="animate-spin" size={20} />
                Verifying Credentials...
              </div>
            ) : (
              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.5rem' }}>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--txt-muted)' }} />
                  <input
                    type="email"
                    placeholder="Admin Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', outline: 'none' }}
                  />
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--txt-muted)' }} />
                  <input
                    type="password"
                    placeholder="Security Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', outline: 'none' }}
                  />
                </div>
                <button 
                  type="submit" 
                  style={{ width: '100%', padding: '1rem', background: 'linear-gradient(135deg, var(--gold), #9e822a)', color: '#020205', fontWeight: 800, borderRadius: '12px', border: 'none', cursor: 'pointer', marginTop: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}
                >
                  Authorize Access
                </button>
              </form>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', opacity: 0.3 }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }}></div>
            <ShieldCheck size={18} />
            <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }}></div>
          </div>

          <div style={{ textAlign: 'left', background: 'rgba(255,255,255,0.03)', padding: '1.25rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h4 style={{ color: '#fff', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={14} className="text-royal-gold" /> Security Protocol
            </h4>
            <p style={{ color: 'var(--txt-muted)', fontSize: '0.8rem', lineHeight: 1.5 }}>
              Access is strictly logged. Authentication requires an active @snapadda.com or authorized estate partner account.
            </p>
          </div>
        </div>

        <div style={{ marginTop: '3.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button 
            onClick={() => window.location.href = '/'}
            className="flex items-center justify-center gap-2 text-gray-500 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft size={14} /> Back to Portal
          </button>
          <p style={{ fontSize: '0.75rem', color: '#333' }}>© 2026 SNAPADDA INFRASTRUCTURE. ALL RIGHTS RESERVED.</p>
        </div>
      </motion.div>

      <style>{`
        .admin-login-box-premium::after {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 100% 0%, rgba(232, 184, 75, 0.05) 0%, transparent 50%);
          border-radius: 32px;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
};

export default AdminLogin;
