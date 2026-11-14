import express from 'express';
import bcrypt from 'bcryptjs';
import { inMemoryStore, query, saveUsersBackup, saveApplicationsBackup } from '../config/db.js';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.js';
import { getNextMemberId } from '../utils/memberIdHelper.js';

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
      payment_date, payment_note, email, address, city, district, state, pin_code,
      employee_type, category, employee_class, category_person, member_category, registration_fee,
      profile_photo_url
    } = req.body;

    const applicantFullName = (full_name || '').trim();
    const applicantMobile = (whatsapp_mobile || cug_mobile || mobile || '').trim();
    const applicantEmail = (email || `${applicantMobile || Date.now()}@mpvmavaksunion.org`).trim().toLowerCase();

    if (!applicantFullName || !applicantMobile) {
      return res.status(400).json({ success: false, message: 'Full Name and WhatsApp Mobile Number are required fields.' });
    }

    const application_no = `APP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newApplication = {
      id: inMemoryStore.membershipApplications.length > 0 ? Math.max(...inMemoryStore.membershipApplications.map(a => a.id || 0)) + 1 : 1,
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
      union_post: union_post || 'Ordinary Member (साधारण सदस्य)',
      cug_mobile: (cug_mobile || '').trim(),
      whatsapp_mobile: applicantMobile,
      mobile: applicantMobile,
      membership_year: membership_year || '2026',
      membership_fee_status: membership_fee_status || 'PAID',
      membership_receipt_date: membership_receipt_date || '',
      membership_receipt_no: membership_receipt_no || '',
      donation_amount: donation_amount || '',
      donation_receipt_date: donation_receipt_date || '',
      donation_receipt_no: donation_receipt_no || '',
      reference_name: reference_name || '',

      // Member Category & Person Category
      employee_type: employee_type || 'Regular',
      category: category || 'ST',
      employee_class: employee_class || 'Class 3 (J.E.)',
      category_person: category_person || member_category || 'Ordinary Member (साधारण सदस्य)',
      member_category: member_category || category_person || 'Ordinary Member (साधारण सदस्य)',

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
      registration_fee: registration_fee || inMemoryStore.systemSettings.registration_fee || 60,
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

    // Permanently insert into PostgreSQL database
    try {
      const appRes = await query(`
        INSERT INTO membership_applications (
          application_no, full_name, father_husband_name, father_name, mobile, whatsapp,
          cug_mobile, whatsapp_mobile, email, address, city, district, state, pin_code,
          occupation, company, designation, company_name, district_name, circle_name,
          division_name, office_name, joining_year, post_name, dept_post, union_post,
          membership_year, membership_fee_status, membership_receipt_date, membership_receipt_no,
          donation_amount, donation_receipt_date, donation_receipt_no, reference_name,
          employee_type, category, employee_class, category_person, member_category,
          union_info, profile_photo_url, registration_fee, payment_status,
          application_status, transaction_id, payment_proof_url, payment_date,
          payment_note, rejection_reason, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6,
          $7, $8, $9, $10, $11, $12, $13, $14,
          $15, $16, $17, $18, $19, $20,
          $21, $22, $23, $24, $25, $26,
          $27, $28, $29, $30,
          $31, $32, $33, $34,
          $35, $36, $37, $38, $39,
          $40, $41, $42, $43,
          $44, $45, $46, $47,
          $48, $49, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
        RETURNING id
      `, [
        newApplication.application_no, newApplication.full_name, newApplication.father_husband_name, newApplication.father_name,
        newApplication.mobile, newApplication.whatsapp_mobile, newApplication.cug_mobile, newApplication.whatsapp_mobile,
        newApplication.email, newApplication.address, newApplication.city, newApplication.district, newApplication.state,
        newApplication.pin_code, newApplication.occupation, newApplication.company, newApplication.designation,
        newApplication.company_name, newApplication.district_name, newApplication.circle_name, newApplication.division_name,
        newApplication.office_name, newApplication.joining_year, newApplication.post_name, newApplication.dept_post,
        newApplication.union_post, newApplication.membership_year, newApplication.membership_fee_status,
        newApplication.membership_receipt_date, newApplication.membership_receipt_no, newApplication.donation_amount,
        newApplication.donation_receipt_date, newApplication.donation_receipt_no, newApplication.reference_name,
        newApplication.employee_type, newApplication.category, newApplication.employee_class, newApplication.category_person,
        newApplication.member_category, newApplication.union_info, newApplication.profile_photo_url,
        newApplication.registration_fee, newApplication.payment_status, newApplication.application_status,
        newApplication.transaction_id, newApplication.payment_proof_url, newApplication.payment_date,
        newApplication.payment_note, newApplication.rejection_reason
      ]);
      if (appRes && appRes.rows && appRes.rows[0]) {
        newApplication.id = appRes.rows[0].id;
      }
    } catch (pgErr) {
      console.warn('⚠️ Could not insert application into PostgreSQL:', pgErr.message);
    }

    inMemoryStore.membershipApplications.unshift(newApplication);
    saveApplicationsBackup();

    // Auto-create/link registered member account in users store with status: 'pending' (Awaiting Admin Approval)
    let existingUser = inMemoryStore.users.find(u => u.email.toLowerCase() === applicantEmail.toLowerCase());
    let newUserId = existingUser ? existingUser.id : (inMemoryStore.users.length > 0 ? Math.max(...inMemoryStore.users.map(u => u.id || 0)) + 1 : 1);
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash('union123', salt);
    const generatedMemberId = existingUser?.member_id || await getNextMemberId(inMemoryStore, query);

    if (!existingUser) {
      const registeredUser = {
        id: newUserId,
        email: applicantEmail,
        password_hash,
        role: 'user',
        status: 'pending', // Pending Admin Approval
        member_id: generatedMemberId,
        full_name: applicantFullName,
        created_at: new Date().toISOString(),
        profile: {
          id: newUserId,
          user_id: newUserId,
          full_name: applicantFullName,
          father_husband_name: (father_name || father_husband_name || '').trim(),
          phone: applicantMobile,
          whatsapp: applicantMobile,
          address: address || '',
          city: district_name || city || 'Indore',
          district: district_name || district || 'Indore',
          state: state || 'Madhya Pradesh',
          pin_code: pin_code || '452001',
          occupation: 'Discom Service',
          company: company_name || 'MP West Zone Electricity Discom',
          designation: post_name || 'Staff Member',
          employee_type: employee_type || 'Regular',
          category: category || 'ST',
          employee_class: employee_class || 'Class 3 (J.E.)',
          category_person: category_person || member_category || 'Ordinary Member (साधारण सदस्य)',
          member_category: member_category || category_person || 'Ordinary Member (साधारण सदस्य)',
          circle: circle_name || `${district_name || 'Indore'} Circle`,
          union_designation: union_post || 'Union Member',
          union_post: union_post || 'Ordinary Member (साधारण सदस्य)',
          bio: `Member of MPVMAVAKS Union (${district_name || 'Indore'}).`,
          avatar_url: profile_photo_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
          joining_date: new Date().toISOString().split('T')[0],
          is_public: true,
          contact_privacy: { showPhone: true, showEmail: true, showAddress: false }
        }
      };
      inMemoryStore.users.push(registeredUser);
      saveUsersBackup();
    } else if (existingUser.status !== 'active') {
      existingUser.status = 'pending';
      saveUsersBackup();
    }

    try {
      const uRes = await query(`
        INSERT INTO users (email, password_hash, role, status, member_id, created_at, updated_at)
        VALUES ($1, $2, 'user', 'pending', $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT (email) DO UPDATE SET status = CASE WHEN users.status = 'active' THEN 'active' ELSE 'pending' END, updated_at = CURRENT_TIMESTAMP
        RETURNING id
      `, [applicantEmail, password_hash, generatedMemberId]);

      const assignedUid = (uRes && uRes.rows && uRes.rows[0]?.id) || newUserId;
      await query(`
        INSERT INTO member_profiles (
          user_id, full_name, father_husband_name, phone, whatsapp, address,
          city, district, state, pin_code, occupation, company, designation,
          circle, union_designation, bio, emergency_contact, joining_date, is_public
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, true)
        ON CONFLICT (user_id) DO UPDATE SET
          full_name = EXCLUDED.full_name,
          phone = EXCLUDED.phone,
          whatsapp = EXCLUDED.whatsapp,
          designation = EXCLUDED.designation,
          circle = EXCLUDED.circle,
          union_designation = EXCLUDED.union_designation
      `, [
        assignedUid, applicantFullName, (father_name || father_husband_name || '').trim(),
        applicantMobile, applicantMobile, address || '',
        district_name || city || 'Indore', district_name || district || 'Indore',
        state || 'Madhya Pradesh', pin_code || '452001', 'Discom Service',
        company_name || 'MP West Zone Electricity Discom', post_name || 'Staff Member',
        circle_name || `${district_name || 'Indore'} Circle`, union_post || 'Union Member',
        `Member of MPVMAVAKS Union (${district_name || 'Indore'}).`, '',
        new Date().toISOString().split('T')[0]
      ]);
    } catch (_) {}

    // Create Unified Payment record
    if (transaction_id) {
      const newPayment = {
        id: inMemoryStore.payments.length + 1,
        user_id: newUserId,
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

      try {
        await query(`
          INSERT INTO payments (
            membership_application_id, payment_type, amount, transaction_id,
            payment_proof_url, payment_date, status, remarks, created_at
          ) VALUES ($1, 'MEMBERSHIP', $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
        `, [
          newApplication.id, newApplication.registration_fee, transaction_id.trim(),
          payment_proof_url || '', newApplication.payment_date, newPayment.status, newPayment.remarks
        ]);
      } catch (_) {}
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

  if (status && status !== 'all') {
    filtered = filtered.filter(a => (a.application_status || 'PENDING').toUpperCase() === status.toUpperCase());
  }

  if (payment_status && payment_status !== 'all') {
    filtered = filtered.filter(a => (a.payment_status || 'PENDING').toUpperCase() === payment_status.toUpperCase());
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

  // Enrich with payment_proof_url fallback if missing
  const enriched = filtered.map(app => {
    let proofUrl = app.payment_proof_url || '';
    if (!proofUrl) {
      const pay = inMemoryStore.payments.find(p => p.membership_application_id === app.id);
      if (pay && pay.payment_proof_url) {
        proofUrl = pay.payment_proof_url;
      }
    }
    return {
      ...app,
      payment_proof_url: proofUrl
    };
  });

  res.json({
    success: true,
    applications: enriched
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
router.put('/:id/verify-payment', authenticateToken, requireAdmin, async (req, res) => {
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

  try {
    await query(`
      UPDATE membership_applications 
      SET payment_status = 'VERIFIED', verified_by = $1, verified_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 OR application_no = $3
    `, [req.user.id, app.id, app.application_no]);

    await query(`
      UPDATE payments 
      SET status = 'VERIFIED', verified_by = $1, verified_at = CURRENT_TIMESTAMP
      WHERE membership_application_id = $2
    `, [req.user.id, app.id]);
  } catch (err) {
    console.warn('⚠️ Could not update payment in PostgreSQL:', err.message);
  }

  saveApplicationsBackup();

  res.json({
    success: true,
    message: `Payment for application ${app.application_no} verified successfully.`,
    application: app
  });
});

// 5. Approve or Reject Application (Admin)
router.put('/:id/status', authenticateToken, requireAdmin, async (req, res) => {
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
    // Update linked user status to 'rejected' without data loss
    const linkedUser = inMemoryStore.users.find(u => u.email.toLowerCase() === app.email.toLowerCase());
    if (linkedUser) {
      linkedUser.status = 'rejected';
      try {
        await query("UPDATE users SET status = 'rejected', updated_at = CURRENT_TIMESTAMP WHERE id = $1", [linkedUser.id]);
      } catch (_) {}
    }
    // Update linked payment
    const linkedPay = inMemoryStore.payments.find(p => p.membership_application_id === app.id);
    if (linkedPay) {
      linkedPay.status = 'REJECTED';
      linkedPay.remarks = app.rejection_reason;
      try {
        await query("UPDATE payments SET status = 'REJECTED', remarks = $1 WHERE membership_application_id = $2", [app.rejection_reason, app.id]);
      } catch (_) {}
    }
  } else if (status === 'APPROVED') {
    app.payment_status = 'VERIFIED';
    app.verified_by = req.user.id;
    app.verified_at = new Date().toISOString();
    // Move member to active in approved members list
    const linkedUser = inMemoryStore.users.find(u => u.email.toLowerCase() === app.email.toLowerCase());
    if (linkedUser) {
      linkedUser.status = 'active';
      try {
        await query("UPDATE users SET status = 'active', updated_at = CURRENT_TIMESTAMP WHERE id = $1", [linkedUser.id]);
      } catch (_) {}
    }
  } else if (status === 'PENDING') {
    const linkedUser = inMemoryStore.users.find(u => u.email.toLowerCase() === app.email.toLowerCase());
    if (linkedUser) {
      linkedUser.status = 'pending';
      try {
        await query("UPDATE users SET status = 'pending', updated_at = CURRENT_TIMESTAMP WHERE id = $1", [linkedUser.id]);
      } catch (_) {}
    }
  }

  try {
    await query(`
      UPDATE membership_applications 
      SET application_status = $1, payment_status = $2, rejection_reason = $3,
          verified_by = $4, verified_at = $5, updated_at = CURRENT_TIMESTAMP
      WHERE id = $6 OR application_no = $7
    `, [app.application_status, app.payment_status, app.rejection_reason || null, app.verified_by || null, app.verified_at || null, app.id, app.application_no]);
  } catch (err) {
    console.warn('⚠️ Could not update application status in PostgreSQL:', err.message);
  }

  saveApplicationsBackup();
  saveUsersBackup();

  res.json({
    success: true,
    message: `Application ${app.application_no} set to ${status}.`,
    application: app
  });
});

// 6. Pre-fill Create User Form from Application (Admin)
router.get('/:id/prefill-user', authenticateToken, requireAdmin, async (req, res) => {
  const app = inMemoryStore.membershipApplications.find(a => a.id === Number(req.params.id));
  if (!app) {
    return res.status(404).json({ success: false, message: 'Application not found.' });
  }

  // Generate suggested sequential Member ID (MPAVAKS-XXXX)
  const suggestedMemberId = await getNextMemberId(inMemoryStore, query);

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
    employee_type: app.employee_type,
    category: app.category,
    employee_class: app.employee_class,
    category_person: app.category_person,
    member_category: app.member_category,
    union_post: app.union_post || app.category_person || app.member_category || 'Ordinary Member (साधारण सदस्य)',
    circle: `${app.city} Circle`,
    union_designation: app.union_post || 'Member',
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

    // Generate or retain Unique Sequential Member ID (MPAVAKS-XXXX) and Temporary Password
    const generatedMemberId = (existingUser && existingUser.member_id && existingUser.member_id.startsWith('MPAVAKS-'))
      ? existingUser.member_id
      : await getNextMemberId(inMemoryStore, query);

    const tempPassword = `MPVMAVAKS@${Math.floor(1000 + Math.random() * 9000)}`;
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(tempPassword, salt);

    let newUserId = existingUser ? existingUser.id : (inMemoryStore.users.length > 0 ? Math.max(...inMemoryStore.users.map(u => u.id || 0)) + 1 : 1);

    const updatedProfile = {
      id: existingUser?.profile?.id || newUserId,
      user_id: newUserId,
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
      employee_type: app.employee_type || 'Regular',
      category: app.category || 'ST',
      employee_class: app.employee_class || 'Class 3 (J.E.)',
      category_person: app.category_person || app.member_category || app.union_post || 'Ordinary Member (साधारण सदस्य)',
      member_category: app.member_category || app.category_person || app.union_post || 'Ordinary Member (साधारण सदस्य)',
      union_post: app.union_post || app.category_person || app.member_category || 'Ordinary Member (साधारण सदस्य)',
      circle: app.circle_name || `${app.district_name || 'Indore'} Circle`,
      union_designation: app.union_post || 'Union Member',
      bio: `Member of MPVMAVAKS Union (${app.district_name || 'Indore'}).`,
      avatar_url: app.profile_photo_url || existingUser?.profile?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
      joining_date: existingUser?.profile?.joining_date || new Date().toISOString().split('T')[0],
      is_public: true,
      contact_privacy: existingUser?.profile?.contact_privacy || { showPhone: true, showEmail: true, showAddress: false }
    };

    if (existingUser) {
      existingUser.role = 'user';
      existingUser.status = 'active'; // Move to approved members list!
      existingUser.member_id = generatedMemberId;
      existingUser.password_hash = password_hash;
      existingUser.full_name = app.full_name;
      existingUser.profile = updatedProfile;

      try {
        await query(`
          UPDATE users 
          SET role = 'user', status = 'active', member_id = $1, password_hash = $2, updated_at = CURRENT_TIMESTAMP
          WHERE id = $3
        `, [generatedMemberId, password_hash, existingUser.id]);

        await query(`
          INSERT INTO member_profiles (
            user_id, full_name, father_husband_name, phone, whatsapp, address,
            city, district, state, pin_code, occupation, company, designation,
            circle, union_designation, bio, emergency_contact, joining_date, is_public
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, true)
          ON CONFLICT (user_id) DO UPDATE SET
            full_name = EXCLUDED.full_name,
            father_husband_name = EXCLUDED.father_husband_name,
            phone = EXCLUDED.phone,
            whatsapp = EXCLUDED.whatsapp,
            designation = EXCLUDED.designation,
            circle = EXCLUDED.circle,
            union_designation = EXCLUDED.union_designation,
            company = EXCLUDED.company
        `, [
          existingUser.id, app.full_name, app.father_name || app.father_husband_name || '',
          app.whatsapp_mobile || app.mobile || app.cug_mobile || '', app.whatsapp_mobile || app.mobile || '',
          app.address || '', app.city || app.district_name || 'Indore', app.district_name || app.district || 'Indore',
          app.state || 'Madhya Pradesh', app.pin_code || '452001', app.occupation || 'Discom Service',
          app.company_name || app.company || 'MP West Zone Electricity Discom', app.post_name || app.designation || 'Staff Member',
          app.circle_name || `${app.district_name || 'Indore'} Circle`, app.union_post || 'Union Member',
          `Member of MPVMAVAKS Union (${app.district_name || 'Indore'}).`, app.emergency_contact || '',
          new Date().toISOString().split('T')[0]
        ]);
      } catch (dbErr) {
        console.warn('⚠️ Could not update user in PostgreSQL:', dbErr.message);
      }
    } else {
      // Create new user with status: 'active'
      try {
        const userRes = await query(`
          INSERT INTO users (email, password_hash, role, status, member_id, created_at, updated_at)
          VALUES ($1, $2, 'user', 'active', $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          RETURNING id
        `, [app.email.trim().toLowerCase(), password_hash, generatedMemberId]);

        if (userRes && userRes.rows && userRes.rows[0]) {
          newUserId = userRes.rows[0].id;
        }

        await query(`
          INSERT INTO member_profiles (
            user_id, full_name, father_husband_name, phone, whatsapp, address,
            city, district, state, pin_code, occupation, company, designation,
            circle, union_designation, bio, emergency_contact, joining_date, is_public
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, true)
          ON CONFLICT (user_id) DO UPDATE SET
            full_name = EXCLUDED.full_name,
            designation = EXCLUDED.designation,
            circle = EXCLUDED.circle,
            union_designation = EXCLUDED.union_designation
        `, [
          newUserId, app.full_name, app.father_name || app.father_husband_name || '',
          app.whatsapp_mobile || app.mobile || app.cug_mobile || '', app.whatsapp_mobile || app.mobile || '',
          app.address || '', app.city || app.district_name || 'Indore', app.district_name || app.district || 'Indore',
          app.state || 'Madhya Pradesh', app.pin_code || '452001', app.occupation || 'Discom Service',
          app.company_name || app.company || 'MP West Zone Electricity Discom', app.post_name || app.designation || 'Staff Member',
          app.circle_name || `${app.district_name || 'Indore'} Circle`, app.union_post || 'Union Member',
          `Member of MPVMAVAKS Union (${app.district_name || 'Indore'}).`, app.emergency_contact || '',
          new Date().toISOString().split('T')[0]
        ]);
      } catch (dbErr) {
        console.warn('⚠️ Could not insert user to PostgreSQL in approve-and-generate:', dbErr.message);
      }

      existingUser = {
        id: newUserId,
        email: app.email.trim().toLowerCase(),
        password_hash,
        role: 'user',
        status: 'active',
        member_id: generatedMemberId,
        created_at: new Date().toISOString(),
        profile: updatedProfile
      };
      inMemoryStore.users.unshift(existingUser);
    }

    saveUsersBackup();

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

    // Permanently update application in PostgreSQL database
    try {
      await query(`
        UPDATE membership_applications 
        SET application_status = 'APPROVED', payment_status = 'VERIFIED',
            verified_by = $1, verified_at = CURRENT_TIMESTAMP,
            generated_credentials = $2, updated_at = CURRENT_TIMESTAMP
        WHERE id = $3 OR application_no = $4
      `, [req.user.id, JSON.stringify(app.generated_credentials), app.id, app.application_no]);
    } catch (pgAppErr) {
      console.warn('⚠️ Could not update application in PostgreSQL:', pgAppErr.message);
    }

    // Save applications to disk storage
    saveApplicationsBackup();

    // Update / Create Payment Record
    const pay = inMemoryStore.payments.find(p => p.membership_application_id === app.id);
    if (pay) {
      pay.status = 'VERIFIED';
      pay.verified_by = req.user.id;
      pay.verified_at = new Date().toISOString();
      pay.user_id = existingUser.id;
    } else {
      inMemoryStore.payments.unshift({
        id: inMemoryStore.payments.length + 1,
        user_id: existingUser.id,
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

    try {
      await query(`
        UPDATE payments 
        SET status = 'VERIFIED', verified_by = $1, verified_at = CURRENT_TIMESTAMP, user_id = $2
        WHERE membership_application_id = $3
      `, [req.user.id, existingUser.id, app.id]);
    } catch (_) {}

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
    console.log(`    Subject: Welcome to MPVMAVAKS Union! Your Login ID & Temporary Password`);
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
      user: existingUser
    });
  } catch (err) {
    next(err);
  }
});

export default router;
