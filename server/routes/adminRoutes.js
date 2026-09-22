import express from 'express';
import { inMemoryStore } from '../config/db.js';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply auth & admin middleware to all admin endpoints
router.use(authenticateToken);
router.use(requireAdmin);

// Analytics & Dashboard Stats
router.get('/stats', (req, res) => {
  const totalMembers = inMemoryStore.users.length;
  const activeMembers = inMemoryStore.users.filter(u => u.status === 'active').length;
  const pendingMembers = inMemoryStore.users.filter(u => u.status === 'pending').length;
  const totalConnections = inMemoryStore.connections.filter(c => c.status === 'accepted').length;
  const totalOpportunities = inMemoryStore.opportunities.length;
  const totalEvents = inMemoryStore.events.length;
  const totalRegistrations = inMemoryStore.eventRegistrations.length;

  const industryBreakdown = inMemoryStore.users.reduce((acc, u) => {
    const ind = u.profile?.industry || 'Other';
    acc[ind] = (acc[ind] || 0) + 1;
    return acc;
  }, {});

  res.json({
    success: true,
    stats: {
      totalMembers,
      activeMembers,
      pendingMembers,
      totalConnections,
      totalOpportunities,
      totalEvents,
      totalRegistrations,
      industryBreakdown
    }
  });
});

// Member Management: List all members
router.get('/members', (req, res) => {
  const members = inMemoryStore.users.map(u => ({
    id: u.id,
    email: u.email,
    role: u.role,
    status: u.status,
    created_at: u.created_at,
    profile: u.profile
  }));

  res.json({
    success: true,
    members
  });
});

// Member Management: Update user status or role
router.put('/members/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const { status, role } = req.body;

  const user = inMemoryStore.users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  if (status) user.status = status;
  if (role) user.role = role;

  res.json({
    success: true,
    message: `User #${userId} updated successfully.`,
    user
  });
});

// Event Management: Create Event
router.post('/events', (req, res) => {
  const { title, banner_url, event_date, event_time, location_type, venue, description, capacity, speaker_name, speaker_title, speaker_avatar } = req.body;

  if (!title || !event_date || !description) {
    return res.status(400).json({ success: false, message: 'Title, date, and description are required.' });
  }

  const newEvent = {
    id: inMemoryStore.events.length + 1,
    title,
    banner_url: banner_url || 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
    event_date,
    event_time: event_time || '10:00 AM IST',
    location_type: location_type || 'online',
    venue: venue || 'Union Suyradev Zoom Lounge',
    description,
    capacity: parseInt(capacity) || 100,
    registered_count: 0,
    speaker_name: speaker_name || 'Union Executive Panel',
    speaker_title: speaker_title || 'Industry Experts',
    speaker_avatar: speaker_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    status: 'upcoming',
    created_at: new Date().toISOString()
  };

  inMemoryStore.events.unshift(newEvent);

  res.status(201).json({
    success: true,
    message: 'New event created successfully!',
    event: newEvent
  });
});

// Event Management: Delete Event
router.delete('/events/:id', (req, res) => {
  const eventId = parseInt(req.params.id);
  const index = inMemoryStore.events.findIndex(e => e.id === eventId);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Event not found.' });
  }

  inMemoryStore.events.splice(index, 1);
  res.json({ success: true, message: 'Event deleted successfully.' });
});

// Event Attendees List
router.get('/events/:id/attendees', (req, res) => {
  const eventId = parseInt(req.params.id);
  const regs = inMemoryStore.eventRegistrations.filter(r => r.event_id === eventId);

  const attendees = regs.map(r => {
    const user = inMemoryStore.users.find(u => u.id === r.user_id);
    return {
      registration_id: r.id,
      registered_at: r.registered_at,
      user: user ? { id: user.id, email: user.email, profile: user.profile } : null
    };
  });

  res.json({
    success: true,
    count: attendees.length,
    attendees
  });
});

// Opportunity Management: Toggle featured / approve
router.put('/opportunities/:id', (req, res) => {
  const oppId = parseInt(req.params.id);
  const { is_featured, status } = req.body;

  const opp = inMemoryStore.opportunities.find(o => o.id === oppId);
  if (!opp) {
    return res.status(404).json({ success: false, message: 'Opportunity not found.' });
  }

  if (is_featured !== undefined) opp.is_featured = is_featured;
  if (status !== undefined) opp.status = status;

  res.json({ success: true, message: 'Opportunity updated successfully.', opportunity: opp });
});

// Opportunity Management: Delete
router.delete('/opportunities/:id', (req, res) => {
  const oppId = parseInt(req.params.id);
  const index = inMemoryStore.opportunities.findIndex(o => o.id === oppId);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Opportunity not found.' });
  }

  inMemoryStore.opportunities.splice(index, 1);
  res.json({ success: true, message: 'Opportunity deleted.' });
});

export default router;
