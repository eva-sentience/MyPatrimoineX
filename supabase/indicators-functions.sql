-- ============================================
-- BITCOIN INDICATORS - CALCULATION FUNCTIONS
-- ============================================

-- ============================================
-- 1. Calculate MA200 (Moving Average 200 days)
-- ============================================
CREATE OR REPLACE FUNCTION calculate_ma200(target_date DATE)
RETURNS DECIMAL AS $$
DECLARE
  ma200 DECIMAL;
BEGIN
  SELECT AVG(price_usd) INTO ma200
  FROM indicator_btc_price_history
  WHERE date <= target_date
    AND date >= target_date - INTERVAL '200 days'
  ORDER BY date DESC
  LIMIT 200;
  
  RETURN ma200;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 2. Calculate Mayer Multiple
-- ============================================
CREATE OR REPLACE FUNCTION calculate_mayer_multiple(target_date DATE)
RETURNS TABLE(
  current_price DECIMAL,
  ma200_value DECIMAL,
  mayer_multiple DECIMAL,
  is_above_2_5 BOOLEAN,
  signal TEXT
) AS $$
DECLARE
  _price DECIMAL;
  _ma200 DECIMAL;
  _multiple DECIMAL;
BEGIN
  -- Get current price
  SELECT price_usd INTO _price
  FROM indicator_btc_price_history
  WHERE date = target_date
  LIMIT 1;
  
  -- Calculate MA200
  _ma200 := calculate_ma200(target_date);
  
  -- Calculate Mayer Multiple
  IF _ma200 > 0 THEN
    _multiple := _price / _ma200;
  ELSE
    _multiple := 0;
  END IF;
  
  -- Return result
  RETURN QUERY SELECT
    _price,
    _ma200,
    _multiple,
    _multiple > 2.5,
    CASE
      WHEN _multiple > 2.5 THEN 'extreme_greed'
      WHEN _multiple > 1.8 THEN 'greed'
      WHEN _multiple < 0.8 THEN 'extreme_fear'
      WHEN _multiple < 1.0 THEN 'fear'
      ELSE 'neutral'
    END;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 3. Calculate Pi Cycle Top
-- ============================================
CREATE OR REPLACE FUNCTION calculate_pi_cycle(target_date DATE)
RETURNS TABLE(
  ma111 DECIMAL,
  ma350x2 DECIMAL,
  has_crossed BOOLEAN,
  distance DECIMAL,
  signal TEXT
) AS $$
DECLARE
  _ma111 DECIMAL;
  _ma350 DECIMAL;
  _ma350x2 DECIMAL;
  _distance DECIMAL;
BEGIN
  -- Calculate 111 DMA
  SELECT AVG(price_usd) INTO _ma111
  FROM indicator_btc_price_history
  WHERE date <= target_date
    AND date >= target_date - INTERVAL '111 days'
  LIMIT 111;
  
  -- Calculate 350 DMA
  SELECT AVG(price_usd) INTO _ma350
  FROM indicator_btc_price_history
  WHERE date <= target_date
    AND date >= target_date - INTERVAL '350 days'
  LIMIT 350;
  
  _ma350x2 := _ma350 * 2;
  
  -- Calculate distance
  IF _ma350x2 > 0 THEN
    _distance := ((_ma111 - _ma350x2) / _ma350x2) * 100;
  ELSE
    _distance := 0;
  END IF;
  
  -- Return result
  RETURN QUERY SELECT
    _ma111,
    _ma350x2,
    _ma111 >= _ma350x2,
    _distance,
    CASE
      WHEN _ma111 >= _ma350x2 THEN 'top_signal'
      WHEN _distance > -5 THEN 'approaching_top'
      ELSE 'safe'
    END;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 4. Calculate Monthly RSI
-- ============================================
CREATE OR REPLACE FUNCTION calculate_monthly_rsi(target_date DATE, periods INT DEFAULT 14)
RETURNS TABLE(
  rsi_value DECIMAL,
  avg_gain DECIMAL,
  avg_loss DECIMAL,
  is_above_70 BOOLEAN,
  is_below_30 BOOLEAN,
  signal TEXT
) AS $$
DECLARE
  _rsi DECIMAL;
  _avg_gain DECIMAL := 0;
  _avg_loss DECIMAL := 0;
  _rs DECIMAL;
BEGIN
  -- Get monthly price changes
  WITH monthly_changes AS (
    SELECT 
      date_trunc('month', date) as month,
      price_usd,
      LAG(price_usd) OVER (ORDER BY date_trunc('month', date)) as prev_price
    FROM indicator_btc_price_history
    WHERE date <= target_date
      AND date >= target_date - INTERVAL '15 months'
    ORDER BY date DESC
    LIMIT periods + 1
  ),
  gains_losses AS (
    SELECT
      CASE WHEN price_usd > prev_price THEN price_usd - prev_price ELSE 0 END as gain,
      CASE WHEN price_usd < prev_price THEN prev_price - price_usd ELSE 0 END as loss
    FROM monthly_changes
    WHERE prev_price IS NOT NULL
  )
  SELECT 
    AVG(gain), 
    AVG(loss)
  INTO _avg_gain, _avg_loss
  FROM gains_losses;
  
  -- Calculate RSI
  IF _avg_loss = 0 THEN
    _rsi := 100;
  ELSE
    _rs := _avg_gain / _avg_loss;
    _rsi := 100 - (100 / (1 + _rs));
  END IF;
  
  -- Return result
  RETURN QUERY SELECT
    _rsi,
    _avg_gain,
    _avg_loss,
    _rsi > 70,
    _rsi < 30,
    CASE
      WHEN _rsi > 70 THEN 'overbought'
      WHEN _rsi < 30 THEN 'oversold'
      ELSE 'neutral'
    END;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 5. Calculate Rainbow Chart Zone
-- ============================================
CREATE OR REPLACE FUNCTION calculate_rainbow_zone(target_date DATE)
RETURNS TABLE(
  current_price DECIMAL,
  log_regression DECIMAL,
  zone TEXT,
  signal TEXT
) AS $$
DECLARE
  _price DECIMAL;
  _days_since_genesis INT;
  _log_regression DECIMAL;
  _zone TEXT;
  _signal TEXT;
BEGIN
  -- Get current price
  SELECT price_usd INTO _price
  FROM indicator_btc_price_history
  WHERE date = target_date
  LIMIT 1;
  
  -- Days since Bitcoin genesis (Jan 3, 2009)
  _days_since_genesis := target_date - DATE '2009-01-03';
  
  -- Logarithmic regression formula
  -- Price = 10^(2.66167155005961 * ln(days) - 17.9183761889864)
  _log_regression := POWER(10, (2.66167155005961 * LN(_days_since_genesis) - 17.9183761889864));
  
  -- Determine zone based on price relative to regression
  CASE
    WHEN _price > _log_regression * 10 THEN
      _zone := 'red';
      _signal := 'sell';
    WHEN _price > _log_regression * 5 THEN
      _zone := 'orange';
      _signal := 'sell';
    WHEN _price > _log_regression * 3 THEN
      _zone := 'yellow';
      _signal := 'sell';
    WHEN _price > _log_regression * 2 THEN
      _zone := 'light_green';
      _signal := 'hold';
    WHEN _price > _log_regression * 1 THEN
      _zone := 'green';
      _signal := 'hold';
    WHEN _price > _log_regression * 0.5 THEN
      _zone := 'light_blue';
      _signal := 'buy';
    WHEN _price > _log_regression * 0.3 THEN
      _zone := 'blue';
      _signal := 'buy';
    WHEN _price > _log_regression * 0.1 THEN
      _zone := 'dark_blue';
      _signal := 'buy';
    ELSE
      _zone := 'purple';
      _signal := 'buy';
  END CASE;
  
  RETURN QUERY SELECT _price, _log_regression, _zone, _signal;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 6. Calculate Stock-to-Flow Model
-- ============================================
CREATE OR REPLACE FUNCTION calculate_stock_to_flow(target_date DATE)
RETURNS TABLE(
  current_price DECIMAL,
  circulating_supply DECIMAL,
  inflation_rate DECIMAL,
  s2f_ratio DECIMAL,
  model_price DECIMAL,
  distance DECIMAL,
  signal TEXT
) AS $$
DECLARE
  _price DECIMAL;
  _supply DECIMAL;
  _annual_inflation DECIMAL;
  _s2f DECIMAL;
  _model_price DECIMAL;
  _distance DECIMAL;
  _halvings INT;
  _block_reward DECIMAL;
BEGIN
  -- Get current price
  SELECT price_usd INTO _price
  FROM indicator_btc_price_history
  WHERE date = target_date
  LIMIT 1;
  
  -- Calculate number of halvings
  -- Halvings: Nov 2012, Jul 2016, May 2020, Apr 2024
  _halvings := CASE
    WHEN target_date < '2012-11-28' THEN 0
    WHEN target_date < '2016-07-09' THEN 1
    WHEN target_date < '2020-05-11' THEN 2
    WHEN target_date < '2024-04-20' THEN 3
    ELSE 4
  END;
  
  -- Block reward after halvings
  _block_reward := 50 / POWER(2, _halvings);
  
  -- Approximate supply (simplified)
  _supply := 21000000 - (21000000 - 19000000) * EXP(-0.0005 * _halvings);
  
  -- Annual inflation
  _annual_inflation := (_block_reward * 6 * 24 * 365) / _supply;
  
  -- Stock-to-Flow ratio
  IF _annual_inflation > 0 THEN
    _s2f := 1 / _annual_inflation;
  ELSE
    _s2f := 999;
  END IF;
  
  -- S2F model price: Price = 0.4 * S2F^3
  _model_price := 0.4 * POWER(_s2f, 3);
  
  -- Distance from model
  IF _model_price > 0 THEN
    _distance := ((_price - _model_price) / _model_price) * 100;
  ELSE
    _distance := 0;
  END IF;
  
  RETURN QUERY SELECT
    _price,
    _supply,
    _annual_inflation,
    _s2f,
    _model_price,
    _distance,
    CASE
      WHEN _distance > 50 THEN 'overvalued'
      WHEN _distance < -50 THEN 'undervalued'
      ELSE 'fair'
    END;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 7. Batch Update All Indicators
-- ============================================
CREATE OR REPLACE FUNCTION update_all_indicators(target_date DATE)
RETURNS TEXT AS $$
DECLARE
  result TEXT := '';
  ma200_data RECORD;
  mayer_data RECORD;
  pi_data RECORD;
  rsi_data RECORD;
  rainbow_data RECORD;
  s2f_data RECORD;
BEGIN
  -- MA200
  INSERT INTO indicator_ma200_history (date, ma200_value, current_price, distance_from_ma, is_above_ma200, signal)
  SELECT 
    target_date,
    calculate_ma200(target_date),
    p.price_usd,
    ((p.price_usd - calculate_ma200(target_date)) / calculate_ma200(target_date)) * 100,
    p.price_usd > calculate_ma200(target_date),
    CASE WHEN p.price_usd > calculate_ma200(target_date) THEN 'bullish' ELSE 'bearish' END
  FROM indicator_btc_price_history p
  WHERE p.date = target_date
  ON CONFLICT (date) DO UPDATE SET
    ma200_value = EXCLUDED.ma200_value,
    current_price = EXCLUDED.current_price;
  
  -- Mayer Multiple
  SELECT * INTO mayer_data FROM calculate_mayer_multiple(target_date);
  INSERT INTO indicator_mayer_history (date, current_price, ma200_value, mayer_multiple, is_above_2_5, signal)
  VALUES (target_date, mayer_data.current_price, mayer_data.ma200_value, mayer_data.mayer_multiple, mayer_data.is_above_2_5, mayer_data.signal)
  ON CONFLICT (date) DO UPDATE SET
    mayer_multiple = EXCLUDED.mayer_multiple;
  
  -- Pi Cycle
  SELECT * INTO pi_data FROM calculate_pi_cycle(target_date);
  INSERT INTO indicator_pi_cycle_history (date, current_price, ma111_value, ma350x2_value, distance_to_cross, has_crossed, signal)
  SELECT target_date, p.price_usd, pi_data.ma111, pi_data.ma350x2, pi_data.distance, pi_data.has_crossed, pi_data.signal
  FROM indicator_btc_price_history p
  WHERE p.date = target_date
  ON CONFLICT (date) DO UPDATE SET
    ma111_value = EXCLUDED.ma111_value;
  
  -- Monthly RSI (only on first day of month)
  IF EXTRACT(DAY FROM target_date) = 1 THEN
    SELECT * INTO rsi_data FROM calculate_monthly_rsi(target_date);
    INSERT INTO indicator_rsi_monthly_history (date, rsi_value, avg_gain, avg_loss, is_above_70, is_below_30, signal)
    VALUES (target_date, rsi_data.rsi_value, rsi_data.avg_gain, rsi_data.avg_loss, rsi_data.is_above_70, rsi_data.is_below_30, rsi_data.signal)
    ON CONFLICT (date) DO UPDATE SET
      rsi_value = EXCLUDED.rsi_value;
  END IF;
  
  -- Rainbow Chart
  SELECT * INTO rainbow_data FROM calculate_rainbow_zone(target_date);
  INSERT INTO indicator_rainbow_history (date, current_price, logarithmic_regression, zone, signal)
  VALUES (target_date, rainbow_data.current_price, rainbow_data.log_regression, rainbow_data.zone, rainbow_data.signal)
  ON CONFLICT (date) DO UPDATE SET
    zone = EXCLUDED.zone;
  
  -- Stock-to-Flow
  SELECT * INTO s2f_data FROM calculate_stock_to_flow(target_date);
  INSERT INTO indicator_s2f_history (date, current_price, circulating_supply, annual_inflation_rate, stock_to_flow_ratio, s2f_model_price, distance_from_model, signal)
  VALUES (target_date, s2f_data.current_price, s2f_data.circulating_supply, s2f_data.inflation_rate, s2f_data.s2f_ratio, s2f_data.model_price, s2f_data.distance, s2f_data.signal)
  ON CONFLICT (date) DO UPDATE SET
    stock_to_flow_ratio = EXCLUDED.stock_to_flow_ratio;
  
  result := 'Updated all calculable indicators for ' || target_date;
  RETURN result;
END;
$$ LANGUAGE plpgsql;