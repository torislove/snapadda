import { createContext, useContext, useState, useEffect } from 'react';
import { updatePreferences } from '../services/api';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  console.log('AuthProvider initializing...');
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('snapadda_user');
    if (stored) {
      try { 
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
          setUser(parsed); 
        }
      } catch (e) { 
        console.error('SnapAdda: Auth storage corruption detected, resetting...', e);
        localStorage.removeItem('snapadda_user');
      }
    }
    setIsLoading(false);

    // Google One-Tap Initialization
    const handleGoogleResponse = async (response) => {
      try {
        const { googleAuth } = await import('../services/api');
        const res = await googleAuth(response.credential);
        if (res.status === 'success') {
          loginGoogle(res.data);
        }
      } catch (err) {
        console.error('One-tap login failed', err);
      }
    };

    if (window.google && !stored) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
        auto_select: true,
        cancel_on_tap_outside: false
      });
      window.google.accounts.id.prompt();
    }
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('snapadda_user', JSON.stringify(userData));
  };

  const loginGoogle = (userData) => {
    const userWithToken = { ...userData.user, token: userData.token || 'mock_token' };
    setUser(userWithToken);
    localStorage.setItem('snapadda_user', JSON.stringify(userWithToken));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('snapadda_user');
  };

  const completeOnboarding = async (preferences = {}) => {
    if (user && user._id) {
      try {
        const response = await updatePreferences(user._id, preferences);
        if (response.status === 'success') {
          const updated = { ...user, ...response.user, onboardingCompleted: true };
          setUser(updated);
          localStorage.setItem('snapadda_user', JSON.stringify(updated));
          return true;
        }
      } catch (e) {
        console.error('Failed to complete onboarding:', e);
        throw e;
      }
    }
    return false;
  };

  return (
    <AuthContext.Provider value={{ user, login, loginGoogle, logout, completeOnboarding, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
