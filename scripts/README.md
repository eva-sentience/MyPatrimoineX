# 📊 PatrimoineX - Système d'Indicateurs Techniques Bitcoin

> Solution complète d'analyse technique automatisée avec données historiques, calculs en temps réel et signaux de trading.

---

## 🎯 Vue d'ensemble

**PatrimoineX** est un système d'analyse technique Bitcoin qui combine :
- ✅ **4100 jours** de données historiques (2014-2025) scrapées depuis Yahoo Finance via Apify
- ✅ **7 indicateurs techniques** calculés automatiquement (SMA, EMA, MACD, RSI, Bollinger Bands, OBV, signaux combinés)
- ✅ **Architecture Supabase** avec 11 tables et 7 fonctions SQL PostgreSQL
- ✅ **N8N workflows** pour mise à jour temps réel toutes les 15 minutes
- ✅ **Signaux de trading automatiques** (Strong Buy, Buy, Neutral, Sell, Strong Sell)

---

## 📁 Structure du projet

```
MyPatrimoineX/
├── scripts/
│   ├── 📄 apify-result.json              # JSON brut Apify (téléchargé manuellement)
│   ├── 🔧 parse-apify-result.mjs         # Parser JSON → CSV (Node.js)
│   ├── 📊 btc-historical-data.csv        # 4100 lignes de prix historiques
│   ├── 🗄️  01-create-indicator-schema.sql # Schéma Supabase (11 tables + 7 fonctions)
│   ├── 📤 import-historical-data.mjs     # Import CSV → Supabase + calcul indicateurs
│   ├── 🚀 install.sh                     # Script d'installation automatique
│   ├── 📚 GUIDE-INSTALLATION.md          # Guide détaillé étape par étape
│   └── 🔒 .env                           # Variables Supabase (URL + Service Key)
└── n8n/
    └── workflows/
        └── 01-btc-price-collector.json   # Workflow N8N (15 min)
```

---

## ⚡ Installation rapide (5 minutes)

### Option A : Installation automatique (recommandé)

```bash
cd ~/MyPatrimoineX/scripts
chmod +x install.sh
./install.sh
```

Le script automatise :
1. ✅ Vérification des prérequis (Node.js, npm, @supabase/supabase-js)
2. ✅ Configuration Supabase (URL + Service Key)
3. ✅ Création du schéma (11 tables + 7 fonctions)
4. ✅ Parsing du JSON Apify → CSV
5. ✅ Import des données (4100 lignes)
6. ✅ Calcul de tous les indicateurs (~10 minutes)

### Option B : Installation manuelle

Consultez `GUIDE-INSTALLATION.md` pour les instructions détaillées étape par étape.

---

## 🗄️ Architecture Supabase

### Tables créées (11)

| Table | Description | Colonnes clés |
|-------|-------------|---------------|
| `indicator_btc_price_history` | Prix historiques BTC-USD | date, price_usd, volume_24h |
| `indicator_moving_averages` | Moyennes mobiles | sma_20, sma_50, sma_200, ema_12, ema_26 |
| `indicator_macd` | MACD | macd_line, signal_line, histogram |
| `indicator_rsi` | RSI (14 périodes) | rsi_14, signal (overbought/oversold) |
| `indicator_bollinger_bands` | Bandes de Bollinger | upper_band, middle_band, lower_band |
| `indicator_obv` | On-Balance Volume | obv, signal (bullish/bearish) |
| `indicator_trading_signals` | Signaux combinés | overall_signal, signal_strength |

### Fonctions SQL créées (7)

| Fonction | Description |
|----------|-------------|
| `calculate_moving_averages(date)` | Calcule SMA 20/50/200 + EMA 12/26 |
| `calculate_macd(date)` | Calcule MACD Line, Signal Line, Histogram |
| `calculate_rsi(date)` | Calcule RSI 14 périodes + signal |
| `calculate_bollinger_bands(date)` | Calcule bandes supérieure/inférieure/médiane |
| `calculate_obv(date)` | Calcule On-Balance Volume |
| `calculate_trading_signals(date)` | Génère signaux combinés (buy/sell) |
| `update_all_indicators(date)` | Lance tous les calculs pour une date |

---

## 📊 Indicateurs calculés

### 1. Moyennes Mobiles
- **SMA 20/50/200** : Moyennes simples sur 20, 50 et 200 jours
- **EMA 12/26** : Moyennes exponentielles pour MACD
- **Golden Cross** : SMA 20 > SMA 50 (signal haussier)
- **Death Cross** : SMA 20 < SMA 50 (signal baissier)

### 2. MACD (Moving Average Convergence Divergence)
- **MACD Line** = EMA 12 - EMA 26
- **Signal Line** = EMA 9 du MACD
- **Histogram** = MACD - Signal
- **Interprétation** : Croisement haussier/baissier

### 3. RSI (Relative Strength Index)
- **RSI 14** : Force relative sur 14 jours
- **Overbought** : RSI > 70 (surachat)
- **Oversold** : RSI < 30 (survente)

### 4. Bollinger Bands
- **Upper Band** : SMA 20 + (2 × écart-type)
- **Lower Band** : SMA 20 - (2 × écart-type)
- **Bandwidth** : Mesure de la volatilité

### 5. OBV (On-Balance Volume)
- Volume cumulé pondéré par la direction du prix
- **Signal bullish** : OBV > SMA 20 OBV
- **Signal bearish** : OBV < SMA 20 OBV

### 6. Signaux de Trading Combinés
- Agrégation de tous les indicateurs
- **Force du signal** : 0-100 (0 = Strong Sell, 100 = Strong Buy)
- **Overall Signal** : Strong Buy / Buy / Neutral / Sell / Strong Sell

---

## 🔄 Mise à jour en temps réel (N8N)

### Workflow 01 : BTC Price Collector

**Fréquence** : Toutes les 15 minutes

**Étapes** :
1. Récupérer prix BTC via CoinGecko API
2. Insérer dans `indicator_btc_price_history`
3. Appeler `update_all_indicators(date)` automatiquement
4. Tous les indicateurs mis à jour en cascade

**Configuration** :
```javascript
// Nœud N8N après insertion
{
  "query": "SELECT update_all_indicators($1)",
  "parameters": ["{{ $json.date }}"]
}
```

---

## 📈 Exemples de requêtes

### Dernières données avec tous les indicateurs

```sql
SELECT 
  p.date,
  p.price_usd,
  ma.sma_20, ma.sma_50, ma.sma_200,
  rsi.rsi_14, rsi.signal as rsi_signal,
  macd.histogram,
  ts.overall_signal, ts.signal_strength
FROM indicator_btc_price_history p
LEFT JOIN indicator_moving_averages ma ON p.date = ma.date
LEFT JOIN indicator_rsi rsi ON p.date = rsi.date
LEFT JOIN indicator_macd macd ON p.date = macd.date
LEFT JOIN indicator_trading_signals ts ON p.date = ts.date
ORDER BY p.date DESC
LIMIT 30;
```

### Détecter les Golden Cross

```sql
SELECT 
  date,
  sma_20,
  sma_50,
  LAG(sma_20) OVER (ORDER BY date) as prev_sma_20,
  LAG(sma_50) OVER (ORDER BY date) as prev_sma_50
FROM indicator_moving_averages
WHERE sma_20 > sma_50 
  AND LAG(sma_20) OVER (ORDER BY date) < LAG(sma_50) OVER (ORDER BY date)
ORDER BY date DESC;
```

### Statistiques sur les signaux de trading

```sql
SELECT 
  overall_signal,
  COUNT(*) as occurrences,
  AVG(signal_strength) as avg_strength,
  MIN(date) as first_occurrence,
  MAX(date) as last_occurrence
FROM indicator_trading_signals
GROUP BY overall_signal
ORDER BY avg_strength DESC;
```

---

## 🚀 Intégration Frontend

### Composant React (exemple)

```typescript
// src/components/indicators/TradingSignal.tsx
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function TradingSignal() {
  const { data } = useQuery({
    queryKey: ['latest-signal'],
    queryFn: async () => {
      const { data } = await supabase
        .from('indicator_trading_signals')
        .select('*, indicator_btc_price_history!inner(*)')
        .order('date', { ascending: false })
        .limit(1)
        .single();
      return data;
    },
    refetchInterval: 60000, // Actualiser chaque minute
  });

  const signalColor = {
    strong_buy: 'text-green-600',
    buy: 'text-green-400',
    neutral: 'text-gray-500',
    sell: 'text-red-400',
    strong_sell: 'text-red-600',
  }[data?.overall_signal || 'neutral'];

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h3 className="text-xl font-bold">Signal de Trading</h3>
      <p className={`text-3xl font-bold ${signalColor}`}>
        {data?.overall_signal?.replace('_', ' ').toUpperCase()}
      </p>
      <p className="text-sm text-gray-600">
        Force: {data?.signal_strength?.toFixed(0)}%
      </p>
      <p className="text-lg mt-2">
        Prix actuel: ${data?.indicator_btc_price_history?.price_usd}
      </p>
    </div>
  );
}
```

---

## 📊 Dashboard Grafana / Metabase (optionnel)

Connectez Grafana ou Metabase directement à Supabase pour créer des dashboards visuels :

- **Graphiques de prix** avec moyennes mobiles superposées
- **RSI Chart** avec zones overbought/oversold
- **MACD Histogram** avec signal line
- **Volume Profile** (OBV)
- **Heatmap des signaux** sur 30/90/365 jours

---

## 🔐 Sécurité

### Variables d'environnement

**Ne jamais commiter le fichier `.env` !**

```bash
# .env (exemple)
SUPABASE_URL=https://xyzabc123.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGc...your-service-role-key
```

### Row Level Security (RLS)

Activez RLS sur Supabase pour protéger l'accès aux tables :

```sql
-- Activer RLS
ALTER TABLE indicator_btc_price_history ENABLE ROW LEVEL SECURITY;

-- Policy : Lecture publique, écriture authentifiée
CREATE POLICY "Public read access"
ON indicator_btc_price_history FOR SELECT
TO PUBLIC USING (true);

CREATE POLICY "Authenticated write access"
ON indicator_btc_price_history FOR INSERT
TO authenticated USING (true);
```

---

## 🛠️ Dépannage

### Problème : Import timeout

**Solution** : Réduire le batch size dans `import-historical-data.mjs`

```javascript
const BATCH_SIZE = 250; // Au lieu de 500
```

### Problème : Calcul des indicateurs lent

**Solution** : Utiliser un index sur `date` (déjà créé par défaut)

```sql
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_btc_price_date 
ON indicator_btc_price_history(date DESC);
```

### Problème : Service Key invalide

**Solution** : Vérifier que vous utilisez la **Service Role Key** et non l'anon key.
Disponible dans : Supabase Dashboard → Settings → API → service_role (secret)

---

## 📚 Ressources

### Documentation officielle
- [Supabase](https://supabase.com/docs)
- [N8N](https://docs.n8n.io)
- [Yahoo Finance](https://finance.yahoo.com)
- [Apify](https://apify.com/docs)

### Articles sur les indicateurs techniques
- [Investopedia - Technical Indicators](https://www.investopedia.com/terms/t/technicalindicator.asp)
- [TradingView - Indicators Guide](https://www.tradingview.com/support/solutions/43000502334-technical-indicators-guide/)

---

## 🎯 Prochaines étapes

- [ ] Ajouter d'autres crypto-monnaies (ETH, BNB, SOL)
- [ ] Intégrer ATR (Average True Range)
- [ ] Intégrer Stochastic Oscillator
- [ ] Intégrer ADX (Average Directional Index)
- [ ] Créer un système d'alertes par email/SMS
- [ ] Backtesting des stratégies de trading
- [ ] API REST pour exposer les signaux
- [ ] Interface admin pour gérer les seuils

---

## 📄 Licence

MIT License - Libre d'utilisation pour projets personnels et commerciaux.

---

## 👨‍💻 Support

Pour toute question :
1. Consultez `GUIDE-INSTALLATION.md`
2. Vérifiez les logs d'exécution
3. Consultez la documentation Supabase

---

**🎉 Bon trading avec PatrimoineX !**
