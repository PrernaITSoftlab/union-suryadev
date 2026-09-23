import express from 'express';
import { inMemoryStore } from '../config/db.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// 1. Get Union Stories Feed
router.get('/feed', authenticateToken, (req, res) => {
  const { category, search } = req.query;
  let stories = inMemoryStore.unionStories.filter(s => s.status === 'PUBLISHED');

  if (category) {
    stories = stories.filter(s => s.category.toLowerCase() === category.toLowerCase());
  }

  if (search) {
    const q = search.toLowerCase();
    stories = stories.filter(s => 
      s.title.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.author_name.toLowerCase().includes(q)
    );
  }

  res.json({
    success: true,
    stories
  });
});

// 2. Publish New Union Story
router.post('/create', authenticateToken, (req, res) => {
  const { title, description, category, attachment_url, attachment_type } = req.body;

  if (!title || !description) {
    return res.status(400).json({ success: false, message: 'Title and Description are required.' });
  }

  const newStory = {
    id: inMemoryStore.unionStories.length + 1,
    author_id: req.user.id,
    author_name: req.user.profile?.full_name || 'Union Member',
    author_title: req.user.profile?.union_designation || req.user.profile?.designation || 'Member',
    author_avatar: req.user.profile?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
    title: title.trim(),
    description: description.trim(),
    category: category || 'General Circular',
    attachment_url: attachment_url || '',
    attachment_type: attachment_type || 'PDF',
    visibility: 'MEMBERS_ONLY',
    status: 'PUBLISHED',
    created_at: new Date().toISOString()
  };

  inMemoryStore.unionStories.unshift(newStory);

  res.status(201).json({
    success: true,
    message: 'Union Story published successfully.',
    story: newStory
  });
});

export default router;
