# Supabase Setup pour PatrimoineX

Ce guide vous explique comment configurer la base de données Supabase pour PatrimoineX.

## 📊 Architecture de la base de données

### Tables principales

1. **patrimoinex_assets** - Actifs financiers des utilisateurs
2. **patrimoinex_market_data** - Données de marché en temps réel
3. **patrimoinex_market_indicators** - Indicateurs Bitcoin (Top/Bottom)
4. **patrimoinex_analysis_history** - Historique des analyses
5. **patrimoinex_portfolio_snapshots** - Snapshots quotidiens du portfolio
6. **patrimoinex_education_content** - Contenu éducatif
7. **patrimoinex_user_preferences** - Préférences utilisateur
8. **patrimoinex_chat_messages** - Conversations IA

### Vues analytiques

- **patrimoinex_portfolio_summary** - Résumé du portfolio par type d'actif
- **patrimoinex_latest_indicators** - Derniers indicateurs de marché

## 🚀 Installation

### Étape 1 : Créer un projet Supabase

1. Aller sur [app.supabase.com](https://app.supabase.com)
2. Créer un nouveau projet
3. Choisir la région (Europe pour la France)
4. Définir un mot de passe fort pour la base de données

### Étape 2 : Exécuter le schéma SQL

1. Aller dans **SQL Editor** dans Supabase
2. Créer une nouvelle query
3. Copier-coller le contenu de `schema.sql`
4. Exécuter le script (Run)

⚠️ **Important** : Le script est idémpotent, vous pouvez le réexécuter sans risque.

### Étape 3 : Récupérer les clés API

1. Aller dans **Settings > API**
2. Copier :
   - **Project URL** (ex: `https://xyz.supabase.co`)
   - **anon public** key

### Étape 4 : Configurer l'application

Créer le fichier `.env.local` à la racine du projet :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_anon_ici
GEMINI_API_KEY=votre_cle_gemini_ici
```

### Étape 5 : Installer les dépendances

```bash
npm install
```

### Étape 6 : Lancer l'application

```bash
npm run dev
```

## 🔒 Sécurité (Row Level Security)

Le schéma inclut des politiques RLS pour :

- **Données privées** (assets, snapshots, preferences, messages)
  - Les utilisateurs ne peuvent voir que leurs propres données
  - CRUD complet sur leurs propres ressources

- **Données publiques** (market data, indicators, education)
  - Lecture seule pour tous les utilisateurs
  - Insértion/modification réservée aux workflows N8N

## 🤖 Workflows N8N (optionnel)

### Workflow 1 : Scraping Market Data

Créer un workflow N8N pour alimenter `patrimoinex_market_data` :

```
Schedule Trigger (daily)
  → HTTP Request (CoinGecko API)
  → Supabase Insert (patrimoinex_market_data)
```

### Workflow 2 : Calcul des indicateurs Bitcoin

```
Schedule Trigger (hourly)
  → HTTP Request (TradingView, CoinStats, etc.)
  → Code Node (calcul is_met)
  → Supabase Upsert (patrimoinex_market_indicators)
```

### Workflow 3 : Snapshots quotidiens

```
Schedule Trigger (daily 00:00 UTC)
  → Supabase Query (get all users)
  → Loop
    → Supabase Query (get user assets)
    → Code Node (calculate totals)
    → Supabase Insert (patrimoinex_portfolio_snapshots)
```

## 📋 Seed Data (données de démo)

Pour tester l'application avec des données factices :

```sql
-- Insérer les 10 indicateurs Bitcoin par défaut
INSERT INTO patrimoinex_market_indicators (
  title_eng, title_fr, description, objective, source, source_url, threshold_type, threshold_value
)
VALUES
  ('200 days Moving Average', 'Moyenne mobile 200 jours', 'Cours moyen du prix du Bitcoin sur une période de 200 jours.', 'Prix du Bitcoin au dessus de la moyenne mobile 200', 'Tradingview', 'https://www.tradingview.com', 'GT', 52000),
  ('Bitcoin Dominance', 'Dominance du Bitcoin', 'Position du Bitcoin sur le marché crypto.', 'Dominance Bitcoin inférieure à 45%', 'Coinstats', 'https://coinstats.app/btc-dominance/', 'LT', 45),
  ('Bitcoin Rainbow Price Chart', 'Indicateur arc en ciel', 'Outil d\'valuation long terme.', 'Zone Rouge / Orange / Jaune', 'Bitcoin Magazine Pro', 'https://www.bitcoinmagazinepro.com/charts/bitcoin-rainbow-chart/', 'ZONE', NULL);
-- ... (ajouter les 7 autres)

-- Ajouter du contenu éducatif
INSERT INTO patrimoinex_education_content (
  title, asset_type, content_type, duration, release_date, author, summary, complexity
)
VALUES
  ('ETF vs Stock Picking', 'Stocks', 'Analyse Vidéo', '18 min', '2024-10-15', 'Finary', 'Comparaison gestion passive vs active', 'Intermédiaire');
```

## 📊 Requêtes utiles

### Récupérer le portfolio d'un utilisateur

```sql
SELECT * FROM patrimoinex_portfolio_summary
WHERE user_id = 'uuid-de-l-utilisateur';
```

### Graphique d'évolution du portfolio (30 jours)

```sql
SELECT 
  snapshot_date,
  total_value,
  allocation
FROM patrimoinex_portfolio_snapshots
WHERE user_id = 'uuid'
  AND snapshot_date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY snapshot_date ASC;
```

### Indicateurs Bitcoin mis à jour aujourd'hui

```sql
SELECT * FROM patrimoinex_latest_indicators
WHERE DATE(analyzed_at) = CURRENT_DATE;
```

## 🛠️ Maintenance

### Nettoyage des vieilles données

```sql
-- Supprimer les market_data de plus de 90 jours
DELETE FROM patrimoinex_market_data
WHERE timestamp < NOW() - INTERVAL '90 days';

-- Archiver les snapshots de plus d'1 an
-- (créer une table patrimoinex_portfolio_snapshots_archive)
```

### Index et performances

Le schéma inclut déjà les index optimaux. Pour vérifier :

```sql
SELECT 
  schemaname,
  tablename,
  indexname
FROM pg_indexes
WHERE tablename LIKE 'patrimoinex_%';
```

## 🐛 Troubleshooting

### Erreur : "relation does not exist"

→ Le schéma n'a pas été exécuté. Réexécuter `schema.sql`.

### Erreur : "permission denied"

→ Vérifier les politiques RLS. L'utilisateur doit être authentifié via Supabase Auth.

### Erreur : "could not connect to server"

→ Vérifier `VITE_SUPABASE_URL` dans `.env.local`.

## 📚 Ressources

- [Documentation Supabase](https://supabase.com/docs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript)
- [PostgreSQL JSON Functions](https://www.postgresql.org/docs/current/functions-json.html)
