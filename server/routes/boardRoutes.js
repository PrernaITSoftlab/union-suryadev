import express from 'express';
import { inMemoryStore, saveBoardBackup, query } from '../config/db.js';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * 1. GET /api/board
 * Public list of Board of Union & Executive Leadership members
 */
router.get('/', (req, res) => {
  try {
    const list = Array.isArray(inMemoryStore.boardMembers) ? inMemoryStore.boardMembers : [];
    // Sort by id or display_order
    const sorted = [...list].sort((a, b) => {
      const orderA = a.display_order !== undefined ? a.display_order : a.id || 0;
      const orderB = b.display_order !== undefined ? b.display_order : b.id || 0;
      return orderA - orderB;
    });

    res.json({
      success: true,
      count: sorted.length,
      boardMembers: sorted
    });
  } catch (err) {
    console.error('Error fetching board members:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch board members' });
  }
});

router.get('/list', (req, res) => {
  const list = Array.isArray(inMemoryStore.boardMembers) ? inMemoryStore.boardMembers : [];
  const sorted = [...list].sort((a, b) => {
    const orderA = a.display_order !== undefined ? a.display_order : a.id || 0;
    const orderB = b.display_order !== undefined ? b.display_order : b.id || 0;
    return orderA - orderB;
  });

  res.json({
    success: true,
    count: sorted.length,
    boardMembers: sorted
  });
});

/**
 * 2. POST /api/board
 * Add a new Board Member (Admin only)
 */
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      nameEn,
      nameHi,
      titleEn,
      titleHi,
      category = 'central',
      isTopHead = false,
      badge = '',
      image = '',
      phone = '',
      email = '',
      circle = '',
      roleEn = '',
      roleHi = '',
      bioEn = '',
      bioHi = '',
      display_order
    } = req.body;

    if (!nameEn || !titleEn) {
      return res.status(400).json({
        success: false,
        message: 'Name (English) and Title / Designation (English) are required.'
      });
    }

    if (!Array.isArray(inMemoryStore.boardMembers)) {
      inMemoryStore.boardMembers = [];
    }

    const maxId = inMemoryStore.boardMembers.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0);
    const newId = maxId + 1;

    const newMember = {
      id: newId,
      nameEn: nameEn.trim(),
      nameHi: (nameHi || nameEn).trim(),
      titleEn: titleEn.trim(),
      titleHi: (titleHi || titleEn).trim(),
      category: category || 'central',
      isTopHead: Boolean(isTopHead),
      badge: badge ? badge.trim() : (titleEn.length > 25 ? titleEn.slice(0, 25) + '...' : titleEn),
      image: image ? image.trim() : '/images/board/v-s-mehto.jpg',
      phone: phone ? phone.trim() : '',
      email: email ? email.trim() : 'mpmavaks@gmail.com',
      circle: circle ? circle.trim() : 'State Executive Committee',
      roleEn: roleEn ? roleEn.trim() : titleEn,
      roleHi: roleHi ? roleHi.trim() : (titleHi || titleEn),
      bioEn: bioEn ? bioEn.trim() : `Executive board leader advocating for worker rights and welfare.`,
      bioHi: bioHi ? bioHi.trim() : `विद्युत कर्मचारियों के अधिकारों एवं कल्याण हेतु सक्रिय प्रांतीय पदाधिकारी।`,
      display_order: display_order !== undefined ? Number(display_order) : newId,
      created_at: new Date().toISOString()
    };

    inMemoryStore.boardMembers.push(newMember);
    saveBoardBackup();

    // If PostgreSQL connected, insert row
    if (typeof query === 'function') {
      try {
        await query(
          `INSERT INTO board_members (id, name_en, name_hi, title_en, title_hi, category, is_top_head, badge, image, phone, email, circle, role_en, role_hi, bio_en, bio_hi, display_order)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
           ON CONFLICT (id) DO NOTHING`,
          [
            newMember.id,
            newMember.nameEn,
            newMember.nameHi,
            newMember.titleEn,
            newMember.titleHi,
            newMember.category,
            newMember.isTopHead,
            newMember.badge,
            newMember.image,
            newMember.phone,
            newMember.email,
            newMember.circle,
            newMember.roleEn,
            newMember.roleHi,
            newMember.bioEn,
            newMember.bioHi,
            newMember.display_order
          ]
        );
      } catch (dbErr) {
        console.warn('⚠️ Could not insert board member into PostgreSQL:', dbErr.message);
      }
    }

    // Audit log
    if (Array.isArray(inMemoryStore.auditLogs)) {
      inMemoryStore.auditLogs.unshift({
        id: inMemoryStore.auditLogs.length + 1,
        action: 'BOARD_MEMBER_CREATED',
        actor_id: req.user?.id || 1,
        actor_name: req.user?.email || 'Admin',
        entity_type: 'BOARD_MEMBER',
        entity_id: String(newId),
        details: `Created new board leader: ${newMember.nameEn} (${newMember.titleEn})`,
        created_at: new Date().toISOString()
      });
    }

    res.status(201).json({
      success: true,
      message: 'Board member added successfully',
      boardMember: newMember
    });
  } catch (err) {
    console.error('Error creating board member:', err);
    res.status(500).json({ success: false, message: 'Server error adding board member' });
  }
});

/**
 * 3. PUT /api/board/:id
 * Edit an existing Board Member (Admin only)
 */
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const targetId = Number(req.params.id);
    if (!Array.isArray(inMemoryStore.boardMembers)) {
      inMemoryStore.boardMembers = [];
    }

    const idx = inMemoryStore.boardMembers.findIndex(m => Number(m.id) === targetId);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Board member not found' });
    }

    const existing = inMemoryStore.boardMembers[idx];
    const {
      nameEn,
      nameHi,
      titleEn,
      titleHi,
      category,
      isTopHead,
      badge,
      image,
      phone,
      email,
      circle,
      roleEn,
      roleHi,
      bioEn,
      bioHi,
      display_order
    } = req.body;

    const updated = {
      ...existing,
      nameEn: nameEn !== undefined ? nameEn.trim() : existing.nameEn,
      nameHi: nameHi !== undefined ? nameHi.trim() : existing.nameHi,
      titleEn: titleEn !== undefined ? titleEn.trim() : existing.titleEn,
      titleHi: titleHi !== undefined ? titleHi.trim() : existing.titleHi,
      category: category !== undefined ? category : existing.category,
      isTopHead: isTopHead !== undefined ? Boolean(isTopHead) : existing.isTopHead,
      badge: badge !== undefined ? badge.trim() : existing.badge,
      image: image !== undefined ? image.trim() : existing.image,
      phone: phone !== undefined ? phone.trim() : existing.phone,
      email: email !== undefined ? email.trim() : existing.email,
      circle: circle !== undefined ? circle.trim() : existing.circle,
      roleEn: roleEn !== undefined ? roleEn.trim() : existing.roleEn,
      roleHi: roleHi !== undefined ? roleHi.trim() : existing.roleHi,
      bioEn: bioEn !== undefined ? bioEn.trim() : existing.bioEn,
      bioHi: bioHi !== undefined ? bioHi.trim() : existing.bioHi,
      display_order: display_order !== undefined ? Number(display_order) : existing.display_order,
      updated_at: new Date().toISOString()
    };

    inMemoryStore.boardMembers[idx] = updated;
    saveBoardBackup();

    // If PostgreSQL connected, update row
    if (typeof query === 'function') {
      try {
        await query(
          `UPDATE board_members SET
             name_en = $1, name_hi = $2, title_en = $3, title_hi = $4, category = $5,
             is_top_head = $6, badge = $7, image = $8, phone = $9, email = $10,
             circle = $11, role_en = $12, role_hi = $13, bio_en = $14, bio_hi = $15,
             display_order = $16, updated_at = CURRENT_TIMESTAMP
           WHERE id = $17`,
          [
            updated.nameEn,
            updated.nameHi,
            updated.titleEn,
            updated.titleHi,
            updated.category,
            updated.isTopHead,
            updated.badge,
            updated.image,
            updated.phone,
            updated.email,
            updated.circle,
            updated.roleEn,
            updated.roleHi,
            updated.bioEn,
            updated.bioHi,
            updated.display_order,
            targetId
          ]
        );
      } catch (dbErr) {
        console.warn('⚠️ Could not update board member in PostgreSQL:', dbErr.message);
      }
    }

    // Audit log
    if (Array.isArray(inMemoryStore.auditLogs)) {
      inMemoryStore.auditLogs.unshift({
        id: inMemoryStore.auditLogs.length + 1,
        action: 'BOARD_MEMBER_UPDATED',
        actor_id: req.user?.id || 1,
        actor_name: req.user?.email || 'Admin',
        entity_type: 'BOARD_MEMBER',
        entity_id: String(targetId),
        details: `Updated board member details: ${updated.nameEn} (${updated.titleEn})`,
        created_at: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      message: 'Board member updated successfully',
      boardMember: updated
    });
  } catch (err) {
    console.error('Error updating board member:', err);
    res.status(500).json({ success: false, message: 'Server error updating board member' });
  }
});

/**
 * 4. DELETE /api/board/:id
 * Delete a Board Member (Admin only)
 */
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const targetId = Number(req.params.id);
    if (!Array.isArray(inMemoryStore.boardMembers)) {
      inMemoryStore.boardMembers = [];
    }

    const idx = inMemoryStore.boardMembers.findIndex(m => Number(m.id) === targetId);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Board member not found' });
    }

    const deleted = inMemoryStore.boardMembers.splice(idx, 1)[0];
    saveBoardBackup();

    // If PostgreSQL connected, delete row
    if (typeof query === 'function') {
      try {
        await query('DELETE FROM board_members WHERE id = $1', [targetId]);
      } catch (dbErr) {
        console.warn('⚠️ Could not delete board member from PostgreSQL:', dbErr.message);
      }
    }

    // Audit log
    if (Array.isArray(inMemoryStore.auditLogs)) {
      inMemoryStore.auditLogs.unshift({
        id: inMemoryStore.auditLogs.length + 1,
        action: 'BOARD_MEMBER_DELETED',
        actor_id: req.user?.id || 1,
        actor_name: req.user?.email || 'Admin',
        entity_type: 'BOARD_MEMBER',
        entity_id: String(targetId),
        details: `Deleted board member: ${deleted.nameEn} (${deleted.titleEn})`,
        created_at: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      message: 'Board member deleted successfully',
      deletedId: targetId
    });
  } catch (err) {
    console.error('Error deleting board member:', err);
    res.status(500).json({ success: false, message: 'Server error deleting board member' });
  }
});

export default router;

