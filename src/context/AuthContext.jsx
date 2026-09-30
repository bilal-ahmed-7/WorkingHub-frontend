import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginApi, registerOwnerApi, logoutApi, getProfileApi } from '../api/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('workhub_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [tokens, setTokens] = useState(() => {
    const saved = localStorage.getItem('workhub_tokens');
    return saved ? JSON.parse(saved) : null;
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (tokens?.access) {
        try {
          const profile = await getProfileApi();
          setUser(profile);
          localStorage.setItem('workhub_user', JSON.stringify(profile));
        } catch (err) {
          console.error('Session verification failed:', err);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  useEffect(() => {
    const syncAuthState = () => {
      const savedTokens = localStorage.getItem('workhub_tokens');
      const savedUser = localStorage.getItem('workhub_user');
      setTokens(savedTokens ? JSON.parse(savedTokens) : null);
      setUser(savedUser ? JSON.parse(savedUser) : null);
    };

    window.addEventListener('storage', syncAuthState);
    return () => window.removeEventListener('storage', syncAuthState);
  }, []);

  const login = async (credentials) => {
    const data = await loginApi(credentials);
    const authTokens = {
      access: data.access,
      refresh: data.refresh,
    };
    setTokens(authTokens);
    setUser(data.user);
    localStorage.setItem('workhub_tokens', JSON.stringify(authTokens));
    localStorage.setItem('workhub_user', JSON.stringify(data.user));
    return data;
  };

  const register = async (formData) => {
    const data = await registerOwnerApi(formData);
    setTokens(data.tokens);
    setUser(data.user);
    localStorage.setItem('workhub_tokens', JSON.stringify(data.tokens));
    localStorage.setItem('workhub_user', JSON.stringify(data.user));
    return data;
  };

  const setAuthSession = (userData, authTokens) => {
    setTokens(authTokens);
    setUser(userData);
    localStorage.setItem('workhub_tokens', JSON.stringify(authTokens));
    localStorage.setItem('workhub_user', JSON.stringify(userData));
  };

  const logout = async () => {
    if (tokens?.refresh) {
      await logoutApi(tokens.refresh);
    }
    setTokens(null);
    setUser(null);
    localStorage.removeItem('workhub_tokens');
    localStorage.removeItem('workhub_user');
  };

  const updateUser = (updatedFields) => {
    setUser((prev) => {
      const updated = { ...prev, ...updatedFields };
      localStorage.setItem('workhub_user', JSON.stringify(updated));
      return updated;
    });
  };

  const value = {
    user,
    tokens,
    loading,
    isAuthenticated: !!tokens?.access && !!user,
    isAdmin: user?.role === 'ADMIN',
    login,
    register,
    setAuthSession,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
