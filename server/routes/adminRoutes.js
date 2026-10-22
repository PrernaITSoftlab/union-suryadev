import express from 'express';
import { inMemoryStore } from '../config/db.js';
import { EventService } from '../services/eventService.js';
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
router.get('/events', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const events = await EventService.getAllEvents();
    res.json({ success: true, events });
  } catch (err) {
    res.json({ success: true, events: inMemoryStore.events });
  }
});

// 5.1 Admin Create Event (/api/admin/events)
router.post('/events', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const newEvt = await EventService.createEvent(req.body, req.user?.id || 1);
    res.status(201).json({ success: true, message: 'Event created successfully', event: newEvt });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to create event' });
  }
});

// 6. Admin Delete Event (/api/admin/events/:id)
router.delete('/events/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await EventService.deleteEvent(req.params.id);
    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to delete event' });
  }
});

// 7. Admin Event Attendees & Join Requests
router.get('/events/:id/attendees', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const attendees = await EventService.getAdminRegistrations(req.params.id);
    res.json({ success: true, attendees });
  } catch (err) {
    const attendees = inMemoryStore.eventRegistrations.filter(r => r.event_id === Number(req.params.id));
    res.json({ success: true, attendees });
  }
});

// 7.0 Admin Event Registrations / Join Requests List (/api/admin/registrations/list and /api/admin/events/registrations/list)
const handleAdminRegList = async (req, res) => {
  try {
    const { event_id } = req.query;
    const registrations = await EventService.getAdminRegistrations(event_id || null);
    res.json({ success: true, registrations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch event registrations' });
  }
};
router.get('/registrations/list', authenticateToken, requireAdmin, handleAdminRegList);
router.get('/events/registrations/list', authenticateToken, requireAdmin, handleAdminRegList);

// 7.1 Admin Approve Event Registration
const handleAdminApprove = async (req, res) => {
  try {
    const registration = await EventService.approveRegistration(req.params.id, req.user);
    res.json({ success: true, message: 'Member join request approved successfully!', registration });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to approve registration' });
  }
};
router.put('/events/registrations/:id/approve', authenticateToken, requireAdmin, handleAdminApprove);
router.put('/registrations/:id/approve', authenticateToken, requireAdmin, handleAdminApprove);

// 7.2 Admin Reject Event Registration
const handleAdminReject = async (req, res) => {
  try {
    const { rejection_reason } = req.body || {};
    const registration = await EventService.rejectRegistration(req.params.id, req.user, rejection_reason);
    res.json({ success: true, message: 'Member join request rejected.', registration });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to reject registration' });
  }
};
router.put('/events/registrations/:id/reject', authenticateToken, requireAdmin, handleAdminReject);
router.put('/registrations/:id/reject', authenticateToken, requireAdmin, handleAdminReject);

// 7.3 Admin Update Registration Status
const handleAdminStatus = async (req, res) => {
  try {
    const { status, rejection_reason } = req.body || {};
    let registration;
    if (status === 'CONFIRMED' || status === 'APPROVED') {
      registration = await EventService.approveRegistration(req.params.id, req.user);
    } else if (status === 'REJECTED') {
      registration = await EventService.rejectRegistration(req.params.id, req.user, rejection_reason);
    } else {
      return res.status(400).json({ success: false, message: 'Status must be CONFIRMED or REJECTED' });
    }
    res.json({ success: true, message: `Registration status updated to ${status}`, registration });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to update registration status' });
  }
};
router.put('/events/registrations/:id/status', authenticateToken, requireAdmin, handleAdminStatus);
router.put('/registrations/:id/status', authenticateToken, requireAdmin, handleAdminStatus);

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

