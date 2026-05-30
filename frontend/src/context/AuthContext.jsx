import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Rehydrate from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setAccessToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const persistAuth = useCallback((userData, token) => {
    localStorage.setItem('accessToken', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setAccessToken(token);
    setUser(userData);
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { user: userData, accessToken: token } = res.data.data;
    persistAuth(userData, token);
    return res.data;
  }, [persistAuth]);

  const register = useCallback(async (displayName, email, password) => {
    const res = await api.post('/auth/register', { displayName, email, password });
    const { user: userData, accessToken: token } = res.data.data;
    persistAuth(userData, token);
    return res.data;
  }, [persistAuth]);

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setAccessToken(null);
    setUser(null);
  }, []);

  const isAuthenticated = !!accessToken;

  return (
    <AuthContext.Provider
      value={{ user, accessToken, isAuthenticated, loading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
