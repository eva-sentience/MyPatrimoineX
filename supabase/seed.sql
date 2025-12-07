-- ============================================
-- PATRIMOINEX SEED DATA
-- Données de démo pour tester l'application
-- ============================================

-- ============================================
-- 1. MARKET INDICATORS (10 indicateurs Bitcoin)
-- ============================================

INSERT INTO patrimoinex_market_indicators (
  title_eng, title_fr, description, objective, source, source_url, threshold_type, threshold_value
)
VALUES
  (
    '200 days Moving Average',
    'Moyenne mobile 200 jours',
    'Cours moyen du prix du Bitcoin sur une période de 200 jours.',
    'Prix du Bitcoin au dessus de la moyenne mobile 200 (en journalier)',
    'Tradingview',
    'https://www.tradingview.com',
    'GT',
    52000
  ),
  (
    'Bitcoin Dominance',
    'Dominance du Bitcoin',
    'La dominance du Bitcoin (BTC) est un indicateur qui offre un aperçu de la position et de l\'influence de ce dernier sur le marché des cryptomonnaies.',
    'Dominance Bitcoin inférieure à 45%',
    'Coinstats',
    'https://coinstats.app/btc-dominance/',
    'LT',
    45
  ),
  (
    'Bitcoin Rainbow Price Chart Indicator',
    'Indicateur arc en ciel du prix du bitcoin',
    'C\'est un outil d\'valuation à long terme pour Bitcoin. Il utilise une courbe de croissance logarithmique pour prévoir l\'orientation future potentielle des prix du Bitcoin.',
    'Zone Rouge / Orange / Jaune',
    'Bitcoin Magazine Pro',
    'https://www.bitcoinmagazinepro.com/charts/bitcoin-rainbow-chart/',
    'ZONE',
    NULL
  ),
  (
    'Mayer Multiple',
    'Multiple de Mayer',
    'Le multiple de Mayer est utilisé pour déterminer si le Bitcoin est suracheté, à un prix raisonnable ou sous-évalué.',
    'Multiple de Mayer > 2,5',
    'Bitcoinition',
    'https://bitcoinition.com/charts/mayer-multiple/',
    'GT',
    2.5
  ),
  (
    'Pi Cycle Top Indicator',
    'Indicateur du Top du cycle PI',
    'L\'indicateur Pi Cycle Top utilise la moyenne mobile de 111 jours (111DMA) et un multiple de la moyenne mobile de 350 jours (350DMA x 2).',
    'Prix du bitcoin > courbe verte (350DMA x 2)',
    'Bitcoin Magazine Pro',
    'https://www.bitcoinmagazinepro.com/charts/pi-cycle-top-indicator/',
    'BOOL',
    NULL
  ),
  (
    'Monthly RSI',
    'RSI mensuel',
    'L\'indice de force relative (RSI) mesure la vitesse et l\'amplitude des changements récents de prix du Bitcoin.',
    'RSI > 70',
    'Bitbo',
    'https://charts.bitbo.io/monthly-rsi/',
    'GT',
    70
  ),
  (
    'Bitcoin Cycle Master',
    'Maitre du cycle Bitcoin',
    'Cet indicateur identifie les périodes de risque accru ou faible en fonction du comportement des transactions on-chain.',
    'Prix du bitcoin > Courbe Violet / Rouge',
    'TradingView',
    'https://www.tradingview.com',
    'BOOL',
    NULL
  ),
  (
    'Stock to flow model',
    'Model du Stock to Flow',
    'Le ratio Stock / Flow (S/F) suppose que la rareté génère de la valeur.',
    'Prix du bitcoin > Courbe de base',
    'Bitcoin Magazine Pro',
    'https://www.bitcoinmagazinepro.com/charts/stock-to-flow-model/',
    'BOOL',
    NULL
  ),
  (
    'ColinTalksCrypto Bitcoin Bull Run Index',
    'Indice CBBI',
    'Le CBBI est un indice Bitcoin qui utilise une analyse avancée en temps réel de 9 mesures pour comprendre le cycle.',
    'Supérieur à 80',
    'CoinGlass',
    'https://www.coinglass.com/fr/pro/i/cbbi-index',
    'GT',
    80
  ),
  (
    'Crypto total marketcap',
    'Marketcap total du marché crypto',
    'Il permet de calculer la capitalisation de l\'ensemble des cryptomonnaies sur le marché à l\'instant T.',
    'Crypto total Marketcap à l\'ATH',
    'CoinMarketCap',
    'https://coinmarketcap.com/charts/',
    'BOOL',
    NULL
  )
ON CONFLICT DO NOTHING;

-- ============================================
-- 2. EDUCATION CONTENT (contenu éducatif)
-- ============================================

INSERT INTO patrimoinex_education_content (
  title, asset_type, content_type, duration, release_date, author, 
  source_url, image_url, summary, complexity, key_points, charts
)
VALUES
  (
    'ETF vs Stock Picking : La vérité mathématique',
    'Stocks',
    'Analyse Vidéo',
    '18 min',
    '2024-10-15',
    'Finary',
    'https://www.youtube.com/watch?v=example',
    'https://images.unsplash.com/photo-1611974765270-ca1258634369?auto=format&fit=crop&q=80',
    'Une analyse approfondie comparant la gestion passive (ETF) et la gestion active (Stock Picking).',
    'Intermédiaire',
    ARRAY[
      'Performance historique des ETF vs Fonds gérés.',
      'Impact des frais sur le long terme.',
      'Différences de diversification.',
      'Psychologie de l\'investisseur.'
    ],
    '[
      {
        "title": "Comparaison de Performance",
        "slideType": "chart",
        "type": "bar",
        "dataKey1": "ETF",
        "dataKey2": "Stock Picking",
        "data": [
          {"name": "1 an", "value1": 8, "value2": 6},
          {"name": "5 ans", "value1": 45, "value2": 30},
          {"name": "10 ans", "value1": 120, "value2": 85}
        ],
        "description": "Rendement cumulé moyen sur différentes périodes."
      }
    ]'::jsonb
  ),
  (
    'Comprendre le halving Bitcoin',
    'Cryptocurrency',
    'Guide',
    '12 min',
    '2024-09-20',
    'Bitcoin Magazine',
    'https://bitcoinmagazine.com/guides/what-is-bitcoin-halving',
    'https://images.unsplash.com/photo-1621761191319-c6fb62004040?auto=format&fit=crop&q=80',
    'Explication détaillée du mécanisme de halving et son impact sur le prix du Bitcoin.',
    'Débutant',
    ARRAY[
      'Le halving réduit la récompense des mineurs de 50%',
      'Il se produit tous les 210 000 blocs (environ 4 ans)',
      'Historiquement, le halving précède un bull run',
      'Prochain halving prévu en 2028'
    ],
    NULL
  ),
  (
    'SCPI : Tout comprendre en 2024',
    'Real Estate',
    'Deep Dive',
    '25 min',
    '2024-11-01',
    'Investir',
    'https://investir.lesechos.fr/scpi',
    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80',
    'Analyse complète des SCPI : fonctionnement, rendements, fiscalité et sélection.',
    'Avancé',
    ARRAY[
      'Rendement moyen 2024 : 4.52%',
      'Fiscalité : imposition au barème progressif',
      'Diversification géographique essentielle',
      'Attention à la liquidité limitée'
    ],
    NULL
  )
ON CONFLICT DO NOTHING;

-- ============================================
-- 3. MARKET DATA (exemples)
-- ============================================

INSERT INTO patrimoinex_market_data (
  asset_type, symbol, metric_name, metric_value, metric_change_24h, source
)
VALUES
  ('Cryptocurrency', 'BTC', 'price', 68450.00, 2.4, 'CoinGecko'),
  ('Cryptocurrency', 'BTC', 'dominance', 54.2, 0.5, 'CoinStats'),
  ('Cryptocurrency', 'ETH', 'price', 3520.00, 1.8, 'CoinGecko'),
  ('Stocks', 'SPX', 'price', 5420.00, 0.8, 'Yahoo Finance'),
  ('Stocks', 'CAC40', 'price', 7950.00, -0.2, 'Boursorama'),
  ('Precious Metals', 'GOLD', 'price', 2350.00, 1.2, 'Kitco'),
  ('Precious Metals', 'SILVER', 'price', 28.50, 2.1, 'Kitco');

-- ============================================
-- 4. ANALYSIS HISTORY (historique factice)
-- ============================================

INSERT INTO patrimoinex_analysis_history (date, percentage, details)
VALUES
  ('2024-12-06', 45.5, '[]'::jsonb),
  ('2024-12-05', 42.0, '[]'::jsonb),
  ('2024-12-04', 38.5, '[]'::jsonb),
  ('2024-12-03', 41.0, '[]'::jsonb),
  ('2024-12-02', 39.5, '[]'::jsonb);
