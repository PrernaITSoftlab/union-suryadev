import express from 'express';
import { inMemoryStore, pool, saveRegistrationsBackup } from '../config/db.js';
import { saveEventsToBackup } from '../db/syncEventsDb.js';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// 0. Get Public Joining Fee Receipts List
router.get('/joining-fee/list', (req, res) => {
  const joiningFees = inMemoryStore.payments
    .filter(p => p.payment_type === 'MEMBERSHIP_FEE' || p.payment_type === 'JOINING_FEE')
    .map(p => ({
      id: p.id,
      member_name: p.user_name || 'Union Member',
      employee_id: p.transaction_id || `PAY-${p.id}`,
      amount: p.amount,
      status: p.status,
      created_at: p.created_at
    }));
  res.json({ success: true, joiningFees });
});

// 0.1 Get Public Event Payments List
router.get('/event-payment/list', (req, res) => {
  const eventPayments = inMemoryStore.payments
    .filter(p => p.payment_type === 'EVENT' || p.payment_type === 'EVENT_REGISTRATION')
    .map(p => ({
      id: p.id,
      member_name: p.user_name || 'Delegate',
      event_title: p.remarks || 'Annual Delegate Convention 2026',
      amount: p.amount,
      status: p.status,
      created_at: p.created_at
    }));
  res.json({ success: true, eventPayments });
});

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
    let proofUrl = p.payment_proof_url || '';

    if (p.membership_application_id) {
      const app = inMemoryStore.membershipApplications.find(a => a.id === p.membership_application_id);
      if (app) {
        applicantName = app.full_name;
        email = app.email;
        phone = app.mobile;
        if (!proofUrl && app.payment_proof_url) {
          proofUrl = app.payment_proof_url;
        }
      }
    } else if (p.user_id) {
      const u = inMemoryStore.users.find(usr => usr.id === p.user_id);
      if (u) {
        applicantName = u.profile?.full_name || u.email;
        email = u.email;
        phone = u.profile?.phone || 'N/A';
      }
    }

    if (p.event_registration_id) {
      const reg = inMemoryStore.eventRegistrations.find(r => r.id === p.event_registration_id);
      if (reg && !proofUrl && reg.payment_proof_url) {
        proofUrl = reg.payment_proof_url;
      }
    }

    return {
      ...p,
      payment_proof_url: proofUrl,
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
router.put('/admin/:id/verify', authenticateToken, requireAdmin, async (req, res) => {
  const paymentId = Number(req.params.id);
  const payment = inMemoryStore.payments.find(p => p.id === paymentId);
  if (!payment) {
    return res.status(404).json({ success: false, message: 'Payment record not found.' });
  }

  payment.status = 'VERIFIED';
  payment.verified_by = req.user.id;
  payment.verified_at = new Date().toISOString();

  if (pool) {
    try {
      await pool.query(`
        UPDATE payments
        SET status = 'VERIFIED', verified_by = $1, verified_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `, [req.user.id, paymentId]);
    } catch (dbErr) {
      console.warn('⚠️ Could not update payment in PostgreSQL:', dbErr.message);
    }
  }

  // If Membership payment, update application payment status
  if (payment.membership_application_id) {
    const app = inMemoryStore.membershipApplications.find(a => a.id === payment.membership_application_id);
    if (app) {
      app.payment_status = 'VERIFIED';
      app.verified_by = req.user.id;
      app.verified_at = new Date().toISOString();
    }
    if (pool) {
      try {
        await pool.query(`
          UPDATE membership_applications
          SET payment_status = 'VERIFIED', verified_by = $1, verified_at = CURRENT_TIMESTAMP
          WHERE id = $2
        `, [req.user.id, payment.membership_application_id]);
      } catch (_) {}
    }
  }

  // If Event payment, update event registration status
  if (payment.event_registration_id) {
    const reg = inMemoryStore.eventRegistrations.find(r => r.id === payment.event_registration_id);
    if (reg) {
      reg.payment_status = 'CONFIRMED';
      reg.registration_status = 'CONFIRMED';
      reg.rejection_reason = '';

      const targetEvent = inMemoryStore.events.find(e => e.id === Number(reg.event_id));
      if (targetEvent) {
        targetEvent.registered_count = (targetEvent.registered_count || 0) + 1;
      }
    }

    if (pool) {
      try {
        await pool.query(`
          UPDATE event_registrations
          SET payment_status = 'CONFIRMED', registration_status = 'CONFIRMED', rejection_reason = NULL
          WHERE id = $1
        `, [payment.event_registration_id]);

        if (reg?.event_id) {
          await pool.query('UPDATE events SET registered_count = registered_count + 1 WHERE id = $1', [reg.event_id]);
        }
      } catch (regDbErr) {
        console.warn('⚠️ Could not update event_registration on payment verify:', regDbErr.message);
      }
    }

    saveRegistrationsBackup();
    saveEventsToBackup(inMemoryStore.events);
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
router.put('/admin/:id/reject', authenticateToken, requireAdmin, async (req, res) => {
  const paymentId = Number(req.params.id);
  const { remarks } = req.body;
  const payment = inMemoryStore.payments.find(p => p.id === paymentId);
  if (!payment) {
    return res.status(404).json({ success: false, message: 'Payment record not found.' });
  }

  payment.status = 'REJECTED';
  payment.remarks = remarks || 'Invalid transaction reference or receipt.';

  if (pool) {
    try {
      await pool.query(`
        UPDATE payments
        SET status = 'REJECTED', remarks = $1
        WHERE id = $2
      `, [payment.remarks, paymentId]);
    } catch (dbErr) {
      console.warn('⚠️ Could not update payment in PostgreSQL:', dbErr.message);
    }
  }

  if (payment.membership_application_id) {
    const app = inMemoryStore.membershipApplications.find(a => a.id === payment.membership_application_id);
    if (app) {
      app.payment_status = 'REJECTED';
    }
  }

  if (payment.event_registration_id) {
    const reg = inMemoryStore.eventRegistrations.find(r => r.id === payment.event_registration_id);
    const wasConfirmed = reg?.registration_status === 'CONFIRMED';
    if (reg) {
      reg.payment_status = 'REJECTED';
      reg.registration_status = 'REJECTED';
      reg.rejection_reason = payment.remarks;

      const targetEvent = inMemoryStore.events.find(e => e.id === Number(reg.event_id));
      if (targetEvent && wasConfirmed && targetEvent.registered_count > 0) {
        targetEvent.registered_count -= 1;
      }
    }

    if (pool) {
      try {
        await pool.query(`
          UPDATE event_registrations
          SET payment_status = 'REJECTED', registration_status = 'REJECTED', rejection_reason = $1
          WHERE id = $2
        `, [payment.remarks, payment.event_registration_id]);

        if (reg?.event_id && wasConfirmed) {
          await pool.query('UPDATE events SET registered_count = GREATEST(0, registered_count - 1) WHERE id = $1', [reg.event_id]);
        }
      } catch (regDbErr) {
        console.warn('⚠️ Could not update event_registration on payment reject:', regDbErr.message);
      }
    }

    saveRegistrationsBackup();
    saveEventsToBackup(inMemoryStore.events);
  }

  res.json({
    success: true,
    message: 'Payment rejected.',
    payment
  });
});

// 4. Get Authenticated User Payment History
router.get('/my-history', authenticateToken, async (req, res) => {
  let userPayments = [];

  if (pool) {
    try {
      const dbRes = await pool.query(`
        SELECT 
          p.*,
          COALESCE(e.title, p.remarks, '') AS event_title,
          COALESCE(r.payment_proof_url, p.payment_proof_url, '') AS payment_proof_url
        FROM payments p
        LEFT JOIN event_registrations r ON p.event_registration_id = r.id
        LEFT JOIN events e ON r.event_id = e.id
        WHERE p.user_id = $1
        ORDER BY p.id DESC
      `, [Number(req.user.id)]);

      if (dbRes.rows.length > 0) {
        userPayments = dbRes.rows.map(r => ({
          ...r,
          id: Number(r.id),
          amount: Number(r.amount || 0)
        }));
      }
    } catch (err) {
      console.warn('⚠️ Notice on querying user payments from PostgreSQL:', err.message);
    }
  }

  if (userPayments.length === 0) {
    userPayments = inMemoryStore.payments.filter(p => Number(p.user_id) === Number(req.user.id));
  }

  // Enrich with associated event or membership title and receipt if not already set
  const enriched = userPayments.map(p => {
    let eventTitle = p.event_title || p.remarks || '';
    let proofUrl = p.payment_proof_url || '';

    if (p.event_registration_id) {
      const reg = inMemoryStore.eventRegistrations.find(r => Number(r.id) === Number(p.event_registration_id));
      if (reg) {
        const evt = inMemoryStore.events.find(e => Number(e.id) === Number(reg.event_id));
        if (evt && !eventTitle) eventTitle = evt.title;
        if (!proofUrl && reg.payment_proof_url) proofUrl = reg.payment_proof_url;
      }
    }

    return {
      ...p,
      event_title: eventTitle,
      payment_proof_url: proofUrl
    };
  });

  res.json({
    success: true,
    payments: enriched
  });
});

export default router;
