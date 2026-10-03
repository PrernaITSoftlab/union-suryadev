import express from 'express';
import { inMemoryStore } from '../config/db.js';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// 1. Get Admin Dashboard Analytics Overview
router.get('/dashboard-analytics', authenticateToken, requireAdmin, (req, res) => {
  const totalMembers = inMemoryStore.users.length;
  const activeMembers = inMemoryStore.users.filter(u => u.status === 'active').length;
  const pendingApplications = inMemoryStore.membershipApplications.filter(a => a.application_status === 'PENDING').length;
  const pendingApprovals = inMemoryStore.membershipApplications.filter(a => a.application_status === 'PENDING').length;
  const pendingPayments = inMemoryStore.payments.filter(p => p.status === 'SUBMITTED' || p.status === 'PENDING').length;
  const upcomingEvents = inMemoryStore.events.filter(e => e.status === 'PUBLISHED' || e.status === 'REGISTRATION_OPEN').length;
  const totalEventRegistrations = inMemoryStore.eventRegistrations.length;
  const totalAnnouncements = inMemoryStore.announcements.length;
  const totalStories = inMemoryStore.unionStories.length;
  const totalContactRequests = inMemoryStore.contactSubmissions.length;

  const recentActivity = inMemoryStore.auditLogs.slice(0, 10);

  res.json({
    success: true,
    stats: {
      totalMembers,
      activeMembers,
      pendingApplications,
      pendingApprovals,
      pendingPayments,
      upcomingEvents,
      totalEventRegistrations,
      totalAnnouncements,
      totalStories,
      totalContactRequests
    },
    recentActivity
  });
});

// 2. Get Audit Logs
router.get('/audit-logs', authenticateToken, requireAdmin, (req, res) => {
  res.json({
    success: true,
    logs: inMemoryStore.auditLogs
  });
});

// 3. Admin Members List Alias (/api/admin/members)
router.get('/members', authenticateToken, requireAdmin, (req, res) => {
  res.json({
    success: true,
    members: inMemoryStore.users.map(u => ({
      id: u.id,
      email: u.email,
      role: u.role,
      status: u.status,
      employee_id: u.member_id,
      profile: u.profile
    }))
  });
});

// 4. Admin Change Member Role & Status (/api/admin/members/:id)
router.put('/members/:id', authenticateToken, requireAdmin, (req, res) => {
  const { status, role } = req.body;
  const user = inMemoryStore.users.find(u => u.id === Number(req.params.id));
  if (!user) return res.status(404).json({ success: false, message: 'Member not found' });
  if (status) user.status = status;
  if (role) user.role = role;
  res.json({ success: true, message: 'Member updated successfully', user });
});

// 5. Admin Get Events (/api/admin/events)
router.get('/events', authenticateToken, requireAdmin, (req, res) => {
  res.json({ success: true, events: inMemoryStore.events });
});

// 5.1 Admin Create Event (/api/admin/events)
router.post('/events', authenticateToken, requireAdmin, (req, res) => {
  const newEvt = {
    id: inMemoryStore.events.length + 1,
    ...req.body,
    created_at: new Date().toISOString()
  };
  inMemoryStore.events.unshift(newEvt);
  res.status(201).json({ success: true, message: 'Event created successfully', event: newEvt });
});

// 6. Admin Delete Event (/api/admin/events/:id)
router.delete('/events/:id', authenticateToken, requireAdmin, (req, res) => {
  inMemoryStore.events = inMemoryStore.events.filter(e => e.id !== Number(req.params.id));
  res.json({ success: true, message: 'Event deleted successfully' });
});

// 7. Admin Event Attendees (/api/admin/events/:id/attendees)
router.get('/events/:id/attendees', authenticateToken, requireAdmin, (req, res) => {
  const attendees = inMemoryStore.eventRegistrations.filter(r => r.event_id === Number(req.params.id));
  res.json({ success: true, attendees });
});

// 8. Admin Opportunities (/api/admin/opportunities)
router.get('/opportunities', authenticateToken, requireAdmin, (req, res) => {
  res.json({ success: true, opportunities: [] });
});

router.put('/opportunities/:id', authenticateToken, requireAdmin, (req, res) => {
  res.json({ success: true, message: 'Opportunity updated successfully' });
});

router.delete('/opportunities/:id', authenticateToken, requireAdmin, (req, res) => {
  res.json({ success: true, message: 'Opportunity deleted successfully' });
});

export default router;

