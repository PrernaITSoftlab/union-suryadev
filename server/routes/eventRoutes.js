import express from 'express';
import { inMemoryStore } from '../config/db.js';
import { authenticateToken, requireAdmin, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// 1. Get All Public & Active Events
router.get('/list', optionalAuth, (req, res) => {
  const { status, search, type } = req.query;
  let eventsList = [...inMemoryStore.events];

  // If unauthenticated, return only PUBLISHED / REGISTRATION_OPEN events marked as PUBLIC
  if (!req.user) {
    eventsList = eventsList.filter(e => e.visibility === 'PUBLIC');
  }

  if (status) {
    eventsList = eventsList.filter(e => e.status.toUpperCase() === status.toUpperCase());
  }

  if (type) {
    eventsList = eventsList.filter(e => e.event_type.toUpperCase() === type.toUpperCase());
  }

  if (search) {
    const q = search.toLowerCase();
    eventsList = eventsList.filter(e => 
      e.title.toLowerCase().includes(q) ||
      e.venue.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q)
    );
  }

  // Attach current user's registration status if logged in
  const enriched = eventsList.map(e => {
    let userRegistration = null;
    if (req.user) {
      userRegistration = inMemoryStore.eventRegistrations.find(r => r.event_id === e.id && r.user_id === req.user.id);
    }
    return {
      ...e,
      user_registration: userRegistration || null
    };
  });

  res.json({
    success: true,
    events: enriched
  });
});

// 2. Get Single Event Details
router.get('/:id', optionalAuth, (req, res) => {
  const event = inMemoryStore.events.find(e => e.id === Number(req.params.id));
  if (!event) {
    return res.status(404).json({ success: false, message: 'Event not found.' });
  }

  let userRegistration = null;
  if (req.user) {
    userRegistration = inMemoryStore.eventRegistrations.find(r => r.event_id === event.id && r.user_id === req.user.id);
  }

  res.json({
    success: true,
    event: {
      ...event,
      user_registration: userRegistration || null
    }
  });
});

// 3. Create Event (Admin)
router.post('/admin/create', authenticateToken, requireAdmin, (req, res) => {
  const {
    title, description, banner_url, event_type, start_date, end_date,
    start_time, end_time, venue, address, capacity, registration_start_date,
    registration_end_date, is_paid, event_fee, payment_qr_url, payment_instructions,
    whatsapp_contact, visibility, status
  } = req.body;

  if (!title || !start_date || !venue) {
    return res.status(400).json({ success: false, message: 'Title, Start Date, and Venue are required.' });
  }

  const defaultQr = inMemoryStore.systemSettings.default_event_qr_url || "/images/payment-qr.png";

  const newEvent = {
    id: inMemoryStore.events.length + 1,
    title: title.trim(),
    description: description || '',
    banner_url: banner_url || 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
    event_type: event_type || 'GENERAL',
    start_date,
    end_date: end_date || start_date,
    start_time: start_time || '10:00 AM',
    end_time: end_time || '05:00 PM',
    venue: venue.trim(),
    address: address || venue,
    capacity: Number(capacity) || 500,
    registered_count: 0,
    registration_start_date: registration_start_date || new Date().toISOString().split('T')[0],
    registration_end_date: registration_end_date || start_date,
    is_paid: Boolean(is_paid),
    event_fee: is_paid ? Number(event_fee) : 0,
    payment_qr_url: payment_qr_url || defaultQr,
    payment_instructions: payment_instructions || 'Pay fee using QR code and submit UTR number.',
    whatsapp_contact: whatsapp_contact || inMemoryStore.systemSettings.payment_whatsapp_number || '+91 98260 11223',
    visibility: visibility || 'PUBLIC',
    status: status || 'REGISTRATION_OPEN',
    created_by: req.user.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  inMemoryStore.events.unshift(newEvent);

  res.status(201).json({
    success: true,
    message: 'Event created successfully.',
    event: newEvent
  });
});

// 4. Update Event (Admin)
router.put('/admin/:id', authenticateToken, requireAdmin, (req, res) => {
  const event = inMemoryStore.events.find(e => e.id === Number(req.params.id));
  if (!event) {
    return res.status(404).json({ success: false, message: 'Event not found.' });
  }

  Object.assign(event, req.body, { updated_at: new Date().toISOString() });

  res.json({
    success: true,
    message: 'Event updated successfully.',
    event
  });
});

// 5. Join Event / Event Registration (Authenticated Member)
router.post('/:id/register', authenticateToken, (req, res) => {
  const eventId = Number(req.params.id);
  const event = inMemoryStore.events.find(e => e.id === eventId);
  if (!event) {
    return res.status(404).json({ success: false, message: 'Event not found.' });
  }

  if (event.status === 'COMPLETED' || event.status === 'CANCELLED') {
    return res.status(400).json({ success: false, message: 'Registrations are closed for this event.' });
  }

  // Prevent duplicate registration
  const existing = inMemoryStore.eventRegistrations.find(r => r.event_id === eventId && r.user_id === req.user.id);
  if (existing) {
    return res.status(400).json({ success: false, message: 'You have already registered for this event.', registration: existing });
  }

  const { transaction_id, payment_proof_url } = req.body;
  const pass_code = `PASS-${(event.title || 'EVT').substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

  let registrationStatus = 'CONFIRMED';
  let paymentStatus = 'CONFIRMED';

  if (event.is_paid && event.event_fee > 0) {
    if (!transaction_id) {
      return res.status(400).json({ success: false, message: 'Payment Transaction ID / UTR is required for paid events.' });
    }
    registrationStatus = 'PENDING';
    paymentStatus = 'PAYMENT_PENDING';
  }

  const newReg = {
    id: inMemoryStore.eventRegistrations.length + 1,
    event_id: eventId,
    user_id: req.user.id,
    pass_code,
    amount: event.event_fee || 0,
    payment_status: paymentStatus,
    registration_status: registrationStatus,
    transaction_id: transaction_id || '',
    payment_proof_url: payment_proof_url || '',
    registered_at: new Date().toISOString()
  };

  inMemoryStore.eventRegistrations.unshift(newReg);
  event.registered_count = (event.registered_count || 0) + 1;

  // Create unified payment record if paid
  if (event.is_paid && transaction_id) {
    inMemoryStore.payments.unshift({
      id: inMemoryStore.payments.length + 1,
      user_id: req.user.id,
      membership_application_id: null,
      event_registration_id: newReg.id,
      payment_type: 'EVENT',
      amount: event.event_fee,
      transaction_id: transaction_id.trim(),
      payment_proof_url: payment_proof_url || '',
      payment_date: new Date().toISOString().split('T')[0],
      status: 'SUBMITTED',
      verified_by: null,
      verified_at: null,
      remarks: `Event registration fee for ${event.title}`,
      created_at: new Date().toISOString()
    });
  }

  res.status(201).json({
    success: true,
    message: event.is_paid 
      ? 'Event payment details submitted! Admin will verify your payment.' 
      : 'You have successfully joined this event!',
    registration: newReg
  });
});

// 6. Get Admin Event Registrations List
router.get('/admin/registrations/list', authenticateToken, requireAdmin, (req, res) => {
  const registrations = inMemoryStore.eventRegistrations.map(r => {
    const targetEvent = inMemoryStore.events.find(e => e.id === r.event_id);
    const targetUser = inMemoryStore.users.find(u => u.id === r.user_id);
    return {
      ...r,
      event_title: targetEvent?.title || 'Union Event',
      member_name: targetUser?.profile?.full_name || 'Union Member',
      member_email: targetUser?.email || '',
      member_phone: targetUser?.profile?.phone || ''
    };
  });

  res.json({
    success: true,
    registrations
  });
});

export default router;
