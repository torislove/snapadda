import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

// Using localstorage for persistence
export interface UserState {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  onboardingCompleted: boolean;
  role: string;
  preferences?: {
    propertyType: string;
    budget: string;
    locations: string[];
    purpose: string;
    additionalNotes: string;
  };
  favorites?: string[];
}

interface AuthContextType {
  user: UserState | null;
  login: (userData: UserState) => void;
  logout: () => void;
  completeOnboarding: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check local storage on mount
    const storedUser = localStorage.getItem('snapadda_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user from local storage");
      }
    }
    setIsLoading(false);
  }, []);

  const login = (userData: UserState) => {
    setUser(userData);
    localStorage.setItem('snapadda_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('snapadda_user');
  };

  const completeOnboarding = () => {
    if (user) {
      const updatedUser = { ...user, onboardingCompleted: true };
      setUser(updatedUser);
      localStorage.setItem('snapadda_user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, completeOnboarding, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
