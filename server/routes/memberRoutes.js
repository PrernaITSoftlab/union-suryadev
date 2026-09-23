import express from 'express';
import bcrypt from 'bcryptjs';
import { inMemoryStore } from '../config/db.js';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// 1. Union Members Directory (Authenticated Members & Admin)
router.get('/directory', authenticateToken, (req, res) => {
  const { search, circle, designation } = req.query;

  // Filter only active members for general directory
  let activeUsers = inMemoryStore.users.filter(u => u.status === 'active' && u.profile);

  if (search) {
    const q = search.toLowerCase();
    activeUsers = activeUsers.filter(u => 
      u.profile.full_name.toLowerCase().includes(q) ||
      (u.member_id && u.member_id.toLowerCase().includes(q)) ||
      (u.profile.company && u.profile.company.toLowerCase().includes(q)) ||
      (u.profile.city && u.profile.city.toLowerCase().includes(q)) ||
      (u.profile.designation && u.profile.designation.toLowerCase().includes(q))
    );
  }

  if (circle) {
    activeUsers = activeUsers.filter(u => u.profile.circle && u.profile.circle.toLowerCase() === circle.toLowerCase());
  }

  // Format directory cards according to privacy settings
  const directory = activeUsers.map(u => {
    const privacy = u.profile.contact_privacy || { showPhone: true, showEmail: true, showAddress: false };
    return {
      id: u.id,
      member_id: u.member_id,
      role: u.role,
      status: u.status,
      full_name: u.profile.full_name,
      avatar_url: u.profile.avatar_url,
      designation: u.profile.designation,
      company: u.profile.company,
      circle: u.profile.circle,
      union_designation: u.profile.union_designation,
      city: u.profile.city,
      state: u.profile.state,
      email: privacy.showEmail ? u.email : undefined,
      phone: privacy.showPhone ? u.profile.phone : undefined,
      whatsapp: privacy.showPhone ? u.profile.whatsapp : undefined,
      bio: u.profile.bio,
      joining_date: u.profile.joining_date
    };
  });

  res.json({
    success: true,
    members: directory
  });
});

// 2. Admin List Members (All Statuses)
router.get('/admin/list', authenticateToken, requireAdmin, (req, res) => {
  const { search, status, circle } = req.query;
  let members = [...inMemoryStore.users];

  if (status) {
    members = members.filter(u => u.status.toLowerCase() === status.toLowerCase());
  }

  if (circle && circle !== 'all') {
    members = members.filter(u => u.profile && u.profile.circle && u.profile.circle.toLowerCase().includes(circle.toLowerCase()));
  }

  if (search) {
    const q = search.toLowerCase();
    members = members.filter(u => 
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.member_id && u.member_id.toLowerCase().includes(q)) ||
      (u.profile && u.profile.full_name.toLowerCase().includes(q)) ||
      (u.profile && u.profile.phone && u.profile.phone.includes(q))
    );
  }

  res.json({
    success: true,
    members: members.map(u => ({
      id: u.id,
      email: u.email,
      role: u.role,
      status: u.status,
      member_id: u.member_id,
      profile: u.profile
    }))
  });
});

// 3. Create User Account (Admin - either from Application or Manually)
router.post('/admin/create', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const {
      application_id, email, password, member_id, role,
      full_name, father_husband_name, dob, gender, phone, whatsapp,
      address, city, district, state, pin_code, occupation, company,
      designation, circle, union_designation, avatar_url, emergency_contact,
      identity_doc_url, additional_doc_url, bio
    } = req.body;

    if (!email || !full_name) {
      return res.status(400).json({ success: false, message: 'Email and Full Name are required.' });
    }

    // Check existing
    const existingEmail = inMemoryStore.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingEmail) {
      return res.status(400).json({ success: false, message: 'A user with this email already exists.' });
    }

    // Default password if not provided
    const initialPassword = password || 'union123';
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(initialPassword, salt);

    const generatedMemberId = member_id || `UNION-${(city || 'IND').substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const newUser = {
      id: inMemoryStore.users.length + 1,
      email: email.trim().toLowerCase(),
      password_hash,
      role: role || 'user',
      status: 'active',
      member_id: generatedMemberId,
      created_at: new Date().toISOString(),
      profile: {
        id: inMemoryStore.users.length + 1,
        user_id: inMemoryStore.users.length + 1,
        full_name: full_name.trim(),
        father_husband_name: father_husband_name || '',
        dob: dob || '',
        gender: gender || 'Male',
        avatar_url: avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
        phone: phone || '',
        whatsapp: whatsapp || phone || '',
        address: address || '',
        city: city || 'Indore',
        district: district || 'Indore',
        state: state || 'Madhya Pradesh',
        pin_code: pin_code || '452001',
        occupation: occupation || 'Discom Service',
        company: company || 'MP West Zone Electricity Discom',
        designation: designation || 'Staff Member',
        circle: circle || 'Indore Circle',
        union_designation: union_designation || 'Union Member',
        bio: bio || `Member of MPWZ Union (${circle || 'Indore'}).`,
        emergency_contact: emergency_contact || '',
        identity_doc_url: identity_doc_url || '',
        additional_doc_url: additional_doc_url || '',
        joining_date: new Date().toISOString().split('T')[0],
        is_public: true,
        contact_privacy: { showPhone: true, showEmail: true, showAddress: false }
      }
    };

    inMemoryStore.users.unshift(newUser);

    // If linked to a membership application, mark application APPROVED & VERIFIED
    if (application_id) {
      const app = inMemoryStore.membershipApplications.find(a => a.id === Number(application_id));
      if (app) {
        app.application_status = 'APPROVED';
        app.payment_status = 'VERIFIED';
        app.verified_by = req.user.id;
        app.verified_at = new Date().toISOString();
      }
    }

    // Log admin action
    inMemoryStore.auditLogs.unshift({
      id: inMemoryStore.auditLogs.length + 1,
      action: 'MEMBER_CREATED',
      actor_id: req.user.id,
      actor_name: req.user.profile?.full_name || 'Admin',
      entity_type: 'USER',
      entity_id: String(newUser.id),
      details: `Created user account ${newUser.email} with Member ID ${newUser.member_id}`,
      created_at: new Date().toISOString()
    });

    res.status(201).json({
      success: true,
      message: `Union member account created successfully! Member ID: ${newUser.member_id}. Initial password: ${initialPassword}`,
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status,
        member_id: newUser.member_id,
        profile: newUser.profile
      }
    });
  } catch (error) {
    next(error);
  }
});

// 4. Update Profile (User self edit / Admin edit)
router.put('/profile/update', authenticateToken, (req, res) => {
  const {
    full_name, phone, whatsapp, address, city, district, state, pin_code,
    bio, avatar_url, emergency_contact, contact_privacy, target_user_id
  } = req.body;

  // If target_user_id provided and requester is Admin, edit target user; otherwise edit self
  let userIdToEdit = req.user.id;
  if (target_user_id && req.user.role === 'admin') {
    userIdToEdit = Number(target_user_id);
  }

  const user = inMemoryStore.users.find(u => u.id === userIdToEdit);
  if (!user || !user.profile) {
    return res.status(404).json({ success: false, message: 'Member profile not found.' });
  }

  if (full_name) user.profile.full_name = full_name;
  if (phone) user.profile.phone = phone;
  if (whatsapp) user.profile.whatsapp = whatsapp;
  if (address) user.profile.address = address;
  if (city) user.profile.city = city;
  if (district) user.profile.district = district;
  if (state) user.profile.state = state;
  if (pin_code) user.profile.pin_code = pin_code;
  if (bio !== undefined) user.profile.bio = bio;
  if (avatar_url) user.profile.avatar_url = avatar_url;
  if (emergency_contact !== undefined) user.profile.emergency_contact = emergency_contact;
  if (contact_privacy) user.profile.contact_privacy = contact_privacy;

  // Admin restricted fields
  if (req.user.role === 'admin') {
    if (req.body.designation) user.profile.designation = req.body.designation;
    if (req.body.circle) user.profile.circle = req.body.circle;
    if (req.body.union_designation) user.profile.union_designation = req.body.union_designation;
    if (req.body.member_id) user.member_id = req.body.member_id;
  }

  res.json({
    success: true,
    message: 'Profile updated successfully.',
    profile: user.profile
  });
});

// 5. Admin Change Member Status (ACTIVE, INACTIVE, SUSPENDED)
router.put('/admin/:id/status', authenticateToken, requireAdmin, (req, res) => {
  const { status } = req.body;
  const targetUser = inMemoryStore.users.find(u => u.id === Number(req.params.id));
  if (!targetUser) {
    return res.status(404).json({ success: false, message: 'Member not found.' });
  }

  if (!['active', 'inactive', 'suspended'].includes(status.toLowerCase())) {
    return res.status(400).json({ success: false, message: 'Invalid status value.' });
  }

  targetUser.status = status.toLowerCase();

  // Log action
  inMemoryStore.auditLogs.unshift({
    id: inMemoryStore.auditLogs.length + 1,
    action: 'MEMBER_STATUS_CHANGED',
    actor_id: req.user.id,
    actor_name: req.user.profile?.full_name || 'Admin',
    entity_type: 'USER',
    entity_id: String(targetUser.id),
    details: `Changed member ${targetUser.email} status to ${status}`,
    created_at: new Date().toISOString()
  });

  res.json({
    success: true,
    message: `Member status updated to ${status}.`,
    user: {
      id: targetUser.id,
      email: targetUser.email,
      status: targetUser.status
    }
  });
});

export default router;
