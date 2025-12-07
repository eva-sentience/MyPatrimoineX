# 🚀 Quick Start - PatrimoineX avec Supabase

## ✅ Configuration terminée !

La base de données Supabase est configurée et prête à l'emploi.

---

## 📦 Installation en 3 étapes

### 1. Cloner et installer

```bash
git clone https://github.com/eva-sentience/MyPatrimoineX.git
cd MyPatrimoineX
npm install
```

### 2. Le fichier `.env.local` est déjà configuré !

Les credentials Supabase sont déjà dans le repo :
- ✅ Project URL configurée
- ✅ Anon key configurée
- 🔑 (Optionnel) Ajoute ta clé Gemini pour le chat IA

### 3. Lancer l'application

```bash
npm run dev
```

Ouvre http://localhost:3000

---

## 🎯 Fonctionnalités actuelles

### ✅ Disponibles (localStorage)
- Dashboard avec allocation d'actifs
- Gestion d'actifs multi-classes
- 10 indicateurs Bitcoin
- Contenu éducatif
- Chat IA Gemini

### 🔄 En migration vers Supabase
- Persistance cloud des actifs
- Snapshots quotidiens du portfolio
- Synchronisation multi-device
- Historique des analyses

---

## 🔌 Architecture actuelle

```
Frontend (React + Vite)
    ↓
localStorage (données actuelles)
    ↓
Supabase (prêt, pas encore connecté)
```

---

## 📊 Base de données Supabase

**Projet** : PatrimoineX  
**URL** : https://fixymduhojtfaltmyixa.supabase.co  
**Status** : ✅ Configurée

### Tables créées :
1. `profiles` - Profils utilisateurs
2. `patrimoinex_assets` - Actifs financiers
3. `patrimoinex_market_data` - Données de marché
4. `patrimoinex_market_indicators` - Indicateurs Bitcoin
5. `patrimoinex_analysis_history` - Historique analyses
6. `patrimoinex_portfolio_snapshots` - Snapshots quotidiens
7. `patrimoinex_education_content` - Contenu éducatif
8. `patrimoinex_user_preferences` - Préférences utilisateur
9. `patrimoinex_chat_messages` - Conversations IA

---

## 🔐 Sécurité

- ✅ Row Level Security (RLS) activé
- ✅ Policies configurées (users voient uniquement leurs données)
- ✅ Anon key utilisée côté client (safe)
- ⚠️ Service role key JAMAIS exposée côté client

---

## 🧪 Test de connexion Supabase

Pour vérifier que Supabase fonctionne :

```typescript
// Dans la console du navigateur (F12)
import { supabase } from './services/supabaseClient';

// Test de connexion
const { data, error } = await supabase.from('patrimoinex_market_indicators').select('*').limit(1);
console.log(data, error);
```

Si pas d'erreur → Connexion OK ! 🎉

---

## 📝 Prochaines étapes

### Option A : Utiliser l'app actuelle (localStorage)
```bash
npm run dev
# L'app fonctionne, données en localStorage
```

### Option B : Migrer vers Supabase (30 min)

**Étape 1** : Modifier `App.tsx`
```typescript
// Remplacer
import { storageService } from './services/storageService';

// Par
import { supabaseService } from './services/supabaseService';
import { supabase } from './services/supabaseClient';
```

**Étape 2** : Activer Supabase Auth

Voir `SUPABASE_MIGRATION.md` pour le guide complet.

---

## 🤖 Workflows N8N recommandés

### Workflow 1 : Market Data Scraper
Fréquence : Toutes les 15 minutes
```
Cron → CoinGecko API → Supabase Insert (patrimoinex_market_data)
```

### Workflow 2 : Bitcoin Indicators Calculator
Fréquence : Toutes les heures
```
Cron → TradingView API → Code (calculate is_met) → Supabase Upsert
```

### Workflow 3 : Daily Portfolio Snapshot
Fréquence : Quotidien (00:00 UTC)
```
Cron → Get users → Loop → Calculate totals → Supabase Insert
```

---

## 📚 Documentation

- [README.md](README.md) - Overview complet
- [SUPABASE_MIGRATION.md](SUPABASE_MIGRATION.md) - Guide migration détaillé
- [supabase/README.md](supabase/README.md) - Doc Supabase spécifique
- [supabase/schema.sql](supabase/schema.sql) - Schéma de la base
- [supabase/seed.sql](supabase/seed.sql) - Données de test

---

## 🆘 Support

### Problème : L'app ne se lance pas
```bash
# Vérifier Node.js
node --version  # Doit être >= 18

# Réinstaller les dépendances
rm -rf node_modules package-lock.json
npm install
```

### Problème : Erreur Supabase
```bash
# Vérifier les credentials dans .env.local
cat .env.local

# Tester la connexion
curl https://fixymduhojtfaltmyixa.supabase.co/rest/v1/
```

### Problème : Port 3000 déjà utilisé
```bash
# Changer le port dans vite.config.ts
server: { port: 3001 }
```

---

## 🎉 C'est prêt !

L'application est fonctionnelle avec localStorage.  
La base Supabase est configurée et attend d'être connectée.  

**Choisis ta stratégie** :
1. Utiliser l'app actuelle (localStorage) → `npm run dev`
2. Migrer vers Supabase → Suivre `SUPABASE_MIGRATION.md`
3. Les deux → Data en local + BDD prête pour plus tard

---

**Questions ?** Consulte la doc ou ouvre une issue GitHub.
