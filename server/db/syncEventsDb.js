import { pool, isPgConnected, inMemoryStore } from '../config/db.js';
import { INITIAL_EVENTS } from './seedData.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BACKUP_FILE = path.join(__dirname, 'events_backup.json');
const INTERACTIONS_BACKUP_FILE = path.join(__dirname, 'event_interactions_backup.json');

export function saveEventsToBackup(events) {
  try {
    fs.writeFileSync(BACKUP_FILE, JSON.stringify(events, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Could not write events backup file:', err.message);
  }
}

export function loadEventsFromBackup() {
  try {
    if (fs.existsSync(BACKUP_FILE)) {
      const data = fs.readFileSync(BACKUP_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Could not read events backup file:', err.message);
  }
  return null;
}

export function saveInteractionsToBackup(interactions) {
  try {
    fs.writeFileSync(INTERACTIONS_BACKUP_FILE, JSON.stringify(interactions, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Could not write event interactions backup file:', err.message);
  }
}

export function loadInteractionsFromBackup() {
  try {
    if (fs.existsSync(INTERACTIONS_BACKUP_FILE)) {
      const data = fs.readFileSync(INTERACTIONS_BACKUP_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Could not read event interactions backup file:', err.message);
  }
  return null;
}

export async function ensureEventsSchemaAndSeed() {
  if (!pool) {
    console.warn('⚠️ No PostgreSQL pool available. Using local events backup / in-memory store.');
    return;
  }

  try {
    // 1. Ensure events_status_check allows UPCOMING as well
    try {
      await pool.query(`
        ALTER TABLE events DROP CONSTRAINT IF EXISTS events_status_check;
        ALTER TABLE events ADD CONSTRAINT events_status_check 
          CHECK (status IN ('DRAFT', 'PUBLISHED', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'COMPLETED', 'CANCELLED', 'UPCOMING'));
      `);
      console.log('✅ PostgreSQL events_status_check constraint updated to support UPCOMING.');
    } catch (conErr) {
      console.warn('⚠️ Notice on events_status_check update:', conErr.message);
    }

    // 2. Check if events table has records
    const countRes = await pool.query('SELECT count(*) as count FROM events');
    const count = parseInt(countRes.rows[0]?.count || '0', 10);
    console.log(`ℹ️ Current events count in PostgreSQL: ${count}`);

    if (count === 0) {
      console.log('⏳ Seeding INITIAL_EVENTS into PostgreSQL events table...');
      for (const evt of INITIAL_EVENTS) {
        await pool.query(`
          INSERT INTO events (
            id, title, description, banner_url, event_type, start_date, end_date,
            start_time, end_time, venue, address, capacity, registered_count,
            registration_start_date, registration_end_date, is_paid, event_fee,
            payment_qr_url, payment_instructions, whatsapp_contact, visibility,
            status, created_by, created_at, updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7,
            $8, $9, $10, $11, $12, $13,
            $14, $15, $16, $17,
            $18, $19, $20, $21,
            $22, $23, $24, $25
          ) ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            start_date = EXCLUDED.start_date,
            venue = EXCLUDED.venue,
            updated_at = EXCLUDED.updated_at;
        `, [
          evt.id,
          evt.title,
          evt.description,
          evt.banner_url || null,
          evt.event_type || 'GENERAL',
          evt.start_date,
          evt.end_date || evt.start_date,
          evt.start_time || '10:00 AM',
          evt.end_time || '05:00 PM',
          evt.venue,
          evt.address || evt.venue,
          evt.capacity || 500,
          evt.registered_count || 0,
          evt.registration_start_date || evt.start_date,
          evt.registration_end_date || evt.start_date,
          Boolean(evt.is_paid),
          evt.event_fee || 0,
          evt.payment_qr_url || null,
          evt.payment_instructions || null,
          evt.whatsapp_contact || null,
          evt.visibility || 'PUBLIC',
          evt.status || 'REGISTRATION_OPEN',
          evt.created_by || 1,
          evt.created_at || new Date().toISOString(),
          evt.updated_at || new Date().toISOString()
        ]);
      }

      // Update sequence to highest id
      await pool.query(`SELECT setval('events_id_seq', (SELECT COALESCE(MAX(id), 1) FROM events));`);
      console.log('✅ INITIAL_EVENTS seeded into PostgreSQL successfully.');
    }

    // 3. Ensure event_likes and event_comments tables exist
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS event_likes (
          id SERIAL PRIMARY KEY,
          event_id INT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
          user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          guest_id VARCHAR(255),
          UNIQUE(event_id, user_id)
        );

        CREATE TABLE IF NOT EXISTS event_comments (
          id SERIAL PRIMARY KEY,
          event_id INT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
          user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          author_name VARCHAR(255),
          author_avatar TEXT,
          content TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          guest_id VARCHAR(255)
        );
      `);
      console.log('✅ PostgreSQL event_likes and event_comments tables verified.');
    } catch (tableErr) {
      console.warn('⚠️ Notice on creating event interaction tables:', tableErr.message);
    }

    // 4. Ensure unique constraint on event_likes
    try {
      await pool.query('ALTER TABLE event_likes ADD CONSTRAINT event_likes_event_user_unique UNIQUE (event_id, user_id);');
    } catch (_) {}

    // 5. Load interactions from DB and update inMemoryStore & backup
    try {
      const dbLikes = await pool.query('SELECT * FROM event_likes ORDER BY created_at ASC');
      const dbComments = await pool.query('SELECT * FROM event_comments ORDER BY created_at ASC');
      inMemoryStore.eventLikes = dbLikes.rows.map(r => ({
        ...r,
        id: Number(r.id),
        event_id: Number(r.event_id),
        user_id: Number(r.user_id)
      }));
      inMemoryStore.eventComments = dbComments.rows.map(r => ({
        ...r,
        id: Number(r.id),
        event_id: Number(r.event_id),
        user_id: Number(r.user_id)
      }));
      saveInteractionsToBackup({
        likes: inMemoryStore.eventLikes,
        comments: inMemoryStore.eventComments
      });
      console.log(`✅ Loaded & backed up ${inMemoryStore.eventLikes.length} likes and ${inMemoryStore.eventComments.length} comments from PostgreSQL.`);
    } catch (intErr) {
      console.warn('⚠️ Could not backup event interactions:', intErr.message);
    }

    // 5. Sync events from PostgreSQL into backup file
    const allEvents = await pool.query(`
      SELECT e.*,
        (SELECT COUNT(*)::int FROM event_likes WHERE event_id = e.id) AS likes_count,
        (SELECT COUNT(*)::int FROM event_comments WHERE event_id = e.id) AS comments_count,
        false AS is_liked
      FROM events e
      ORDER BY e.start_date ASC, e.id ASC
    `);
    const normalized = allEvents.rows.map(normalizeEventRow);
    saveEventsToBackup(normalized);
    console.log(`✅ Loaded & backed up ${normalized.length} events from PostgreSQL.`);
    return normalized;
  } catch (err) {
    console.error('❌ Error in ensureEventsSchemaAndSeed:', err.message);
    const backup = loadEventsFromBackup();
    return backup || INITIAL_EVENTS;
  }
}

export function formatDbDate(val) {
  if (!val) return null;
  if (val instanceof Date) {
    const y = val.getFullYear();
    const m = String(val.getMonth() + 1).padStart(2, '0');
    const d = String(val.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  const s = String(val).trim();
  if (s.length >= 10 && /^\d{4}-\d{2}-\d{2}/.test(s)) {
    return s.slice(0, 10);
  }
  const parsed = new Date(s);
  if (!isNaN(parsed.getTime())) {
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, '0');
    const d = String(parsed.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  return s;
}

export function normalizeEventRow(row) {
  if (!row) return null;
  return {
    ...row,
    id: Number(row.id),
    capacity: Number(row.capacity || 0),
    registered_count: Number(row.registered_count || 0),
    event_fee: Number(row.event_fee || 0),
    is_paid: Boolean(row.is_paid),
    likes_count: Number(row.likes_count || 0),
    comments_count: Number(row.comments_count || 0),
    is_liked: Boolean(row.is_liked),
    start_date: formatDbDate(row.start_date) || '',
    end_date: formatDbDate(row.end_date) || formatDbDate(row.start_date) || '',
    registration_start_date: formatDbDate(row.registration_start_date) || formatDbDate(row.start_date) || '',
    registration_end_date: formatDbDate(row.registration_end_date) || formatDbDate(row.start_date) || '',
    visibility: row.visibility || 'PUBLIC',
    status: row.status || 'REGISTRATION_OPEN'
  };
}

