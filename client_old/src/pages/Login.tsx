import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import { Logo } from '../components/ui/Logo';
import './Login.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setIsAuthLoading(true);
    setAuthError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const token = await user.getIdToken();
      
      const payload = {
        email: user.email,
        name: user.displayName,
        picture: user.photoURL,
        sub: user.uid
      };

      // Send to backend to sync user
      const res = await fetch(`${API_URL}/users/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, payload })
      });
      
      if (!res.ok) {
        throw new Error(`Server authentication failed: ${res.statusText}`);
      }

      const data = await res.json();
      if (data.user) {
        login(data.user);
        if (!data.user.onboardingCompleted) {
          navigate('/onboarding');
        } else {
          navigate('/'); // Redirect to Website Home
        }
      }
    } catch (error: any) {
      console.error("Firebase Login Error Details:", {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      
      if (error.code === 'auth/popup-blocked') {
        setAuthError("Auth popup was blocked by your browser. Please allow popups for this site.");
      } else if (error.code === 'auth/cancelled-popup-request') {
        // Do nothing, user just closed the popup
      } else {
        const diagnosticMessage = error.message?.includes('Failed to fetch') 
          ? "Network Error: Could not connect to SnapAdda Server. Please check your internet or retry later." 
          : (error.message || "Login failed. Please verify your internet connection.");
        setAuthError(diagnosticMessage);
      }
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Guest login to browse without an account
  const handleGuestLogin = () => {
    const guestUser = {
      _id: 'guest_' + Date.now(),
      name: 'Guest User',
      email: 'guest@snapadda.com',
      avatar: 'https://ui-avatars.com/api/?name=Guest&background=111&color=d4af37',
      onboardingCompleted: true,
      role: 'client',
      favorites: []
    };
    
    login(guestUser as any);
    navigate('/');
  };

  return (
    <div className="login-page">
      <div className="login-spline-bg"></div>
      
      <motion.div 
        className="login-container glass-heavy tilt-3d"
        style={{ transformStyle: 'preserve-3d', padding: '2.5rem', borderRadius: '16px', margin: '1rem' }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="login-header">
          <div className="login-logo">
            <Logo size={42} showText />
          </div>
          <h1>Welcome to SnapAdda</h1>
          <p>Securely sign in to save favorites, get personalized property matches, and explore verified listings.</p>
          <div className="login-info">
            <p>Fast access with Google authentication and an option to browse as a guest.</p>
          </div>
        </div>

        <div className="login-actions" style={{ minHeight: '180px' }}>
          {authError && (
            <div style={{ color: 'var(--error)', background: 'rgba(231, 76, 60, 0.1)', padding: '10px 15px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '15px', textAlign: 'center' }}>
              {authError}
            </div>
          )}

          <div className="google-btn-wrapper">
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button 
                onClick={handleGoogleLogin}
                disabled={isAuthLoading}
                className="firebase-google-btn"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  backgroundColor: 'white',
                  color: '#111',
                  padding: '12px 24px',
                  borderRadius: '12px', // Match the rest of the app's radius
                  fontWeight: '700',
                  border: 'none',
                  cursor: isAuthLoading ? 'wait' : 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  transition: 'all 0.2s ease',
                  opacity: isAuthLoading ? 0.7 : 1
                }}
              >
                {isAuthLoading ? (
                  <span className="spinner" style={{ border: '2px solid #ddd', borderTop: '2px solid #000', borderRadius: '50%', width: '16px', height: '16px', animation: 'spin 1s linear infinite' }}></span>
                ) : (
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: '18px' }} />
                )}
                {isAuthLoading ? 'Connecting...' : 'Continue with Google'}
              </button>
            </div>
          </div>
          
          <div className="divider"><span>Or</span></div>
          
          <button 
            onClick={handleGuestLogin}
            style={{
              width: '100%',
              padding: '12px',
              background: 'transparent',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: 500,
              transition: 'all 0.3s ease',
              marginTop: '5px'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.color = 'var(--text-primary)';
              e.currentTarget.style.borderColor = 'var(--accent-gold)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.color = 'var(--text-secondary)';
              e.currentTarget.style.borderColor = 'var(--border-color)';
            }}
            className="btn-3d"
          >
            Skip & Browse as Guest
          </button>
        </div>

        <div className="login-footer">
          <p><ShieldCheck size={16} /> Secure Authentication via Google</p>
          <p>By signing in, you agree to our Terms of Service & Privacy Policy.</p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
