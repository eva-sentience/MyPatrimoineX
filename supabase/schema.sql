-- ============================================
-- PATRIMOINEX DATABASE SCHEMA
-- ============================================

-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. USER PROFILES (extends existing profiles table)
-- ============================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS has_setup_2fa BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS patrimoinex_onboarding_completed BOOLEAN DEFAULT false;

-- ============================================
-- 2. ASSETS TABLE (Core financial assets)
-- ============================================
CREATE TABLE IF NOT EXISTS patrimoinex_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN (
    'Real Estate', 'Stocks', 'Bonds', 'Private Equity', 
    'Cryptocurrency', 'Precious Metals', 'France Invest', 'Exotic'
  )),
  amount DECIMAL(20, 8) NOT NULL DEFAULT 0,
  current_value DECIMAL(20, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  purchase_date DATE NOT NULL,
  purchase_price DECIMAL(20, 2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assets_user_id ON patrimoinex_assets(user_id);
CREATE INDEX IF NOT EXISTS idx_assets_type ON patrimoinex_assets(type);
CREATE INDEX IF NOT EXISTS idx_assets_created_at ON patrimoinex_assets(created_at DESC);

-- ============================================
-- 3. MARKET DATA (Real-time market snapshots)
-- ============================================
CREATE TABLE IF NOT EXISTS patrimoinex_market_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_type TEXT NOT NULL CHECK (asset_type IN (
    'Real Estate', 'Stocks', 'Bonds', 'Private Equity', 
    'Cryptocurrency', 'Precious Metals', 'France Invest', 'Exotic'
  )),
  symbol TEXT,
  metric_name TEXT NOT NULL,
  metric_value DECIMAL(20, 8) NOT NULL,
  metric_change_24h DECIMAL(10, 4),
  source TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  raw_data JSONB
);

CREATE INDEX IF NOT EXISTS idx_market_data_asset_type ON patrimoinex_market_data(asset_type);
CREATE INDEX IF NOT EXISTS idx_market_data_symbol ON patrimoinex_market_data(symbol);
CREATE INDEX IF NOT EXISTS idx_market_data_timestamp ON patrimoinex_market_data(timestamp DESC);

-- ============================================
-- 4. MARKET INDICATORS (Top/Bottom signals)
-- ============================================
CREATE TABLE IF NOT EXISTS patrimoinex_market_indicators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_eng TEXT NOT NULL,
  title_fr TEXT NOT NULL,
  description TEXT,
  objective TEXT,
  source TEXT,
  source_url TEXT,
  threshold_type TEXT CHECK (threshold_type IN ('GT', 'LT', 'ZONE', 'BOOL')),
  threshold_value DECIMAL(20, 8),
  current_value DECIMAL(20, 8),
  is_met BOOLEAN,
  display_value TEXT,
  analyzed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_market_indicators_analyzed_at ON patrimoinex_market_indicators(analyzed_at DESC);

-- ============================================
-- 5. ANALYSIS HISTORY
-- ============================================
CREATE TABLE IF NOT EXISTS patrimoinex_analysis_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  percentage DECIMAL(5, 2),
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analysis_history_date ON patrimoinex_analysis_history(date DESC);

-- ============================================
-- 6. PORTFOLIO SNAPSHOTS
-- ============================================
CREATE TABLE IF NOT EXISTS patrimoinex_portfolio_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  snapshot_date DATE NOT NULL,
  total_value DECIMAL(20, 2) NOT NULL,
  allocation JSONB NOT NULL,
  performance_24h DECIMAL(10, 4),
  performance_7d DECIMAL(10, 4),
  performance_30d DECIMAL(10, 4),
  performance_ytd DECIMAL(10, 4),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_portfolio_snapshots_user_id ON patrimoinex_portfolio_snapshots(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_snapshots_date ON patrimoinex_portfolio_snapshots(snapshot_date DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_portfolio_snapshots_user_date ON patrimoinex_portfolio_snapshots(user_id, snapshot_date);

-- ============================================
-- 7. EDUCATION CONTENT
-- ============================================
CREATE TABLE IF NOT EXISTS patrimoinex_education_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  asset_type TEXT CHECK (asset_type IN (
    'Real Estate', 'Stocks', 'Bonds', 'Private Equity', 
    'Cryptocurrency', 'Precious Metals', 'France Invest', 'Exotic'
  )),
  content_type TEXT CHECK (content_type IN ('Analyse Vidéo', 'Guide', 'Deep Dive')),
  duration TEXT,
  release_date DATE,
  author TEXT,
  source_url TEXT,
  image_url TEXT,
  summary TEXT,
  complexity TEXT CHECK (complexity IN ('Débutant', 'Intermédiaire', 'Avancé')),
  key_points TEXT[],
  charts JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_education_asset_type ON patrimoinex_education_content(asset_type);
CREATE INDEX IF NOT EXISTS idx_education_complexity ON patrimoinex_education_content(complexity);
CREATE INDEX IF NOT EXISTS idx_education_release_date ON patrimoinex_education_content(release_date DESC);

-- ============================================
-- 8. USER PREFERENCES
-- ============================================
CREATE TABLE IF NOT EXISTS patrimoinex_user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  default_currency TEXT DEFAULT 'EUR',
  theme TEXT DEFAULT 'dark' CHECK (theme IN ('light', 'dark')),
  notifications_enabled BOOLEAN DEFAULT true,
  email_digest TEXT DEFAULT 'weekly' CHECK (email_digest IN ('daily', 'weekly', 'monthly', 'never')),
  favorite_asset_types TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 9. CHAT MESSAGES
-- ============================================
CREATE TABLE IF NOT EXISTS patrimoinex_chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'model')),
  text TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  context JSONB
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON patrimoinex_chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_timestamp ON patrimoinex_chat_messages(timestamp DESC);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE patrimoinex_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE patrimoinex_portfolio_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE patrimoinex_user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE patrimoinex_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE patrimoinex_market_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE patrimoinex_market_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE patrimoinex_analysis_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE patrimoinex_education_content ENABLE ROW LEVEL SECURITY;

-- Assets policies
CREATE POLICY "Users can view own assets" ON patrimoinex_assets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own assets" ON patrimoinex_assets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own assets" ON patrimoinex_assets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own assets" ON patrimoinex_assets FOR DELETE USING (auth.uid() = user_id);

-- Portfolio snapshots policies
CREATE POLICY "Users can view own snapshots" ON patrimoinex_portfolio_snapshots FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own snapshots" ON patrimoinex_portfolio_snapshots FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User preferences policies
CREATE POLICY "Users can view own preferences" ON patrimoinex_user_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own preferences" ON patrimoinex_user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own preferences" ON patrimoinex_user_preferences FOR UPDATE USING (auth.uid() = user_id);

-- Chat messages policies
CREATE POLICY "Users can view own messages" ON patrimoinex_chat_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own messages" ON patrimoinex_chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Public read-only data
CREATE POLICY "Anyone can view market data" ON patrimoinex_market_data FOR SELECT USING (true);
CREATE POLICY "Anyone can view market indicators" ON patrimoinex_market_indicators FOR SELECT USING (true);
CREATE POLICY "Anyone can view analysis history" ON patrimoinex_analysis_history FOR SELECT USING (true);
CREATE POLICY "Anyone can view education content" ON patrimoinex_education_content FOR SELECT USING (true);

-- ============================================
-- TRIGGERS
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_patrimoinex_assets_updated_at BEFORE UPDATE ON patrimoinex_assets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patrimoinex_market_indicators_updated_at BEFORE UPDATE ON patrimoinex_market_indicators FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patrimoinex_education_content_updated_at BEFORE UPDATE ON patrimoinex_education_content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patrimoinex_user_preferences_updated_at BEFORE UPDATE ON patrimoinex_user_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VIEWS
-- ============================================

CREATE OR REPLACE VIEW patrimoinex_portfolio_summary AS
SELECT 
  a.user_id,
  a.type,
  COUNT(*) as asset_count,
  SUM(a.amount * a.current_value) as total_value,
  AVG(CASE WHEN a.purchase_price > 0 THEN ((a.current_value - a.purchase_price) / a.purchase_price) * 100 ELSE 0 END) as avg_performance_pct
FROM patrimoinex_assets a
GROUP BY a.user_id, a.type;

CREATE OR REPLACE VIEW patrimoinex_latest_indicators AS
SELECT DISTINCT ON (title_eng) *
FROM patrimoinex_market_indicators
ORDER BY title_eng, analyzed_at DESC;