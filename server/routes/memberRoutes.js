import express from 'express';
import { inMemoryStore } from '../config/db.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get list of public members with search & filtering
router.get('/', (req, res) => {
  const { search, industry, location, category } = req.query;

  let filtered = inMemoryStore.users.filter(u => u.status === 'active' && u.profile && u.profile.is_public !== false);

  if (search) {
    const term = search.toLowerCase();
    filtered = filtered.filter(u => 
      u.profile.full_name.toLowerCase().includes(term) ||
      u.profile.company.toLowerCase().includes(term) ||
      u.profile.title.toLowerCase().includes(term) ||
      (u.profile.skills && u.profile.skills.some(s => s.toLowerCase().includes(term)))
    );
  }

  if (industry && industry !== 'All') {
    filtered = filtered.filter(u => u.profile.industry.toLowerCase().includes(industry.toLowerCase()));
  }

  if (location && location !== 'All') {
    filtered = filtered.filter(u => u.profile.location.toLowerCase().includes(location.toLowerCase()));
  }

  const result = filtered.map(u => ({
    id: u.id,
    email: u.email,
    role: u.role,
    profile: u.profile
  }));

  res.json({
    success: true,
    count: result.length,
    members: result
  });
});

// Get member profile by ID
router.get('/:id', (req, res) => {
  const memberId = parseInt(req.params.id);
  const user = inMemoryStore.users.find(u => u.id === memberId);

  if (!user || user.status === 'suspended') {
    return res.status(404).json({ success: false, message: 'Member profile not found.' });
  }

  // Count active connections
  const connectionsCount = inMemoryStore.connections.filter(
    c => (c.requester_id === memberId || c.addressee_id === memberId) && c.status === 'accepted'
  ).length;

  res.json({
    success: true,
    member: {
      id: user.id,
      email: user.email,
      role: user.role,
      profile: user.profile,
      connections_count: connectionsCount
    }
  });
});

// Update profile (Authenticated user)
router.put('/profile/update', authenticateToken, (req, res) => {
  const user = inMemoryStore.users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  const {
    full_name, avatar_url, title, company, industry, location,
    bio, skills, services, website, linkedin, twitter, phone
  } = req.body;

  if (!user.profile) user.profile = {};

  if (full_name !== undefined) user.profile.full_name = full_name;
  if (avatar_url !== undefined) user.profile.avatar_url = avatar_url;
  if (title !== undefined) user.profile.title = title;
  if (company !== undefined) user.profile.company = company;
  if (industry !== undefined) user.profile.industry = industry;
  if (location !== undefined) user.profile.location = location;
  if (bio !== undefined) user.profile.bio = bio;
  if (skills !== undefined) user.profile.skills = Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim());
  if (services !== undefined) user.profile.services = Array.isArray(services) ? services : services.split(',').map(s => s.trim());
  if (website !== undefined) user.profile.website = website;
  if (linkedin !== undefined) user.profile.linkedin = linkedin;
  if (twitter !== undefined) user.profile.twitter = twitter;
  if (phone !== undefined) user.profile.phone = phone;

  // Calculate profile completion percentage
  let score = 30; // base email & name
  if (user.profile.avatar_url) score += 10;
  if (user.profile.title && user.profile.company) score += 20;
  if (user.profile.bio) score += 15;
  if (user.profile.skills && user.profile.skills.length > 0) score += 15;
  if (user.profile.website || user.profile.linkedin) score += 10;

  user.profile.profile_completion = Math.min(score, 100);

  res.json({
    success: true,
    message: 'Profile updated successfully!',
    profile: user.profile
  });
});

export default router;
