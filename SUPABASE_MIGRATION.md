# 🚀 Guide de migration vers Supabase

## 📋 Ce qui a été fait

### ✅ Structure de base de données créée
- 9 tables PostgreSQL optimisées
- Row Level Security (RLS) configuré
- Indexes de performance
- Triggers automatiques
- 2 vues analytiques

### ✅ Service layer implémenté
- `services/supabaseClient.ts` - Client Supabase configuré
- `services/supabaseService.ts` - API complète pour toutes les opérations
- Remplacement de localStorage préparé

### ✅ Documentation complète
- `supabase/schema.sql` - Schéma complet de la base
- `supabase/seed.sql` - Données de démonstration
- `supabase/README.md` - Guide d'installation détaillé

---

## 🎯 Prochaines étapes

### 1. Configurer votre projet Supabase (10 min)

```bash
# 1. Créer un compte sur https://app.supabase.com
# 2. Créer un nouveau projet
# 3. Aller dans SQL Editor
# 4. Exécuter le contenu de supabase/schema.sql
# 5. (Optionnel) Exécuter supabase/seed.sql pour les données de démo
```

### 2. Récupérer vos credentials Supabase

Dans **Settings > API** :
- Project URL
- anon public key

### 3. Configurer l'environnement

```bash
# Copier le template
cp .env.local.example .env.local

# Éditer .env.local et ajouter :
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_anon_ici
GEMINI_API_KEY=votre_cle_gemini_ici
```

### 4. Installer les dépendances

```bash
npm install
```

### 5. Lancer l'application

```bash
npm run dev
```

---

## 🔄 Migration de localStorage vers Supabase

L'application utilise actuellement `services/storageService.ts` qui stocke les données dans localStorage. Pour basculer vers Supabase, il faut modifier les composants suivants :

### Fichiers à modifier :

#### 1. `App.tsx`
```typescript
// Avant
import { storageService } from './services/storageService';

// Après
import { supabaseService } from './services/supabaseService';
import { supabase } from './services/supabaseClient';

// Dans useEffect, charger les assets via Supabase
useEffect(() => {
  const loadAssets = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const assets = await supabaseService.getAssets(user.id);
      setAssets(assets);
    }
  };
  loadAssets();
}, []);
```

#### 2. `components/CategoryView.tsx`
Remplacer les appels localStorage par supabaseService :
- `storageService.saveAsset()` → `supabaseService.addAsset()`
- `storageService.updateAsset()` → `supabaseService.updateAsset()`
- `storageService.deleteAsset()` → `supabaseService.deleteAsset()`

#### 3. Activer l'authentification Supabase
Modifier `components/Auth.tsx` pour utiliser Supabase Auth au lieu du système mocké.

---

## 📊 Fonctionnalités Supabase activées

### ✅ Gestion des actifs
- CRUD complet avec persistance cloud
- Synchronisation multi-device
- Historique des modifications (via updated_at)

### ✅ Snapshots de portfolio
- Création automatique quotidienne
- Graphiques d'évolution temporelle
- Calcul de performances (24h, 7j, 30j, YTD)

### ✅ Market data en temps réel
- Prêt pour intégration API (CoinGecko, Yahoo Finance)
- Stockage optimisé avec JSONB
- Indexes pour requêtes rapides

### ✅ Indicateurs Bitcoin
- 10 indicateurs pré-configurés
- Update automatique via N8N (à configurer)
- Vue `patrimoinex_latest_indicators` pour récupération rapide

### ✅ Contenu éducatif
- Stockage de vidéos, guides, analyses
- Tri par complexité et date
- Charts JSONB pour graphiques interactifs

---

## 🤖 Workflows N8N recommandés

### Workflow 1 : Market Data Scraper
**Fréquence** : Toutes les 15 minutes

```
Cron Trigger (*/15 * * * *)
  → HTTP Request (CoinGecko /coins/bitcoin)
  → Set Node (extract price, volume, dominance)
  → Supabase Insert (patrimoinex_market_data)
```

### Workflow 2 : Bitcoin Indicators Calculator
**Fréquence** : Toutes les heures

```
Cron Trigger (0 * * * *)
  → HTTP Request Multiple (TradingView, BitcoinMagazine, etc.)
  → Code Node (calculate is_met for each indicator)
  → Supabase Upsert (patrimoinex_market_indicators)
```

### Workflow 3 : Daily Portfolio Snapshot
**Fréquence** : Quotidien à minuit UTC

```
Cron Trigger (0 0 * * *)
  → Supabase Query (SELECT DISTINCT user_id FROM patrimoinex_assets)
  → Split In Batches
    → For each user:
      → Supabase Query (get user assets)
      → Code Node (calculate total_value, allocation)
      → Supabase Upsert (patrimoinex_portfolio_snapshots)
```

---

## 🔒 Sécurité et bonnes pratiques

### Row Level Security (RLS)
✅ **Déjà configuré** - Les utilisateurs ne peuvent accéder qu'à leurs propres données

### Variables d'environnement
⚠️ **Ne jamais commit** les clés API
- Utiliser `.env.local` en local
- Configurer les secrets dans Vercel/Netlify pour la production

### API Keys Supabase
- **anon key** : Utilisée côté client (safe)
- **service_role key** : ⚠️ Ne JAMAIS exposer côté client

---

## 📈 Monitoring et analytics

### Requêtes utiles

**Portfolio d'un utilisateur** :
```sql
SELECT * FROM patrimoinex_portfolio_summary
WHERE user_id = 'uuid';
```

**Évolution sur 30 jours** :
```sql
SELECT snapshot_date, total_value
FROM patrimoinex_portfolio_snapshots
WHERE user_id = 'uuid'
  AND snapshot_date >= CURRENT_DATE - 30
ORDER BY snapshot_date;
```

**Indicateurs mis à jour** :
```sql
SELECT title_fr, current_value, is_met
FROM patrimoinex_latest_indicators;
```

---

## 🐛 Troubleshooting

### Problème : Impossible de se connecter à Supabase
**Solution** : Vérifier `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` dans `.env.local`

### Problème : "relation does not exist"
**Solution** : Exécuter `supabase/schema.sql` dans le SQL Editor

### Problème : "new row violates row-level security policy"
**Solution** : S'assurer que l'utilisateur est authentifié via Supabase Auth

### Problème : Assets ne se chargent pas
**Solution** : Vérifier que `user_id` correspond à l'UUID Supabase Auth

---

## 📞 Support

- **Docs Supabase** : https://supabase.com/docs
- **RLS Guide** : https://supabase.com/docs/guides/auth/row-level-security
- **GitHub Issues** : Pour signaler des bugs

---

**Status** : 🟢 Prêt pour la migration
**Temps estimé** : 30 minutes
**Difficulté** : Intermédiaire
