import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface AdminAuthContextType {
  adminUser: AdminUser | null;
  adminLogin: (userData: AdminUser, token: string) => void;
  adminLogout: () => void;
  updateAdminUser: (updates: Partial<AdminUser>) => void;
  isLoading: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedAdmin = localStorage.getItem('snapadda_admin');
    const token = localStorage.getItem('snapadda_admin_token');
    if (storedAdmin && token) {
      try { setAdminUser(JSON.parse(storedAdmin)); } catch { /* ignore */ }
    }
    setIsLoading(false);
  }, []);

  const adminLogin = (userData: AdminUser, token: string) => {
    setAdminUser(userData);
    localStorage.setItem('snapadda_admin', JSON.stringify(userData));
    localStorage.setItem('snapadda_admin_token', token);
  };

  const adminLogout = () => {
    setAdminUser(null);
    localStorage.removeItem('snapadda_admin');
    localStorage.removeItem('snapadda_admin_token');
  };

  // Patch local state + localStorage after profile update
  const updateAdminUser = (updates: Partial<AdminUser>) => {
    setAdminUser(prev => {
      if (!prev) return prev;
      const merged = { ...prev, ...updates };
      localStorage.setItem('snapadda_admin', JSON.stringify(merged));
      return merged;
    });
  };

  return (
    <AdminAuthContext.Provider value={{ adminUser, adminLogin, adminLogout, updateAdminUser, isLoading }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  return context;
};
