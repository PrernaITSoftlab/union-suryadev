import express from 'express';
import { inMemoryStore } from '../config/db.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get connections for logged-in user
router.get('/', authenticateToken, (req, res) => {
  const userId = req.user.id;

  // Accepted connections
  const acceptedConns = inMemoryStore.connections.filter(
    c => (c.requester_id === userId || c.addressee_id === userId) && c.status === 'accepted'
  );

  const connectedUserIds = acceptedConns.map(c => 
    c.requester_id === userId ? c.addressee_id : c.requester_id
  );

  const connectedMembers = inMemoryStore.users
    .filter(u => connectedUserIds.includes(u.id))
    .map(u => ({
      id: u.id,
      email: u.email,
      profile: u.profile
    }));

  // Pending incoming requests
  const pendingIncoming = inMemoryStore.connections
    .filter(c => c.addressee_id === userId && c.status === 'pending')
    .map(c => {
      const requester = inMemoryStore.users.find(u => u.id === c.requester_id);
      return {
        connection_id: c.id,
        created_at: c.created_at,
        requester: requester ? { id: requester.id, email: requester.email, profile: requester.profile } : null
      };
    });

  // Pending sent requests
  const pendingSent = inMemoryStore.connections
    .filter(c => c.requester_id === userId && c.status === 'pending')
    .map(c => {
      const addressee = inMemoryStore.users.find(u => u.id === c.addressee_id);
      return {
        connection_id: c.id,
        created_at: c.created_at,
        addressee: addressee ? { id: addressee.id, email: addressee.email, profile: addressee.profile } : null
      };
    });

  res.json({
    success: true,
    accepted: connectedMembers,
    pending_incoming: pendingIncoming,
    pending_sent: pendingSent
  });
});

// Send connection request
router.post('/request', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { target_user_id } = req.body;

  if (!target_user_id) {
    return res.status(400).json({ success: false, message: 'Target user ID is required.' });
  }

  if (target_user_id === userId) {
    return res.status(400).json({ success: false, message: 'You cannot connect with yourself.' });
  }

  const targetUser = inMemoryStore.users.find(u => u.id === target_user_id);
  if (!targetUser) {
    return res.status(404).json({ success: false, message: 'Target user not found.' });
  }

  // Check existing connection or request
  const existing = inMemoryStore.connections.find(
    c => (c.requester_id === userId && c.addressee_id === target_user_id) ||
         (c.requester_id === target_user_id && c.addressee_id === userId)
  );

  if (existing) {
    if (existing.status === 'accepted') {
      return res.status(400).json({ success: false, message: 'You are already connected with this member.' });
    } else {
      return res.status(400).json({ success: false, message: 'A connection request is already pending.' });
    }
  }

  const newConn = {
    id: inMemoryStore.connections.length + 1,
    requester_id: userId,
    addressee_id: target_user_id,
    status: 'pending',
    created_at: new Date().toISOString()
  };

  inMemoryStore.connections.push(newConn);

  // Notify target user
  const requesterObj = inMemoryStore.users.find(u => u.id === userId);
  inMemoryStore.notifications.push({
    id: inMemoryStore.notifications.length + 1,
    user_id: target_user_id,
    title: "New Connection Request",
    message: `${requesterObj?.profile?.full_name || 'A professional'} wants to connect with you on Union Suyradev.`,
    type: "connection",
    link: "/dashboard",
    is_read: false,
    created_at: new Date().toISOString()
  });

  res.json({
    success: true,
    message: 'Connection request sent successfully!',
    connection: newConn
  });
});

// Respond to connection request (accept/decline)
router.post('/respond', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { connection_id, action } = req.body; // action: 'accept' or 'decline'

  const connIndex = inMemoryStore.connections.findIndex(c => c.id === connection_id && c.addressee_id === userId);
  if (connIndex === -1) {
    return res.status(404).json({ success: false, message: 'Connection request not found.' });
  }

  const conn = inMemoryStore.connections[connIndex];

  if (action === 'accept') {
    conn.status = 'accepted';
    conn.updated_at = new Date().toISOString();

    // Notify requester
    const accepter = inMemoryStore.users.find(u => u.id === userId);
    inMemoryStore.notifications.push({
      id: inMemoryStore.notifications.length + 1,
      user_id: conn.requester_id,
      title: "Connection Accepted! 🎉",
      message: `${accepter?.profile?.full_name || 'Member'} accepted your connection request. Start collaborating!`,
      type: "connection",
      link: "/connections",
      is_read: false,
      created_at: new Date().toISOString()
    });

    return res.json({ success: true, message: 'Connection request accepted.' });
  } else {
    inMemoryStore.connections.splice(connIndex, 1);
    return res.json({ success: true, message: 'Connection request declined.' });
  }
});

// Get suggested connections
router.get('/suggested', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const currentUser = inMemoryStore.users.find(u => u.id === userId);

  // Existing connection user IDs
  const existingUserIds = inMemoryStore.connections
    .filter(c => c.requester_id === userId || c.addressee_id === userId)
    .map(c => (c.requester_id === userId ? c.addressee_id : c.requester_id));

  existingUserIds.push(userId); // exclude self

  // Recommend users in similar industry or with common skills
  const suggestions = inMemoryStore.users
    .filter(u => u.status === 'active' && !existingUserIds.includes(u.id))
    .slice(0, 6)
    .map(u => ({
      id: u.id,
      email: u.email,
      profile: u.profile,
      match_reason: u.profile.industry === currentUser?.profile?.industry 
        ? `Same Industry: ${u.profile.industry}` 
        : 'Recommended Professional'
    }));

  res.json({
    success: true,
    suggested: suggestions
  });
});

export default router;
