-- Union Suyradev Relational Database Schema for Neon PostgreSQL

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('member', 'admin')),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'pending', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
  id SERIAL PRIMARY KEY,
  user_id INT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  title VARCHAR(255),
  company VARCHAR(255),
  industry VARCHAR(100),
  location VARCHAR(100),
  bio TEXT,
  skills TEXT[], -- Array of skill tags
  services TEXT[], -- Array of service tags
  website VARCHAR(255),
  linkedin VARCHAR(255),
  twitter VARCHAR(255),
  phone VARCHAR(50),
  is_public BOOLEAN DEFAULT true,
  profile_completion INT DEFAULT 85,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Connections Table
CREATE TABLE IF NOT EXISTS connections (
  id SERIAL PRIMARY KEY,
  requester_id INT REFERENCES users(id) ON DELETE CASCADE,
  addressee_id INT REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_connection_pair UNIQUE(requester_id, addressee_id)
);

-- 4. Opportunities Table
CREATE TABLE IF NOT EXISTS opportunities (
  id SERIAL PRIMARY KEY,
  author_id INT REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL, -- Referral, Partnership, Co-founding, Contract, Investment
  description TEXT NOT NULL,
  requirements TEXT,
  location VARCHAR(100) DEFAULT 'Global / Remote',
  budget_range VARCHAR(100),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'closed', 'pending_approval')),
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Events Table
CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  banner_url TEXT,
  event_date DATE NOT NULL,
  event_time VARCHAR(100) NOT NULL,
  location_type VARCHAR(50) DEFAULT 'online' CHECK (location_type IN ('online', 'in_person')),
  venue VARCHAR(255),
  description TEXT NOT NULL,
  capacity INT DEFAULT 100,
  registered_count INT DEFAULT 0,
  speaker_name VARCHAR(255),
  speaker_title VARCHAR(255),
  speaker_avatar TEXT,
  status VARCHAR(50) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Event Registrations Table
CREATE TABLE IF NOT EXISTS event_registrations (
  id SERIAL PRIMARY KEY,
  event_id INT REFERENCES events(id) ON DELETE CASCADE,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'confirmed',
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_event_registration UNIQUE(event_id, user_id)
);

-- 7. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'info', -- connection, opportunity, event, announcement
  link VARCHAR(255),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Testimonials Table
CREATE TABLE IF NOT EXISTS testimonials (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE SET NULL,
  quote TEXT NOT NULL,
  author_name VARCHAR(255) NOT NULL,
  author_title VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  author_avatar TEXT,
  result_badge VARCHAR(100), -- e.g. "$120k B2B Contract", "Global Joint Venture"
  rating INT DEFAULT 5,
  is_featured BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index creation for optimized queries
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_industry ON profiles(industry);
CREATE INDEX IF NOT EXISTS idx_connections_users ON connections(requester_id, addressee_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_category ON opportunities(category);
