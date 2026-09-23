import express from 'express';
import { inMemoryStore } from '../config/db.js';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// 1. Submit Public Contact Form Inquiry
router.post('/submit', (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: 'Name, Email, and Message are required.' });
  }

  const newSubmission = {
    id: inMemoryStore.contactSubmissions.length + 1,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone || '',
    subject: subject || 'General Inquiry',
    message: message.trim(),
    status: 'PENDING',
    created_at: new Date().toISOString()
  };

  inMemoryStore.contactSubmissions.unshift(newSubmission);

  // Notify Admin
  inMemoryStore.notifications.unshift({
    id: inMemoryStore.notifications.length + 1,
    user_id: 1,
    title: 'New Public Contact Inquiry',
    message: `${name} (${subject}) submitted a contact message.`,
    type: 'INFO',
    link: '/admin/contact',
    is_read: false,
    created_at: new Date().toISOString()
  });

  res.status(201).json({
    success: true,
    message: 'Your inquiry has been submitted successfully! Union representative will contact you soon.'
  });
});

// 2. List Contact Inquiries (Admin)
router.get('/admin/list', authenticateToken, requireAdmin, (req, res) => {
  res.json({
    success: true,
    inquiries: inMemoryStore.contactSubmissions
  });
});

// 3. Update Contact Inquiry Status (Admin)
router.put('/admin/:id/status', authenticateToken, requireAdmin, (req, res) => {
  const { status } = req.body;
  const inquiry = inMemoryStore.contactSubmissions.find(i => i.id === Number(req.params.id));
  if (!inquiry) {
    return res.status(404).json({ success: false, message: 'Inquiry not found.' });
  }

  inquiry.status = status || 'REVIEWED';
  res.json({ success: true, message: 'Inquiry status updated.', inquiry });
});

export default router;
