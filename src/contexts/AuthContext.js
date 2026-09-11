import React, { createContext, useEffect, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Load initial state from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : null;
    if (user) {
      setIsLoggedIn(true);
      setUsername(user.username);
      setIsAdmin(user.role === 'admin');
    }
    setIsAuthLoading(false);
  }, []);

  const login = (user) => {
    setIsLoggedIn(true);
    setUsername(user.username);
    setIsAdmin(user.role === 'admin');
    localStorage.setItem('user', JSON.stringify(user));

    const storedLoginHistory = localStorage.getItem('loginHistory');
    const loginHistory = storedLoginHistory ? JSON.parse(storedLoginHistory) : [];
    const loginRecord = {
      username: user.username,
      email: user.email,
      phone: user.phone,
      dateOfBirth: user.dateOfBirth,
      lastLogin: new Date().toISOString(),
    };
    const updatedLoginHistory = [
      loginRecord,
      ...loginHistory.filter((record) => record.username !== user.username),
    ];
    localStorage.setItem('loginHistory', JSON.stringify(updatedLoginHistory));
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setIsAdmin(false);
    localStorage.removeItem('user');  // Remove user data
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, username, isAdmin, isAuthLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
