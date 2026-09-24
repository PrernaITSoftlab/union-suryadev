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

export default router;
