import express from 'express';
import bcrypt from 'bcryptjs';
import { inMemoryStore, query, saveUsersBackup } from '../config/db.js';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.js';
import { getNextMemberId } from '../utils/memberIdHelper.js';

const router = express.Router();

// 0. General Members List (Public/Authenticated Fallback)
router.get('/', (req, res) => {
  const activeUsers = inMemoryStore.users.filter(u => u.status === 'active' && u.profile);
  res.json({
    success: true,
    members: activeUsers.map(u => ({
      id: u.id,
      member_id: u.member_id,
      employee_id: u.member_id,
      email: u.email,
      role: u.role,
      status: u.status,
      profile: u.profile
    }))
  });
});

// 0.1 My Profile
router.get('/my-profile', authenticateToken, (req, res) => {
  const user = inMemoryStore.users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User profile not found' });
  }
  res.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      member_id: user.member_id,
      profile: user.profile
    }
  });
});

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

    let generatedMemberId = member_id ? String(member_id).trim() : null;
    if (!generatedMemberId || generatedMemberId.toUpperCase().startsWith('UNION-')) {
      generatedMemberId = await getNextMemberId(inMemoryStore, query);
    } else {
      const idExists = inMemoryStore.users.some(u => u.member_id && u.member_id.toLowerCase() === generatedMemberId.toLowerCase());
      if (idExists) {
        return res.status(400).json({ success: false, message: `Member ID ${generatedMemberId} is already in use.` });
      }
    }

    let newUserId = inMemoryStore.users.length > 0 ? Math.max(...inMemoryStore.users.map(u => u.id || 0)) + 1 : 1;

    // Persist new user permanently into Neon PostgreSQL database
    try {
      const userRes = await query(`
        INSERT INTO users (email, password_hash, role, status, member_id, created_at, updated_at)
        VALUES ($1, $2, $3, 'active', $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING id
      `, [email.trim().toLowerCase(), password_hash, role || 'user', generatedMemberId]);

      if (userRes && userRes.rows && userRes.rows[0]) {
        newUserId = userRes.rows[0].id;
      }

      await query(`
        INSERT INTO member_profiles (
          user_id, full_name, father_husband_name, dob, gender, avatar_url, phone, whatsapp,
          address, city, district, state, pin_code, occupation, company, designation,
          circle, union_designation, bio, emergency_contact, identity_doc_url, additional_doc_url, joining_date, is_public
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, true)
        ON CONFLICT (user_id) DO UPDATE SET
          full_name = EXCLUDED.full_name,
          designation = EXCLUDED.designation,
          circle = EXCLUDED.circle,
          union_designation = EXCLUDED.union_designation
      `, [
        newUserId,
        full_name.trim(),
        father_husband_name || '',
        dob || null,
        gender || 'Male',
        avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
        phone || '',
        whatsapp || phone || '',
        address || '',
        city || 'Indore',
        district || 'Indore',
        state || 'Madhya Pradesh',
        pin_code || '452001',
        occupation || 'Discom Service',
        company || 'MP West Zone Electricity Discom',
        designation || 'Staff Member',
        circle || 'Indore Circle',
        union_designation || 'Union Member',
        bio || `Member of MPVMAVAKS Union (${circle || 'Indore'}).`,
        emergency_contact || '',
        identity_doc_url || '',
        additional_doc_url || '',
        new Date().toISOString().split('T')[0]
      ]);
    } catch (dbErr) {
      console.warn('⚠️ Could not insert user to PostgreSQL in admin/create:', dbErr.message);
    }

    const newUser = {
      id: newUserId,
      email: email.trim().toLowerCase(),
      password_hash,
      role: role || 'user',
      status: 'active',
      member_id: generatedMemberId,
      created_at: new Date().toISOString(),
      profile: {
        id: newUserId,
        user_id: newUserId,
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
        bio: bio || `Member of MPVMAVAKS Union (${circle || 'Indore'}).`,
        emergency_contact: emergency_contact || '',
        identity_doc_url: identity_doc_url || '',
        additional_doc_url: additional_doc_url || '',
        joining_date: new Date().toISOString().split('T')[0],
        is_public: true,
        contact_privacy: { showPhone: true, showEmail: true, showAddress: false }
      }
    };

    inMemoryStore.users.unshift(newUser);
    saveUsersBackup();

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

// Helper: Validate photo data URI or URL
const validatePhotoPayload = (avatarUrl) => {
  if (!avatarUrl || typeof avatarUrl !== 'string') {
    return { valid: false, message: 'Photo data or URL is required.' };
  }
  const trimmed = avatarUrl.trim();
  if (trimmed.startsWith('data:')) {
    // Validate image MIME type
    const matches = trimmed.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,/);
    if (!matches) {
      return { valid: false, message: 'Invalid image format. Supported formats: PNG, JPG, JPEG, WEBP, GIF, SVG.' };
    }
    // Calculate approximate byte size from base64
    const base64Data = trimmed.split(',')[1] || '';
    const approximateBytes = Math.ceil((base64Data.length * 3) / 4);
    const MAX_PHOTO_BYTES = 5 * 1024 * 1024; // 5MB
    if (approximateBytes > MAX_PHOTO_BYTES) {
      return { valid: false, message: 'Profile photo size exceeds maximum limit of 5MB. Please choose a smaller photo.' };
    }
    return { valid: true, url: trimmed };
  } else if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/')) {
    return { valid: true, url: trimmed };
  } else {
    return { valid: false, message: 'Photo must be a valid image file (base64) or web URL (http/https).' };
  }
};

// 4. Update Profile (User self edit / Admin edit)
router.put('/profile/update', authenticateToken, async (req, res) => {
  try {
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

    // Validate avatar_url if provided
    if (avatar_url !== undefined && avatar_url !== '') {
      const photoValidation = validatePhotoPayload(avatar_url);
      if (!photoValidation.valid) {
        return res.status(400).json({ success: false, message: photoValidation.message });
      }
      user.profile.avatar_url = photoValidation.url;
    }

    if (full_name) user.profile.full_name = full_name;
    if (phone) user.profile.phone = phone;
    if (whatsapp) user.profile.whatsapp = whatsapp;
    if (address !== undefined) user.profile.address = address;
    if (city !== undefined) user.profile.city = city;
    if (district !== undefined) user.profile.district = district;
    if (state !== undefined) user.profile.state = state;
    if (pin_code !== undefined) user.profile.pin_code = pin_code;
    if (bio !== undefined) user.profile.bio = bio;
    if (emergency_contact !== undefined) user.profile.emergency_contact = emergency_contact;
    if (contact_privacy) user.profile.contact_privacy = contact_privacy;

    // Admin restricted fields
    if (req.user.role === 'admin') {
      if (req.body.designation) user.profile.designation = req.body.designation;
      if (req.body.circle) user.profile.circle = req.body.circle;
      if (req.body.union_designation) user.profile.union_designation = req.body.union_designation;
      if (req.body.member_id) {
        user.member_id = req.body.member_id;
        try {
          await query(`UPDATE users SET member_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`, [req.body.member_id, userIdToEdit]);
        } catch (dbErr) {
          console.warn('⚠️ Could not update member_id in users table:', dbErr.message);
        }
      }
    }

    // Persist to Neon PostgreSQL Database
    try {
      await query(`
        UPDATE member_profiles
        SET full_name = COALESCE($1, full_name),
            phone = COALESCE($2, phone),
            whatsapp = COALESCE($3, whatsapp),
            address = COALESCE($4, address),
            city = COALESCE($5, city),
            district = COALESCE($6, district),
            state = COALESCE($7, state),
            pin_code = COALESCE($8, pin_code),
            bio = COALESCE($9, bio),
            avatar_url = COALESCE($10, avatar_url),
            emergency_contact = COALESCE($11, emergency_contact),
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $12
      `, [
        user.profile.full_name,
        user.profile.phone,
        user.profile.whatsapp,
        user.profile.address,
        user.profile.city,
        user.profile.district,
        user.profile.state,
        user.profile.pin_code,
        user.profile.bio,
        user.profile.avatar_url,
        user.profile.emergency_contact,
        userIdToEdit
      ]);
    } catch (dbErr) {
      console.warn('⚠️ Could not update member_profiles in DB:', dbErr.message);
    }

    // Persist to local backup JSON
    saveUsersBackup();

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      profile: user.profile,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        member_id: user.member_id,
        profile: user.profile
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
});

// Dedicated Photo Upload & Update Handler
const handlePhotoUpdate = async (req, res) => {
  try {
    const { avatar_url, target_user_id } = req.body;
    let userIdToEdit = req.user.id;
    if (target_user_id && req.user.role === 'admin') {
      userIdToEdit = Number(target_user_id);
    }

    const user = inMemoryStore.users.find(u => u.id === userIdToEdit);
    if (!user || !user.profile) {
      return res.status(404).json({ success: false, message: 'Member profile not found.' });
    }

    const validation = validatePhotoPayload(avatar_url);
    if (!validation.valid) {
      return res.status(400).json({ success: false, message: validation.message });
    }

    user.profile.avatar_url = validation.url;

    // Persist to Neon PostgreSQL Database
    try {
      await query(`
        UPDATE member_profiles
        SET avatar_url = $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $2
      `, [validation.url, userIdToEdit]);
    } catch (dbErr) {
      console.warn('⚠️ Could not update avatar_url in DB:', dbErr.message);
    }

    // Persist to local backup JSON
    saveUsersBackup();

    // Log admin action if admin updated someone else's photo
    if (target_user_id && req.user.role === 'admin' && userIdToEdit !== req.user.id) {
      inMemoryStore.auditLogs.unshift({
        id: inMemoryStore.auditLogs.length + 1,
        action: 'MEMBER_PHOTO_UPDATED',
        actor_id: req.user.id,
        actor_name: req.user.profile?.full_name || 'Admin',
        entity_type: 'USER',
        entity_id: String(userIdToEdit),
        details: `Updated profile photo for member ${user.email} (${user.member_id})`,
        created_at: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      message: 'Profile photo updated successfully!',
      avatar_url: validation.url,
      profile: user.profile,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        member_id: user.member_id,
        profile: user.profile
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update profile photo.' });
  }
};

router.put('/profile/photo', authenticateToken, handlePhotoUpdate);
router.post('/profile/photo', authenticateToken, handlePhotoUpdate);

// Remove Profile Photo (Reset to default)
router.delete('/profile/photo', authenticateToken, async (req, res) => {
  try {
    const { target_user_id } = req.body || {};
    let userIdToEdit = req.user.id;
    if (target_user_id && req.user.role === 'admin') {
      userIdToEdit = Number(target_user_id);
    }

    const user = inMemoryStore.users.find(u => u.id === userIdToEdit);
    if (!user || !user.profile) {
      return res.status(404).json({ success: false, message: 'Member profile not found.' });
    }

    // Default portrait
    const defaultAvatar = user.profile.gender === 'Female'
      ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80'
      : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80';

    user.profile.avatar_url = defaultAvatar;

    try {
      await query(`
        UPDATE member_profiles
        SET avatar_url = $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $2
      `, [defaultAvatar, userIdToEdit]);
    } catch (dbErr) {
      console.warn('⚠️ Could not reset avatar_url in DB:', dbErr.message);
    }

    saveUsersBackup();

    res.json({
      success: true,
      message: 'Profile photo reset to default.',
      avatar_url: defaultAvatar,
      profile: user.profile,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        member_id: user.member_id,
        profile: user.profile
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to reset profile photo.' });
  }
});

// Get My Profile endpoint
router.get('/my-profile', authenticateToken, (req, res) => {
  const user = inMemoryStore.users.find(u => u.id === req.user.id);
  if (!user || !user.profile) {
    return res.status(404).json({ success: false, message: 'Profile not found.' });
  }
  res.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      member_id: user.member_id,
      profile: user.profile
    }
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
