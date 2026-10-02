import React, { createContext, useEffect, useState } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Load initial state and verify token if present
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken) {
        try {
          const res = await api.auth.getMe();
          if (res.user) {
            setIsLoggedIn(true);
            setUser(res.user);
            setUsername(res.user.username);
            setIsAdmin(res.user.role === 'admin');
            localStorage.setItem('user', JSON.stringify(res.user));
            setIsAuthLoading(false);
            return;
          }
        } catch (err) {
          console.warn('Session verification failed, falling back to local storage:', err.message);
        }
      }

      // Fallback to local storage if API is offline
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          setIsLoggedIn(true);
          setUser(parsed);
          setUsername(parsed.username);
          setIsAdmin(parsed.role === 'admin');
        } catch (e) {
          console.error(e);
        }
      }

      setIsAuthLoading(false);
    };

    initializeAuth();
  }, []);

  const login = (userData, token) => {
    setIsLoggedIn(true);
    setUser(userData);
    setUsername(userData.username);
    setIsAdmin(userData.role === 'admin');

    localStorage.setItem('user', JSON.stringify(userData));
    if (token) {
      localStorage.setItem('token', token);
    }

    const storedLoginHistory = localStorage.getItem('loginHistory');
    const loginHistory = storedLoginHistory ? JSON.parse(storedLoginHistory) : [];
    const loginRecord = {
      username: userData.username,
      email: userData.email,
      phone: userData.phone,
      dateOfBirth: userData.dateOfBirth,
      lastLogin: new Date().toISOString(),
    };
    const updatedLoginHistory = [
      loginRecord,
      ...loginHistory.filter((record) => record.username !== userData.username),
    ];
    localStorage.setItem('loginHistory', JSON.stringify(updatedLoginHistory));
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setUsername('');
    setIsAdmin(false);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, username, user, isAdmin, isAuthLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
