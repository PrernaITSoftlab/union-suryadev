import express from 'express';
import bcrypt from 'bcryptjs';
import { inMemoryStore } from '../config/db.js';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// 1. Submit Membership Application (Public)
router.post('/submit', async (req, res, next) => {
  try {
    const {
      full_name, father_husband_name, dob, gender, mobile, whatsapp, email,
      address, city, district, state, pin_code, occupation, company, designation,
      union_info, profile_photo_url, identity_doc_url, additional_doc_url,
      emergency_contact, transaction_id, payment_proof_url, payment_date, payment_note
    } = req.body;

    if (!full_name || !mobile || !email) {
      return res.status(400).json({ success: false, message: 'Full Name, Mobile Number, and Email are required fields.' });
    }

    // Check if email or mobile already registered as an active member or pending application
    const existingUser = inMemoryStore.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An active member account already exists with this email address.' });
    }

    const application_no = `APP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newApplication = {
      id: inMemoryStore.membershipApplications.length + 1,
      application_no,
      full_name: full_name.trim(),
      father_husband_name: father_husband_name || '',
      dob: dob || '',
      gender: gender || 'Male',
      mobile: mobile.trim(),
      whatsapp: whatsapp || mobile,
      email: email.trim().toLowerCase(),
      address: address || '',
      city: city || 'Indore',
      district: district || 'Indore',
      state: state || 'Madhya Pradesh',
      pin_code: pin_code || '452001',
      occupation: occupation || 'Discom Service',
      company: company || 'MP West Zone Electricity Discom',
      designation: designation || 'Staff Member',
      union_info: union_info || '',
      profile_photo_url: profile_photo_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
      identity_doc_url: identity_doc_url || '',
      additional_doc_url: additional_doc_url || '',
      emergency_contact: emergency_contact || '',
      registration_fee: inMemoryStore.systemSettings.registration_fee || 500,
      payment_status: transaction_id ? 'SUBMITTED' : 'PENDING',
      application_status: 'PENDING',
      transaction_id: transaction_id || '',
      payment_proof_url: payment_proof_url || '',
      payment_date: payment_date || new Date().toISOString().split('T')[0],
      payment_note: payment_note || '',
      verified_by: null,
      verified_at: null,
      rejection_reason: '',
      created_at: new Date().toISOString()
    };

    inMemoryStore.membershipApplications.unshift(newApplication);

    // Create Unified Payment record
    if (transaction_id) {
      const newPayment = {
        id: inMemoryStore.payments.length + 1,
        user_id: null,
        membership_application_id: newApplication.id,
        event_registration_id: null,
        payment_type: 'MEMBERSHIP',
        amount: newApplication.registration_fee,
        transaction_id: transaction_id.trim(),
        payment_proof_url: payment_proof_url || '',
        payment_date: newApplication.payment_date,
        status: 'SUBMITTED',
        verified_by: null,
        verified_at: null,
        remarks: `Registration fee UTR ${transaction_id} for Application ${application_no}`,
        created_at: new Date().toISOString()
      };
      inMemoryStore.payments.unshift(newPayment);
    }

    // Admin Notification
    inMemoryStore.notifications.unshift({
      id: inMemoryStore.notifications.length + 1,
      user_id: 1, // Admin user
      title: 'New Union Membership Application',
      message: `${full_name} (${application_no}) submitted membership application. Payment status: ${newApplication.payment_status}.`,
      type: 'PAYMENT',
      link: '/admin/applications',
      is_read: false,
      created_at: new Date().toISOString()
    });

    res.status(201).json({
      success: true,
      message: 'Membership application submitted successfully! Admin will review your application and verify payment.',
      application: newApplication
    });
  } catch (error) {
    next(error);
  }
});

// 2. List Membership Applications (Admin)
router.get('/list', authenticateToken, requireAdmin, (req, res) => {
  const { status, payment_status, search } = req.query;
  let filtered = [...inMemoryStore.membershipApplications];

  if (status) {
    filtered = filtered.filter(a => a.application_status.toUpperCase() === status.toUpperCase());
  }

  if (payment_status) {
    filtered = filtered.filter(a => a.payment_status.toUpperCase() === payment_status.toUpperCase());
  }

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(a => 
      a.full_name.toLowerCase().includes(q) ||
      a.application_no.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q) ||
      a.mobile.includes(q)
    );
  }

  res.json({
    success: true,
    applications: filtered
  });
});

// 3. Get Application Detail
router.get('/:id', authenticateToken, requireAdmin, (req, res) => {
  const app = inMemoryStore.membershipApplications.find(a => a.id === Number(req.params.id));
  if (!app) {
    return res.status(404).json({ success: false, message: 'Application not found.' });
  }
  res.json({ success: true, application: app });
});

// 4. Verify Application Payment (Admin)
router.put('/:id/verify-payment', authenticateToken, requireAdmin, (req, res) => {
  const app = inMemoryStore.membershipApplications.find(a => a.id === Number(req.params.id));
  if (!app) {
    return res.status(404).json({ success: false, message: 'Application not found.' });
  }

  app.payment_status = 'VERIFIED';
  app.verified_by = req.user.id;
  app.verified_at = new Date().toISOString();

  // Update corresponding unified payment record
  const p = inMemoryStore.payments.find(pay => pay.membership_application_id === app.id);
  if (p) {
    p.status = 'VERIFIED';
    p.verified_by = req.user.id;
    p.verified_at = new Date().toISOString();
  }

  res.json({
    success: true,
    message: `Payment for application ${app.application_no} verified successfully.`,
    application: app
  });
});

// 5. Approve or Reject Application (Admin)
router.put('/:id/status', authenticateToken, requireAdmin, (req, res) => {
  const { status, rejection_reason } = req.body;
  const app = inMemoryStore.membershipApplications.find(a => a.id === Number(req.params.id));
  if (!app) {
    return res.status(404).json({ success: false, message: 'Application not found.' });
  }

  if (!['APPROVED', 'REJECTED', 'PENDING'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid application status.' });
  }

  app.application_status = status;
  if (status === 'REJECTED') {
    app.rejection_reason = rejection_reason || 'Application criteria not fulfilled.';
    if (app.payment_status === 'SUBMITTED') {
      app.payment_status = 'REJECTED';
    }
  }

  res.json({
    success: true,
    message: `Application ${app.application_no} set to ${status}.`,
    application: app
  });
});

// 6. Pre-fill Create User Form from Application (Admin)
router.get('/:id/prefill-user', authenticateToken, requireAdmin, (req, res) => {
  const app = inMemoryStore.membershipApplications.find(a => a.id === Number(req.params.id));
  if (!app) {
    return res.status(404).json({ success: false, message: 'Application not found.' });
  }

  // Generate suggested Member ID
  const circleCode = (app.city || 'IND').substring(0, 3).toUpperCase();
  const randomNum = Math.floor(100 + Math.random() * 900);
  const suggestedMemberId = `UNION-${circleCode}-${randomNum}`;

  const prefilled = {
    application_id: app.id,
    application_no: app.application_no,
    email: app.email,
    member_id: suggestedMemberId,
    full_name: app.full_name,
    father_husband_name: app.father_husband_name,
    dob: app.dob,
    gender: app.gender,
    phone: app.mobile,
    whatsapp: app.whatsapp,
    address: app.address,
    city: app.city,
    district: app.district,
    state: app.state,
    pin_code: app.pin_code,
    occupation: app.occupation,
    company: app.company,
    designation: app.designation,
    circle: `${app.city} Circle`,
    union_designation: 'Member',
    avatar_url: app.profile_photo_url,
    emergency_contact: app.emergency_contact,
    identity_doc_url: app.identity_doc_url,
    additional_doc_url: app.additional_doc_url,
    joining_date: new Date().toISOString().split('T')[0]
  };

  res.json({
    success: true,
    prefilledUser: prefilled
  });
});

export default router;
