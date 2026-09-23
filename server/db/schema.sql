-- Union Management System - PostgreSQL Relational Schema

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'pending', 'inactive', 'suspended')),
  member_id VARCHAR(100) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Member Profiles Table
CREATE TABLE IF NOT EXISTS member_profiles (
  id SERIAL PRIMARY KEY,
  user_id INT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  father_husband_name VARCHAR(255),
  dob DATE,
  gender VARCHAR(20),
  avatar_url TEXT,
  phone VARCHAR(50),
  whatsapp VARCHAR(50),
  address TEXT,
  city VARCHAR(100),
  district VARCHAR(100),
  state VARCHAR(100),
  pin_code VARCHAR(20),
  occupation VARCHAR(150),
  company VARCHAR(255),
  designation VARCHAR(150),
  circle VARCHAR(100),
  union_designation VARCHAR(150),
  bio TEXT,
  emergency_contact VARCHAR(100),
  identity_doc_url TEXT,
  additional_doc_url TEXT,
  joining_date DATE DEFAULT CURRENT_DATE,
  is_public BOOLEAN DEFAULT true,
  contact_privacy JSONB DEFAULT '{"showPhone": true, "showEmail": true, "showAddress": false}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Membership Applications Table
CREATE TABLE IF NOT EXISTS membership_applications (
  id SERIAL PRIMARY KEY,
  application_no VARCHAR(100) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  father_husband_name VARCHAR(255),
  dob DATE,
  gender VARCHAR(20),
  mobile VARCHAR(50) NOT NULL,
  whatsapp VARCHAR(50),
  email VARCHAR(255) NOT NULL,
  address TEXT,
  city VARCHAR(100),
  district VARCHAR(100),
  state VARCHAR(100),
  pin_code VARCHAR(20),
  occupation VARCHAR(150),
  company VARCHAR(255),
  designation VARCHAR(150),
  union_info TEXT,
  profile_photo_url TEXT,
  identity_doc_url TEXT,
  additional_doc_url TEXT,
  emergency_contact VARCHAR(100),
  registration_fee DECIMAL(10, 2) DEFAULT 500.00,
  payment_status VARCHAR(50) DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'SUBMITTED', 'VERIFIED', 'REJECTED')),
  application_status VARCHAR(50) DEFAULT 'PENDING' CHECK (application_status IN ('PENDING', 'APPROVED', 'REJECTED')),
  transaction_id VARCHAR(100),
  payment_proof_url TEXT,
  payment_date DATE,
  payment_note TEXT,
  verified_by INT REFERENCES users(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Events Table
CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  banner_url TEXT,
  event_type VARCHAR(50) DEFAULT 'GENERAL', -- GENERAL, MEETING, CONVENTION, WORKSHOP
  start_date DATE NOT NULL,
  end_date DATE,
  start_time VARCHAR(50) NOT NULL,
  end_time VARCHAR(50),
  venue VARCHAR(255) NOT NULL,
  address TEXT,
  capacity INT DEFAULT 100,
  registered_count INT DEFAULT 0,
  registration_start_date DATE,
  registration_end_date DATE,
  is_paid BOOLEAN DEFAULT false,
  event_fee DECIMAL(10, 2) DEFAULT 0.00,
  payment_qr_url TEXT,
  payment_instructions TEXT,
  whatsapp_contact VARCHAR(50),
  visibility VARCHAR(50) DEFAULT 'PUBLIC' CHECK (visibility IN ('PUBLIC', 'MEMBERS_ONLY')),
  status VARCHAR(50) DEFAULT 'PUBLISHED' CHECK (status IN ('DRAFT', 'PUBLISHED', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'COMPLETED', 'CANCELLED')),
  created_by INT REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Event Registrations Table
CREATE TABLE IF NOT EXISTS event_registrations (
  id SERIAL PRIMARY KEY,
  event_id INT REFERENCES events(id) ON DELETE CASCADE,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  pass_code VARCHAR(100) UNIQUE,
  amount DECIMAL(10, 2) DEFAULT 0.00,
  payment_status VARCHAR(50) DEFAULT 'CONFIRMED' CHECK (payment_status IN ('PENDING', 'PAYMENT_PENDING', 'CONFIRMED', 'REJECTED', 'CANCELLED')),
  registration_status VARCHAR(50) DEFAULT 'CONFIRMED' CHECK (registration_status IN ('PENDING', 'CONFIRMED', 'CANCELLED', 'ATTENDED')),
  transaction_id VARCHAR(100),
  payment_proof_url TEXT,
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_event_user UNIQUE(event_id, user_id)
);

-- 6. Unified Payments Table
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE SET NULL,
  membership_application_id INT REFERENCES membership_applications(id) ON DELETE SET NULL,
  event_registration_id INT REFERENCES event_registrations(id) ON DELETE SET NULL,
  payment_type VARCHAR(50) NOT NULL CHECK (payment_type IN ('MEMBERSHIP', 'EVENT')),
  amount DECIMAL(10, 2) NOT NULL,
  transaction_id VARCHAR(100) NOT NULL,
  payment_proof_url TEXT,
  payment_date DATE DEFAULT CURRENT_DATE,
  status VARCHAR(50) DEFAULT 'SUBMITTED' CHECK (status IN ('PENDING', 'SUBMITTED', 'VERIFIED', 'REJECTED')),
  verified_by INT REFERENCES users(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Announcements Table
CREATE TABLE IF NOT EXISTS announcements (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'GENERAL' CHECK (type IN ('GENERAL', 'IMPORTANT', 'URGENT', 'EVENT', 'MEETING', 'STRIKE', 'PAYMENT', 'EMERGENCY', 'OTHER')),
  priority VARCHAR(50) DEFAULT 'NORMAL' CHECK (priority IN ('NORMAL', 'HIGH', 'CRITICAL')),
  attachment_url TEXT,
  start_date DATE DEFAULT CURRENT_DATE,
  expiry_date DATE,
  target_audience VARCHAR(50) DEFAULT 'ALL_MEMBERS',
  is_popup BOOLEAN DEFAULT true,
  status VARCHAR(50) DEFAULT 'PUBLISHED' CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
  created_by INT REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  announcement_id INT REFERENCES announcements(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'INFO',
  link VARCHAR(255),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Union Stories Table (Public Feed inside Union)
CREATE TABLE IF NOT EXISTS union_stories (
  id SERIAL PRIMARY KEY,
  author_id INT REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) DEFAULT 'General Circular',
  attachment_url TEXT,
  attachment_type VARCHAR(50), -- PDF, IMAGE, DOC
  visibility VARCHAR(50) DEFAULT 'MEMBERS_ONLY',
  status VARCHAR(50) DEFAULT 'PUBLISHED',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Shared Documents Table (Private Member-to-Member)
CREATE TABLE IF NOT EXISTS shared_documents (
  id SERIAL PRIMARY KEY,
  sender_id INT REFERENCES users(id) ON DELETE CASCADE,
  recipient_id INT REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  file_url TEXT NOT NULL,
  file_name VARCHAR(255),
  file_type VARCHAR(50),
  file_size VARCHAR(50),
  is_read BOOLEAN DEFAULT false,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Contact Submissions Table
CREATE TABLE IF NOT EXISTS contact_submissions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  subject VARCHAR(255),
  message TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'REVIEWED', 'RESOLVED')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. System Settings Table
CREATE TABLE IF NOT EXISTS system_settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  action VARCHAR(100) NOT NULL,
  actor_id INT REFERENCES users(id),
  actor_name VARCHAR(255),
  entity_type VARCHAR(100),
  entity_id VARCHAR(100),
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index creation
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_member_id ON users(member_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON membership_applications(application_status, payment_status);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status, payment_type);
CREATE INDEX IF NOT EXISTS idx_shared_docs_recipient ON shared_documents(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);

