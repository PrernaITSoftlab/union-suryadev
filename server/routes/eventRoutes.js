import express from 'express';
import { EventService } from '../services/eventService.js';
import { authenticateToken, requireAdmin, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

const setNoCacheHeaders = (res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
};

// 0. Get All Public & Active Events (Base Root Route)
router.get('/', optionalAuth, async (req, res) => {
  setNoCacheHeaders(res);
  try {
    const isPublicOnly = req.query.isPublicOnly === 'true';
    const events = await EventService.getAllEvents({
      isPublicOnly,
      userId: req.user?.id
    });
    res.json({ success: true, events });
  } catch (err) {
    console.error('Error fetching root events:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch events.' });
  }
});

// 1. Get All Events with filters (List Route)
router.get('/list', optionalAuth, async (req, res) => {
  setNoCacheHeaders(res);
  try {
    const { status, search, type } = req.query;
    const isPublicOnly = req.query.isPublicOnly === 'true';
    const events = await EventService.getAllEvents({
      status,
      search,
      type,
      isPublicOnly,
      userId: req.user?.id
    });

    res.json({
      success: true,
      events
    });
  } catch (err) {
    console.error('Error fetching events list:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch events list.' });
  }
});

// 1.1 Get Authenticated Member's Event Registrations
router.get('/my-registrations', authenticateToken, async (req, res) => {
  try {
    const registrations = await EventService.getMyRegistrations(req.user.id);
    res.json({
      success: true,
      registrations
    });
  } catch (err) {
    console.error('Error fetching member registrations:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch member event registrations.' });
  }
});

// 2. Get Single Event Details
router.get('/:id', optionalAuth, async (req, res) => {
  setNoCacheHeaders(res);
  try {
    const event = await EventService.getEventById(req.params.id, req.user?.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    res.json({
      success: true,
      event
    });
  } catch (err) {
    console.error('Error fetching event details:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch event.' });
  }
});

// 3. Create Event (Admin)
router.post('/admin/create', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, start_date, venue } = req.body;

    if (!title || !start_date || !venue) {
      return res.status(400).json({ success: false, message: 'Title, Start Date, and Venue are required.' });
    }

    const newEvent = await EventService.createEvent(req.body, req.user.id);

    res.status(201).json({
      success: true,
      message: 'Event created and saved permanently to database.',
      event: newEvent
    });
  } catch (err) {
    console.error('Error creating event:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to create event.' });
  }
});

// 4. Update Event (Admin)
router.put('/admin/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const updated = await EventService.updateEvent(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    res.json({
      success: true,
      message: 'Event updated and saved permanently to database.',
      event: updated
    });
  } catch (err) {
    console.error('Error updating event:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to update event.' });
  }
});

// 5. Join Event / Event Registration Request (Authenticated Member)
router.post('/:id/register', authenticateToken, async (req, res) => {
  try {
    const registration = await EventService.registerForEvent(req.params.id, req.user, req.body);

    const event = await EventService.getEventById(req.params.id);
    res.status(201).json({
      success: true,
      message: event?.is_paid
        ? 'Event payment details submitted! Admin will verify your payment and approve your join request.'
        : 'Your request to join this event has been submitted! Admin will review and approve your request.',
      registration
    });
  } catch (err) {
    if (err.existing) {
      return res.status(400).json({
        success: false,
        message: err.message,
        registration: err.existing
      });
    }
    res.status(400).json({ success: false, message: err.message || 'Registration failed.' });
  }
});

// 6. Get Admin Event Registrations List
router.get('/admin/registrations/list', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { event_id } = req.query;
    const registrations = await EventService.getAdminRegistrations(event_id || null);
    res.json({
      success: true,
      registrations
    });
  } catch (err) {
    console.error('Error fetching registrations:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch registrations.' });
  }
});

// 6.1 Admin Approve Event Registration
router.put('/admin/registrations/:id/approve', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const registration = await EventService.approveRegistration(req.params.id, req.user);
    res.json({
      success: true,
      message: 'Member join request approved successfully!',
      registration
    });
  } catch (err) {
    console.error('Error approving registration:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to approve registration.' });
  }
});

// 6.2 Admin Reject Event Registration
router.put('/admin/registrations/:id/reject', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { rejection_reason } = req.body || {};
    const registration = await EventService.rejectRegistration(req.params.id, req.user, rejection_reason);
    res.json({
      success: true,
      message: 'Member join request rejected.',
      registration
    });
  } catch (err) {
    console.error('Error rejecting registration:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to reject registration.' });
  }
});

// 6.3 Admin Set Registration Status (Generic Status Handler)
router.put('/admin/registrations/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status, rejection_reason } = req.body || {};
    let registration;
    if (status === 'CONFIRMED' || status === 'APPROVED') {
      registration = await EventService.approveRegistration(req.params.id, req.user);
    } else if (status === 'REJECTED') {
      registration = await EventService.rejectRegistration(req.params.id, req.user, rejection_reason);
    } else {
      return res.status(400).json({ success: false, message: 'Invalid status. Must be CONFIRMED or REJECTED.' });
    }

    res.json({
      success: true,
      message: `Registration status updated to ${status}.`,
      registration
    });
  } catch (err) {
    console.error('Error updating registration status:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to update registration status.' });
  }
});

const handleDeleteEventRoute = async (req, res) => {
  try {
    const deleted = await EventService.deleteEvent(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    res.json({
      success: true,
      message: 'Event deleted permanently from database.',
      deleted
    });
  } catch (err) {
    console.error('Error deleting event:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to delete event.' });
  }
};

// 7. Delete Event (Admin) - both /events/admin/:id and /events/:id supported
router.delete('/admin/:id', authenticateToken, requireAdmin, handleDeleteEventRoute);
router.delete('/:id', authenticateToken, requireAdmin, handleDeleteEventRoute);

// 8. Toggle Like on Event (Authenticated User)
router.post('/:id/like', authenticateToken, async (req, res) => {
  try {
    const result = await EventService.toggleLike(req.params.id, req.user);
    res.json({
      success: true,
      ...result
    });
  } catch (err) {
    console.error('Error toggling like:', err);
    res.status(500).json({ success: false, message: 'Failed to update like status.' });
  }
});

// 9. Get Event Comments List
router.get('/:id/comments', optionalAuth, async (req, res) => {
  try {
    const comments = await EventService.getComments(req.params.id);
    res.json({
      success: true,
      comments
    });
  } catch (err) {
    console.error('Error fetching comments:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch comments.' });
  }
});

// 10. Post New Comment to Event (Authenticated User)
router.post('/:id/comments', authenticateToken, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Comment content cannot be empty.' });
    }

    const result = await EventService.addComment(req.params.id, req.user, content);
    res.status(201).json({
      success: true,
      message: 'Comment posted successfully.',
      ...result
    });
  } catch (err) {
    console.error('Error adding comment:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to post comment.' });
  }
});

// 11. Delete Comment (Author or Admin)
router.delete('/comments/:commentId', authenticateToken, async (req, res) => {
  try {
    await EventService.deleteComment(req.params.commentId, req.user);
    res.json({
      success: true,
      message: 'Comment deleted successfully.'
    });
  } catch (err) {
    console.error('Error deleting comment:', err);
    res.status(500).json({ success: false, message: 'Failed to delete comment.' });
  }
});

export default router;
