import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const ConnectionContext = createContext();

export const ConnectionProvider = ({ children }) => {
  const { user } = useAuth();
  const [connections, setConnections] = useState([]);
  const [pendingIncoming, setPendingIncoming] = useState([]);
  const [pendingSent, setPendingSent] = useState([]);
  const [suggested, setSuggested] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchConnections = useCallback(async () => {
    if (!user) {
      setConnections([]);
      setPendingIncoming([]);
      setPendingSent([]);
      setSuggested([]);
      return;
    }

    setLoading(true);
    try {
      const [connRes, sugRes] = await Promise.all([
        api.get('/connections'),
        api.get('/connections/suggested')
      ]);

      if (connRes.data.success) {
        setConnections(connRes.data.accepted || []);
        setPendingIncoming(connRes.data.pending_incoming || []);
        setPendingSent(connRes.data.pending_sent || []);
      }

      if (sugRes.data.success) {
        setSuggested(sugRes.data.suggested || []);
      }
    } catch (err) {
      console.error('Error fetching connections:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  const sendConnectRequest = async (targetUserId) => {
    const res = await api.post('/connections/request', { target_user_id: targetUserId });
    if (res.data.success) {
      await fetchConnections();
    }
    return res.data;
  };

  const respondConnectRequest = async (connectionId, action) => {
    const res = await api.post('/connections/respond', { connection_id: connectionId, action });
    if (res.data.success) {
      await fetchConnections();
    }
    return res.data;
  };

  return (
    <ConnectionContext.Provider value={{
      connections,
      pendingIncoming,
      pendingSent,
      suggested,
      loading,
      refreshConnections: fetchConnections,
      sendConnectRequest,
      respondConnectRequest
    }}>
      {children}
    </ConnectionContext.Provider>
  );
};

export const useConnections = () => useContext(ConnectionContext);
