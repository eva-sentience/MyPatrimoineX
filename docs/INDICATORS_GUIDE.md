# 🎯 Guide Complet : Indicateurs Bitcoin Temps Réel

## 📊 Vue d'ensemble

Ce guide explique comment répliquer les 10 indicateurs Bitcoin avec données historiques + temps réel dans Supabase.

---

## 🏗️ Architecture

```
CoinGecko API (15min) → N8N Workflows → Supabase Tables → React Frontend
     ↓                        ↓                 ↓
Glassnode API (1h)    SQL Functions        Real-time
CoinGlass API (1h)    Calculations         Updates
```

### Tables Supabase (1 par indicateur)

1. `indicator_btc_price_history` - Prix BTC historique (base)
2. `indicator_ma200_history` - Moyenne Mobile 200 jours
3. `indicator_dominance_history` - Dominance Bitcoin
4. `indicator_rainbow_history` - Rainbow Chart
5. `indicator_mayer_history` - Mayer Multiple
6. `indicator_pi_cycle_history` - Pi Cycle Top
7. `indicator_rsi_monthly_history` - RSI Mensuel
8. `indicator_cycle_master_history` - Cycle Master
9. `indicator_s2f_history` - Stock-to-Flow
10. `indicator_cbbi_history` - CBBI Index
11. `indicator_total_mcap_history` - Market Cap Total

---

## 🚀 Déploiement

### Étape 1 : Créer les tables Supabase

```bash
# Depuis ton projet local
cd MyPatrimoineX
git pull origin main

# Ouvrir Supabase Dashboard
open https://supabase.com/dashboard/project/fixymduhojtfaltmyixa
```

**Dans SQL Editor**, exécuter dans l'ordre :

1. `supabase/indicators-schema.sql` - Créer les 11 tables
2. `supabase/indicators-functions.sql` - Créer les fonctions SQL

### Étape 2 : Importer les workflows N8N

Dans ton instance N8N :

1. **Workflow 1** : Bitcoin Price Collector (15 min)
   - Fichier : `n8n/workflows/01-btc-price-collector.json`
   - Fréquence : Toutes les 15 minutes
   - Source : CoinGecko API
   - Cible : `indicator_btc_price_history`

2. **Workflow 2** : Dominance Collector (15 min)
   - Fichier : `n8n/workflows/02-dominance-collector.json`
   - Fréquence : Toutes les 15 minutes
   - Source : CoinGecko Global API
   - Cible : `indicator_dominance_history`

3. **Workflow 3** : Indicators Calculator (1h)
   - Fichier : `n8n/workflows/03-indicators-calculator.json`
   - Fréquence : Toutes les heures
   - Action : Exécute `update_all_indicators(CURRENT_DATE)`
   - Calcule : MA200, Mayer, Pi Cycle, RSI, Rainbow, S2F

4. **Workflow 4** : Total Market Cap (15 min)
   - Fichier : `n8n/workflows/04-total-mcap-collector.json`
   - Fréquence : Toutes les 15 minutes
   - Source : CoinGecko Global API
   - Cible : `indicator_total_mcap_history`

### Étape 3 : Configuration N8N

**Credentials Supabase dans N8N :**

```
Host: fixymduhojtfaltmyixa.supabase.co
Service Role Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpeHltZHVob2p0ZmFsdG15aXhhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDE2NTgyOSwiZXhwIjoyMDc5NzQxODI5fQ.3bYlu5FlWnCuIqNCzFzPR8wiwfDnQMDR69Axtusq-o4
```

⚠️ **Utiliser la Service Role Key** pour N8N (pas l'anon key)

### Étape 4 : Backfill données historiques

Pour avoir des données historiques (recommandé 1 an minimum) :

```sql
-- Dans Supabase SQL Editor

-- 1. Insérer historique prix BTC (via CoinGecko historical API)
-- Script Python à exécuter localement

-- 2. Calculer les indicateurs pour chaque jour historique
DO $$
DECLARE
  d DATE;
BEGIN
  FOR d IN
    SELECT generate_series(
      CURRENT_DATE - INTERVAL '365 days',
      CURRENT_DATE,
      '1 day'::interval
    )::DATE
  LOOP
    PERFORM update_all_indicators(d);
  END LOOP;
END $$;
```

---

## 📊 Détails des Indicateurs

### 1. MA200 (Moyenne Mobile 200 jours)
**Source** : Calculé  
**Formule** : Moyenne des 200 derniers prix  
**Objectif** : Prix > MA200 = Bullish

```sql
SELECT calculate_ma200(CURRENT_DATE);
```

### 2. Bitcoin Dominance
**Source** : CoinGecko API  
**Endpoint** : `https://api.coingecko.com/api/v3/global`  
**Objectif** : Dominance < 45% = Altcoin Season

### 3. Rainbow Chart
**Source** : Calculé  
**Formule** : Régression logarithmique  
**Base** : `Price = 10^(2.66167155005961 * ln(days_since_genesis) - 17.9183761889864)`  
**Objectif** : Zone Rouge/Orange/Jaune = Vente

### 4. Mayer Multiple
**Source** : Calculé  
**Formule** : Prix / MA200  
**Objectif** : Multiple > 2.5 = Extrême Greed

### 5. Pi Cycle Top
**Source** : Calculé  
**Formule** : 111 DMA vs 350 DMA × 2  
**Objectif** : 111 DMA croise 350 DMA × 2 = Top Signal

### 6. RSI Mensuel
**Source** : Calculé  
**Formule** : RSI sur 14 périodes mensuelles  
**Objectif** : RSI > 70 = Suracheté

### 7. Cycle Master
**Source** : On-chain (Glassnode)  
**Endpoint** : `https://api.glassnode.com/v1/metrics/indicators/...`  
**Objectif** : Prix > Bande haute = Haut risque

⚠️ **Nécessite API Key Glassnode** (paid)

### 8. Stock-to-Flow
**Source** : Calculé  
**Formule** : `S2F = Stock / Flow`, `Model Price = 0.4 × S2F³`  
**Objectif** : Prix > Model Price = Top

### 9. CBBI (Colin Talks Crypto Index)
**Source** : CoinGlass API / Scraping  
**Endpoint** : `https://www.coinglass.com/api/cbbi`  
**Objectif** : Score > 80 = Extreme Bull

⚠️ **Peut nécessiter scraping** (pas d'API officielle)

### 10. Total Market Cap
**Source** : CoinGecko API  
**Endpoint** : `https://api.coingecko.com/api/v3/global`  
**Objectif** : Market Cap = ATH

---

## 🔍 Requêtes SQL Utiles

### Voir les dernières valeurs de tous les indicateurs

```sql
SELECT * FROM indicator_latest_values
ORDER BY date DESC;
```

### Graphique MA200 (30 derniers jours)

```sql
SELECT 
  date,
  ma200_value,
  current_price,
  distance_from_ma
FROM indicator_ma200_history
WHERE date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY date ASC;
```

### Historique Rainbow Chart

```sql
SELECT
  date,
  zone,
  current_price,
  logarithmic_regression,
  signal
FROM indicator_rainbow_history
WHERE date >= CURRENT_DATE - INTERVAL '90 days'
ORDER BY date ASC;
```

### Score composite (nombre d'indicateurs validés)

```sql
SELECT
  COUNT(*) FILTER (WHERE is_met = true) as indicators_met,
  COUNT(*) as total_indicators,
  ROUND((COUNT(*) FILTER (WHERE is_met = true)::DECIMAL / COUNT(*)) * 100, 2) as percentage
FROM indicator_latest_values;
```

---

## 🎨 Intégration Frontend React

### Service TypeScript pour les indicateurs

Créer `services/indicatorsService.ts` :

```typescript
import { supabase } from './supabaseClient';

export interface IndicatorValue {
  indicator: string;
  date: string;
  is_met: boolean;
  signal: string;
  details: any;
}

export const indicatorsService = {
  // Get all latest indicator values
  async getLatestIndicators(): Promise<IndicatorValue[]> {
    const { data, error } = await supabase
      .from('indicator_latest_values')
      .select('*')
      .order('indicator', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Get MA200 history for chart
  async getMA200History(days: number = 30): Promise<any[]> {
    const { data, error } = await supabase
      .from('indicator_ma200_history')
      .select('date, ma200_value, current_price, distance_from_ma')
      .gte('date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Get Rainbow Chart history
  async getRainbowHistory(days: number = 90): Promise<any[]> {
    const { data, error } = await supabase
      .from('indicator_rainbow_history')
      .select('*')
      .gte('date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Get composite score
  async getCompositeScore(): Promise<{met: number, total: number, percentage: number}> {
    const { data, error } = await supabase
      .rpc('get_composite_score');

    if (error) throw error;
    return data;
  },

  // Subscribe to real-time updates
  subscribeToIndicators(callback: (payload: any) => void) {
    return supabase
      .channel('indicators')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'indicator_ma200_history'
      }, callback)
      .subscribe();
  }
};
```

### Utilisation dans le composant

```typescript
import { useEffect, useState } from 'react';
import { indicatorsService } from './services/indicatorsService';

function IndicatorsView() {
  const [indicators, setIndicators] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIndicators();

    // Real-time subscription
    const subscription = indicatorsService.subscribeToIndicators((payload) => {
      console.log('Indicator updated:', payload);
      loadIndicators(); // Refresh
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function loadIndicators() {
    try {
      const data = await indicatorsService.getLatestIndicators();
      setIndicators(data);
    } catch (error) {
      console.error('Error loading indicators:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Analyse Top (Temps Réel)</h2>
      
      {indicators.map((ind) => (
        <div key={ind.indicator} className="p-4 bg-gray-800 rounded-lg">
          <h3 className="font-bold">{ind.indicator}</h3>
          <p>Status: {ind.is_met ? '✅ Objectif atteint' : '❌ Pas atteint'}</p>
          <p>Signal: {ind.signal}</p>
          <p>Date: {ind.date}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## 🔄 Maintenance

### Backfill données manquantes

```sql
-- Vérifier les dates manquantes
SELECT 
  d::DATE as missing_date
FROM generate_series(
  CURRENT_DATE - INTERVAL '30 days',
  CURRENT_DATE,
  '1 day'::interval
) d
WHERE d::DATE NOT IN (
  SELECT date FROM indicator_ma200_history
);

-- Calculer pour les dates manquantes
DO $$
DECLARE
  missing_date DATE;
BEGIN
  FOR missing_date IN
    SELECT d::DATE
    FROM generate_series(
      CURRENT_DATE - INTERVAL '30 days',
      CURRENT_DATE,
      '1 day'::interval
    ) d
    WHERE d::DATE NOT IN (
      SELECT date FROM indicator_ma200_history
    )
  LOOP
    PERFORM update_all_indicators(missing_date);
  END LOOP;
END $$;
```

### Nettoyer données anciennes

```sql
-- Supprimer données > 2 ans (optionnel)
DELETE FROM indicator_btc_price_history
WHERE date < CURRENT_DATE - INTERVAL '2 years';

DELETE FROM indicator_ma200_history
WHERE date < CURRENT_DATE - INTERVAL '2 years';

-- Répéter pour toutes les tables
```

---

## 📈 Roadmap

### Phase 1 : Core Indicators (Maintenant)
- ✅ MA200
- ✅ Dominance
- ✅ Rainbow Chart
- ✅ Mayer Multiple
- ✅ Pi Cycle
- ✅ RSI Monthly
- ✅ Stock-to-Flow
- ✅ Total Market Cap

### Phase 2 : Advanced (Prochain)
- [ ] CBBI (scraping CoinGlass)
- [ ] Cycle Master (Glassnode API)
- [ ] Real-time WebSocket updates
- [ ] Notifications push

### Phase 3 : Analytics
- [ ] Backtest historique
- [ ] ML predictions
- [ ] Composite score optimization

---

## 🆘 Troubleshooting

### Problème : Fonctions SQL ne s'exécutent pas

```sql
-- Vérifier que les fonctions existent
SELECT proname FROM pg_proc WHERE proname LIKE 'calculate%';

-- Tester manuellement
SELECT update_all_indicators(CURRENT_DATE);
```

### Problème : Workflows N8N échouent

1. Vérifier credentials Supabase
2. Vérifier rate limits CoinGecko (50 req/min)
3. Logs N8N : voir erreurs détaillées

### Problème : Données manquantes

```sql
-- Vérifier couverture données
SELECT 
  'btc_price' as table_name,
  MIN(date) as first_date,
  MAX(date) as last_date,
  COUNT(*) as total_rows
FROM indicator_btc_price_history

UNION ALL

SELECT 
  'ma200',
  MIN(date),
  MAX(date),
  COUNT(*)
FROM indicator_ma200_history;
```

---

## 📚 Ressources

- [CoinGecko API Docs](https://www.coingecko.com/en/api/documentation)
- [Glassnode API Docs](https://docs.glassnode.com/)
- [Bitcoin Rainbow Chart](https://www.bitcoinmagazinepro.com/charts/bitcoin-rainbow-chart/)
- [Stock-to-Flow Model](https://www.bitcoinmagazinepro.com/charts/stock-to-flow-model/)
- [Pi Cycle Top Indicator](https://www.bitcoinmagazinepro.com/charts/pi-cycle-top-indicator/)

---

**Questions ?** Ouvre une issue GitHub ou contacte le support.
