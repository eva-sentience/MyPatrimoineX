# 🚀 Quick Start : Indicateurs Bitcoin Temps Réel

## 🎯 Objectif

Répliquer les 10 indicateurs Bitcoin avec données historiques + temps réel.

---

## ⚡️ Setup Rapide (10 minutes)

### Étape 1 : Exécuter le SQL dans Supabase

1. Ouvre Supabase : https://supabase.com/dashboard/project/fixymduhojtfaltmyixa
2. SQL Editor
3. Exécute dans l'ordre :
   - `supabase/indicators-schema.sql`
   - `supabase/indicators-functions.sql`

### Étape 2 : Importer workflows N8N

1. Ouvre N8N
2. Import workflows depuis `n8n/workflows/`
3. Configure Supabase credentials (service role key)
4. Active tous les workflows

### Étape 3 : Pull le nouveau code

```bash
cd ~/MyPatrimoineX
git pull origin main
npm install
npm run dev
```

### Étape 4 : Tester l'intégration

```typescript
import { indicatorsService } from './services/indicatorsService';

// Dans ton composant
const indicators = await indicatorsService.getLatestIndicators();
console.log(indicators);
```

---

## 📋 Ce qui a été créé

### Fichiers ajoutés au repo

1. **`supabase/indicators-schema.sql`** - 11 tables pour les indicateurs
2. **`supabase/indicators-functions.sql`** - Fonctions SQL de calcul
3. **`n8n/workflows/01-btc-price-collector.json`** - Collecter prix BTC (15min)
4. **`n8n/workflows/02-dominance-collector.json`** - Collecter dominance (15min)
5. **`n8n/workflows/03-indicators-calculator.json`** - Calculer indicateurs (1h)
6. **`n8n/workflows/04-total-mcap-collector.json`** - Market cap total (15min)
7. **`services/indicatorsService.ts`** - Service TypeScript
8. **`docs/INDICATORS_GUIDE.md`** - Guide complet
9. **`docs/INDICATORS_QUICKSTART.md`** - Ce fichier

### Tables Supabase créées

```
indicator_btc_price_history       - Prix BTC historique
indicator_ma200_history           - MA 200 jours
indicator_dominance_history       - Dominance BTC
indicator_rainbow_history         - Rainbow Chart
indicator_mayer_history           - Mayer Multiple
indicator_pi_cycle_history        - Pi Cycle Top
indicator_rsi_monthly_history     - RSI Mensuel
indicator_cycle_master_history    - Cycle Master
indicator_s2f_history             - Stock-to-Flow
indicator_cbbi_history            - CBBI Index
indicator_total_mcap_history      - Market Cap Total
```

---

## 🔍 Test rapide

### 1. Vérifier que les tables existent

Dans Supabase SQL Editor :

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE 'indicator_%';
```

Tu devrais voir 11 tables.

### 2. Insérer un prix BTC manuellement

```sql
INSERT INTO indicator_btc_price_history (
  timestamp, 
  date, 
  price_usd, 
  price_eur, 
  volume_24h, 
  market_cap
)
VALUES (
  NOW(),
  CURRENT_DATE,
  68000,
  63000,
  25000000000,
  1340000000000
);
```

### 3. Calculer les indicateurs

```sql
SELECT update_all_indicators(CURRENT_DATE);
```

### 4. Vérifier les résultats

```sql
SELECT * FROM indicator_ma200_history ORDER BY date DESC LIMIT 1;
SELECT * FROM indicator_mayer_history ORDER BY date DESC LIMIT 1;
SELECT * FROM indicator_rainbow_history ORDER BY date DESC LIMIT 1;
```

---

## 📊 Utilisation dans React

### Exemple : Afficher les derniers indicateurs

```typescript
import { useEffect, useState } from 'react';
import { indicatorsService, IndicatorValue } from './services/indicatorsService';

function IndicatorsView() {
  const [indicators, setIndicators] = useState<IndicatorValue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIndicators();
  }, []);

  async function loadIndicators() {
    try {
      const data = await indicatorsService.getLatestIndicators();
      setIndicators(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="grid grid-cols-2 gap-4">
      {indicators.map((ind) => (
        <div 
          key={ind.indicator} 
          className={`p-4 rounded-lg ${
            ind.is_met ? 'bg-green-900/20' : 'bg-red-900/20'
          }`}
        >
          <h3 className="font-bold">{ind.indicator}</h3>
          <p className="text-sm text-gray-400">{ind.signal}</p>
          <p className="text-xs text-gray-500">Dernière MAJ : {ind.date}</p>
          {ind.is_met ? (
            <span className="text-green-500">✅ Objectif atteint</span>
          ) : (
            <span className="text-red-500">❌ Pas atteint</span>
          )}
        </div>
      ))}
    </div>
  );
}
```

### Exemple : Graphique MA200

```typescript
import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { indicatorsService } from './services/indicatorsService';

function MA200Chart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const history = await indicatorsService.getMA200History(90);
    setData(history);
  }

  return (
    <LineChart width={800} height={400} data={data}>
      <XAxis dataKey="date" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Line 
        type="monotone" 
        dataKey="current_price" 
        stroke="#8884d8" 
        name="Prix BTC"
      />
      <Line 
        type="monotone" 
        dataKey="ma200_value" 
        stroke="#82ca9d" 
        name="MA200"
      />
    </LineChart>
  );
}
```

---

## 🔧 Commandes utiles

### Vérifier le statut des workflows N8N

```bash
# Via N8N CLI (si installé)
n8n list:workflow
```

### Backfill 30 derniers jours (Supabase SQL)

```sql
DO $$
DECLARE
  d DATE;
BEGIN
  FOR d IN
    SELECT generate_series(
      CURRENT_DATE - INTERVAL '30 days',
      CURRENT_DATE,
      '1 day'::interval
    )::DATE
  LOOP
    PERFORM update_all_indicators(d);
  END LOOP;
END $$;
```

### Voir le score composite

```sql
SELECT
  COUNT(*) FILTER (WHERE is_met = true) as met,
  COUNT(*) as total,
  ROUND((COUNT(*) FILTER (WHERE is_met = true)::DECIMAL / COUNT(*)) * 100, 2) as pct
FROM indicator_latest_values;
```

---

## ✅ Checklist Complète

- [ ] Tables Supabase créées (`indicators-schema.sql`)
- [ ] Fonctions SQL installées (`indicators-functions.sql`)
- [ ] Workflow 1 : BTC Price Collector (N8N)
- [ ] Workflow 2 : Dominance Collector (N8N)
- [ ] Workflow 3 : Indicators Calculator (N8N)
- [ ] Workflow 4 : Total Market Cap (N8N)
- [ ] Service TypeScript intégré (`indicatorsService.ts`)
- [ ] Test : Insérer 1 prix BTC manuellement
- [ ] Test : Exécuter `update_all_indicators()`
- [ ] Test : Vérifier les tables ont des données
- [ ] Test : Appeler `indicatorsService.getLatestIndicators()` depuis React

---

## 📚 Ressources

- **Guide complet** : `docs/INDICATORS_GUIDE.md`
- **Service TypeScript** : `services/indicatorsService.ts`
- **Workflows N8N** : `n8n/workflows/`
- **CoinGecko API** : https://www.coingecko.com/en/api

---

**Questions ?** Consulte `docs/INDICATORS_GUIDE.md` pour le guide détaillé.
