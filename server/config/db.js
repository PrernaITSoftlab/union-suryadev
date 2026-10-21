import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  INITIAL_SYSTEM_SETTINGS,
  INITIAL_USERS,
  INITIAL_MEMBERSHIP_APPLICATIONS,
  INITIAL_EVENTS,
  INITIAL_EVENT_REGISTRATIONS,
  INITIAL_PAYMENTS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_UNION_STORIES,
  INITIAL_SHARED_DOCUMENTS,
  INITIAL_CONTACT_SUBMISSIONS,
  INITIAL_EVENT_LIKES,
  INITIAL_EVENT_COMMENTS
} from '../db/seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const USERS_BACKUP_FILE = path.join(__dirname, '../db/users_backup.json');

const { Pool } = pg;

let pool = null;
let isPgConnected = false;

// High-Performance Local In-Memory Database Store for MPVMAVAKS Union
export const inMemoryStore = {
  systemSettings: { ...INITIAL_SYSTEM_SETTINGS },
  users: [...INITIAL_USERS],
  membershipApplications: [...INITIAL_MEMBERSHIP_APPLICATIONS],
  events: [...INITIAL_EVENTS],
  eventRegistrations: [...INITIAL_EVENT_REGISTRATIONS],
  payments: [...INITIAL_PAYMENTS],
  announcements: [...INITIAL_ANNOUNCEMENTS],
  notifications: [...INITIAL_NOTIFICATIONS],
  unionStories: [...INITIAL_UNION_STORIES],
  sharedDocuments: [...INITIAL_SHARED_DOCUMENTS],
  contactSubmissions: [...INITIAL_CONTACT_SUBMISSIONS],
  eventLikes: [...INITIAL_EVENT_LIKES],
  eventComments: [...INITIAL_EVENT_COMMENTS],
  auditLogs: [
    {
      id: 1,
      action: "SYSTEM_INITIALIZED",
      actor_id: 1,
      actor_name: "System",
      entity_type: "SYSTEM",
      entity_id: "0",
      details: "MPVMAVAKS Union platform initialized with default configurations.",
      created_at: new Date().toISOString()
    }
  ]
};

// Save users to local persistent storage (users_backup.json)
export const saveUsersBackup = () => {
  try {
    fs.writeFileSync(USERS_BACKUP_FILE, JSON.stringify(inMemoryStore.users, null, 2), 'utf-8');
  } catch (err) {
    console.warn('⚠️ Could not save users_backup.json:', err.message);
  }
};

// Load users from local persistent storage on startup
export const loadUsersBackup = () => {
  try {
    if (fs.existsSync(USERS_BACKUP_FILE)) {
      const data = fs.readFileSync(USERS_BACKUP_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        inMemoryStore.users = parsed;
        console.log(`📁 Loaded ${parsed.length} users with photos from disk storage (users_backup.json).`);
      }
    }
  } catch (err) {
    console.warn('⚠️ Could not read users_backup.json:', err.message);
  }
};

// Pre-load from disk backup if present
loadUsersBackup();

if (process.env.DATABASE_URL) {
  try {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
    });

    pool.connect(async (err, client, release) => {
      if (err) {
        console.warn('⚠️ PostgreSQL connection unconfigured. Running seamlessly with local in-memory DB store.');
        isPgConnected = false;
      } else {
        isPgConnected = true;
        console.log('✅ Connected to PostgreSQL Database successfully.');

        // Hydrate from PostgreSQL Database so profile photos and updates persist across server/page restarts
        try {
          const dbUsers = await client.query(`
            SELECT u.id, u.email, u.password_hash, u.role, u.status, u.member_id,
                   p.id as profile_id, p.full_name, p.father_husband_name, p.dob, p.gender,
                   p.avatar_url, p.phone, p.whatsapp, p.address, p.city, p.district, p.state,
                   p.pin_code, p.occupation, p.company, p.designation, p.circle,
                   p.union_designation, p.bio, p.emergency_contact, p.joining_date,
                   p.is_public, p.contact_privacy
            FROM users u
            LEFT JOIN member_profiles p ON u.id = p.user_id
            ORDER BY u.id ASC
          `);
          if (dbUsers.rows.length > 0) {
            inMemoryStore.users = dbUsers.rows.map(r => ({
              id: r.id,
              email: r.email,
              password_hash: r.password_hash,
              role: r.role,
              status: r.status,
              member_id: r.member_id,
              profile: {
                id: r.profile_id || r.id,
                user_id: r.id,
                full_name: r.full_name,
                father_husband_name: r.father_husband_name,
                dob: r.dob,
                gender: r.gender,
                avatar_url: r.avatar_url,
                phone: r.phone,
                whatsapp: r.whatsapp,
                address: r.address,
                city: r.city,
                district: r.district,
                state: r.state,
                pin_code: r.pin_code,
                occupation: r.occupation,
                company: r.company,
                designation: r.designation,
                circle: r.circle,
                union_designation: r.union_designation,
                bio: r.bio,
                emergency_contact: r.emergency_contact,
                joining_date: r.joining_date,
                is_public: r.is_public,
                contact_privacy: r.contact_privacy
              }
            }));
            saveUsersBackup();
            console.log(`✅ Loaded ${inMemoryStore.users.length} users with updated profiles from PostgreSQL.`);
          }
        } catch (dbErr) {
          console.warn('⚠️ Could not hydrate from DB:', dbErr.message);
        }

        release();
      }
    });
  } catch (error) {
    console.warn('⚠️ PG Pool initialization error. Using in-memory database fallback.');
    isPgConnected = false;
  }
} else {
  console.log('ℹ️ DATABASE_URL not set in server/.env. Running seamlessly with high-performance local in-memory store.');
}

export const query = async (text, params) => {
  if (pool) {
    try {
      const res = await pool.query(text, params);
      isPgConnected = true;
      return res;
    } catch (err) {
      console.error('Database Query Error:', err.message);
      throw err;
    }
  } else {
    return { rows: [], rowCount: 0 };
  }
};

export { isPgConnected, pool };
