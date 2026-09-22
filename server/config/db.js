import pg from 'pg';
import dotenv from 'dotenv';
import { 
  INITIAL_MEMBERS, 
  INITIAL_OPPORTUNITIES, 
  INITIAL_EVENTS, 
  INITIAL_TESTIMONIALS, 
  INITIAL_CONNECTIONS, 
  INITIAL_NOTIFICATIONS 
} from '../db/seedData.js';

dotenv.config();

const { Pool } = pg;

let pool = null;
let isPgConnected = false;

// In-Memory Database fallback state
export const inMemoryStore = {
  users: [...INITIAL_MEMBERS],
  opportunities: [...INITIAL_OPPORTUNITIES],
  events: [...INITIAL_EVENTS],
  testimonials: [...INITIAL_TESTIMONIALS],
  connections: [...INITIAL_CONNECTIONS],
  notifications: [...INITIAL_NOTIFICATIONS],
  eventRegistrations: [
    { id: 1, event_id: 1, user_id: 2, registered_at: "2026-09-20T10:00:00Z" }
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
        console.warn('⚠️ Neon PostgreSQL connection failed or unconfigured. Using high-performance local in-memory DB fallback.');
        isPgConnected = false;
      } else {
        isPgConnected = true;
        console.log('✅ Connected to Neon PostgreSQL Database successfully.');
        release();
      }
    });
  } catch (error) {
    console.warn('⚠️ PG Pool initialization error. Using in-memory database fallback.');
    isPgConnected = false;
  }
} else {
  console.log('ℹ️ DATABASE_URL not set in server/.env. Platform running seamlessly with local in-memory store.');
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
    // Return structured object mimicking pg query result for fallback
    return { rows: [], rowCount: 0 };
  }
};

export { isPgConnected, pool };
