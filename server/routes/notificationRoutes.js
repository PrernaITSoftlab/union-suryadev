import express from 'express';
import { inMemoryStore } from '../config/db.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get notifications for logged-in user
router.get('/', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const userNotifs = inMemoryStore.notifications
    .filter(n => n.user_id === userId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const unreadCount = userNotifs.filter(n => !n.is_read).length;

  res.json({
    success: true,
    unread_count: unreadCount,
    notifications: userNotifs
  });
});

// Mark notification as read
router.put('/:id/read', authenticateToken, (req, res) => {
  const notifId = parseInt(req.params.id);
  const userId = req.user.id;

  const notif = inMemoryStore.notifications.find(n => n.id === notifId && n.user_id === userId);
  if (notif) {
    notif.is_read = true;
  }

  res.json({ success: true, message: 'Notification marked as read.' });
});

// Mark all as read
router.put('/read-all', authenticateToken, (req, res) => {
  const userId = req.user.id;
  inMemoryStore.notifications
    .filter(n => n.user_id === userId)
    .forEach(n => { n.is_read = true; });

  res.json({ success: true, message: 'All notifications marked as read.' });
});

export default router;
