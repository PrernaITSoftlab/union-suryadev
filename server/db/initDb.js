import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';
import { INITIAL_USERS } from './seedData.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false }
});

export async function initializeDatabase() {
  if (!process.env.DATABASE_URL) {
    console.log('⚠️ DATABASE_URL not set in server/.env');
    return;
  }

  const client = await pool.connect();
  try {
    console.log('⏳ Initializing PostgreSQL schema on Neon database...');
    const schemaPath = path.join(__dirname, 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf-8');

    await client.query(sql);
    console.log('✅ PostgreSQL Schema initialized successfully!');

    // Seed Dummy Member & Admin Users into PostgreSQL Users Table
    for (const u of INITIAL_USERS) {
      await client.query(`
        INSERT INTO users (id, email, password_hash, role, status, member_id)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO UPDATE 
        SET email = EXCLUDED.email,
            password_hash = EXCLUDED.password_hash,
            role = EXCLUDED.role,
            status = EXCLUDED.status,
            member_id = EXCLUDED.member_id;
      `, [u.id, u.email, u.password_hash, u.role, u.status, u.member_id]);

      if (u.profile) {
        const p = u.profile;
        await client.query(`
          INSERT INTO member_profiles (
            id, user_id, full_name, father_husband_name, dob, gender, avatar_url, phone, whatsapp,
            address, city, district, state, pin_code, occupation, company, designation, circle, union_designation, bio, emergency_contact, joining_date, is_public, contact_privacy
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24
          ) ON CONFLICT (user_id) DO UPDATE SET
            full_name = EXCLUDED.full_name,
            designation = EXCLUDED.designation,
            circle = EXCLUDED.circle,
            union_designation = EXCLUDED.union_designation;
        `, [
          p.id, u.id, p.full_name, p.father_husband_name, p.dob, p.gender, p.avatar_url, p.phone, p.whatsapp,
          p.address, p.city, p.district, p.state, p.pin_code, p.occupation, p.company, p.designation, p.circle, p.union_designation, p.bio, p.emergency_contact, p.joining_date, p.is_public, JSON.stringify(p.contact_privacy)
        ]);
      }
    }
    console.log('✅ Dummy Member and Admin accounts populated in database!');

    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema='public'
      ORDER BY table_name;
    `);
    console.log('📋 Tables in Neon PostgreSQL database:', res.rows.map(r => r.table_name));
  } catch (err) {
    console.error('❌ Error initializing database schema:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  initializeDatabase();
}
