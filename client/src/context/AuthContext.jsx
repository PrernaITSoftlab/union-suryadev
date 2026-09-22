import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check auth status on load
  useEffect(() => {
    const fetchMe = async () => {
      const token = localStorage.getItem('union_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/me');
        if (res.data.success) {
          setUser(res.data.user);
        } else {
          localStorage.removeItem('union_token');
        }
      } catch (err) {
        console.error('Auth verification failed:', err);
        localStorage.removeItem('union_token');
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      localStorage.setItem('union_token', res.data.token);
      setUser(res.data.user);
    }
    return res.data;
  };

  const register = async (formData) => {
    const res = await api.post('/auth/register', formData);
    if (res.data.success) {
      localStorage.setItem('union_token', res.data.token);
      setUser(res.data.user);
    }
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('union_token');
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    const res = await api.put('/members/profile/update', profileData);
    if (res.data.success) {
      setUser(prev => ({
        ...prev,
        profile: res.data.profile
      }));
    }
    return res.data;
  };

  // Demo Switcher helper for user testing
  const switchDemoUser = async (roleType) => {
    const targetEmail = roleType === 'admin' ? 'admin@unionsuyradev.com' : 'priya.sharma@nexusfintech.io';
    try {
      const res = await login(targetEmail, 'password123');
      return res;
    } catch (err) {
      console.error('Demo switch failed:', err);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      updateProfile,
      switchDemoUser,
      isAdmin: user?.role === 'admin'
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
