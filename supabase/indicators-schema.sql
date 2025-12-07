-- ============================================
-- BITCOIN INDICATORS - HISTORICAL DATA SCHEMA
-- ============================================
-- Each indicator has its own table with historical values

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. BITCOIN PRICE (Raw data)
-- ============================================
CREATE TABLE IF NOT EXISTS indicator_btc_price_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  timestamp TIMESTAMPTZ NOT NULL,
  date DATE NOT NULL,
  price_usd DECIMAL(20, 2) NOT NULL,
  price_eur DECIMAL(20, 2),
  volume_24h DECIMAL(20, 2),
  market_cap DECIMAL(20, 2),
  source TEXT DEFAULT 'coingecko',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_btc_price_date ON indicator_btc_price_history(date);
CREATE INDEX idx_btc_price_timestamp ON indicator_btc_price_history(timestamp DESC);

-- ============================================
-- 2. MA200 (200-Day Moving Average)
-- ============================================
CREATE TABLE IF NOT EXISTS indicator_ma200_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL UNIQUE,
  ma200_value DECIMAL(20, 2) NOT NULL,
  current_price DECIMAL(20, 2) NOT NULL,
  distance_from_ma DECIMAL(10, 4),
  is_above_ma200 BOOLEAN NOT NULL,
  signal TEXT CHECK (signal IN ('bullish', 'bearish', 'neutral')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ma200_date ON indicator_ma200_history(date DESC);

-- ============================================
-- 3. BITCOIN DOMINANCE
-- ============================================
CREATE TABLE IF NOT EXISTS indicator_dominance_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL UNIQUE,
  dominance_percent DECIMAL(5, 2) NOT NULL,
  btc_market_cap DECIMAL(20, 2),
  total_market_cap DECIMAL(20, 2),
  is_below_45 BOOLEAN NOT NULL,
  signal TEXT CHECK (signal IN ('altcoin_season', 'btc_dominance', 'neutral')),
  source TEXT DEFAULT 'coingecko',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_dominance_date ON indicator_dominance_history(date DESC);

-- ============================================
-- 4. RAINBOW CHART
-- ============================================
CREATE TABLE IF NOT EXISTS indicator_rainbow_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL UNIQUE,
  current_price DECIMAL(20, 2) NOT NULL,
  logarithmic_regression DECIMAL(20, 2) NOT NULL,
  zone TEXT NOT NULL CHECK (zone IN ('red', 'orange', 'yellow', 'light_green', 'green', 'light_blue', 'blue', 'dark_blue', 'purple')),
  zone_threshold_low DECIMAL(20, 2),
  zone_threshold_high DECIMAL(20, 2),
  signal TEXT CHECK (signal IN ('sell', 'hold', 'buy')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rainbow_date ON indicator_rainbow_history(date DESC);

-- ============================================
-- 5. MAYER MULTIPLE
-- ============================================
CREATE TABLE IF NOT EXISTS indicator_mayer_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL UNIQUE,
  current_price DECIMAL(20, 2) NOT NULL,
  ma200_value DECIMAL(20, 2) NOT NULL,
  mayer_multiple DECIMAL(10, 4) NOT NULL,
  is_above_2_5 BOOLEAN NOT NULL,
  signal TEXT CHECK (signal IN ('extreme_greed', 'greed', 'neutral', 'fear', 'extreme_fear')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_mayer_date ON indicator_mayer_history(date DESC);

-- ============================================
-- 6. PI CYCLE TOP
-- ============================================
CREATE TABLE IF NOT EXISTS indicator_pi_cycle_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL UNIQUE,
  current_price DECIMAL(20, 2) NOT NULL,
  ma111_value DECIMAL(20, 2) NOT NULL,
  ma350x2_value DECIMAL(20, 2) NOT NULL,
  distance_to_cross DECIMAL(10, 4),
  has_crossed BOOLEAN NOT NULL,
  signal TEXT CHECK (signal IN ('top_signal', 'approaching_top', 'safe')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pi_cycle_date ON indicator_pi_cycle_history(date DESC);

-- ============================================
-- 7. MONTHLY RSI
-- ============================================
CREATE TABLE IF NOT EXISTS indicator_rsi_monthly_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL UNIQUE,
  rsi_value DECIMAL(5, 2) NOT NULL,
  avg_gain DECIMAL(20, 2),
  avg_loss DECIMAL(20, 2),
  is_above_70 BOOLEAN NOT NULL,
  is_below_30 BOOLEAN NOT NULL,
  signal TEXT CHECK (signal IN ('overbought', 'oversold', 'neutral')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rsi_date ON indicator_rsi_monthly_history(date DESC);

-- ============================================
-- 8. CYCLE MASTER
-- ============================================
CREATE TABLE IF NOT EXISTS indicator_cycle_master_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL UNIQUE,
  current_price DECIMAL(20, 2) NOT NULL,
  cycle_top_band DECIMAL(20, 2),
  cycle_bottom_band DECIMAL(20, 2),
  position_in_cycle DECIMAL(5, 2),
  signal TEXT CHECK (signal IN ('extreme_risk', 'high_risk', 'neutral', 'low_risk', 'extreme_opportunity')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cycle_master_date ON indicator_cycle_master_history(date DESC);

-- ============================================
-- 9. STOCK-TO-FLOW
-- ============================================
CREATE TABLE IF NOT EXISTS indicator_s2f_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL UNIQUE,
  current_price DECIMAL(20, 2) NOT NULL,
  circulating_supply DECIMAL(20, 8) NOT NULL,
  annual_inflation_rate DECIMAL(5, 4) NOT NULL,
  stock_to_flow_ratio DECIMAL(10, 2) NOT NULL,
  s2f_model_price DECIMAL(20, 2) NOT NULL,
  distance_from_model DECIMAL(10, 4),
  signal TEXT CHECK (signal IN ('overvalued', 'fair', 'undervalued')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_s2f_date ON indicator_s2f_history(date DESC);

-- ============================================
-- 10. CBBI
-- ============================================
CREATE TABLE IF NOT EXISTS indicator_cbbi_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL UNIQUE,
  cbbi_score INT NOT NULL CHECK (cbbi_score >= 0 AND cbbi_score <= 100),
  is_above_80 BOOLEAN NOT NULL,
  confidence_score DECIMAL(5, 2),
  metrics JSONB,
  signal TEXT CHECK (signal IN ('extreme_bull', 'bull', 'neutral', 'bear')),
  source TEXT DEFAULT 'coinglass',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cbbi_date ON indicator_cbbi_history(date DESC);

-- ============================================
-- 11. TOTAL CRYPTO MARKET CAP
-- ============================================
CREATE TABLE IF NOT EXISTS indicator_total_mcap_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL UNIQUE,
  total_market_cap DECIMAL(20, 2) NOT NULL,
  all_time_high DECIMAL(20, 2) NOT NULL,
  distance_from_ath DECIMAL(10, 4),
  is_at_ath BOOLEAN NOT NULL,
  signal TEXT CHECK (signal IN ('ath', 'near_ath', 'correction', 'deep_correction')),
  source TEXT DEFAULT 'coingecko',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_total_mcap_date ON indicator_total_mcap_history(date DESC);

-- ============================================
-- RLS POLICIES
-- ============================================
ALTER TABLE indicator_btc_price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE indicator_ma200_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE indicator_dominance_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE indicator_rainbow_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE indicator_mayer_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE indicator_pi_cycle_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE indicator_rsi_monthly_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE indicator_cycle_master_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE indicator_s2f_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE indicator_cbbi_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE indicator_total_mcap_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read BTC price" ON indicator_btc_price_history FOR SELECT USING (true);
CREATE POLICY "Anyone can read MA200" ON indicator_ma200_history FOR SELECT USING (true);
CREATE POLICY "Anyone can read dominance" ON indicator_dominance_history FOR SELECT USING (true);
CREATE POLICY "Anyone can read rainbow" ON indicator_rainbow_history FOR SELECT USING (true);
CREATE POLICY "Anyone can read mayer" ON indicator_mayer_history FOR SELECT USING (true);
CREATE POLICY "Anyone can read pi cycle" ON indicator_pi_cycle_history FOR SELECT USING (true);
CREATE POLICY "Anyone can read RSI" ON indicator_rsi_monthly_history FOR SELECT USING (true);
CREATE POLICY "Anyone can read cycle master" ON indicator_cycle_master_history FOR SELECT USING (true);
CREATE POLICY "Anyone can read S2F" ON indicator_s2f_history FOR SELECT USING (true);
CREATE POLICY "Anyone can read CBBI" ON indicator_cbbi_history FOR SELECT USING (true);
CREATE POLICY "Anyone can read total mcap" ON indicator_total_mcap_history FOR SELECT USING (true);