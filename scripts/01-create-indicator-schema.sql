-- ============================================================================
-- PATRIMOINEX - SCHEMA INDICATEURS TECHNIQUES & IMPORT DONNÉES HISTORIQUES
-- ============================================================================
-- Ce script crée toutes les tables d'indicateurs, fonctions SQL et importe
-- les données historiques Bitcoin depuis le CSV généré par Apify
-- ============================================================================

-- ============================================================================
-- PARTIE 1 : TABLES D'INDICATEURS (11 tables)
-- ============================================================================

-- Table 1 : Prix historiques BTC-USD
CREATE TABLE IF NOT EXISTS indicator_btc_price_history (
    date DATE PRIMARY KEY,
    price_usd NUMERIC(20, 8) NOT NULL,
    price_eur NUMERIC(20, 8),
    volume_24h NUMERIC(20, 2),
    market_cap NUMERIC(20, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table 2 : Moyennes mobiles
CREATE TABLE IF NOT EXISTS indicator_moving_averages (
    date DATE PRIMARY KEY,
    sma_20 NUMERIC(20, 8),
    sma_50 NUMERIC(20, 8),
    sma_200 NUMERIC(20, 8),
    ema_12 NUMERIC(20, 8),
    ema_26 NUMERIC(20, 8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (date) REFERENCES indicator_btc_price_history(date) ON DELETE CASCADE
);

-- Table 3 : MACD
CREATE TABLE IF NOT EXISTS indicator_macd (
    date DATE PRIMARY KEY,
    macd_line NUMERIC(20, 8),
    signal_line NUMERIC(20, 8),
    histogram NUMERIC(20, 8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (date) REFERENCES indicator_btc_price_history(date) ON DELETE CASCADE
);

-- Table 4 : RSI
CREATE TABLE IF NOT EXISTS indicator_rsi (
    date DATE PRIMARY KEY,
    rsi_14 NUMERIC(20, 8),
    signal VARCHAR(20) CHECK (signal IN ('overbought', 'oversold', 'neutral')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (date) REFERENCES indicator_btc_price_history(date) ON DELETE CASCADE
);

-- Table 5 : Stochastique
CREATE TABLE IF NOT EXISTS indicator_stochastic (
    date DATE PRIMARY KEY,
    k_percent NUMERIC(20, 8),
    d_percent NUMERIC(20, 8),
    signal VARCHAR(20) CHECK (signal IN ('overbought', 'oversold', 'neutral')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (date) REFERENCES indicator_btc_price_history(date) ON DELETE CASCADE
);

-- Table 6 : Bollinger Bands
CREATE TABLE IF NOT EXISTS indicator_bollinger_bands (
    date DATE PRIMARY KEY,
    upper_band NUMERIC(20, 8),
    middle_band NUMERIC(20, 8),
    lower_band NUMERIC(20, 8),
    bandwidth NUMERIC(20, 8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (date) REFERENCES indicator_btc_price_history(date) ON DELETE CASCADE
);

-- Table 7 : ATR (Average True Range)
CREATE TABLE IF NOT EXISTS indicator_atr (
    date DATE PRIMARY KEY,
    atr_14 NUMERIC(20, 8),
    volatility_signal VARCHAR(20) CHECK (volatility_signal IN ('high', 'medium', 'low')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (date) REFERENCES indicator_btc_price_history(date) ON DELETE CASCADE
);

-- Table 8 : OBV (On-Balance Volume)
CREATE TABLE IF NOT EXISTS indicator_obv (
    date DATE PRIMARY KEY,
    obv NUMERIC(30, 2),
    obv_sma_20 NUMERIC(30, 2),
    signal VARCHAR(20) CHECK (signal IN ('bullish', 'bearish', 'neutral')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (date) REFERENCES indicator_btc_price_history(date) ON DELETE CASCADE
);

-- Table 9 : ADX (Average Directional Index)
CREATE TABLE IF NOT EXISTS indicator_adx (
    date DATE PRIMARY KEY,
    adx NUMERIC(20, 8),
    plus_di NUMERIC(20, 8),
    minus_di NUMERIC(20, 8),
    trend_strength VARCHAR(20) CHECK (trend_strength IN ('strong', 'weak', 'no_trend')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (date) REFERENCES indicator_btc_price_history(date) ON DELETE CASCADE
);

-- Table 10 : Ichimoku
CREATE TABLE IF NOT EXISTS indicator_ichimoku (
    date DATE PRIMARY KEY,
    tenkan_sen NUMERIC(20, 8),
    kijun_sen NUMERIC(20, 8),
    senkou_span_a NUMERIC(20, 8),
    senkou_span_b NUMERIC(20, 8),
    chikou_span NUMERIC(20, 8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (date) REFERENCES indicator_btc_price_history(date) ON DELETE CASCADE
);

-- Table 11 : Signaux de trading combinés
CREATE TABLE IF NOT EXISTS indicator_trading_signals (
    date DATE PRIMARY KEY,
    overall_signal VARCHAR(20) CHECK (overall_signal IN ('strong_buy', 'buy', 'neutral', 'sell', 'strong_sell')),
    signal_strength NUMERIC(5, 2) CHECK (signal_strength BETWEEN 0 AND 100),
    bullish_indicators INTEGER,
    bearish_indicators INTEGER,
    neutral_indicators INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (date) REFERENCES indicator_btc_price_history(date) ON DELETE CASCADE
);

-- ============================================================================
-- PARTIE 2 : INDEX POUR OPTIMISER LES REQUÊTES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_btc_price_date ON indicator_btc_price_history(date DESC);
CREATE INDEX IF NOT EXISTS idx_moving_averages_date ON indicator_moving_averages(date DESC);
CREATE INDEX IF NOT EXISTS idx_macd_date ON indicator_macd(date DESC);
CREATE INDEX IF NOT EXISTS idx_rsi_date ON indicator_rsi(date DESC);
CREATE INDEX IF NOT EXISTS idx_trading_signals_date ON indicator_trading_signals(date DESC);

-- ============================================================================
-- PARTIE 3 : FONCTIONS SQL DE CALCUL DES INDICATEURS (7 fonctions)
-- ============================================================================

-- Fonction 1 : Calculer les moyennes mobiles (SMA et EMA)
CREATE OR REPLACE FUNCTION calculate_moving_averages(target_date DATE)
RETURNS VOID AS $$
DECLARE
    v_sma_20 NUMERIC;
    v_sma_50 NUMERIC;
    v_sma_200 NUMERIC;
    v_ema_12 NUMERIC;
    v_ema_26 NUMERIC;
    v_prev_ema_12 NUMERIC;
    v_prev_ema_26 NUMERIC;
    v_current_price NUMERIC;
    v_multiplier_12 NUMERIC := 2.0 / (12 + 1);
    v_multiplier_26 NUMERIC := 2.0 / (26 + 1);
BEGIN
    -- Récupérer le prix actuel
    SELECT price_usd INTO v_current_price
    FROM indicator_btc_price_history
    WHERE date = target_date;

    IF v_current_price IS NULL THEN
        RETURN;
    END IF;

    -- SMA 20
    SELECT AVG(price_usd) INTO v_sma_20
    FROM (
        SELECT price_usd
        FROM indicator_btc_price_history
        WHERE date <= target_date
        ORDER BY date DESC
        LIMIT 20
    ) AS sub;

    -- SMA 50
    SELECT AVG(price_usd) INTO v_sma_50
    FROM (
        SELECT price_usd
        FROM indicator_btc_price_history
        WHERE date <= target_date
        ORDER BY date DESC
        LIMIT 50
    ) AS sub;

    -- SMA 200
    SELECT AVG(price_usd) INTO v_sma_200
    FROM (
        SELECT price_usd
        FROM indicator_btc_price_history
        WHERE date <= target_date
        ORDER BY date DESC
        LIMIT 200
    ) AS sub;

    -- EMA 12 (utilise l'EMA précédente si disponible)
    SELECT ema_12 INTO v_prev_ema_12
    FROM indicator_moving_averages
    WHERE date < target_date
    ORDER BY date DESC
    LIMIT 1;

    IF v_prev_ema_12 IS NULL THEN
        v_ema_12 := v_sma_20; -- Initialisation avec SMA
    ELSE
        v_ema_12 := (v_current_price - v_prev_ema_12) * v_multiplier_12 + v_prev_ema_12;
    END IF;

    -- EMA 26
    SELECT ema_26 INTO v_prev_ema_26
    FROM indicator_moving_averages
    WHERE date < target_date
    ORDER BY date DESC
    LIMIT 1;

    IF v_prev_ema_26 IS NULL THEN
        v_ema_26 := v_sma_20;
    ELSE
        v_ema_26 := (v_current_price - v_prev_ema_26) * v_multiplier_26 + v_prev_ema_26;
    END IF;

    -- Insérer ou mettre à jour
    INSERT INTO indicator_moving_averages (date, sma_20, sma_50, sma_200, ema_12, ema_26, updated_at)
    VALUES (target_date, v_sma_20, v_sma_50, v_sma_200, v_ema_12, v_ema_26, NOW())
    ON CONFLICT (date) DO UPDATE
    SET sma_20 = EXCLUDED.sma_20,
        sma_50 = EXCLUDED.sma_50,
        sma_200 = EXCLUDED.sma_200,
        ema_12 = EXCLUDED.ema_12,
        ema_26 = EXCLUDED.ema_26,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Fonction 2 : Calculer le MACD
CREATE OR REPLACE FUNCTION calculate_macd(target_date DATE)
RETURNS VOID AS $$
DECLARE
    v_ema_12 NUMERIC;
    v_ema_26 NUMERIC;
    v_macd_line NUMERIC;
    v_signal_line NUMERIC;
    v_histogram NUMERIC;
    v_prev_signal NUMERIC;
    v_multiplier NUMERIC := 2.0 / (9 + 1);
BEGIN
    -- Récupérer EMA 12 et EMA 26
    SELECT ema_12, ema_26 INTO v_ema_12, v_ema_26
    FROM indicator_moving_averages
    WHERE date = target_date;

    IF v_ema_12 IS NULL OR v_ema_26 IS NULL THEN
        RETURN;
    END IF;

    -- MACD Line = EMA12 - EMA26
    v_macd_line := v_ema_12 - v_ema_26;

    -- Signal Line = EMA 9 du MACD
    SELECT signal_line INTO v_prev_signal
    FROM indicator_macd
    WHERE date < target_date
    ORDER BY date DESC
    LIMIT 1;

    IF v_prev_signal IS NULL THEN
        -- Initialisation : utiliser la moyenne des 9 derniers MACD
        SELECT AVG(ema_12 - ema_26) INTO v_signal_line
        FROM (
            SELECT ema_12, ema_26
            FROM indicator_moving_averages
            WHERE date <= target_date
            ORDER BY date DESC
            LIMIT 9
        ) AS sub;
    ELSE
        v_signal_line := (v_macd_line - v_prev_signal) * v_multiplier + v_prev_signal;
    END IF;

    -- Histogram = MACD - Signal
    v_histogram := v_macd_line - v_signal_line;

    -- Insérer ou mettre à jour
    INSERT INTO indicator_macd (date, macd_line, signal_line, histogram, updated_at)
    VALUES (target_date, v_macd_line, v_signal_line, v_histogram, NOW())
    ON CONFLICT (date) DO UPDATE
    SET macd_line = EXCLUDED.macd_line,
        signal_line = EXCLUDED.signal_line,
        histogram = EXCLUDED.histogram,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Fonction 3 : Calculer le RSI
CREATE OR REPLACE FUNCTION calculate_rsi(target_date DATE)
RETURNS VOID AS $$
DECLARE
    v_rsi NUMERIC;
    v_avg_gain NUMERIC;
    v_avg_loss NUMERIC;
    v_rs NUMERIC;
    v_signal VARCHAR(20);
BEGIN
    -- Calculer les gains et pertes moyens sur 14 jours
    WITH price_changes AS (
        SELECT
            date,
            price_usd,
            LAG(price_usd) OVER (ORDER BY date) AS prev_price
        FROM indicator_btc_price_history
        WHERE date <= target_date
        ORDER BY date DESC
        LIMIT 15
    ),
    gains_losses AS (
        SELECT
            CASE WHEN price_usd > prev_price THEN price_usd - prev_price ELSE 0 END AS gain,
            CASE WHEN price_usd < prev_price THEN prev_price - price_usd ELSE 0 END AS loss
        FROM price_changes
        WHERE prev_price IS NOT NULL
    )
    SELECT
        AVG(gain) INTO v_avg_gain,
        AVG(loss) INTO v_avg_loss
    FROM gains_losses;

    IF v_avg_loss = 0 THEN
        v_rsi := 100;
    ELSE
        v_rs := v_avg_gain / v_avg_loss;
        v_rsi := 100 - (100 / (1 + v_rs));
    END IF;

    -- Déterminer le signal
    IF v_rsi >= 70 THEN
        v_signal := 'overbought';
    ELSIF v_rsi <= 30 THEN
        v_signal := 'oversold';
    ELSE
        v_signal := 'neutral';
    END IF;

    -- Insérer ou mettre à jour
    INSERT INTO indicator_rsi (date, rsi_14, signal, updated_at)
    VALUES (target_date, v_rsi, v_signal, NOW())
    ON CONFLICT (date) DO UPDATE
    SET rsi_14 = EXCLUDED.rsi_14,
        signal = EXCLUDED.signal,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Fonction 4 : Calculer les Bollinger Bands
CREATE OR REPLACE FUNCTION calculate_bollinger_bands(target_date DATE)
RETURNS VOID AS $$
DECLARE
    v_middle_band NUMERIC;
    v_std_dev NUMERIC;
    v_upper_band NUMERIC;
    v_lower_band NUMERIC;
    v_bandwidth NUMERIC;
BEGIN
    -- Middle Band = SMA 20
    SELECT sma_20 INTO v_middle_band
    FROM indicator_moving_averages
    WHERE date = target_date;

    IF v_middle_band IS NULL THEN
        RETURN;
    END IF;

    -- Calculer l'écart-type des 20 derniers prix
    SELECT STDDEV(price_usd) INTO v_std_dev
    FROM (
        SELECT price_usd
        FROM indicator_btc_price_history
        WHERE date <= target_date
        ORDER BY date DESC
        LIMIT 20
    ) AS sub;

    -- Upper Band = Middle Band + (2 * std_dev)
    v_upper_band := v_middle_band + (2 * v_std_dev);

    -- Lower Band = Middle Band - (2 * std_dev)
    v_lower_band := v_middle_band - (2 * v_std_dev);

    -- Bandwidth = (Upper - Lower) / Middle
    v_bandwidth := (v_upper_band - v_lower_band) / v_middle_band * 100;

    -- Insérer ou mettre à jour
    INSERT INTO indicator_bollinger_bands (date, upper_band, middle_band, lower_band, bandwidth, updated_at)
    VALUES (target_date, v_upper_band, v_middle_band, v_lower_band, v_bandwidth, NOW())
    ON CONFLICT (date) DO UPDATE
    SET upper_band = EXCLUDED.upper_band,
        middle_band = EXCLUDED.middle_band,
        lower_band = EXCLUDED.lower_band,
        bandwidth = EXCLUDED.bandwidth,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Fonction 5 : Calculer l'OBV
CREATE OR REPLACE FUNCTION calculate_obv(target_date DATE)
RETURNS VOID AS $$
DECLARE
    v_current_price NUMERIC;
    v_prev_price NUMERIC;
    v_current_volume NUMERIC;
    v_prev_obv NUMERIC;
    v_obv NUMERIC;
    v_obv_sma_20 NUMERIC;
    v_signal VARCHAR(20);
BEGIN
    -- Récupérer le prix et volume actuels
    SELECT price_usd, volume_24h INTO v_current_price, v_current_volume
    FROM indicator_btc_price_history
    WHERE date = target_date;

    IF v_current_price IS NULL OR v_current_volume IS NULL THEN
        RETURN;
    END IF;

    -- Récupérer le prix précédent
    SELECT price_usd INTO v_prev_price
    FROM indicator_btc_price_history
    WHERE date < target_date
    ORDER BY date DESC
    LIMIT 1;

    -- Récupérer l'OBV précédent
    SELECT obv INTO v_prev_obv
    FROM indicator_obv
    WHERE date < target_date
    ORDER BY date DESC
    LIMIT 1;

    IF v_prev_obv IS NULL THEN
        v_prev_obv := 0;
    END IF;

    -- Calculer OBV
    IF v_prev_price IS NULL THEN
        v_obv := v_current_volume;
    ELSIF v_current_price > v_prev_price THEN
        v_obv := v_prev_obv + v_current_volume;
    ELSIF v_current_price < v_prev_price THEN
        v_obv := v_prev_obv - v_current_volume;
    ELSE
        v_obv := v_prev_obv;
    END IF;

    -- Calculer OBV SMA 20
    SELECT AVG(obv) INTO v_obv_sma_20
    FROM (
        SELECT obv
        FROM indicator_obv
        WHERE date < target_date
        ORDER BY date DESC
        LIMIT 19
    ) AS sub;

    IF v_obv_sma_20 IS NULL THEN
        v_obv_sma_20 := v_obv;
    ELSE
        v_obv_sma_20 := (v_obv_sma_20 * 19 + v_obv) / 20;
    END IF;

    -- Déterminer le signal
    IF v_obv > v_obv_sma_20 THEN
        v_signal := 'bullish';
    ELSIF v_obv < v_obv_sma_20 THEN
        v_signal := 'bearish';
    ELSE
        v_signal := 'neutral';
    END IF;

    -- Insérer ou mettre à jour
    INSERT INTO indicator_obv (date, obv, obv_sma_20, signal, updated_at)
    VALUES (target_date, v_obv, v_obv_sma_20, v_signal, NOW())
    ON CONFLICT (date) DO UPDATE
    SET obv = EXCLUDED.obv,
        obv_sma_20 = EXCLUDED.obv_sma_20,
        signal = EXCLUDED.signal,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Fonction 6 : Calculer les signaux de trading combinés
CREATE OR REPLACE FUNCTION calculate_trading_signals(target_date DATE)
RETURNS VOID AS $$
DECLARE
    v_bullish_count INTEGER := 0;
    v_bearish_count INTEGER := 0;
    v_neutral_count INTEGER := 0;
    v_total_indicators INTEGER := 0;
    v_signal_strength NUMERIC;
    v_overall_signal VARCHAR(20);
    
    v_rsi_signal VARCHAR(20);
    v_macd_histogram NUMERIC;
    v_obv_signal VARCHAR(20);
    v_sma_20 NUMERIC;
    v_sma_50 NUMERIC;
    v_sma_200 NUMERIC;
    v_current_price NUMERIC;
BEGIN
    -- Récupérer le prix actuel
    SELECT price_usd INTO v_current_price
    FROM indicator_btc_price_history
    WHERE date = target_date;

    IF v_current_price IS NULL THEN
        RETURN;
    END IF;

    -- Indicateur 1 : RSI
    SELECT signal INTO v_rsi_signal
    FROM indicator_rsi
    WHERE date = target_date;
    
    IF v_rsi_signal = 'oversold' THEN
        v_bullish_count := v_bullish_count + 1;
    ELSIF v_rsi_signal = 'overbought' THEN
        v_bearish_count := v_bearish_count + 1;
    ELSE
        v_neutral_count := v_neutral_count + 1;
    END IF;
    v_total_indicators := v_total_indicators + 1;

    -- Indicateur 2 : MACD
    SELECT histogram INTO v_macd_histogram
    FROM indicator_macd
    WHERE date = target_date;
    
    IF v_macd_histogram IS NOT NULL THEN
        IF v_macd_histogram > 0 THEN
            v_bullish_count := v_bullish_count + 1;
        ELSIF v_macd_histogram < 0 THEN
            v_bearish_count := v_bearish_count + 1;
        ELSE
            v_neutral_count := v_neutral_count + 1;
        END IF;
        v_total_indicators := v_total_indicators + 1;
    END IF;

    -- Indicateur 3 : OBV
    SELECT signal INTO v_obv_signal
    FROM indicator_obv
    WHERE date = target_date;
    
    IF v_obv_signal = 'bullish' THEN
        v_bullish_count := v_bullish_count + 1;
    ELSIF v_obv_signal = 'bearish' THEN
        v_bearish_count := v_bearish_count + 1;
    ELSE
        v_neutral_count := v_neutral_count + 1;
    END IF;
    v_total_indicators := v_total_indicators + 1;

    -- Indicateur 4 : Moyennes mobiles (Golden Cross / Death Cross)
    SELECT sma_20, sma_50, sma_200 INTO v_sma_20, v_sma_50, v_sma_200
    FROM indicator_moving_averages
    WHERE date = target_date;
    
    IF v_sma_20 IS NOT NULL AND v_sma_50 IS NOT NULL THEN
        IF v_sma_20 > v_sma_50 AND v_current_price > v_sma_200 THEN
            v_bullish_count := v_bullish_count + 1;
        ELSIF v_sma_20 < v_sma_50 AND v_current_price < v_sma_200 THEN
            v_bearish_count := v_bearish_count + 1;
        ELSE
            v_neutral_count := v_neutral_count + 1;
        END IF;
        v_total_indicators := v_total_indicators + 1;
    END IF;

    -- Calculer la force du signal (0-100)
    IF v_total_indicators > 0 THEN
        v_signal_strength := ((v_bullish_count - v_bearish_count) + v_total_indicators) * 50.0 / v_total_indicators;
    ELSE
        v_signal_strength := 50;
    END IF;

    -- Déterminer le signal global
    IF v_signal_strength >= 80 THEN
        v_overall_signal := 'strong_buy';
    ELSIF v_signal_strength >= 60 THEN
        v_overall_signal := 'buy';
    ELSIF v_signal_strength >= 40 THEN
        v_overall_signal := 'neutral';
    ELSIF v_signal_strength >= 20 THEN
        v_overall_signal := 'sell';
    ELSE
        v_overall_signal := 'strong_sell';
    END IF;

    -- Insérer ou mettre à jour
    INSERT INTO indicator_trading_signals (
        date, 
        overall_signal, 
        signal_strength, 
        bullish_indicators, 
        bearish_indicators, 
        neutral_indicators, 
        updated_at
    )
    VALUES (
        target_date, 
        v_overall_signal, 
        v_signal_strength, 
        v_bullish_count, 
        v_bearish_count, 
        v_neutral_count, 
        NOW()
    )
    ON CONFLICT (date) DO UPDATE
    SET overall_signal = EXCLUDED.overall_signal,
        signal_strength = EXCLUDED.signal_strength,
        bullish_indicators = EXCLUDED.bullish_indicators,
        bearish_indicators = EXCLUDED.bearish_indicators,
        neutral_indicators = EXCLUDED.neutral_indicators,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Fonction 7 : Mettre à jour tous les indicateurs pour une date
CREATE OR REPLACE FUNCTION update_all_indicators(target_date DATE)
RETURNS VOID AS $$
BEGIN
    PERFORM calculate_moving_averages(target_date);
    PERFORM calculate_macd(target_date);
    PERFORM calculate_rsi(target_date);
    PERFORM calculate_bollinger_bands(target_date);
    PERFORM calculate_obv(target_date);
    PERFORM calculate_trading_signals(target_date);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PARTIE 4 : COMMENTAIRES ET MÉTADONNÉES
-- ============================================================================

COMMENT ON TABLE indicator_btc_price_history IS 'Historique des prix Bitcoin (BTC-USD) depuis 2014';
COMMENT ON TABLE indicator_moving_averages IS 'Moyennes mobiles simples (SMA) et exponentielles (EMA)';
COMMENT ON TABLE indicator_macd IS 'Moving Average Convergence Divergence';
COMMENT ON TABLE indicator_rsi IS 'Relative Strength Index (14 périodes)';
COMMENT ON TABLE indicator_bollinger_bands IS 'Bollinger Bands (20 périodes, 2 écarts-types)';
COMMENT ON TABLE indicator_obv IS 'On-Balance Volume';
COMMENT ON TABLE indicator_trading_signals IS 'Signaux de trading combinés basés sur plusieurs indicateurs';

-- ============================================================================
-- FIN DU SCHEMA
-- ============================================================================

-- Afficher un message de confirmation
DO $$
BEGIN
    RAISE NOTICE '✅ Schéma créé avec succès : 11 tables + 7 fonctions';
    RAISE NOTICE 'Prochaine étape : importer les données CSV avec la commande ci-dessous';
END $$;
