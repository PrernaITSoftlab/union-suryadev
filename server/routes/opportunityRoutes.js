import express from 'express';
import { inMemoryStore } from '../config/db.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get list of opportunities
router.get('/', (req, res) => {
  const { category, search, featured } = req.query;

  let list = inMemoryStore.opportunities.filter(o => o.status === 'active');

  if (featured === 'true') {
    list = list.filter(o => o.is_featured);
  }

  if (category && category !== 'All') {
    list = list.filter(o => o.category.toLowerCase() === category.toLowerCase());
  }

  if (search) {
    const term = search.toLowerCase();
    list = list.filter(o => 
      o.title.toLowerCase().includes(term) ||
      o.description.toLowerCase().includes(term) ||
      o.author_name.toLowerCase().includes(term)
    );
  }

  res.json({
    success: true,
    count: list.length,
    opportunities: list
  });
});

// Create opportunity
router.post('/create', authenticateToken, (req, res) => {
  const user = inMemoryStore.users.find(u => u.id === req.user.id);
  const { title, category, description, requirements, location, budget_range } = req.body;

  if (!title || !category || !description) {
    return res.status(400).json({ success: false, message: 'Title, category, and description are required.' });
  }

  const newOpp = {
    id: inMemoryStore.opportunities.length + 1,
    author_id: user.id,
    author_name: user.profile?.full_name || 'Member',
    author_company: user.profile?.company || 'Union Suyradev Network',
    author_title: user.profile?.title || 'Professional Leader',
    author_avatar: user.profile?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
    title,
    category,
    description,
    requirements: requirements || '',
    location: location || 'Global / Remote',
    budget_range: budget_range || 'To be discussed',
    status: 'active',
    is_featured: req.user.role === 'admin',
    created_at: new Date().toISOString()
  };

  inMemoryStore.opportunities.unshift(newOpp);

  res.status(201).json({
    success: true,
    message: 'Business opportunity posted successfully!',
    opportunity: newOpp
  });
});

// Express interest / respond to opportunity
router.post('/:id/interest', authenticateToken, (req, res) => {
  const oppId = parseInt(req.params.id);
  const opp = inMemoryStore.opportunities.find(o => o.id === oppId);

  if (!opp) {
    return res.status(404).json({ success: false, message: 'Opportunity not found.' });
  }

  const sender = inMemoryStore.users.find(u => u.id === req.user.id);

  // Send notification to author
  if (opp.author_id && opp.author_id !== req.user.id) {
    inMemoryStore.notifications.push({
      id: inMemoryStore.notifications.length + 1,
      user_id: opp.author_id,
      title: "Opportunity Response!",
      message: `${sender?.profile?.full_name || 'A member'} expressed interest in your opportunity "${opp.title}".`,
      type: "opportunity",
      link: "/opportunities",
      is_read: false,
      created_at: new Date().toISOString()
    });
  }

  res.json({
    success: true,
    message: 'Your interest has been communicated to the opportunity creator!'
  });
});

export default router;
