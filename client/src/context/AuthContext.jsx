import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch settings & authenticate user on initial load
  useEffect(() => {
    const initAuth = async () => {
      try {
        const settingsRes = await api.get('/settings/public');
        if (settingsRes.data.success) {
          setSettings(settingsRes.data.settings);
        }
      } catch (err) {
        console.warn('Failed to fetch public settings:', err);
      }

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

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
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

  const switchDemoUser = async (roleType) => {
    const targetEmail = roleType === 'admin' ? 'admin@mpwzunion.org' : 'sunita.chouhan@mpwzunion.org';
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
      settings,
      loading,
      login,
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
