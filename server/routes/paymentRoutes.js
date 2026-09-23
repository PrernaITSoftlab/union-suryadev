import express from 'express';
import { inMemoryStore } from '../config/db.js';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// 1. Get Admin Unified Payments List
router.get('/admin/list', authenticateToken, requireAdmin, (req, res) => {
  const { type, status, search } = req.query;
  let list = [...inMemoryStore.payments];

  if (type) {
    list = list.filter(p => p.payment_type.toUpperCase() === type.toUpperCase());
  }

  if (status) {
    list = list.filter(p => p.status.toUpperCase() === status.toUpperCase());
  }

  if (search) {
    const q = search.toLowerCase();
    list = list.filter(p => 
      p.transaction_id.toLowerCase().includes(q) ||
      (p.remarks && p.remarks.toLowerCase().includes(q))
    );
  }

  // Enrich with user / application / event info
  const enriched = list.map(p => {
    let applicantName = 'N/A';
    let email = 'N/A';
    let phone = 'N/A';

    if (p.membership_application_id) {
      const app = inMemoryStore.membershipApplications.find(a => a.id === p.membership_application_id);
      if (app) {
        applicantName = app.full_name;
        email = app.email;
        phone = app.mobile;
      }
    } else if (p.user_id) {
      const u = inMemoryStore.users.find(usr => usr.id === p.user_id);
      if (u) {
        applicantName = u.profile?.full_name || u.email;
        email = u.email;
        phone = u.profile?.phone || 'N/A';
      }
    }

    return {
      ...p,
      applicantName,
      email,
      phone
    };
  });

  res.json({
    success: true,
    payments: enriched
  });
});

// 2. Admin Verify Payment
router.put('/admin/:id/verify', authenticateToken, requireAdmin, (req, res) => {
  const payment = inMemoryStore.payments.find(p => p.id === Number(req.params.id));
  if (!payment) {
    return res.status(404).json({ success: false, message: 'Payment record not found.' });
  }

  payment.status = 'VERIFIED';
  payment.verified_by = req.user.id;
  payment.verified_at = new Date().toISOString();

  // If Membership payment, update application payment status
  if (payment.membership_application_id) {
    const app = inMemoryStore.membershipApplications.find(a => a.id === payment.membership_application_id);
    if (app) {
      app.payment_status = 'VERIFIED';
      app.verified_by = req.user.id;
      app.verified_at = new Date().toISOString();
    }
  }

  // If Event payment, update event registration status
  if (payment.event_registration_id) {
    const reg = inMemoryStore.eventRegistrations.find(r => r.id === payment.event_registration_id);
    if (reg) {
      reg.payment_status = 'CONFIRMED';
      reg.registration_status = 'CONFIRMED';
    }
  }

  // Audit log
  inMemoryStore.auditLogs.unshift({
    id: inMemoryStore.auditLogs.length + 1,
    action: 'PAYMENT_VERIFIED',
    actor_id: req.user.id,
    actor_name: req.user.profile?.full_name || 'Admin',
    entity_type: 'PAYMENT',
    entity_id: String(payment.id),
    details: `Verified ₹${payment.amount} UTR ${payment.transaction_id}`,
    created_at: new Date().toISOString()
  });

  res.json({
    success: true,
    message: 'Payment verified successfully.',
    payment
  });
});

// 3. Admin Reject Payment
router.put('/admin/:id/reject', authenticateToken, requireAdmin, (req, res) => {
  const { remarks } = req.body;
  const payment = inMemoryStore.payments.find(p => p.id === Number(req.params.id));
  if (!payment) {
    return res.status(404).json({ success: false, message: 'Payment record not found.' });
  }

  payment.status = 'REJECTED';
  payment.remarks = remarks || 'Invalid transaction reference or proof.';

  if (payment.membership_application_id) {
    const app = inMemoryStore.membershipApplications.find(a => a.id === payment.membership_application_id);
    if (app) {
      app.payment_status = 'REJECTED';
    }
  }

  if (payment.event_registration_id) {
    const reg = inMemoryStore.eventRegistrations.find(r => r.id === payment.event_registration_id);
    if (reg) {
      reg.payment_status = 'REJECTED';
      reg.registration_status = 'CANCELLED';
    }
  }

  res.json({
    success: true,
    message: 'Payment rejected.',
    payment
  });
});

// 4. Get Authenticated User Payment History
router.get('/my-history', authenticateToken, (req, res) => {
  const userPayments = inMemoryStore.payments.filter(p => p.user_id === req.user.id);
  res.json({
    success: true,
    payments: userPayments
  });
});

export default router;
