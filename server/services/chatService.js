import { pool, inMemoryStore } from '../config/db.js';
import { ensureChatSchemaAndSeed, saveChatBackup } from '../db/syncChatDb.js';

class ChatService {
  constructor() {
    this.initialized = false;
    this.initPromise = this.init();
  }

  async init() {
    try {
      await ensureChatSchemaAndSeed();
      this.initialized = true;
    } catch (err) {
      console.error('❌ Failed to initialize ChatService:', err.message);
      this.initialized = true;
    }
  }

  async awaitInit() {
    if (!this.initialized) {
      await this.initPromise;
    }
  }

  // Helper to extract user profile
  getUserProfile(userId) {
    const numId = Number(userId);
    const u = inMemoryStore.users.find(user => user.id === numId);
    if (!u) return { id: numId, full_name: 'Union Member', avatar_url: '', member_id: '', designation: '' };
    return {
      id: u.id,
      email: u.email,
      role: u.role,
      member_id: u.member_id || '',
      full_name: u.profile?.full_name || u.email?.split('@')[0] || 'Member',
      avatar_url: u.profile?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      designation: u.profile?.union_designation || u.profile?.designation || 'Member',
      circle: u.profile?.circle || 'All Circles'
    };
  }

  /**
   * Get all chat groups accessible to the user
   */
  async getGroups(userId, userRole = 'user') {
    await this.awaitInit();
    const numUserId = Number(userId);

    const allGroups = inMemoryStore.chatGroups || [];
    const allMembers = inMemoryStore.chatGroupMembers || [];
    const allMessages = inMemoryStore.chatMessages || [];

    // Filter groups where user is a member OR group is public
    const visibleGroups = allGroups.filter(g => {
      if (!g.is_private) return true;
      return allMembers.some(m => m.group_id === g.id && m.user_id === numUserId);
    });

    const enriched = visibleGroups.map(group => {
      const groupMembers = allMembers.filter(m => m.group_id === group.id);
      const userMembership = groupMembers.find(m => m.user_id === numUserId);
      const isMember = Boolean(userMembership);
      const isAdmin = userRole === 'admin' || group.created_by === numUserId || userMembership?.role === 'ADMIN';

      // Messages in this group
      const groupMsgs = allMessages.filter(msg => msg.group_id === group.id);
      groupMsgs.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      const lastMsg = groupMsgs.length > 0 ? groupMsgs[groupMsgs.length - 1] : null;

      // Last message sender
      let lastSenderName = '';
      if (lastMsg) {
        if (lastMsg.is_system) {
          lastSenderName = 'System';
        } else {
          const senderProf = this.getUserProfile(lastMsg.sender_id);
          lastSenderName = lastSenderName = lastMsg.sender_id === numUserId ? 'You' : senderProf.full_name;
        }
      }

      // Unread count
      const lastRead = userMembership?.last_read_at ? new Date(userMembership.last_read_at) : new Date(0);
      const unreadCount = isMember 
        ? groupMsgs.filter(m => m.sender_id !== numUserId && new Date(m.created_at) > lastRead).length 
        : 0;

      return {
        ...group,
        id: Number(group.id),
        members_count: groupMembers.length,
        is_member: isMember,
        is_admin: isAdmin,
        last_message: lastMsg ? {
          id: lastMsg.id,
          text: lastMsg.message_text,
          sender_name: lastSenderName,
          created_at: lastMsg.created_at,
          is_system: lastMsg.is_system
        } : null,
        unread_count: unreadCount
      };
    });

    // Sort by latest message date or group created_at descending
    enriched.sort((a, b) => {
      const timeA = a.last_message?.created_at || a.created_at;
      const timeB = b.last_message?.created_at || b.created_at;
      return new Date(timeB) - new Date(timeA);
    });

    return enriched;
  }

  /**
   * Get single group details with members
   */
  async getGroupDetails(groupId, userId, userRole = 'user') {
    await this.awaitInit();
    const numGroupId = Number(groupId);
    const numUserId = Number(userId);

    const group = inMemoryStore.chatGroups.find(g => g.id === numGroupId);
    if (!group) throw new Error('Chat group not found');

    const groupMembers = (inMemoryStore.chatGroupMembers || []).filter(m => m.group_id === numGroupId);
    const userMembership = groupMembers.find(m => m.user_id === numUserId);
    const isMember = Boolean(userMembership);
    const isAdmin = userRole === 'admin' || group.created_by === numUserId || userMembership?.role === 'ADMIN';

    // Enrich members with full profile details
    const enrichedMembers = groupMembers.map(m => {
      const prof = this.getUserProfile(m.user_id);
      return {
        id: m.id,
        user_id: m.user_id,
        role: m.role,
        joined_at: m.joined_at,
        is_creator: group.created_by === m.user_id,
        ...prof
      };
    });

    return {
      ...group,
      id: Number(group.id),
      is_member: isMember,
      is_admin: isAdmin,
      can_manage: isAdmin,
      members: enrichedMembers,
      members_count: enrichedMembers.length
    };
  }

  /**
   * Create a new Group Chat
   */
  async createGroup(userId, data) {
    await this.awaitInit();
    const numUserId = Number(userId);

    const { name, description = '', avatar_url = '', category = 'GENERAL', circle = 'ALL', is_private = false, member_ids = [] } = data;

    if (!name || !name.trim()) {
      throw new Error('Group name is required.');
    }

    const defaultAvatars = [
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?auto=format&fit=crop&w=400&q=80'
    ];
    const finalAvatar = avatar_url?.trim() || defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)];

    const newGroupId = inMemoryStore.chatGroups.length > 0 
      ? Math.max(...inMemoryStore.chatGroups.map(g => g.id)) + 1 
      : 1;

    const newGroup = {
      id: newGroupId,
      name: name.trim(),
      description: description?.trim() || '',
      avatar_url: finalAvatar,
      created_by: numUserId,
      category: category || 'GENERAL',
      circle: circle || 'ALL',
      is_private: Boolean(is_private),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // PostgreSQL insert if available
    if (pool) {
      try {
        const dbRes = await pool.query(
          `INSERT INTO chat_groups (name, description, avatar_url, created_by, category, circle, is_private)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING *`,
          [newGroup.name, newGroup.description, newGroup.avatar_url, newGroup.created_by, newGroup.category, newGroup.circle, newGroup.is_private]
        );
        if (dbRes.rows.length > 0) {
          newGroup.id = Number(dbRes.rows[0].id);
        }
      } catch (err) {
        console.warn('⚠️ DB insert chat group error, using memory ID:', err.message);
      }
    }

    inMemoryStore.chatGroups.push(newGroup);

    // Add creator as ADMIN member
    const creatorMemberId = (inMemoryStore.chatGroupMembers.length > 0 
      ? Math.max(...inMemoryStore.chatGroupMembers.map(m => m.id)) + 1 
      : 1);

    const creatorMember = {
      id: creatorMemberId,
      group_id: newGroup.id,
      user_id: numUserId,
      role: 'ADMIN',
      joined_at: new Date().toISOString(),
      last_read_at: new Date().toISOString()
    };
    inMemoryStore.chatGroupMembers.push(creatorMember);

    if (pool) {
      try {
        await pool.query(
          `INSERT INTO chat_group_members (group_id, user_id, role) VALUES ($1, $2, 'ADMIN') ON CONFLICT DO NOTHING`,
          [newGroup.id, numUserId]
        );
      } catch (_) {}
    }

    // Add any initial member IDs
    if (Array.isArray(member_ids) && member_ids.length > 0) {
      for (const mId of member_ids) {
        const cleanMId = Number(mId);
        if (cleanMId !== numUserId && !isNaN(cleanMId)) {
          const nextMemberId = Math.max(...inMemoryStore.chatGroupMembers.map(m => m.id), 0) + 1;
          const newMember = {
            id: nextMemberId,
            group_id: newGroup.id,
            user_id: cleanMId,
            role: 'MEMBER',
            joined_at: new Date().toISOString(),
            last_read_at: new Date().toISOString()
          };
          inMemoryStore.chatGroupMembers.push(newMember);

          if (pool) {
            try {
              await pool.query(
                `INSERT INTO chat_group_members (group_id, user_id, role) VALUES ($1, $2, 'MEMBER') ON CONFLICT DO NOTHING`,
                [newGroup.id, cleanMId]
              );
            } catch (_) {}
          }
        }
      }
    }

    // System welcome message
    const creatorProfile = this.getUserProfile(numUserId);
    const systemMsgId = inMemoryStore.chatMessages.length > 0 
      ? Math.max(...inMemoryStore.chatMessages.map(m => m.id)) + 1 
      : 1;

    const systemMsg = {
      id: systemMsgId,
      group_id: newGroup.id,
      sender_id: numUserId,
      message_text: `🎉 ${creatorProfile.full_name} created the group "${newGroup.name}"`,
      is_system: true,
      created_at: new Date().toISOString()
    };
    inMemoryStore.chatMessages.push(systemMsg);

    if (pool) {
      try {
        await pool.query(
          `INSERT INTO chat_messages (group_id, sender_id, message_text, is_system) VALUES ($1, $2, $3, true)`,
          [newGroup.id, numUserId, systemMsg.message_text]
        );
      } catch (_) {}
    }

    saveChatBackup();
    return await this.getGroupDetails(newGroup.id, numUserId);
  }

  /**
   * Update Group Profile (Admin only)
   */
  async updateGroup(groupId, userId, updates, userRole = 'user') {
    await this.awaitInit();
    const numGroupId = Number(groupId);
    const numUserId = Number(userId);

    const group = inMemoryStore.chatGroups.find(g => g.id === numGroupId);
    if (!group) throw new Error('Chat group not found');

    const member = inMemoryStore.chatGroupMembers.find(m => m.group_id === numGroupId && m.user_id === numUserId);
    const isAdmin = userRole === 'admin' || group.created_by === numUserId || member?.role === 'ADMIN';

    if (!isAdmin) {
      throw new Error('Unauthorized: Only group admins can update group settings.');
    }

    const prevName = group.name;
    if (updates.name && updates.name.trim()) group.name = updates.name.trim();
    if (updates.description !== undefined) group.description = updates.description.trim();
    if (updates.avatar_url) group.avatar_url = updates.avatar_url.trim();
    if (updates.category) group.category = updates.category;
    if (updates.circle) group.circle = updates.circle;
    group.updated_at = new Date().toISOString();

    if (pool) {
      try {
        await pool.query(
          `UPDATE chat_groups SET name = $1, description = $2, avatar_url = $3, category = $4, circle = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6`,
          [group.name, group.description, group.avatar_url, group.category, group.circle, numGroupId]
        );
      } catch (_) {}
    }

    // If name changed, post system message
    if (updates.name && updates.name.trim() !== prevName) {
      const userProfile = this.getUserProfile(numUserId);
      const msgId = (inMemoryStore.chatMessages.length > 0 ? Math.max(...inMemoryStore.chatMessages.map(m => m.id)) : 0) + 1;
      inMemoryStore.chatMessages.push({
        id: msgId,
        group_id: numGroupId,
        sender_id: numUserId,
        message_text: `✏️ ${userProfile.full_name} updated group name to "${group.name}"`,
        is_system: true,
        created_at: new Date().toISOString()
      });
    }

    saveChatBackup();
    return await this.getGroupDetails(numGroupId, numUserId, userRole);
  }

  /**
   * Add members to group (Admin only)
   */
  async addMembers(groupId, userIdsToAdd, requesterId, userRole = 'user') {
    await this.awaitInit();
    const numGroupId = Number(groupId);
    const numRequesterId = Number(requesterId);

    const group = inMemoryStore.chatGroups.find(g => g.id === numGroupId);
    if (!group) throw new Error('Chat group not found');

    const requesterMember = inMemoryStore.chatGroupMembers.find(m => m.group_id === numGroupId && m.user_id === numRequesterId);
    const isAdmin = userRole === 'admin' || group.created_by === numRequesterId || requesterMember?.role === 'ADMIN';

    if (!isAdmin) {
      throw new Error('Unauthorized: Only group admins can add members.');
    }

    const ids = Array.isArray(userIdsToAdd) ? userIdsToAdd : [userIdsToAdd];
    const addedNames = [];

    for (const uId of ids) {
      const numUId = Number(uId);
      if (isNaN(numUId)) continue;

      const alreadyMember = inMemoryStore.chatGroupMembers.some(m => m.group_id === numGroupId && m.user_id === numUId);
      if (!alreadyMember) {
        const nextId = (inMemoryStore.chatGroupMembers.length > 0 ? Math.max(...inMemoryStore.chatGroupMembers.map(m => m.id)) : 0) + 1;
        inMemoryStore.chatGroupMembers.push({
          id: nextId,
          group_id: numGroupId,
          user_id: numUId,
          role: 'MEMBER',
          joined_at: new Date().toISOString(),
          last_read_at: new Date().toISOString()
        });

        if (pool) {
          try {
            await pool.query(
              `INSERT INTO chat_group_members (group_id, user_id, role) VALUES ($1, $2, 'MEMBER') ON CONFLICT DO NOTHING`,
              [numGroupId, numUId]
            );
          } catch (_) {}
        }

        const userProf = this.getUserProfile(numUId);
        addedNames.push(userProf.full_name);
      }
    }

    if (addedNames.length > 0) {
      const reqProf = this.getUserProfile(numRequesterId);
      const msgId = (inMemoryStore.chatMessages.length > 0 ? Math.max(...inMemoryStore.chatMessages.map(m => m.id)) : 0) + 1;
      inMemoryStore.chatMessages.push({
        id: msgId,
        group_id: numGroupId,
        sender_id: numRequesterId,
        message_text: `👤 ${reqProf.full_name} added ${addedNames.join(', ')} to the group.`,
        is_system: true,
        created_at: new Date().toISOString()
      });
    }

    saveChatBackup();
    return await this.getGroupDetails(numGroupId, numRequesterId, userRole);
  }

  /**
   * Remove member or Leave group
   */
  async removeMember(groupId, targetUserId, requesterId, userRole = 'user') {
    await this.awaitInit();
    const numGroupId = Number(groupId);
    const numTargetId = Number(targetUserId);
    const numRequesterId = Number(requesterId);

    const group = inMemoryStore.chatGroups.find(g => g.id === numGroupId);
    if (!group) throw new Error('Chat group not found');

    const requesterMember = inMemoryStore.chatGroupMembers.find(m => m.group_id === numGroupId && m.user_id === numRequesterId);
    const isAdmin = userRole === 'admin' || group.created_by === numRequesterId || requesterMember?.role === 'ADMIN';
    const isSelf = numTargetId === numRequesterId;

    if (!isAdmin && !isSelf) {
      throw new Error('Unauthorized: You can only remove members if you are a group admin.');
    }

    // Cannot remove creator unless creator leaves
    if (group.created_by === numTargetId && !isSelf) {
      throw new Error('Cannot remove the group creator.');
    }

    const memberIdx = inMemoryStore.chatGroupMembers.findIndex(m => m.group_id === numGroupId && m.user_id === numTargetId);
    if (memberIdx === -1) {
      throw new Error('User is not a member of this group.');
    }

    const targetProf = this.getUserProfile(numTargetId);
    const reqProf = this.getUserProfile(numRequesterId);

    inMemoryStore.chatGroupMembers.splice(memberIdx, 1);

    if (pool) {
      try {
        await pool.query(
          `DELETE FROM chat_group_members WHERE group_id = $1 AND user_id = $2`,
          [numGroupId, numTargetId]
        );
      } catch (_) {}
    }

    // System message
    const msgId = (inMemoryStore.chatMessages.length > 0 ? Math.max(...inMemoryStore.chatMessages.map(m => m.id)) : 0) + 1;
    const msgText = isSelf 
      ? `🚪 ${targetProf.full_name} left the group.`
      : `❌ ${reqProf.full_name} removed ${targetProf.full_name} from the group.`;

    inMemoryStore.chatMessages.push({
      id: msgId,
      group_id: numGroupId,
      sender_id: numRequesterId,
      message_text: msgText,
      is_system: true,
      created_at: new Date().toISOString()
    });

    saveChatBackup();
    return { success: true, message: msgText };
  }

  /**
   * Delete Group (Admin/Creator only)
   */
  async deleteGroup(groupId, requesterId, userRole = 'user') {
    await this.awaitInit();
    const numGroupId = Number(groupId);
    const numRequesterId = Number(requesterId);

    const group = inMemoryStore.chatGroups.find(g => g.id === numGroupId);
    if (!group) throw new Error('Chat group not found');

    const isAdmin = userRole === 'admin' || group.created_by === numRequesterId;
    if (!isAdmin) {
      throw new Error('Unauthorized: Only the group creator or system admin can delete this group.');
    }

    inMemoryStore.chatGroups = inMemoryStore.chatGroups.filter(g => g.id !== numGroupId);
    inMemoryStore.chatGroupMembers = inMemoryStore.chatGroupMembers.filter(m => m.group_id !== numGroupId);
    inMemoryStore.chatMessages = inMemoryStore.chatMessages.filter(m => m.group_id !== numGroupId);

    if (pool) {
      try {
        await pool.query(`DELETE FROM chat_groups WHERE id = $1`, [numGroupId]);
      } catch (_) {}
    }

    saveChatBackup();
    return { success: true, message: `Group "${group.name}" deleted successfully.` };
  }

  /**
   * Get Message History
   */
  async getMessages(groupId, userId, limit = 100) {
    await this.awaitInit();
    const numGroupId = Number(groupId);
    const numUserId = Number(userId);

    const group = inMemoryStore.chatGroups.find(g => g.id === numGroupId);
    if (!group) throw new Error('Chat group not found');

    // Update member's last_read_at
    const mem = inMemoryStore.chatGroupMembers.find(m => m.group_id === numGroupId && m.user_id === numUserId);
    if (mem) {
      mem.last_read_at = new Date().toISOString();
      if (pool) {
        try {
          await pool.query(
            `UPDATE chat_group_members SET last_read_at = CURRENT_TIMESTAMP WHERE group_id = $1 AND user_id = $2`,
            [numGroupId, numUserId]
          );
        } catch (_) {}
      }
    }

    const messages = (inMemoryStore.chatMessages || [])
      .filter(m => m.group_id === numGroupId)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      .slice(-limit);

    // Enrich messages with sender profile
    const enriched = messages.map(m => {
      const senderProf = this.getUserProfile(m.sender_id);
      return {
        id: m.id,
        group_id: m.group_id,
        sender_id: m.sender_id,
        message_text: m.message_text,
        attachment_url: m.attachment_url || null,
        attachment_type: m.attachment_type || null,
        is_system: Boolean(m.is_system),
        created_at: m.created_at,
        is_mine: m.sender_id === numUserId,
        sender_name: senderProf.full_name,
        sender_avatar: senderProf.avatar_url,
        sender_member_id: senderProf.member_id,
        sender_designation: senderProf.designation
      };
    });

    return enriched;
  }

  /**
   * Send a Message to Group
   */
  async sendMessage(groupId, senderId, messageText, attachmentUrl = null, attachmentType = null) {
    await this.awaitInit();
    const numGroupId = Number(groupId);
    const numSenderId = Number(senderId);

    const group = inMemoryStore.chatGroups.find(g => g.id === numGroupId);
    if (!group) throw new Error('Chat group not found');

    // Ensure sender is a member or auto-join if public
    let isMember = inMemoryStore.chatGroupMembers.some(m => m.group_id === numGroupId && m.user_id === numSenderId);
    if (!isMember) {
      if (!group.is_private) {
        // Auto-join public group
        const nextId = (inMemoryStore.chatGroupMembers.length > 0 ? Math.max(...inMemoryStore.chatGroupMembers.map(m => m.id)) : 0) + 1;
        inMemoryStore.chatGroupMembers.push({
          id: nextId,
          group_id: numGroupId,
          user_id: numSenderId,
          role: 'MEMBER',
          joined_at: new Date().toISOString(),
          last_read_at: new Date().toISOString()
        });
        isMember = true;
      } else {
        throw new Error('You must be a member of this private group to post messages.');
      }
    }

    if (!messageText || !messageText.trim()) {
      throw new Error('Message text cannot be empty.');
    }

    const nextMsgId = (inMemoryStore.chatMessages.length > 0 ? Math.max(...inMemoryStore.chatMessages.map(m => m.id)) : 0) + 1;
    const newMsg = {
      id: nextMsgId,
      group_id: numGroupId,
      sender_id: numSenderId,
      message_text: messageText.trim(),
      attachment_url: attachmentUrl || null,
      attachment_type: attachmentType || null,
      is_system: false,
      created_at: new Date().toISOString()
    };

    if (pool) {
      try {
        const dbRes = await pool.query(
          `INSERT INTO chat_messages (group_id, sender_id, message_text, attachment_url, attachment_type, is_system)
           VALUES ($1, $2, $3, $4, $5, false)
           RETURNING *`,
          [numGroupId, numSenderId, newMsg.message_text, newMsg.attachment_url, newMsg.attachment_type]
        );
        if (dbRes.rows.length > 0) {
          newMsg.id = Number(dbRes.rows[0].id);
        }
      } catch (_) {}
    }

    inMemoryStore.chatMessages.push(newMsg);

    // Update group updated_at
    group.updated_at = new Date().toISOString();

    // Update sender's last_read_at
    const mem = inMemoryStore.chatGroupMembers.find(m => m.group_id === numGroupId && m.user_id === numSenderId);
    if (mem) mem.last_read_at = new Date().toISOString();

    saveChatBackup();

    const senderProf = this.getUserProfile(numSenderId);
    return {
      ...newMsg,
      is_mine: true,
      sender_name: senderProf.full_name,
      sender_avatar: senderProf.avatar_url,
      sender_member_id: senderProf.member_id,
      sender_designation: senderProf.designation
    };
  }

  /**
   * Search Union Directory for Adding Members
   */
  async getDirectory(search = '', currentUserId = null) {
    await this.awaitInit();
    const term = (search || '').toLowerCase().trim();
    const numCurrId = Number(currentUserId);

    const users = (inMemoryStore.users || []).filter(u => u.status === 'active' && u.id !== numCurrId);

    const members = users.map(u => ({
      id: u.id,
      full_name: u.profile?.full_name || u.email?.split('@')[0] || 'Member',
      avatar_url: u.profile?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      member_id: u.member_id || '',
      email: u.email,
      phone: u.profile?.phone || '',
      circle: u.profile?.circle || 'All Circles',
      designation: u.profile?.union_designation || u.profile?.designation || 'Member'
    }));

    if (!term) return members.slice(0, 50);

    return members.filter(m => 
      m.full_name.toLowerCase().includes(term) ||
      m.member_id.toLowerCase().includes(term) ||
      m.circle.toLowerCase().includes(term) ||
      m.email.toLowerCase().includes(term)
    );
  }
}

export default new ChatService();
