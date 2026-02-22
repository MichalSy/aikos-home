-- Aikos Home - Supabase Tables
-- Run this in Supabase SQL Editor
-- Table prefix: aikos_home (from app-name in aikoapp.json)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Quests
CREATE TABLE IF NOT EXISTS aikos_home_quests (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done', 'blocked')),
  is_ready BOOLEAN DEFAULT false,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks
CREATE TABLE IF NOT EXISTS aikos_home_tasks (
  id SERIAL PRIMARY KEY,
  quest_id INTEGER NOT NULL REFERENCES aikos_home_quests(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done', 'blocked')),
  is_ready BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  result TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Settings
CREATE TABLE IF NOT EXISTS aikos_home_settings (
  key TEXT PRIMARY KEY,
  value TEXT
);

-- Config (legacy - for local password auth)
CREATE TABLE IF NOT EXISTS aikos_home_config (
  key TEXT PRIMARY KEY,
  value TEXT
);

-- Sessions (legacy - for local auth)
CREATE TABLE IF NOT EXISTS aikos_home_sessions (
  token TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_aikos_home_tasks_quest_id ON aikos_home_tasks(quest_id);
CREATE INDEX IF NOT EXISTS idx_aikos_home_quests_status ON aikos_home_quests(status);

-- Enable Row Level Security
ALTER TABLE aikos_home_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE aikos_home_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE aikos_home_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE aikos_home_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE aikos_home_sessions ENABLE ROW LEVEL SECURITY;

-- Policies: Allow all operations for authenticated users
CREATE POLICY "Allow all for authenticated users" ON aikos_home_quests
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users" ON aikos_home_tasks
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users" ON aikos_home_settings
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users" ON aikos_home_config
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users" ON aikos_home_sessions
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_aikos_home_quests_updated_at
  BEFORE UPDATE ON aikos_home_quests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_aikos_home_tasks_updated_at
  BEFORE UPDATE ON aikos_home_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
