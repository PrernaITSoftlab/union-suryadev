import express from 'express';
import { inMemoryStore } from '../config/db.js';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get Public System Settings
router.get('/public', (req, res) => {
  res.json({
    success: true,
    settings: inMemoryStore.systemSettings
  });
});

// Admin Update System Settings
router.put('/admin/update', authenticateToken, requireAdmin, (req, res) => {
  const updated = req.body;
  Object.assign(inMemoryStore.systemSettings, updated);

  // Log action
  inMemoryStore.auditLogs.unshift({
    id: inMemoryStore.auditLogs.length + 1,
    action: 'SETTINGS_UPDATED',
    actor_id: req.user.id,
    actor_name: req.user.profile?.full_name || 'Admin',
    entity_type: 'SETTINGS',
    entity_id: '1',
    details: 'System settings & payment parameters updated',
    created_at: new Date().toISOString()
  });

  res.json({
    success: true,
    message: 'System settings updated successfully.',
    settings: inMemoryStore.systemSettings
  });
});

export default router;
