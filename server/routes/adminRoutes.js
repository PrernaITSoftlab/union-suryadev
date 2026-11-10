import { normalizeMemberId } from '../utils/memberIdHelper.js';
import express from 'express';
import { inMemoryStore, saveUsersBackup, query } from '../config/db.js';
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
  const { search, status, circle, page, limit } = req.query;
  let members = [...inMemoryStore.users];

  if (status && status !== 'all') {
    members = members.filter(u => u.status && u.status.toLowerCase() === status.toLowerCase());
  }

  if (circle && circle !== 'all' && circle !== 'All') {
    const cLower = circle.toLowerCase();
    members = members.filter(u => {
      const p = u.profile || {};
      const uCircle = (p.circle || '').toLowerCase();
      return uCircle.includes(cLower) || cLower.includes(uCircle);
    });
  }

  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    members = members.filter(u => {
      const p = u.profile || {};
      return (u.email && u.email.toLowerCase().includes(q)) ||
             (u.member_id && u.member_id.toLowerCase().includes(q)) ||
             (p.full_name && p.full_name.toLowerCase().includes(q)) ||
             (u.full_name && u.full_name.toLowerCase().includes(q)) ||
             (p.phone && p.phone.includes(q)) ||
             (p.company && p.company.toLowerCase().includes(q));
    });
  }

  const totalCount = members.length;
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);

  let paginated = members;
  if (!isNaN(limitNum) && limitNum > 0) {
    const validPage = !isNaN(pageNum) && pageNum > 0 ? pageNum : 1;
    const startIndex = (validPage - 1) * limitNum;
    paginated = members.slice(startIndex, startIndex + limitNum);
  }

  res.json({
    success: true,
    total: totalCount,
    count: paginated.length,
    page: !isNaN(pageNum) && pageNum > 0 ? pageNum : 1,
    limit: !isNaN(limitNum) && limitNum > 0 ? limitNum : totalCount,
    totalPages: !isNaN(limitNum) && limitNum > 0 ? Math.ceil(totalCount / limitNum) : 1,
    members: paginated.map(u => ({
      id: u.id,
      email: u.email,
      role: u.role || 'user',
      status: u.status || 'active',
      employee_id: normalizeMemberId(u.member_id, u.id),
      member_id: normalizeMemberId(u.member_id, u.id),
      full_name: u.profile?.full_name || u.full_name || 'Member',
      profile: {
        ...(u.profile || {}),
        full_name: u.profile?.full_name || u.full_name || 'Member'
      }
    }))
  });
});

// 4. Admin Update Member Details & Name (/api/admin/members/:id)
router.put('/members/:id', authenticateToken, requireAdmin, async (req, res) => {
  const {
    status, role, full_name, name, fullName, email,
    designation, company, circle, union_designation, union_post,
    phone, whatsapp, member_id, address, city, district, bio
  } = req.body;

  const user = inMemoryStore.users.find(u => u.id === Number(req.params.id));
  if (!user) return res.status(404).json({ success: false, message: 'Member not found' });

  if (!user.profile) {
    user.profile = { id: user.id, user_id: user.id };
  }

  // Update name if supplied
  const newName = (full_name !== undefined ? full_name : name !== undefined ? name : fullName !== undefined ? fullName : '').trim();
  if (newName) {
    user.profile.full_name = newName;
    user.full_name = newName;
  }

  if (status) user.status = status;
  if (role) user.role = role;
  if (email) user.email = email.trim().toLowerCase();
  if (member_id) user.member_id = member_id.trim();

  if (designation !== undefined) user.profile.designation = designation;
  if (company !== undefined) user.profile.company = company;
  if (circle !== undefined) user.profile.circle = circle;
  if (union_designation !== undefined) user.profile.union_designation = union_designation;
  if (union_post !== undefined) user.profile.union_post = union_post;
  if (phone !== undefined) user.profile.phone = phone;
  if (whatsapp !== undefined) user.profile.whatsapp = whatsapp;
  if (address !== undefined) user.profile.address = address;
  if (city !== undefined) user.profile.city = city;
  if (district !== undefined) user.profile.district = district;
  if (bio !== undefined) user.profile.bio = bio;

  // Persist to users_backup.json immediately
  saveUsersBackup();

  // Try PostgreSQL safely
  try {
    await query(`
      INSERT INTO member_profiles (
        user_id, full_name, phone, designation, circle, union_designation, company, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id) DO UPDATE SET
        full_name = COALESCE(EXCLUDED.full_name, member_profiles.full_name),
        phone = COALESCE(EXCLUDED.phone, member_profiles.phone),
        designation = COALESCE(EXCLUDED.designation, member_profiles.designation),
        circle = COALESCE(EXCLUDED.circle, member_profiles.circle),
        union_designation = COALESCE(EXCLUDED.union_designation, member_profiles.union_designation),
        company = COALESCE(EXCLUDED.company, member_profiles.company),
        updated_at = CURRENT_TIMESTAMP
    `, [user.id, user.profile.full_name, user.profile.phone, user.profile.designation, user.profile.circle, user.profile.union_designation, user.profile.company]);

    if (email || member_id || role || status) {
      await query(`
        UPDATE users 
        SET email = COALESCE($1, email),
            member_id = COALESCE($2, member_id),
            role = COALESCE($3, role),
            status = COALESCE($4, status),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $5
      `, [user.email, user.member_id, user.role, user.status, user.id]);
    }
  } catch (dbErr) {
    console.warn('⚠️ Could not update member in DB from admin route:', dbErr.message);
  }

  res.json({
    success: true,
    message: 'Member details and name updated successfully!',
    user: {
      ...user,
      member_id: normalizeMemberId(user.member_id, user.id),
      full_name: user.profile.full_name
    }
  });
});

// 5. Admin Get Events (/api/admin/events)
router.get('/events', authenticateToken, requireAdmin, async (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
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
    const deleted = await EventService.deleteEvent(req.params.id);
    res.json({ success: true, message: 'Event permanently deleted from database.', deleted });
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

