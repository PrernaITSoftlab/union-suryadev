import express from 'express';
import { inMemoryStore } from '../config/db.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get User Notifications & Unread Count
router.get('/my-notifications', authenticateToken, (req, res) => {
  const userNotifs = inMemoryStore.notifications.filter(n => n.user_id === req.user.id);
  const unreadCount = userNotifs.filter(n => !n.is_read).length;

  res.json({
    success: true,
    notifications: userNotifs,
    unreadCount
  });
});

// Mark single notification read
router.put('/:id/read', authenticateToken, (req, res) => {
  const notif = inMemoryStore.notifications.find(n => n.id === Number(req.params.id) && n.user_id === req.user.id);
  if (!notif) {
    return res.status(404).json({ success: false, message: 'Notification not found.' });
  }

  notif.is_read = true;
  res.json({ success: true, notification: notif });
});

// Mark all as read
router.put('/read-all', authenticateToken, (req, res) => {
  inMemoryStore.notifications
    .filter(n => n.user_id === req.user.id)
    .forEach(n => { n.is_read = true; });

  res.json({ success: true, message: 'All notifications marked as read.' });
});

export default router;
