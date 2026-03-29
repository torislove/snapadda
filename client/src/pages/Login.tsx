import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Home, ShieldCheck } from 'lucide-react';
import './Login.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleGoogleLogin = async () => {
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
      
      const data = await res.json();
      if (res.ok && data.user) {
        login(data.user);
        if (!data.user.onboardingCompleted) {
          navigate('/onboarding');
        } else {
          navigate('/dashboard'); 
        }
      }
    } catch (error) {
      console.error("Firebase Login Error:", error);
      alert("Login failed. Please try again.");
    }
  };

  // Mock login for demonstration if Google Auth is unconfigured
  const handleDevMockLogin = async () => {
    const mockPayload = {
      email: 'demo@snapadda.com',
      name: 'Demo User',
      picture: 'https://ui-avatars.com/api/?name=Demo+User',
      sub: 'mock-google-id-123'
    };
    
    const res = await fetch(`${API_URL}/users/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: 'mock-token', payload: mockPayload })
    });
    
    const data = await res.json();
    if (res.ok && data.user) {
      login(data.user);
      if (!data.user.onboardingCompleted) {
        navigate('/onboarding');
      } else {
        navigate('/dashboard'); // Direct to modern app dashboard
      }
    }
  };

  return (
    <div className="login-page">
      <div className="login-spline-bg"></div>
      
      <motion.div 
        className="login-container"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="login-header">
          <div className="login-logo">
            <Home size={32} className="text-gold" />
            <span>SnapAdda</span>
          </div>
          <h1>Welcome Home</h1>
          <p>Sign in to discover premium real estate tailored precisely to your requirements.</p>
        </div>

        <div className="login-actions">
          <div className="google-btn-wrapper">
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button 
                onClick={handleGoogleLogin}
                className="firebase-google-btn"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  backgroundColor: 'white',
                  color: '#111',
                  padding: '12px 24px',
                  borderRadius: '30px',
                  fontWeight: '600',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  transition: 'all 0.2s ease'
                }}
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: '18px' }} />
                Continue with Google
              </button>
            </div>
          </div>
          
          <div className="divider"><span>Or</span></div>
          
          <button className="dev-mock-btn" onClick={handleDevMockLogin}>
            Continue with Demo Account
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
