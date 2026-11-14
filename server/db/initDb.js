import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';
import { INITIAL_USERS, INITIAL_EVENTS, INITIAL_MEMBERSHIP_APPLICATIONS } from './seedData.js';

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

    // Ensure existing rows are migrated to clean MPAVAKS- IDs
    await client.query("UPDATE users SET member_id = 'MPAVAKS-0004' WHERE id = 2 AND member_id = 'MPAVAKS-0001'");
    await client.query("UPDATE users SET member_id = 'MPAVAKS-0001' WHERE (role = 'admin' OR id = 1) AND (member_id LIKE 'UNION-%' OR member_id = 'UNION-ADMIN-001' OR member_id IS NULL)");
    await client.query("UPDATE users SET member_id = REPLACE(member_id, 'UNION-ADMIN-', 'MPAVAKS-') WHERE member_id LIKE 'UNION-ADMIN-%'");
    await client.query("UPDATE users SET member_id = REPLACE(member_id, 'UNION-', 'MPAVAKS-') WHERE member_id LIKE 'UNION-%'");

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

    // Update constraint & seed INITIAL_EVENTS into PostgreSQL
    try {
      await client.query(`
        ALTER TABLE events DROP CONSTRAINT IF EXISTS events_status_check;
        ALTER TABLE events ADD CONSTRAINT events_status_check 
          CHECK (status IN ('DRAFT', 'PUBLISHED', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'COMPLETED', 'CANCELLED', 'UPCOMING'));
      `);
    } catch (_) {}

    for (const evt of INITIAL_EVENTS) {
      await client.query(`
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
        evt.id, evt.title, evt.description, evt.banner_url || null, evt.event_type || 'GENERAL',
        evt.start_date, evt.end_date || evt.start_date, evt.start_time || '10:00 AM', evt.end_time || '05:00 PM',
        evt.venue, evt.address || evt.venue, evt.capacity || 500, evt.registered_count || 0,
        evt.registration_start_date || evt.start_date, evt.registration_end_date || evt.start_date,
        Boolean(evt.is_paid), evt.event_fee || 0, evt.payment_qr_url || null, evt.payment_instructions || null,
        evt.whatsapp_contact || null, evt.visibility || 'PUBLIC', evt.status || 'REGISTRATION_OPEN',
        evt.created_by || 1, evt.created_at || new Date().toISOString(), evt.updated_at || new Date().toISOString()
      ]);
    }
    await client.query(`SELECT setval('events_id_seq', (SELECT COALESCE(MAX(id), 1) FROM events));`);
    console.log('✅ Initial events populated in database!');

    // Seed Initial Membership Applications into PostgreSQL
    for (const app of INITIAL_MEMBERSHIP_APPLICATIONS) {
      await client.query(`
        INSERT INTO membership_applications (
          id, application_no, full_name, father_husband_name, father_name, mobile, whatsapp,
          whatsapp_mobile, email, address, city, district, state, pin_code,
          occupation, company, designation, company_name, district_name,
          post_name, union_post, employee_type, category, employee_class,
          category_person, member_category, profile_photo_url, registration_fee,
          payment_status, application_status, transaction_id, payment_proof_url,
          payment_date, payment_note, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7,
          $8, $9, $10, $11, $12, $13, $14,
          $15, $16, $17, $18, $19,
          $20, $21, $22, $23, $24,
          $25, $26, $27, $28,
          $29, $30, $31, $32,
          $33, $34, $35, $36
        ) ON CONFLICT (application_no) DO UPDATE SET
          full_name = EXCLUDED.full_name,
          payment_status = EXCLUDED.payment_status,
          application_status = EXCLUDED.application_status,
          updated_at = CURRENT_TIMESTAMP;
      `, [
        app.id, app.application_no, app.full_name, app.father_husband_name || app.father_name, app.father_name || app.father_husband_name,
        app.mobile, app.whatsapp || app.mobile, app.whatsapp_mobile || app.mobile, app.email, app.address || '',
        app.city || 'Indore', app.district || 'Indore', app.state || 'Madhya Pradesh', app.pin_code || '452001',
        app.occupation || 'Discom Service', app.company || 'MP West Zone Electricity Discom',
        app.designation || 'Staff Member', app.company_name || app.company || 'MP West Zone Electricity Discom',
        app.district_name || app.district || 'Indore', app.post_name || app.designation || 'Junior Engineer (JE)',
        app.union_post || 'Ordinary Member (साधारण सदस्य)', app.employee_type || 'Regular', app.category || 'ST',
        app.employee_class || 'Class 3 (J.E.)', app.category_person || 'Ordinary Member (साधारण सदस्य)',
        app.member_category || 'Ordinary Member (साधारण सदस्य)', app.profile_photo_url || '',
        app.registration_fee || 500, app.payment_status || 'PENDING', app.application_status || 'PENDING',
        app.transaction_id || '', app.payment_proof_url || '', app.payment_date || '2026-09-20',
        app.payment_note || '', app.created_at || new Date().toISOString(), new Date().toISOString()
      ]);
    }
    await client.query(`SELECT setval('membership_applications_id_seq', (SELECT COALESCE(MAX(id), 1) FROM membership_applications));`);
    console.log('✅ Initial membership applications populated in database!');

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
