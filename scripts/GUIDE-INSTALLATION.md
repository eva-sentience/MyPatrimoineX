# 📊 PATRIMOINEX - GUIDE D'INSTALLATION COMPLÈTE
## Système d'indicateurs techniques Bitcoin avec données historiques

---

## 🎯 VUE D'ENSEMBLE

Ce guide vous accompagne pour :
1. ✅ Créer le schéma Supabase (11 tables + 7 fonctions SQL)
2. ✅ Importer 4100 jours de données historiques Bitcoin (2014-2025)
3. ✅ Calculer automatiquement tous les indicateurs techniques
4. ✅ Configurer N8N pour la mise à jour en temps réel

**Durée totale estimée**: 15-20 minutes

---

## 📦 PRÉREQUIS

### 1. Node.js et packages npm
```bash
node --version  # v18+ recommandé
npm install @supabase/supabase-js
```

### 2. Accès Supabase
- Projet Supabase créé
- URL du projet : `https://your-project.supabase.co`
- Service Role Key (disponible dans Settings > API)

### 3. Fichiers générés par Apify
- ✅ `apify-result.json` (téléchargé depuis Apify)
- ✅ `btc-historical-data.csv` (généré par parse-apify-result.mjs)

---

## 📋 ÉTAPE 1 : CRÉER LE SCHÉMA SUPABASE

### Option A : Via l'éditeur SQL Supabase (recommandé)

1. Ouvrez votre projet Supabase
2. Allez dans **SQL Editor**
3. Cliquez sur **New Query**
4. Copiez-collez le contenu de `01-create-indicator-schema.sql`
5. Cliquez sur **Run**

**Résultat attendu**: ✅ 11 tables créées + 7 fonctions SQL

### Option B : Via psql (ligne de commande)
```bash
psql -h db.your-project.supabase.co \
     -p 5432 \
     -d postgres \
     -U postgres \
     -f 01-create-indicator-schema.sql
```

### Vérification
```sql
-- Vérifier que les tables existent
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE 'indicator_%';

-- Devrait retourner 11 lignes
```

---

## 📋 ÉTAPE 2 : GÉNÉRER LE CSV DEPUIS APIFY

### 2.1 Parser le JSON Apify
```bash
cd ~/MyPatrimoineX/scripts
node parse-apify-result.mjs apify-result.json btc-historical-data.csv
```

**Sortie attendue**:
```
🔍 Lecture du fichier Apify...
📊 Parsing du markdown...
✅ 4100 lignes de données extraites
📅 Période couverte: 2014-09-17 → 2025-12-07
💾 Génération du CSV...
✅ CSV exporté: btc-historical-data.csv

📈 Statistiques:
   - Nombre total de jours: 4100
   - Prix min: $178.10
   - Prix max: $124752.53
   - Volume moyen: $21503360275.28
```

### 2.2 Vérifier le CSV
```bash
head -5 btc-historical-data.csv
```

**Format attendu**:
```csv
date,price_usd,price_eur,volume_24h,market_cap
2025-12-07,88722.56000000,,36700581888.00,
2025-12-06,89272.38000000,,37994042405.00,
2025-12-05,89387.76000000,,63256398633.00,
2025-12-04,92141.63000000,,64538402681.00,
```

---

## 📋 ÉTAPE 3 : IMPORTER LES DONNÉES DANS SUPABASE

### 3.1 Configurer les variables d'environnement

```bash
# Créer un fichier .env dans ~/MyPatrimoineX/scripts
cat > .env << 'EOF'
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key-here
EOF
```

⚠️ **IMPORTANT**: Utilisez la **Service Role Key**, pas l'anon key !

### 3.2 Lancer l'import

```bash
export $(cat .env | xargs)
node import-historical-data.mjs btc-historical-data.csv
```

**Ce script va**:
1. Importer les 4100 lignes de prix historiques
2. Calculer automatiquement tous les indicateurs techniques
3. Générer les signaux de trading

**Durée**: ~10-15 minutes (dépend de la vitesse Supabase)

**Sortie attendue**:
```
🚀 Import des données historiques Bitcoin dans Supabase

📂 Lecture du CSV...
✅ 4100 lignes à importer
📅 Colonnes: date, price_usd, price_eur, volume_24h, market_cap

📤 Import batch 1/9 (500 lignes)...
✅ Batch 1/9 importé
📤 Import batch 2/9 (500 lignes)...
✅ Batch 2/9 importé
...
✅ Import terminé avec succès!

📊 Calcul des indicateurs techniques...
⏳ 4100 dates à traiter (cela peut prendre plusieurs minutes)...
   100/4100 (2.4%) - ETA: 615s
   200/4100 (4.9%) - ETA: 590s
   ...
✅ Tous les indicateurs calculés en 620s

📈 Statistiques finales:
   Dernière date: 2025-12-07
   Prix actuel: $88722.56
   Total de jours: 4100
   Indicateurs calculés: 4100

🎉 Import et calcul des indicateurs terminés!
```

---

## 📋 ÉTAPE 4 : VÉRIFIER L'IMPORT

### Requêtes SQL de vérification

```sql
-- 1. Vérifier le nombre de lignes dans chaque table
SELECT 
  'indicator_btc_price_history' as table_name, COUNT(*) as count
FROM indicator_btc_price_history
UNION ALL
SELECT 
  'indicator_moving_averages', COUNT(*)
FROM indicator_moving_averages
UNION ALL
SELECT 
  'indicator_macd', COUNT(*)
FROM indicator_macd
UNION ALL
SELECT 
  'indicator_rsi', COUNT(*)
FROM indicator_rsi
UNION ALL
SELECT 
  'indicator_bollinger_bands', COUNT(*)
FROM indicator_bollinger_bands
UNION ALL
SELECT 
  'indicator_obv', COUNT(*)
FROM indicator_obv
UNION ALL
SELECT 
  'indicator_trading_signals', COUNT(*)
FROM indicator_trading_signals;

-- Devrait retourner ~4100 pour chaque table

-- 2. Vérifier les données récentes
SELECT 
  p.date,
  p.price_usd,
  ma.sma_20,
  ma.sma_50,
  ma.sma_200,
  rsi.rsi_14,
  ts.overall_signal,
  ts.signal_strength
FROM indicator_btc_price_history p
LEFT JOIN indicator_moving_averages ma ON p.date = ma.date
LEFT JOIN indicator_rsi rsi ON p.date = rsi.date
LEFT JOIN indicator_trading_signals ts ON p.date = ts.date
ORDER BY p.date DESC
LIMIT 10;

-- 3. Vérifier les Golden Cross / Death Cross
SELECT 
  date,
  sma_20,
  sma_50,
  CASE 
    WHEN sma_20 > sma_50 THEN 'Golden Cross (Bullish)'
    WHEN sma_20 < sma_50 THEN 'Death Cross (Bearish)'
    ELSE 'Neutral'
  END as signal
FROM indicator_moving_averages
WHERE date >= (CURRENT_DATE - INTERVAL '30 days')
ORDER BY date DESC;

-- 4. Statistiques globales
SELECT 
  MIN(date) as premiere_date,
  MAX(date) as derniere_date,
  COUNT(*) as total_jours,
  MIN(price_usd) as prix_min,
  MAX(price_usd) as prix_max,
  AVG(price_usd) as prix_moyen,
  AVG(volume_24h) as volume_moyen
FROM indicator_btc_price_history;
```

---

## 📋 ÉTAPE 5 : CONFIGURER N8N POUR LES MISES À JOUR

### 5.1 Workflow existant (workflow 01)

**Statut**: ✅ Déjà configuré et testé
- Récupère le prix BTC toutes les 15 minutes
- Utilise l'API CoinGecko
- Insère dans `indicator_btc_price_history`

### 5.2 Ajouter le calcul automatique des indicateurs

Modifiez le workflow 01 pour ajouter un nœud après l'insertion :

```javascript
// Nœud "Calculate Indicators" (Function)
const date = $json.date; // Date de la nouvelle donnée insérée

// Appeler la fonction SQL Supabase
return {
  query: "SELECT update_all_indicators($1)",
  parameters: [date]
};
```

### 5.3 Créer un workflow de recalcul complet (optionnel)

Si vous voulez recalculer tous les indicateurs quotidiennement :

```javascript
// Workflow "Daily Indicator Recalculation"
// Trigger: Schedule (1x par jour à 00:00 UTC)

// Nœud 1: Get All Dates
SELECT date FROM indicator_btc_price_history ORDER BY date ASC

// Nœud 2: Loop & Calculate
for (const date of $json) {
  await $supabase.rpc('update_all_indicators', { target_date: date });
}
```

---

## 📋 ÉTAPE 6 : CRÉER LES VUES SQL (OPTIONNEL MAIS RECOMMANDÉ)

Pour simplifier les requêtes frontend, créez des vues :

```sql
-- Vue : Dernières données avec tous les indicateurs
CREATE OR REPLACE VIEW v_latest_indicators AS
SELECT 
  p.date,
  p.price_usd,
  p.price_eur,
  p.volume_24h,
  p.market_cap,
  ma.sma_20,
  ma.sma_50,
  ma.sma_200,
  ma.ema_12,
  ma.ema_26,
  macd.macd_line,
  macd.signal_line,
  macd.histogram,
  rsi.rsi_14,
  rsi.signal as rsi_signal,
  bb.upper_band,
  bb.middle_band,
  bb.lower_band,
  bb.bandwidth,
  obv.obv,
  obv.signal as obv_signal,
  ts.overall_signal,
  ts.signal_strength,
  ts.bullish_indicators,
  ts.bearish_indicators,
  ts.neutral_indicators
FROM indicator_btc_price_history p
LEFT JOIN indicator_moving_averages ma ON p.date = ma.date
LEFT JOIN indicator_macd macd ON p.date = macd.date
LEFT JOIN indicator_rsi rsi ON p.date = rsi.date
LEFT JOIN indicator_bollinger_bands bb ON p.date = bb.date
LEFT JOIN indicator_obv obv ON p.date = obv.date
LEFT JOIN indicator_trading_signals ts ON p.date = ts.date
ORDER BY p.date DESC;

-- Vue : Statistiques hebdomadaires
CREATE OR REPLACE VIEW v_weekly_stats AS
SELECT 
  DATE_TRUNC('week', date) as week_start,
  MIN(price_usd) as week_low,
  MAX(price_usd) as week_high,
  AVG(price_usd) as week_avg,
  SUM(volume_24h) as week_volume
FROM indicator_btc_price_history
GROUP BY DATE_TRUNC('week', date)
ORDER BY week_start DESC;
```

---

## 🎯 PROCHAINES ÉTAPES

### Intégration Frontend

1. **Composant Dashboard**
```typescript
// src/components/indicators/IndicatorDashboard.tsx
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function IndicatorDashboard() {
  const { data: latestData } = useQuery({
    queryKey: ['latest-indicators'],
    queryFn: async () => {
      const { data } = await supabase
        .from('v_latest_indicators')
        .select('*')
        .limit(1)
        .single();
      return data;
    },
  });

  return (
    <div>
      <h2>Prix actuel: ${latestData?.price_usd}</h2>
      <p>RSI: {latestData?.rsi_14}</p>
      <p>Signal: {latestData?.overall_signal}</p>
      {/* ... */}
    </div>
  );
}
```

2. **Graphiques historiques** (Recharts ou Chart.js)
3. **Alertes en temps réel** (via Supabase Realtime)

---

## ⚠️ DÉPANNAGE

### Erreur : "Table already exists"
```sql
-- Supprimer toutes les tables pour recommencer
DROP TABLE IF EXISTS indicator_trading_signals CASCADE;
DROP TABLE IF EXISTS indicator_ichimoku CASCADE;
DROP TABLE IF EXISTS indicator_adx CASCADE;
DROP TABLE IF EXISTS indicator_obv CASCADE;
DROP TABLE IF EXISTS indicator_atr CASCADE;
DROP TABLE IF EXISTS indicator_bollinger_bands CASCADE;
DROP TABLE IF EXISTS indicator_stochastic CASCADE;
DROP TABLE IF EXISTS indicator_rsi CASCADE;
DROP TABLE IF EXISTS indicator_macd CASCADE;
DROP TABLE IF EXISTS indicator_moving_averages CASCADE;
DROP TABLE IF EXISTS indicator_btc_price_history CASCADE;
```

### Erreur : "Timeout during indicator calculation"
- Réduire le nombre de dates traitées par batch (de 10 à 5)
- Exécuter le calcul en plusieurs passes :

```javascript
// Calculer par année
const dates2014 = dates.filter(d => d.startsWith('2014'));
await calculateAllIndicators(dates2014);

const dates2015 = dates.filter(d => d.startsWith('2015'));
await calculateAllIndicators(dates2015);
// etc...
```

### Erreur : "SUPABASE_SERVICE_KEY invalid"
- Vérifiez que vous utilisez la **Service Role Key** et non l'anon key
- Disponible dans Supabase Dashboard > Settings > API > service_role (secret)

---

## 📚 RESSOURCES

### Documentation
- [Supabase SQL Editor](https://supabase.com/docs/guides/database/overview)
- [N8N Supabase Integration](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.supabase/)
- [Trading Indicators Explained](https://www.investopedia.com/terms/t/technicalindicator.asp)

### Fichiers du projet
```
MyPatrimoineX/
├── scripts/
│   ├── apify-result.json              # JSON Apify téléchargé
│   ├── parse-apify-result.mjs         # Script de parsing
│   ├── btc-historical-data.csv        # CSV généré
│   ├── 01-create-indicator-schema.sql # Schéma Supabase
│   ├── import-historical-data.mjs     # Script d'import
│   └── .env                           # Variables d'environnement
```

---

## ✅ CHECKLIST FINALE

- [ ] Schéma Supabase créé (11 tables + 7 fonctions)
- [ ] CSV généré avec 4100 lignes
- [ ] Données importées dans Supabase
- [ ] Indicateurs calculés avec succès
- [ ] Vérifications SQL passées
- [ ] N8N configuré pour mises à jour temps réel
- [ ] Vues SQL créées
- [ ] Frontend intégré

---

## 🎉 FÉLICITATIONS !

Vous avez maintenant un système complet d'analyse technique Bitcoin avec :
- ✅ 4100 jours de données historiques
- ✅ 7 indicateurs techniques calculés automatiquement
- ✅ Signaux de trading en temps réel
- ✅ Infrastructure scalable pour ajouter d'autres crypto-monnaies

**Support**: Pour toute question, consultez les logs d'exécution ou la documentation Supabase.
