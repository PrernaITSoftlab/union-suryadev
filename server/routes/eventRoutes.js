import express from 'express';
import { inMemoryStore } from '../config/db.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get list of events
router.get('/', (req, res) => {
  const { type, search } = req.query;

  let list = [...inMemoryStore.events];

  if (type && type !== 'All') {
    list = list.filter(e => e.location_type === type);
  }

  if (search) {
    const term = search.toLowerCase();
    list = list.filter(e => 
      e.title.toLowerCase().includes(term) ||
      e.description.toLowerCase().includes(term) ||
      e.speaker_name.toLowerCase().includes(term)
    );
  }

  res.json({
    success: true,
    count: list.length,
    events: list
  });
});

// Get single event with user registration status
router.get('/:id', (req, res) => {
  const eventId = parseInt(req.params.id);
  const event = inMemoryStore.events.find(e => e.id === eventId);

  if (!event) {
    return res.status(404).json({ success: false, message: 'Event not found.' });
  }

  res.json({
    success: true,
    event
  });
});

// Register / RSVP for event
router.post('/:id/register', authenticateToken, (req, res) => {
  const eventId = parseInt(req.params.id);
  const userId = req.user.id;

  const event = inMemoryStore.events.find(e => e.id === eventId);
  if (!event) {
    return res.status(404).json({ success: false, message: 'Event not found.' });
  }

  const existing = inMemoryStore.eventRegistrations.find(
    r => r.event_id === eventId && r.user_id === userId
  );

  if (existing) {
    return res.status(400).json({ success: false, message: 'You have already registered for this event!' });
  }

  inMemoryStore.eventRegistrations.push({
    id: inMemoryStore.eventRegistrations.length + 1,
    event_id: eventId,
    user_id: userId,
    registered_at: new Date().toISOString()
  });

  event.registered_count = (event.registered_count || 0) + 1;

  // Add confirmation notification
  inMemoryStore.notifications.push({
    id: inMemoryStore.notifications.length + 1,
    user_id: userId,
    title: "Event Registration Confirmed!",
    message: `You are confirmed for "${event.title}" on ${event.event_date}.`,
    type: "event",
    link: `/events/${event.id}`,
    is_read: false,
    created_at: new Date().toISOString()
  });

  res.json({
    success: true,
    message: `Registration confirmed for ${event.title}!`,
    event
  });
});

export default router;
