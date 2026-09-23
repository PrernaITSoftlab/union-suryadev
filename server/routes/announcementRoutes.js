import express from 'express';
import { inMemoryStore } from '../config/db.js';
import { authenticateToken, requireAdmin, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// 1. Get Announcements Feed
router.get('/list', optionalAuth, (req, res) => {
  const { type, priority, search } = req.query;
  let announcements = inMemoryStore.announcements.filter(a => a.status === 'PUBLISHED');

  if (type) {
    announcements = announcements.filter(a => a.type.toUpperCase() === type.toUpperCase());
  }

  if (priority) {
    announcements = announcements.filter(a => a.priority.toUpperCase() === priority.toUpperCase());
  }

  if (search) {
    const q = search.toLowerCase();
    announcements = announcements.filter(a => 
      a.title.toLowerCase().includes(q) ||
      a.description.toLowerCase().includes(q)
    );
  }

  res.json({
    success: true,
    announcements
  });
});

// 2. Get Active Top-Screen Popup Banner Announcements (For logged-in & public users)
router.get('/active-popups', optionalAuth, (req, res) => {
  const activePopups = inMemoryStore.announcements.filter(a => 
    a.status === 'PUBLISHED' && 
    a.is_popup === true
  );

  res.json({
    success: true,
    popups: activePopups
  });
});

// 3. Create & Broadcast Announcement (Admin)
router.post('/admin/create', authenticateToken, requireAdmin, (req, res) => {
  const {
    title, description, type, priority, attachment_url, start_date,
    expiry_date, target_audience, is_popup, status
  } = req.body;

  if (!title || !description) {
    return res.status(400).json({ success: false, message: 'Title and Description are required.' });
  }

  const newAnnouncement = {
    id: inMemoryStore.announcements.length + 1,
    title: title.trim(),
    description: description.trim(),
    type: (type || 'GENERAL').toUpperCase(),
    priority: (priority || 'NORMAL').toUpperCase(),
    attachment_url: attachment_url || '',
    start_date: start_date || new Date().toISOString().split('T')[0],
    expiry_date: expiry_date || '',
    target_audience: target_audience || 'ALL_MEMBERS',
    is_popup: is_popup !== undefined ? Boolean(is_popup) : true,
    status: status || 'PUBLISHED',
    created_by: req.user.id,
    created_at: new Date().toISOString()
  };

  inMemoryStore.announcements.unshift(newAnnouncement);

  // Broadcast persistent notifications to all users
  if (newAnnouncement.status === 'PUBLISHED') {
    inMemoryStore.users.forEach(u => {
      inMemoryStore.notifications.unshift({
        id: inMemoryStore.notifications.length + 1,
        user_id: u.id,
        announcement_id: newAnnouncement.id,
        title: `${newAnnouncement.priority === 'CRITICAL' ? '⚠️ URGENT NOTICE: ' : ''}${newAnnouncement.title}`,
        message: newAnnouncement.description.substring(0, 140) + '...',
        type: newAnnouncement.type,
        link: '/dashboard/announcements',
        is_read: false,
        created_at: new Date().toISOString()
      });
    });
  }

  res.status(201).json({
    success: true,
    message: 'Announcement published & broadcasted successfully.',
    announcement: newAnnouncement
  });
});

export default router;
