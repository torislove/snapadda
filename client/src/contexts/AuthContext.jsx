import { createContext, useContext, useState, useEffect } from 'react';
import { updatePreferences } from '../services/api';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const trackLocation = async (currentUser) => {
    if (!currentUser || !(currentUser._id || currentUser.id)) return;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Use fetch directly to avoid dependency on api.js in context if needed
          await fetch(`/api/users/${currentUser._id || currentUser.id}/location`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lat: latitude, lng: longitude })
          });
        } catch (err) { console.warn('Location sync failed'); }
      }, null, { enableHighAccuracy: false, timeout: 5000 });
    }
  };

  useEffect(() => {
    try {
      const stored = localStorage.getItem('snapadda_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && (parsed._id || parsed.id || parsed.token)) {
          setUser(parsed);
          trackLocation(parsed);
          console.log('AuthProvider: Restored session for', parsed.email || parsed.name);
        }
      }
    } catch (err) {
      console.warn('AuthProvider: Failed to restore session, starting fresh.', err.message);
      localStorage.removeItem('snapadda_user');
    } finally {
      setIsLoading(false);
      console.log('AuthProvider: Initialization complete.');
      fetch('/api/warmup').catch(() => {});
    }
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('snapadda_user', JSON.stringify(userData));
    trackLocation(userData);
    fetch('/api/warmup').catch(() => {});
  };

  const loginGoogle = (userData) => {
    const userWithToken = { ...userData.user, token: userData.token || 'mock_token' };
    localStorage.setItem('snapadda_user', JSON.stringify(userWithToken));
    setIsLoading(false);
    setUser(userWithToken);
    trackLocation(userWithToken);
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
