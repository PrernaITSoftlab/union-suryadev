import express from 'express';
import bcrypt from 'bcryptjs';
import { inMemoryStore } from '../config/db.js';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// 1. Submit Membership Application (Public)
router.post('/submit', async (req, res, next) => {
  try {
    const {
      company_name, district_name, circle_name, division_name, office_name,
      joining_year, full_name, father_name, father_husband_name, post_name,
      dept_post, union_post, cug_mobile, whatsapp_mobile, mobile,
      membership_year, membership_fee_status, membership_receipt_date,
      membership_receipt_no, donation_amount, donation_receipt_date,
      donation_receipt_no, reference_name, transaction_id, payment_proof_url,
      payment_date, payment_note, email, address, city, district, state, pin_code
    } = req.body;

    const applicantFullName = (full_name || '').trim();
    const applicantMobile = (whatsapp_mobile || cug_mobile || mobile || '').trim();
    const applicantEmail = (email || `${applicantMobile || Date.now()}@mpwzunion.org`).trim().toLowerCase();

    if (!applicantFullName || !applicantMobile) {
      return res.status(400).json({ success: false, message: 'Full Name and WhatsApp Mobile Number are required fields.' });
    }

    const application_no = `APP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newApplication = {
      id: inMemoryStore.membershipApplications.length + 1,
      application_no,
      // 21 Form Fields
      company_name: company_name || 'MP West Zone Electricity Discom',
      district_name: district_name || 'Indore',
      circle_name: circle_name || '',
      division_name: division_name || '',
      office_name: office_name || '',
      joining_year: joining_year || '',
      full_name: applicantFullName,
      father_name: (father_name || father_husband_name || '').trim(),
      father_husband_name: (father_name || father_husband_name || '').trim(),
      post_name: post_name || 'Junior Engineer (JE)',
      dept_post: dept_post || '',
      union_post: union_post || 'Member',
      cug_mobile: (cug_mobile || '').trim(),
      whatsapp_mobile: applicantMobile,
      mobile: applicantMobile,
      membership_year: membership_year || '2026-2027',
      membership_fee_status: membership_fee_status || 'PAID_60',
      membership_receipt_date: membership_receipt_date || '',
      membership_receipt_no: membership_receipt_no || '',
      donation_amount: donation_amount || '',
      donation_receipt_date: donation_receipt_date || '',
      donation_receipt_no: donation_receipt_no || '',
      reference_name: reference_name || '',

      // General fields
      email: applicantEmail,
      address: address || '',
      city: district_name || city || 'Indore',
      district: district_name || district || 'Indore',
      state: state || 'Madhya Pradesh',
      pin_code: pin_code || '452001',
      occupation: 'Discom Service',
      company: company_name || 'MP West Zone Electricity Discom',
      designation: post_name || 'Staff Member',
      union_info: `Reference: ${reference_name || 'N/A'}, District: ${district_name || 'N/A'}`,
      profile_photo_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
      registration_fee: inMemoryStore.systemSettings.registration_fee || 60,
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

// 7. Approve Application & Generate Credentials (Payment-Gated Member Onboarding Flow)
router.post('/:id/approve-and-generate', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const appId = Number(req.params.id);
    const app = inMemoryStore.membershipApplications.find(a => a.id === appId);
    if (!app) {
      return res.status(404).json({ success: false, message: 'Membership application not found.' });
    }

    // Check if user already exists
    let existingUser = inMemoryStore.users.find(u => u.email.toLowerCase() === app.email.toLowerCase());
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: `User account for ${app.email} already exists (Member ID: ${existingUser.member_id}).`
      });
    }

    // Generate Unique Member ID and Temporary Password
    const rawCode = (app.district_name || app.city || 'IND').replace(/[^a-zA-Z]/g, '');
    const cityCode = (rawCode.length >= 3 ? rawCode : 'IND').substring(0, 3).toUpperCase();
    const randIdNum = Math.floor(100 + Math.random() * 900);
    const generatedMemberId = `UNION-${cityCode}-${randIdNum}`;
    
    const tempPassword = `MPWZ@${Math.floor(1000 + Math.random() * 9000)}`;
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(tempPassword, salt);

    // Create Active User Account
    const newUser = {
      id: inMemoryStore.users.length + 1,
      email: app.email.trim().toLowerCase(),
      password_hash,
      role: 'user',
      status: 'active',
      member_id: generatedMemberId,
      created_at: new Date().toISOString(),
      profile: {
        id: inMemoryStore.users.length + 1,
        user_id: inMemoryStore.users.length + 1,
        full_name: app.full_name,
        father_husband_name: app.father_name || app.father_husband_name || '',
        phone: app.whatsapp_mobile || app.mobile || app.cug_mobile || '',
        whatsapp: app.whatsapp_mobile || app.mobile || '',
        address: app.address || '',
        city: app.city || app.district_name || 'Indore',
        district: app.district_name || app.district || 'Indore',
        state: app.state || 'Madhya Pradesh',
        pin_code: app.pin_code || '452001',
        occupation: app.occupation || 'Discom Service',
        company: app.company_name || app.company || 'MP West Zone Electricity Discom',
        designation: app.post_name || app.designation || 'Staff Member',
        circle: app.circle_name || `${app.district_name || 'Indore'} Circle`,
        union_designation: app.union_post || 'Union Member',
        bio: `Member of MPWZ Union (${app.district_name || 'Indore'}).`,
        joining_date: new Date().toISOString().split('T')[0],
        is_public: true,
        contact_privacy: { showPhone: true, showEmail: true, showAddress: false }
      }
    };

    inMemoryStore.users.unshift(newUser);

    // Update Application Status & Store Credentials Details
    app.application_status = 'APPROVED';
    app.payment_status = 'VERIFIED';
    app.verified_by = req.user.id;
    app.verified_at = new Date().toISOString();
    app.generated_credentials = {
      member_id: generatedMemberId,
      email: app.email,
      temp_password: tempPassword,
      generated_at: new Date().toISOString(),
      sent_to: app.email
    };

    // Update / Create Payment Record
    const pay = inMemoryStore.payments.find(p => p.membership_application_id === app.id);
    if (pay) {
      pay.status = 'VERIFIED';
      pay.verified_by = req.user.id;
      pay.verified_at = new Date().toISOString();
      pay.user_id = newUser.id;
    } else {
      inMemoryStore.payments.unshift({
        id: inMemoryStore.payments.length + 1,
        user_id: newUser.id,
        membership_application_id: app.id,
        payment_type: 'MEMBERSHIP',
        amount: app.registration_fee || 500,
        transaction_id: app.transaction_id || 'VERIFIED-ADMIN',
        payment_date: app.payment_date || new Date().toISOString().split('T')[0],
        status: 'VERIFIED',
        verified_by: req.user.id,
        verified_at: new Date().toISOString(),
        remarks: `Approved by admin & credentials generated`,
        created_at: new Date().toISOString()
      });
    }

    // Add Audit Log
    inMemoryStore.auditLogs.unshift({
      id: inMemoryStore.auditLogs.length + 1,
      action: 'MEMBER_APPROVED_CREDENTIALS_GENERATED',
      actor_id: req.user.id,
      actor_name: req.user.profile?.full_name || 'Admin',
      entity_type: 'MEMBERSHIP_APPLICATION',
      entity_id: String(app.id),
      details: `Approved application ${app.application_no} for ${app.full_name}, generated Member ID ${generatedMemberId}`,
      created_at: new Date().toISOString()
    });

    console.log(`✉️ [EMAIL DISPATCH SIMULATION] Sent to ${app.email}:`);
    console.log(`    Subject: Welcome to MPWZ Union! Your Login ID & Temporary Password`);
    console.log(`    Member ID: ${generatedMemberId} | Password: ${tempPassword}`);

    res.json({
      success: true,
      message: `Member ${app.full_name} approved! Credentials generated & sent to ${app.email}.`,
      credentials: {
        member_id: generatedMemberId,
        email: app.email,
        temp_password: tempPassword,
        applicant_name: app.full_name,
        whatsapp: app.whatsapp_mobile || app.mobile
      },
      application: app,
      user: newUser
    });
  } catch (err) {
    next(err);
  }
});

export default router;
