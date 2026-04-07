import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { KeyRound, Mail, Loader2, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { Logo } from '../../components/ui/Logo';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import './Login.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { adminLogin } = useAdminAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
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
        setError(data.message || 'Authentication Failed');
      }
    } catch (err) {
      setError('Network Error. Ensure backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setIsLoading(true);
    setError('');
    try {
      const decoded: any = jwtDecode(credentialResponse.credential);
      // We use the same user/authGoogle endpoint but check for 'admin' role in the backend
      const res = await fetch(`${API_URL}/users/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload: decoded }),
      });
      const data = await res.json();
      
      if (data.status === 'success') {
        if (data.user.role === 'admin') {
          adminLogin(data.user, credentialResponse.credential);
          navigate('/admin');
        } else {
          setError('Unauthorized: System identifies you as a client account.');
        }
      }
    } catch (err) {
      setError('Google verification failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      {/* Dynamic Background Elements */}
      <div className="admin-login-orb orb-1" />
      <div className="admin-login-orb orb-2" />
      
      <motion.div 
        className="admin-login-box glass-heavy"
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex flex-col items-center mb-10 text-center">
          <motion.div 
            className="mb-6 relative"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="absolute inset-0 bg-gold-500/20 blur-2xl rounded-full" />
            <Logo size={56} />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
              Snap<span className="text-gold-500">Adda</span> Console
            </h1>
            <p className="text-gray-400 text-sm font-medium tracking-wide uppercase flex items-center justify-center gap-2">
              <ShieldCheck size={14} className="text-emerald-400" /> Administrative Access
            </p>
          </motion.div>
        </div>

        {error && (
          <motion.div 
            className="mb-8 p-4 bg-red-900/20 border border-red-500/30 rounded-xl text-red-300 text-xs text-center font-semibold tracking-wide"
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
          >
            {error}
          </motion.div>
        )}

        {/* Google Login Section */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="google-btn-container">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google Authentication Failed')}
              theme="filled_black"
              shape="circle"
              size="large"
              width="100%"
            />
          </div>
          
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em]">Or use secondary keys</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>
        </motion.div>

        <form onSubmit={handleLogin} className="space-y-6">
          <motion.div 
            className="input-group"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <label className="input-label">Email Key</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-gold-500 transition-colors" size={18} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="authority@snapadda.com"
                className="admin-input-field pl-12"
                required
              />
            </div>
          </motion.div>

          <motion.div 
            className="input-group"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <label className="input-label">Secure Password</label>
            <div className="relative group">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-gold-500 transition-colors" size={18} />
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="admin-input-field pl-12 pr-12"
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </motion.div>

          <motion.button 
            type="submit" 
            disabled={isLoading}
            className="admin-signin-btn"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Initialize Session'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
