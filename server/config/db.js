import pg from 'pg';
import dotenv from 'dotenv';
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
  INITIAL_CONTACT_SUBMISSIONS
} from '../db/seedData.js';

dotenv.config();

const { Pool } = pg;

let pool = null;
let isPgConnected = false;

// High-Performance Local In-Memory Database Store for MPWZ Union
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
  auditLogs: [
    {
      id: 1,
      action: "SYSTEM_INITIALIZED",
      actor_id: 1,
      actor_name: "System",
      entity_type: "SYSTEM",
      entity_id: "0",
      details: "MPWZ Union platform initialized with default configurations.",
      created_at: new Date().toISOString()
    }
  ]
};

if (process.env.DATABASE_URL) {
  try {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
    });

    pool.connect((err, client, release) => {
      if (err) {
        console.warn('⚠️ PostgreSQL connection unconfigured. Running seamlessly with local in-memory DB store.');
        isPgConnected = false;
      } else {
        isPgConnected = true;
        console.log('✅ Connected to PostgreSQL Database successfully.');
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
  if (isPgConnected && pool) {
    try {
      return await pool.query(text, params);
    } catch (err) {
      console.error('Database Query Error:', err.message);
      throw err;
    }
  } else {
    return { rows: [], rowCount: 0 };
  }
};

export { isPgConnected, pool };
