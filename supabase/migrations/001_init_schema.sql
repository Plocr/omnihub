-- OmniHub Core Schema

-- Enable pg_trgm for Chinese-friendly fuzzy search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Sources: where data comes from
CREATE TABLE IF NOT EXISTS sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('github', 'api_directory', 'skill_registry', 'rss', 'manual')) NOT NULL,
  url TEXT,
  config JSONB DEFAULT '{}' NOT NULL,
  sync_status TEXT DEFAULT 'active' CHECK (sync_status IN ('active', 'paused', 'error')),
  last_sync_at TIMESTAMPTZ,
  item_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Items: the core content
CREATE TABLE IF NOT EXISTS items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES sources(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  link TEXT UNIQUE NOT NULL,
  source_type TEXT CHECK (source_type IN ('api', 'skill', 'tool', 'article')) NOT NULL,
  category TEXT,
  tags TEXT[] DEFAULT '{}' NOT NULL,
  api_metadata JSONB DEFAULT '{}' NOT NULL,
  skill_metadata JSONB DEFAULT '{}' NOT NULL,
  quality_score FLOAT DEFAULT 0 NOT NULL,
  popularity INT DEFAULT 0 NOT NULL,
  image_url TEXT,
  og_image_url TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'draft')) NOT NULL,
  is_featured BOOLEAN DEFAULT false NOT NULL,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Item update history
CREATE TABLE IF NOT EXISTS item_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  change_type TEXT NOT NULL,
  previous_data JSONB DEFAULT '{}' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_items_source_type ON items(source_type);
CREATE INDEX IF NOT EXISTS idx_items_category ON items(category);
CREATE INDEX IF NOT EXISTS idx_items_tags ON items USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_items_quality ON items(quality_score DESC);
CREATE INDEX IF NOT EXISTS idx_items_published ON items(published_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_items_status ON items(status);
CREATE INDEX IF NOT EXISTS idx_items_featured ON items(is_featured) WHERE is_featured = true;

-- Chinese-friendly text search indexes (pg_trgm)
CREATE INDEX IF NOT EXISTS idx_items_search_title ON items USING GIN (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_items_search_desc ON items USING GIN (COALESCE(description, '') gin_trgm_ops);

-- Enable Row Level Security
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_updates ENABLE ROW LEVEL SECURITY;

-- Public read access policies
CREATE POLICY "Public read access" ON items
  FOR SELECT USING (status = 'active');

CREATE POLICY "Public read sources" ON sources
  FOR SELECT USING (true);

-- Seed initial sources
INSERT INTO sources (name, type, url, config) VALUES
  ('GitHub Trending', 'github', 'https://github.com/trending', '{"type": "trending"}'::JSONB),
  ('Public APIs', 'api_directory', 'https://api.publicapis.org/entries', '{}'::JSONB),
  ('Claude Code Skills', 'skill_registry', 'https://github.com/topics/claude-code-skill', '{}'::JSONB)
ON CONFLICT DO NOTHING;
