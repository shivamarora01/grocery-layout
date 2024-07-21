"use client"
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLogin, setIsLogin] = useState(false);
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  useEffect(() => {
    const loggedIn = localStorage.getItem('isLogin') === 'true';
    setIsLogin(loggedIn);
  }, []);

  const login = () => {
    setIsLogin(true);
    localStorage.setItem('isLogin', 'true');
  };

  const logout = () => {
    setIsLogin(false);
    localStorage.setItem('isLogin', 'false');
  };

  const onSetupComplete = (val) => {
    setIsSetupComplete(val);
  };

  return (
    <AuthContext.Provider value={{ isLogin, login, logout, onSetupComplete, isSetupComplete }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);