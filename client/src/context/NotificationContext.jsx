import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activePopups, setActivePopups] = useState([]);
  const [dismissedPopupIds, setDismissedPopupIds] = useState([]);

  // Fetch notifications & active popups
  const fetchNotifications = async () => {
    try {
      // Top active popups for all visitors/users
      const popupsRes = await api.get('/announcements/active-popups');
      if (popupsRes.data.success) {
        setActivePopups(popupsRes.data.popups);
      }

      // User specific notifications if logged in
      if (user) {
        const notifRes = await api.get('/notifications/my-notifications');
        if (notifRes.data.success) {
          setNotifications(notifRes.data.notifications);
          setUnreadCount(notifRes.data.unreadCount);
        }
      }
    } catch (err) {
      console.warn('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // 15s refresh
    return () => clearInterval(interval);
  }, [user]);

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  const dismissPopup = (id) => {
    setDismissedPopupIds(prev => [...prev, id]);
  };

  // Filter out popups user manually dismissed
  const visiblePopups = activePopups.filter(p => !dismissedPopupIds.includes(p.id));

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      visiblePopups,
      markAsRead,
      markAllAsRead,
      dismissPopup,
      refreshNotifications: fetchNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
