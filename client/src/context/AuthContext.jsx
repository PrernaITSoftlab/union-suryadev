import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Pre-hydrate user immediately from localStorage to prevent any avatar flicker on refresh
  const [user, setUser] = useState(() => {
    try {
      const cached = localStorage.getItem('union_user');
      return cached ? JSON.parse(cached) : null;
    } catch (e) {
      return null;
    }
  });
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(!user);

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
        setUser(null);
        localStorage.removeItem('union_user');
        setLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/me');
        if (res.data.success && res.data.user) {
          setUser(res.data.user);
          localStorage.setItem('union_user', JSON.stringify(res.data.user));
        } else {
          localStorage.removeItem('union_token');
          localStorage.removeItem('union_user');
          setUser(null);
        }
      } catch (err) {
        console.error('Auth verification failed:', err);
        // Only clear if 401 unauthorized
        if (err.response?.status === 401) {
          localStorage.removeItem('union_token');
          localStorage.removeItem('union_user');
          setUser(null);
        }
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
      localStorage.setItem('union_user', JSON.stringify(res.data.user));
      setUser(res.data.user);
    }
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('union_token');
    localStorage.removeItem('union_user');
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    const res = await api.put('/members/profile/update', profileData);
    if (res.data.success) {
      setUser(prev => {
        const updated = {
          ...prev,
          profile: res.data.profile,
          ...(res.data.user || {})
        };
        localStorage.setItem('union_user', JSON.stringify(updated));
        return updated;
      });
    }
    return res.data;
  };

  const updateProfilePhoto = async (avatarUrl, targetUserId = null) => {
    const res = await api.put('/members/profile/photo', {
      avatar_url: avatarUrl,
      target_user_id: targetUserId
    });
    if (res.data.success) {
      // If updating own profile
      if (!targetUserId || (user && user.id === Number(targetUserId))) {
        setUser(prev => {
          const updated = {
            ...prev,
            profile: {
              ...(prev?.profile || {}),
              avatar_url: res.data.avatar_url
            }
          };
          localStorage.setItem('union_user', JSON.stringify(updated));
          return updated;
        });
      }
    }
    return res.data;
  };

  const resetProfilePhoto = async (targetUserId = null) => {
    const res = await api.delete('/members/profile/photo', {
      data: { target_user_id: targetUserId }
    });
    if (res.data.success) {
      if (!targetUserId || (user && user.id === Number(targetUserId))) {
        setUser(prev => {
          const updated = {
            ...prev,
            profile: {
              ...(prev?.profile || {}),
              avatar_url: res.data.avatar_url
            }
          };
          localStorage.setItem('union_user', JSON.stringify(updated));
          return updated;
        });
      }
    }
    return res.data;
  };

  const switchDemoUser = async (roleType) => {
    const targetEmail = roleType === 'admin' ? 'admin@mpvmavaksunion.org' : 'member@mpvmavaksunion.org';
    const targetPass = roleType === 'admin' ? 'admin123' : 'member123';
    try {
      const res = await login(targetEmail, targetPass);
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
      updateProfilePhoto,
      resetProfilePhoto,
      switchDemoUser,
      isAdmin: user?.role === 'admin'
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
