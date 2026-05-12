import { createContext, useContext, useState, useEffect } from 'react';
import { updatePreferences } from '../services/api';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('snapadda_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && (parsed._id || parsed.id || parsed.token)) {
          setUser(parsed);
          console.log('AuthProvider: Restored session for', parsed.email || parsed.name);
        }
      }
    } catch (err) {
      console.warn('AuthProvider: Failed to restore session, starting fresh.', err.message);
      localStorage.removeItem('snapadda_user');
    } finally {
      setIsLoading(false);
      console.log('AuthProvider: Initialization complete.');
      // Trigger a silent warmup call to pre-heat serverless functions and DB connection
      fetch('/api/warmup').catch(() => {});
    }
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('snapadda_user', JSON.stringify(userData));
    // Trigger warmup after login to ensure immediate property fetches succeed
    fetch('/api/warmup').catch(() => {});
  };

  const loginGoogle = (userData) => {
    const userWithToken = { ...userData.user, token: userData.token || 'mock_token' };
    localStorage.setItem('snapadda_user', JSON.stringify(userWithToken));
    setIsLoading(false); // Force loading off BEFORE user set to avoid blink stalls
    setUser(userWithToken);
    // Trigger warmup after Google login
    fetch('/api/warmup').catch(() => {});
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
