import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import ChatService from '../services/chatService.js';

const router = express.Router();

// 1. Get all accessible chat groups
router.get('/groups', authenticateToken, async (req, res) => {
  try {
    const groups = await ChatService.getGroups(req.user.id, req.user.role);
    res.json({ success: true, groups });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch chat groups' });
  }
});

// 2. Create a new chat group
router.post('/groups', authenticateToken, async (req, res) => {
  try {
    const group = await ChatService.createGroup(req.user.id, req.body);
    res.status(201).json({ success: true, message: 'Group created successfully!', group });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message || 'Failed to create chat group' });
  }
});

// 3. Get group details & members list
router.get('/groups/:id', authenticateToken, async (req, res) => {
  try {
    const group = await ChatService.getGroupDetails(req.params.id, req.user.id, req.user.role);
    res.json({ success: true, group });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message || 'Chat group not found' });
  }
});

// 4. Update group profile / settings (Admin only)
router.put('/groups/:id', authenticateToken, async (req, res) => {
  try {
    const group = await ChatService.updateGroup(req.params.id, req.user.id, req.body, req.user.role);
    res.json({ success: true, message: 'Group updated successfully!', group });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message || 'Failed to update group' });
  }
});

// 5. Delete group (Admin/Creator only)
router.delete('/groups/:id', authenticateToken, async (req, res) => {
  try {
    const result = await ChatService.deleteGroup(req.params.id, req.user.id, req.user.role);
    res.json(result);
  } catch (err) {
    res.status(403).json({ success: false, message: err.message || 'Failed to delete group' });
  }
});

// 6. Add member(s) to group (Admin only)
router.post('/groups/:id/members', authenticateToken, async (req, res) => {
  try {
    const { user_ids } = req.body;
    const group = await ChatService.addMembers(req.params.id, user_ids, req.user.id, req.user.role);
    res.json({ success: true, message: 'Members added successfully!', group });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message || 'Failed to add members' });
  }
});

// 7. Remove member or Leave group
router.delete('/groups/:id/members/:userId', authenticateToken, async (req, res) => {
  try {
    const result = await ChatService.removeMember(req.params.id, req.params.userId, req.user.id, req.user.role);
    res.json(result);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message || 'Failed to remove member' });
  }
});

// 8. Get Message History
router.get('/groups/:id/messages', authenticateToken, async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 100;
    const messages = await ChatService.getMessages(req.params.id, req.user.id, limit);
    res.json({ success: true, messages });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message || 'Failed to fetch messages' });
  }
});

// 9. Send a Message
router.post('/groups/:id/messages', authenticateToken, async (req, res) => {
  try {
    const { message_text, attachment_url, attachment_type } = req.body;
    const message = await ChatService.sendMessage(
      req.params.id,
      req.user.id,
      message_text,
      attachment_url,
      attachment_type
    );
    res.status(201).json({ success: true, message });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message || 'Failed to send message' });
  }
});

// 10. Search Union Member Directory (for adding to groups)
router.get('/directory', authenticateToken, async (req, res) => {
  try {
    const members = await ChatService.getDirectory(req.query.search, req.user.id);
    res.json({ success: true, members });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to search directory' });
  }
});

export default router;
