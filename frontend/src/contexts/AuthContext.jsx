import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '@/api/axios';
import { AuthAPI } from '@/api/auth.api';

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const storedUser = localStorage.getItem('hms_user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])


const login = async (email, password) => {
  try {
    const res = await AuthAPI.login(email, password);

    const { user, token } = res.data;

    localStorage.setItem('hms_user', JSON.stringify(user));
    localStorage.setItem('hms_token', token);

    setUser(user);
    return true;
  } catch (error) {
    return false;
  }
};


  const register = async (name, email, password) => {
    if (name && email && password) {
      const mockUser = {
        id: Date.now().toString(),
        email,
        name,
        role: 'admin'
      }
      setUser(mockUser)
      localStorage.setItem('hms_user', JSON.stringify(mockUser))
      return true
    }
    return false
  }

const logout = () => {
  setUser(null);
  localStorage.removeItem('hms_user');
  localStorage.removeItem('hms_token');
};

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}
