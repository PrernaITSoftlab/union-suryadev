//new
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
const EVENTS_BACKUP_FILE = path.join(__dirname, '../db/events_backup.json');
const REGISTRATIONS_BACKUP_FILE = path.join(__dirname, '../db/event_registrations_backup.json');
const BOARD_BACKUP_FILE = path.join(__dirname, '../db/board_backup.json');
const APPLICATIONS_BACKUP_FILE = path.join(__dirname, '../db/membership_applications_backup.json');

const loadInitialBoard = () => {
  try {
    if (fs.existsSync(BOARD_BACKUP_FILE)) {
      const data = JSON.parse(fs.readFileSync(BOARD_BACKUP_FILE, 'utf-8'));
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch (_) {}
  return [];
};

const loadInitialEvents = () => {
  try {
    if (fs.existsSync(EVENTS_BACKUP_FILE)) {
      const data = JSON.parse(fs.readFileSync(EVENTS_BACKUP_FILE, 'utf-8'));
      if (Array.isArray(data)) return data;
    }
  } catch (_) {}
  return [...INITIAL_EVENTS];
};

const loadInitialRegistrations = () => {
  try {
    if (fs.existsSync(REGISTRATIONS_BACKUP_FILE)) {
      const data = JSON.parse(fs.readFileSync(REGISTRATIONS_BACKUP_FILE, 'utf-8'));
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch (_) {}
  return [...INITIAL_EVENT_REGISTRATIONS];
};

const loadInitialApplications = () => {
  try {
    if (fs.existsSync(APPLICATIONS_BACKUP_FILE)) {
      const data = JSON.parse(fs.readFileSync(APPLICATIONS_BACKUP_FILE, 'utf-8'));
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch (_) {}
  return [...INITIAL_MEMBERSHIP_APPLICATIONS];
};

const { Pool } = pg;

let pool = null;
let isPgConnected = false;

// High-Performance Local In-Memory Database Store for MPVMAVAKS Union
export const inMemoryStore = {
  systemSettings: { ...INITIAL_SYSTEM_SETTINGS },
  users: [...INITIAL_USERS],
  membershipApplications: loadInitialApplications(),
  events: loadInitialEvents(),
  eventRegistrations: loadInitialRegistrations(),
  payments: [...INITIAL_PAYMENTS],
  announcements: [...INITIAL_ANNOUNCEMENTS],
  notifications: [...INITIAL_NOTIFICATIONS],
  unionStories: [...INITIAL_UNION_STORIES],
  sharedDocuments: [...INITIAL_SHARED_DOCUMENTS],
  contactSubmissions: [...INITIAL_CONTACT_SUBMISSIONS],
  eventLikes: [...INITIAL_EVENT_LIKES],
  eventComments: [...INITIAL_EVENT_COMMENTS],
  chatGroups: [],
  chatGroupMembers: [],
  chatMessages: [],
  boardMembers: loadInitialBoard(),
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

// Save membership applications to local persistent storage
export const saveApplicationsBackup = () => {
  try {
    fs.writeFileSync(APPLICATIONS_BACKUP_FILE, JSON.stringify(inMemoryStore.membershipApplications, null, 2), 'utf-8');
  } catch (err) {
    console.warn('⚠️ Could not save membership_applications_backup.json:', err.message);
  }
};

// Load membership applications from local persistent storage on startup
export const loadApplicationsBackup = () => {
  try {
    if (fs.existsSync(APPLICATIONS_BACKUP_FILE)) {
      const data = fs.readFileSync(APPLICATIONS_BACKUP_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Merge with INITIAL_MEMBERSHIP_APPLICATIONS so default seeds are always present
        const existingNos = new Set(parsed.map(a => a.application_no || a.id));
        for (const initA of INITIAL_MEMBERSHIP_APPLICATIONS) {
          if (!existingNos.has(initA.application_no) && !existingNos.has(initA.id)) {
            parsed.push(initA);
          }
        }
        inMemoryStore.membershipApplications = parsed;
        saveApplicationsBackup();
        console.log(`📁 Loaded ${parsed.length} membership applications from disk storage (membership_applications_backup.json).`);
        return;
      }
    }
    inMemoryStore.membershipApplications = [...INITIAL_MEMBERSHIP_APPLICATIONS];
    saveApplicationsBackup();
  } catch (err) {
    console.warn('⚠️ Could not read membership_applications_backup.json:', err.message);
  }
};

// Save event registrations to local persistent storage (event_registrations_backup.json)
export const saveRegistrationsBackup = () => {
  try {
    fs.writeFileSync(REGISTRATIONS_BACKUP_FILE, JSON.stringify(inMemoryStore.eventRegistrations, null, 2), 'utf-8');
  } catch (err) {
    console.warn('⚠️ Could not save event_registrations_backup.json:', err.message);
  }
};

// Save board members to local persistent storage (board_backup.json)
export const saveBoardBackup = () => {
  try {
    fs.writeFileSync(BOARD_BACKUP_FILE, JSON.stringify(inMemoryStore.boardMembers, null, 2), 'utf-8');
  } catch (err) {
    console.warn('⚠️ Could not save board_backup.json:', err.message);
  }
};

// Load users from local persistent storage on startup
export const loadUsersBackup = () => {
  try {
    if (fs.existsSync(USERS_BACKUP_FILE)) {
      const data = fs.readFileSync(USERS_BACKUP_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        parsed.forEach(u => {
          if (u.member_id && u.member_id.startsWith('UNION-ADMIN-')) {
            u.member_id = u.member_id.replace(/^UNION-ADMIN-/i, 'MPAVAKS-');
          } else if (u.member_id && u.member_id.startsWith('UNION-')) {
            u.member_id = u.member_id.replace(/^UNION-/i, 'MPAVAKS-');
          }
        });

        // Merge with INITIAL_USERS to guarantee all registered members are present
        const existingIds = new Set(parsed.map(u => u.id));
        const existingEmails = new Set(parsed.map(u => (u.email || '').toLowerCase()));
        for (const initU of INITIAL_USERS) {
          if (!existingIds.has(initU.id) && !existingEmails.has((initU.email || '').toLowerCase())) {
            parsed.push(initU);
          }
        }

        inMemoryStore.users = parsed;
        saveUsersBackup();
        console.log(`📁 Loaded ${parsed.length} users with photos from disk storage (users_backup.json).`);
      }
    }
  } catch (err) {
    console.warn('⚠️ Could not read users_backup.json:', err.message);
  }
};

// Pre-load from disk backup if present
loadUsersBackup();
loadApplicationsBackup();

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
          try {
            await client.query(`
              UPDATE users SET member_id = 'MPAVAKS-0004' WHERE id = 2 AND member_id = 'MPAVAKS-0001';
              UPDATE users SET member_id = 'MPAVAKS-0001' WHERE (role = 'admin' OR id = 1) AND (member_id LIKE 'UNION-%' OR member_id = 'UNION-ADMIN-001' OR member_id IS NULL);
              UPDATE users SET member_id = REPLACE(member_id, 'UNION-ADMIN-', 'MPAVAKS-') WHERE member_id LIKE 'UNION-ADMIN-%';
              UPDATE users SET member_id = REPLACE(member_id, 'UNION-', 'MPAVAKS-') WHERE member_id LIKE 'UNION-%';
            `);
          } catch (migErr) {
            console.warn('⚠️ Automated PostgreSQL Member ID check:', migErr.message);
          }

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
              member_id: (r.member_id && r.member_id.startsWith('UNION-ADMIN-'))
                ? r.member_id.replace(/^UNION-ADMIN-/i, 'MPAVAKS-')
                : (r.member_id && r.member_id.startsWith('UNION-'))
                ? r.member_id.replace(/^UNION-/i, 'MPAVAKS-')
                : (!r.member_id && r.role === 'admin')
                ? 'MPAVAKS-0001'
                : r.member_id,
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

        // Ensure membership_applications table & columns exist and hydrate from PostgreSQL
        try {
          try {
            await client.query(`
              ALTER TABLE users DROP CONSTRAINT IF EXISTS users_status_check;
              ALTER TABLE users ADD CONSTRAINT users_status_check CHECK (status IN ('active', 'pending', 'inactive', 'suspended', 'rejected', 'deleted'));

              CREATE TABLE IF NOT EXISTS membership_applications (
                id SERIAL PRIMARY KEY,
                application_no VARCHAR(100) UNIQUE NOT NULL,
                full_name VARCHAR(255) NOT NULL,
                father_husband_name VARCHAR(255),
                father_name VARCHAR(255),
                dob DATE,
                gender VARCHAR(20),
                mobile VARCHAR(50) NOT NULL,
                whatsapp VARCHAR(50),
                cug_mobile VARCHAR(50),
                whatsapp_mobile VARCHAR(50),
                email VARCHAR(255) NOT NULL,
                address TEXT,
                city VARCHAR(100),
                district VARCHAR(100),
                state VARCHAR(100),
                pin_code VARCHAR(20),
                occupation VARCHAR(150),
                company VARCHAR(255),
                designation VARCHAR(150),
                company_name VARCHAR(255),
                district_name VARCHAR(100),
                circle_name VARCHAR(100),
                division_name VARCHAR(100),
                office_name VARCHAR(100),
                joining_year VARCHAR(50),
                post_name VARCHAR(150),
                dept_post VARCHAR(150),
                union_post VARCHAR(150),
                membership_year VARCHAR(50),
                membership_fee_status VARCHAR(50),
                membership_receipt_date VARCHAR(50),
                membership_receipt_no VARCHAR(100),
                donation_amount VARCHAR(50),
                donation_receipt_date VARCHAR(50),
                donation_receipt_no VARCHAR(100),
                reference_name VARCHAR(255),
                employee_type VARCHAR(100),
                category VARCHAR(100),
                employee_class VARCHAR(100),
                category_person VARCHAR(150),
                member_category VARCHAR(150),
                union_info TEXT,
                profile_photo_url TEXT,
                identity_doc_url TEXT,
                additional_doc_url TEXT,
                emergency_contact VARCHAR(100),
                registration_fee DECIMAL(10, 2) DEFAULT 500.00,
                payment_status VARCHAR(50) DEFAULT 'PENDING',
                application_status VARCHAR(50) DEFAULT 'PENDING',
                transaction_id VARCHAR(100),
                payment_proof_url TEXT,
                payment_date DATE,
                payment_note TEXT,
                verified_by INT REFERENCES users (id),
                verified_at TIMESTAMP WITH TIME ZONE,
                rejection_reason TEXT,
                generated_credentials JSONB,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
              );

              ALTER TABLE membership_applications ADD COLUMN IF NOT EXISTS company_name VARCHAR(255);
              ALTER TABLE membership_applications ADD COLUMN IF NOT EXISTS district_name VARCHAR(100);
              ALTER TABLE membership_applications ADD COLUMN IF NOT EXISTS circle_name VARCHAR(100);
              ALTER TABLE membership_applications ADD COLUMN IF NOT EXISTS division_name VARCHAR(100);
              ALTER TABLE membership_applications ADD COLUMN IF NOT EXISTS office_name VARCHAR(100);
              ALTER TABLE membership_applications ADD COLUMN IF NOT EXISTS joining_year VARCHAR(50);
              ALTER TABLE membership_applications ADD COLUMN IF NOT EXISTS father_name VARCHAR(255);
              ALTER TABLE membership_applications ADD COLUMN IF NOT EXISTS post_name VARCHAR(150);
              ALTER TABLE membership_applications ADD COLUMN IF NOT EXISTS dept_post VARCHAR(150);
              ALTER TABLE membership_applications ADD COLUMN IF NOT EXISTS union_post VARCHAR(150);
              ALTER TABLE membership_applications ADD COLUMN IF NOT EXISTS cug_mobile VARCHAR(50);
              ALTER TABLE membership_applications ADD COLUMN IF NOT EXISTS whatsapp_mobile VARCHAR(50);
              ALTER TABLE membership_applications ADD COLUMN IF NOT EXISTS membership_year VARCHAR(50);
              ALTER TABLE membership_applications ADD COLUMN IF NOT EXISTS membership_fee_status VARCHAR(50);
              ALTER TABLE membership_applications ADD COLUMN IF NOT EXISTS membership_receipt_date VARCHAR(50);
              ALTER TABLE membership_applications ADD COLUMN IF NOT EXISTS membership_receipt_no VARCHAR(100);
              ALTER TABLE membership_applications ADD COLUMN IF NOT EXISTS donation_amount VARCHAR(50);
              ALTER TABLE membership_applications ADD COLUMN IF NOT EXISTS donation_receipt_date VARCHAR(50);
              ALTER TABLE membership_applications ADD COLUMN IF NOT EXISTS donation_receipt_no VARCHAR(100);
              ALTER TABLE membership_applications ADD COLUMN IF NOT EXISTS reference_name VARCHAR(255);
              ALTER TABLE membership_applications ADD COLUMN IF NOT EXISTS employee_type VARCHAR(100);
              ALTER TABLE membership_applications ADD COLUMN IF NOT EXISTS category VARCHAR(100);
              ALTER TABLE membership_applications ADD COLUMN IF NOT EXISTS employee_class VARCHAR(100);
              ALTER TABLE membership_applications ADD COLUMN IF NOT EXISTS category_person VARCHAR(150);
              ALTER TABLE membership_applications ADD COLUMN IF NOT EXISTS member_category VARCHAR(150);
              ALTER TABLE membership_applications ADD COLUMN IF NOT EXISTS generated_credentials JSONB;
            `);
          } catch (migErr) {
            console.warn('⚠️ Automated PostgreSQL membership_applications schema check:', migErr.message);
          }

          const dbApps = await client.query(`
            SELECT * FROM membership_applications ORDER BY id ASC;
          `);

          if (dbApps.rows.length > 0) {
            const dbAppNos = new Set(dbApps.rows.map(r => r.application_no));
            const existingMemory = inMemoryStore.membershipApplications || [];

            const mappedDbApps = dbApps.rows.map(r => ({
              id: r.id,
              application_no: r.application_no,
              full_name: r.full_name,
              father_name: r.father_name || r.father_husband_name || '',
              father_husband_name: r.father_husband_name || r.father_name || '',
              dob: r.dob ? new Date(r.dob).toISOString().split('T')[0] : '',
              gender: r.gender || '',
              mobile: r.mobile || r.whatsapp_mobile || '',
              whatsapp: r.whatsapp || r.whatsapp_mobile || '',
              whatsapp_mobile: r.whatsapp_mobile || r.mobile || '',
              cug_mobile: r.cug_mobile || '',
              email: r.email,
              address: r.address || '',
              city: r.city || r.district_name || 'Indore',
              district: r.district || r.district_name || 'Indore',
              state: r.state || 'Madhya Pradesh',
              pin_code: r.pin_code || '452001',
              occupation: r.occupation || 'Discom Service',
              company: r.company || r.company_name || 'MP West Zone Electricity Discom',
              designation: r.designation || r.post_name || 'Staff Member',
              company_name: r.company_name || r.company || 'MP West Zone Electricity Discom',
              district_name: r.district_name || r.district || 'Indore',
              circle_name: r.circle_name || '',
              division_name: r.division_name || '',
              office_name: r.office_name || '',
              joining_year: r.joining_year || '',
              post_name: r.post_name || r.designation || 'Junior Engineer (JE)',
              dept_post: r.dept_post || '',
              union_post: r.union_post || 'Ordinary Member (साधारण सदस्य)',
              membership_year: r.membership_year || '2026',
              membership_fee_status: r.membership_fee_status || '',
              membership_receipt_date: r.membership_receipt_date || '',
              membership_receipt_no: r.membership_receipt_no || '',
              donation_amount: r.donation_amount || '',
              donation_receipt_date: r.donation_receipt_date || '',
              donation_receipt_no: r.donation_receipt_no || '',
              reference_name: r.reference_name || '',
              employee_type: r.employee_type || 'Regular',
              category: r.category || 'ST',
              employee_class: r.employee_class || 'Class 3 (J.E.)',
              category_person: r.category_person || r.member_category || 'Ordinary Member (साधारण सदस्य)',
              member_category: r.member_category || r.category_person || 'Ordinary Member (साधारण सदस्य)',
              union_info: r.union_info || '',
              profile_photo_url: r.profile_photo_url || '',
              identity_doc_url: r.identity_doc_url || '',
              additional_doc_url: r.additional_doc_url || '',
              emergency_contact: r.emergency_contact || '',
              registration_fee: Number(r.registration_fee) || 500,
              payment_status: r.payment_status || 'PENDING',
              application_status: r.application_status || 'PENDING',
              transaction_id: r.transaction_id || '',
              payment_proof_url: r.payment_proof_url || '',
              payment_date: r.payment_date ? new Date(r.payment_date).toISOString().split('T')[0] : '',
              payment_note: r.payment_note || '',
              verified_by: r.verified_by,
              verified_at: r.verified_at,
              rejection_reason: r.rejection_reason || '',
              generated_credentials: r.generated_credentials || null,
              created_at: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString()
            }));

            // Include any memory-stored applications not yet in DB
            for (const memApp of existingMemory) {
              if (memApp.application_no && !dbAppNos.has(memApp.application_no)) {
                mappedDbApps.unshift(memApp);
                try {
                  await client.query(`
                    INSERT INTO membership_applications (
                      application_no, full_name, father_husband_name, father_name, mobile, whatsapp,
                      whatsapp_mobile, email, address, city, district, state, pin_code,
                      occupation, company, designation, company_name, district_name,
                      post_name, union_post, employee_type, category, employee_class,
                      category_person, member_category, profile_photo_url, registration_fee,
                      payment_status, application_status, transaction_id, payment_proof_url,
                      payment_date, payment_note, rejection_reason, created_at
                    ) VALUES (
                      $1, $2, $3, $4, $5, $6,
                      $7, $8, $9, $10, $11, $12, $13,
                      $14, $15, $16, $17, $18,
                      $19, $20, $21, $22, $23,
                      $24, $25, $26, $27,
                      $28, $29, $30, $31,
                      $32, $33, $34, $35
                    ) ON CONFLICT (application_no) DO NOTHING;
                  `, [
                    memApp.application_no, memApp.full_name, memApp.father_husband_name || memApp.father_name,
                    memApp.father_name || memApp.father_husband_name, memApp.mobile, memApp.whatsapp || memApp.mobile,
                    memApp.whatsapp_mobile || memApp.mobile, memApp.email, memApp.address || '',
                    memApp.city || 'Indore', memApp.district || 'Indore', memApp.state || 'Madhya Pradesh',
                    memApp.pin_code || '452001', memApp.occupation || 'Discom Service',
                    memApp.company || 'MP West Zone Electricity Discom', memApp.designation || 'Staff Member',
                    memApp.company_name || memApp.company || 'MP West Zone Electricity Discom',
                    memApp.district_name || memApp.district || 'Indore',
                    memApp.post_name || memApp.designation || 'Junior Engineer (JE)',
                    memApp.union_post || 'Ordinary Member (साधारण सदस्य)', memApp.employee_type || 'Regular',
                    memApp.category || 'ST', memApp.employee_class || 'Class 3 (J.E.)',
                    memApp.category_person || 'Ordinary Member (साधारण सदस्य)',
                    memApp.member_category || 'Ordinary Member (साधारण सदस्य)', memApp.profile_photo_url || '',
                    memApp.registration_fee || 500, memApp.payment_status || 'PENDING',
                    memApp.application_status || 'PENDING', memApp.transaction_id || '',
                    memApp.payment_proof_url || '', memApp.payment_date || '2026-09-20',
                    memApp.payment_note || '', memApp.rejection_reason || '', memApp.created_at || new Date().toISOString()
                  ]);
                } catch (_) {}
              }
            }

            inMemoryStore.membershipApplications = mappedDbApps;
            saveApplicationsBackup();
            console.log(`✅ Loaded ${mappedDbApps.length} membership applications from PostgreSQL.`);
          } else {
            console.log('⏳ Seeding initial membership applications into PostgreSQL...');
            for (const app of inMemoryStore.membershipApplications) {
              try {
                await client.query(`
                  INSERT INTO membership_applications (
                    application_no, full_name, father_husband_name, father_name, mobile, whatsapp,
                    whatsapp_mobile, email, address, city, district, state, pin_code,
                    occupation, company, designation, company_name, district_name,
                    post_name, union_post, employee_type, category, employee_class,
                    category_person, member_category, profile_photo_url, registration_fee,
                    payment_status, application_status, transaction_id, payment_proof_url,
                    payment_date, payment_note, rejection_reason, created_at
                  ) VALUES (
                    $1, $2, $3, $4, $5, $6,
                    $7, $8, $9, $10, $11, $12, $13,
                    $14, $15, $16, $17, $18,
                    $19, $20, $21, $22, $23,
                    $24, $25, $26, $27,
                    $28, $29, $30, $31,
                    $32, $33, $34, $35
                  ) ON CONFLICT (application_no) DO NOTHING;
                `, [
                  app.application_no, app.full_name, app.father_husband_name || app.father_name,
                  app.father_name || app.father_husband_name, app.mobile, app.whatsapp || app.mobile,
                  app.whatsapp_mobile || app.mobile, app.email, app.address || '',
                  app.city || 'Indore', app.district || 'Indore', app.state || 'Madhya Pradesh',
                  app.pin_code || '452001', app.occupation || 'Discom Service',
                  app.company || 'MP West Zone Electricity Discom', app.designation || 'Staff Member',
                  app.company_name || app.company || 'MP West Zone Electricity Discom',
                  app.district_name || app.district || 'Indore',
                  app.post_name || app.designation || 'Junior Engineer (JE)',
                  app.union_post || 'Ordinary Member (साधारण सदस्य)', app.employee_type || 'Regular',
                  app.category || 'ST', app.employee_class || 'Class 3 (J.E.)',
                  app.category_person || 'Ordinary Member (साधारण सदस्य)',
                  app.member_category || 'Ordinary Member (साधारण सदस्य)', app.profile_photo_url || '',
                  app.registration_fee || 500, app.payment_status || 'PENDING',
                  app.application_status || 'PENDING', app.transaction_id || '',
                  app.payment_proof_url || '', app.payment_date || '2026-09-20',
                  app.payment_note || '', app.rejection_reason || '', app.created_at || new Date().toISOString()
                ]);
              } catch (_) {}
            }
          }
        } catch (appDbErr) {
          console.warn('⚠️ Could not hydrate membership applications from DB:', appDbErr.message);
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
      isPgConnected = false;
      console.warn('⚠️ Database query fallback to in-memory store:', err.message);
      return { rows: [], rowCount: 0 };
    }
  } else {
    return { rows: [], rowCount: 0 };
  }
};

export { isPgConnected, pool };
