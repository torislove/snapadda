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
      try { setUser(JSON.parse(stored)); } catch { console.error('Failed to parse user from localStorage'); }
    }
    setIsLoading(false);
    console.log('AuthProvider loaded user from localStorage.');
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

  const loginGuest = () => {
    const guestUser = { 
      _id: 'guest_' + Date.now(),
      name: 'Guest User', 
      role: 'client', 
      isGuest: true, 
      onboardingCompleted: true 
    };
    setUser(guestUser);
    localStorage.setItem('snapadda_user', JSON.stringify(guestUser));
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
    <AuthContext.Provider value={{ user, login, loginGoogle, loginGuest, logout, completeOnboarding, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
