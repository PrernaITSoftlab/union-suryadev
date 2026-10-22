import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool, inMemoryStore } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CHAT_BACKUP_FILE = path.join(__dirname, 'chat_backup.json');

export const INITIAL_CHAT_GROUPS = [
  {
    id: 1,
    name: "MPVMAVAKS Central Executive Union (प्रांतीय कार्यसमिति)",
    description: "Official executive committee channel for state delegates, circulars, and statewide coordination.",
    avatar_url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=400&q=80",
    created_by: 1,
    category: "EXECUTIVE",
    circle: "All Circles",
    is_private: false,
    created_at: "2026-10-01T09:00:00.000Z"
  },
  {
    id: 2,
    name: "Indore Circle Power Engineers & Linemen Forum",
    description: "Malwa & Nimar zone technical maintenance, sub-station operations, and grievance discussion.",
    avatar_url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80",
    created_by: 1,
    category: "DISTRICT",
    circle: "Indore City Circle",
    is_private: false,
    created_at: "2026-10-02T10:30:00.000Z"
  },
  {
    id: 3,
    name: "High-Voltage PTW & Line Safety Forum",
    description: "33kV/11kV field safety, permit-to-work guidelines, and accident prevention support.",
    avatar_url: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=400&q=80",
    created_by: 2,
    category: "SAFETY",
    circle: "All Circles",
    is_private: false,
    created_at: "2026-10-05T14:00:00.000Z"
  },
  {
    id: 4,
    name: "Old Pension Scheme (OPS) & Pay Scale Advocacy",
    description: "Statewide OPS restoration updates, memorandum representations, and welfare agitations.",
    avatar_url: "https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?auto=format&fit=crop&w=400&q=80",
    created_by: 1,
    category: "WELFARE",
    circle: "All Circles",
    is_private: false,
    created_at: "2026-10-08T11:15:00.000Z"
  }
];

export const INITIAL_CHAT_MEMBERS = [
  // Group 1
  { id: 1, group_id: 1, user_id: 1, role: 'ADMIN', joined_at: "2026-10-01T09:00:00.000Z" },
  { id: 2, group_id: 1, user_id: 2, role: 'MEMBER', joined_at: "2026-10-01T09:05:00.000Z" },
  { id: 3, group_id: 1, user_id: 3, role: 'MEMBER', joined_at: "2026-10-01T09:10:00.000Z" },
  { id: 4, group_id: 1, user_id: 4, role: 'ADMIN', joined_at: "2026-10-01T09:15:00.000Z" },
  { id: 5, group_id: 1, user_id: 5, role: 'ADMIN', joined_at: "2026-10-01T09:20:00.000Z" },

  // Group 2
  { id: 6, group_id: 2, user_id: 1, role: 'ADMIN', joined_at: "2026-10-02T10:30:00.000Z" },
  { id: 7, group_id: 2, user_id: 2, role: 'MEMBER', joined_at: "2026-10-02T10:35:00.000Z" },
  { id: 8, group_id: 2, user_id: 3, role: 'MEMBER', joined_at: "2026-10-02T10:40:00.000Z" },

  // Group 3
  { id: 9, group_id: 3, user_id: 2, role: 'ADMIN', joined_at: "2026-10-05T14:00:00.000Z" },
  { id: 10, group_id: 3, user_id: 1, role: 'MEMBER', joined_at: "2026-10-05T14:05:00.000Z" },
  { id: 11, group_id: 3, user_id: 3, role: 'MEMBER', joined_at: "2026-10-05T14:10:00.000Z" },

  // Group 4
  { id: 12, group_id: 4, user_id: 1, role: 'ADMIN', joined_at: "2026-10-08T11:15:00.000Z" },
  { id: 13, group_id: 4, user_id: 2, role: 'MEMBER', joined_at: "2026-10-08T11:20:00.000Z" },
  { id: 14, group_id: 4, user_id: 4, role: 'MEMBER', joined_at: "2026-10-08T11:25:00.000Z" }
];

export const INITIAL_CHAT_MESSAGES = [
  // Group 1 Messages
  {
    id: 1,
    group_id: 1,
    sender_id: 1,
    message_text: "Welcome delegates and executives to the official MPVMAVAKS Central Executive Union channel. All circulars, state delegation agendas, and official correspondence will be coordinated here.",
    is_system: false,
    created_at: "2026-10-18T10:00:00.000Z"
  },
  {
    id: 2,
    group_id: 1,
    sender_id: 2,
    message_text: "Namaskar General Secretary Ji. The Indore Circle delegation representation for 7th Pay DA arrears and PTW insurance has been finalized for the upcoming convention.",
    is_system: false,
    created_at: "2026-10-18T10:15:00.000Z"
  },
  {
    id: 3,
    group_id: 1,
    sender_id: 4,
    message_text: "Excellent. Central office has also submitted the formal reminder to the Energy Secretary. All circle delegates are requested to confirm their attendance.",
    is_system: false,
    created_at: "2026-10-18T11:00:00.000Z"
  },

  // Group 2 Messages
  {
    id: 4,
    group_id: 2,
    sender_id: 1,
    message_text: "Welcome to the Indore Circle forum. All sub-station maintenance and lineman safety issues can be posted here for immediate union action.",
    is_system: false,
    created_at: "2026-10-19T09:30:00.000Z"
  },
  {
    id: 5,
    group_id: 2,
    sender_id: 3,
    message_text: "Polo Ground division staff have reported shortages of Class-4 tested insulating gloves. We need replacement kits before the festive maintenance drive.",
    is_system: false,
    created_at: "2026-10-19T09:45:00.000Z"
  },
  {
    id: 6,
    group_id: 2,
    sender_id: 2,
    message_text: "Noted Er. Mahendra. Union executive team has already drafted the requisition letter to CE (O&M) Indore. Will share the receipt number shortly.",
    is_system: false,
    created_at: "2026-10-19T10:10:00.000Z"
  },

  // Group 3 Messages
  {
    id: 7,
    group_id: 3,
    sender_id: 2,
    message_text: "High-Voltage PTW (Permit-to-Work) Safety Forum initialized. Zero tolerance for working on live 33kV/11kV lines without certified earthing discharge rods.",
    is_system: false,
    created_at: "2026-10-20T08:00:00.000Z"
  },
  {
    id: 8,
    group_id: 3,
    sender_id: 1,
    message_text: "Safety guidelines circular has been published under Correspondence & Orders. Every shift engineer must verify PTW before authorizing line climbing.",
    is_system: false,
    created_at: "2026-10-20T08:30:00.000Z"
  }
];

// Persistent backup to disk
export const saveChatBackup = (data = null) => {
  try {
    const payload = data || {
      groups: inMemoryStore.chatGroups || [],
      members: inMemoryStore.chatGroupMembers || [],
      messages: inMemoryStore.chatMessages || []
    };
    fs.writeFileSync(CHAT_BACKUP_FILE, JSON.stringify(payload, null, 2), 'utf-8');
  } catch (err) {
    console.warn('⚠️ Could not save chat_backup.json:', err.message);
  }
};

// Load chat backup from disk
export const loadChatBackup = () => {
  try {
    if (fs.existsSync(CHAT_BACKUP_FILE)) {
      const content = fs.readFileSync(CHAT_BACKUP_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (parsed && Array.isArray(parsed.groups)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('⚠️ Could not load chat_backup.json:', err.message);
  }
  return null;
};

// Ensure PostgreSQL chat tables and initialize in-memory store
export async function ensureChatSchemaAndSeed() {
  // 1. Initialize In-Memory Store from Backup or Seed Defaults
  const backup = loadChatBackup();
  if (backup && backup.groups && backup.groups.length > 0) {
    inMemoryStore.chatGroups = backup.groups;
    inMemoryStore.chatGroupMembers = backup.members || [];
    inMemoryStore.chatMessages = backup.messages || [];
    console.log(`📁 Loaded ${backup.groups.length} chat groups & ${backup.messages?.length || 0} messages from disk backup.`);
  } else {
    inMemoryStore.chatGroups = [...INITIAL_CHAT_GROUPS];
    inMemoryStore.chatGroupMembers = [...INITIAL_CHAT_MEMBERS];
    inMemoryStore.chatMessages = [...INITIAL_CHAT_MESSAGES];
    saveChatBackup();
    console.log(`✅ Seeded ${INITIAL_CHAT_GROUPS.length} default union chat groups into local memory & disk backup.`);
  }

  // 2. Ensure PostgreSQL tables if connected
  if (!pool) return;

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS chat_groups (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        avatar_url TEXT,
        created_by INT REFERENCES users(id) ON DELETE SET NULL,
        category VARCHAR(100) DEFAULT 'GENERAL',
        circle VARCHAR(100) DEFAULT 'ALL',
        is_private BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS chat_group_members (
        id SERIAL PRIMARY KEY,
        group_id INT REFERENCES chat_groups(id) ON DELETE CASCADE,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        role VARCHAR(50) DEFAULT 'MEMBER' CHECK (role IN ('ADMIN', 'MEMBER')),
        joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        last_read_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(group_id, user_id)
      );

      CREATE TABLE IF NOT EXISTS chat_messages (
        id SERIAL PRIMARY KEY,
        group_id INT REFERENCES chat_groups(id) ON DELETE CASCADE,
        sender_id INT REFERENCES users(id) ON DELETE SET NULL,
        message_text TEXT NOT NULL,
        attachment_url TEXT,
        attachment_type VARCHAR(50),
        is_system BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_chat_messages_group ON chat_messages(group_id, created_at);
      CREATE INDEX IF NOT EXISTS idx_chat_members_user ON chat_group_members(user_id);
    `);

    // Check count in PostgreSQL
    const res = await pool.query('SELECT COUNT(*) AS count FROM chat_groups');
    const count = parseInt(res.rows[0]?.count || '0', 10);
    if (count === 0) {
      console.log('⏳ Seeding chat groups into PostgreSQL database...');
      for (const g of inMemoryStore.chatGroups) {
        await pool.query(
          `INSERT INTO chat_groups (id, name, description, avatar_url, created_by, category, circle, is_private, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           ON CONFLICT (id) DO NOTHING`,
          [g.id, g.name, g.description, g.avatar_url, g.created_by, g.category, g.circle, g.is_private, g.created_at]
        );
      }
      // Seed members
      for (const m of inMemoryStore.chatGroupMembers) {
        await pool.query(
          `INSERT INTO chat_group_members (id, group_id, user_id, role, joined_at)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (group_id, user_id) DO NOTHING`,
          [m.id, m.group_id, m.user_id, m.role, m.joined_at]
        );
      }
      // Seed messages
      for (const msg of inMemoryStore.chatMessages) {
        await pool.query(
          `INSERT INTO chat_messages (id, group_id, sender_id, message_text, is_system, created_at)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (id) DO NOTHING`,
          [msg.id, msg.group_id, msg.sender_id, msg.message_text, msg.is_system || false, msg.created_at]
        );
      }
      // Reset sequences
      await pool.query(`SELECT setval('chat_groups_id_seq', (SELECT COALESCE(MAX(id), 1) FROM chat_groups))`);
      await pool.query(`SELECT setval('chat_group_members_id_seq', (SELECT COALESCE(MAX(id), 1) FROM chat_group_members))`);
      await pool.query(`SELECT setval('chat_messages_id_seq', (SELECT COALESCE(MAX(id), 1) FROM chat_messages))`);
      console.log('✅ PostgreSQL chat tables seeded successfully.');
    }
  } catch (err) {
    console.warn('⚠️ Notice on PostgreSQL chat sync:', err.message);
  }
}
