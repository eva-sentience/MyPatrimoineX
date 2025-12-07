<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# PatrimoineX - Wealth OS 🚀

**Plateforme intelligente de gestion patrimoniale** avec analytics financier en temps réel et IA advisor.

[![Status](https://img.shields.io/badge/status-active-success.svg)]()
[![Supabase](https://img.shields.io/badge/database-Supabase-green)]()
[![React](https://img.shields.io/badge/react-19.2.0-blue)]()
[![License](https://img.shields.io/badge/license-MIT-blue.svg)]()

---

## ⚡️ Quick Start

```bash
# Clone & Setup
git clone https://github.com/eva-sentience/MyPatrimoineX.git
cd MyPatrimoineX
npm run setup

# Launch
npm run dev
```

**Ouvre** http://localhost:3000 🎉

📖 **Guide détaillé** : [QUICKSTART.md](QUICKSTART.md)

---

## 📊 Fonctionnalités

### 🎯 Core Features
- ✅ **Dashboard** - Vue d'ensemble du patrimoine avec allocation dynamique
- ✅ **8 Classes d'actifs** - Stocks, Crypto, Immobilier, Or, Obligations, Private Equity, France Invest, Exotic
- ✅ **Analytics en temps réel** - KPIs, performance, trends
- ✅ **10 Indicateurs Bitcoin** - Top/Bottom signals (Mayer Multiple, Pi Cycle, S2F, etc.)
- ✅ **Macro France** - Dette publique, déficit, défaillances d'entreprises
- ✅ **Contenu éducatif** - Analyses vidéo, guides, deep dives
- ✅ **IA Financial Advisor** - Chat Gemini contextuel

### 🔮 Tech Stack
- **Frontend** : React 19 + TypeScript + Vite
- **UI** : Tailwind CSS (Dark mode Obsidian)
- **Charts** : Recharts
- **Database** : Supabase (PostgreSQL)
- **IA** : Google Gemini / Claude API
- **Deploy** : Vercel ready

---

## 🗂️ Documentation

| Doc | Description | Temps |
|-----|-------------|-------|
| [📄 STATUS.md](STATUS.md) | État du projet & roadmap | 2 min |
| [🚀 QUICKSTART.md](QUICKSTART.md) | Démarrage rapide | 5 min |
| [🔄 SUPABASE_MIGRATION.md](SUPABASE_MIGRATION.md) | Guide migration localStorage → Supabase | 30 min |
| [📊 supabase/README.md](supabase/README.md) | Documentation Supabase détaillée | 15 min |

---

## 🏗️ Architecture

### Actuelle (localStorage)
```
React Frontend → localStorage → Gemini API
```

### Cible (Supabase)
```
React Frontend → Supabase (PostgreSQL) ← N8N Workflows
                    ↓
                Claude API
```

### Structure BDD Supabase

```sql
profiles                        -- Utilisateurs
patrimoinex_assets              -- Actifs financiers
patrimoinex_market_data         -- Prix en temps réel
patrimoinex_market_indicators   -- Indicateurs Bitcoin (10)
patrimoinex_analysis_history    -- Historique analyses
patrimoinex_portfolio_snapshots -- Snapshots quotidiens
patrimoinex_education_content   -- Contenu éducatif
patrimoinex_user_preferences    -- Settings
patrimoinex_chat_messages       -- Conversations IA
```

**Status** : 🟢 Configurée et prête (9 tables + 2 vues)

---

## 🎨 Screenshots

### Dashboard
![Dashboard](https://via.placeholder.com/800x400?text=Dashboard+Preview)

### Market Analysis
![Market](https://via.placeholder.com/800x400?text=Market+Analysis)

---

## 🚀 Installation

### Prérequis
- Node.js 18+
- npm ou yarn
- Compte Supabase (gratuit)
- Clé API Gemini (optionnel)

### Setup automatique

```bash
git clone https://github.com/eva-sentience/MyPatrimoineX.git
cd MyPatrimoineX
npm run setup
```

### Configuration manuelle

```bash
npm install
cp .env.local.example .env.local
# Éditer .env.local avec tes credentials
npm run dev
```

### Test Supabase

```bash
npm run test:supabase
```

---

## 📦 Scripts disponibles

```bash
npm run dev           # Dev server (port 3000)
npm run build         # Production build
npm run preview       # Preview production
npm run setup         # Setup automatique
npm run test:supabase # Test connexion Supabase
```

---

## 🌐 Déploiement

### Vercel (1-click)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/eva-sentience/MyPatrimoineX)

Variables d'environnement :
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `GEMINI_API_KEY` (optionnel)

### Netlify

```bash
netlify deploy --prod
```

---

## 🤖 Workflows N8N (optionnel)

### Workflow 1 : Market Data Scraper
**Fréquence** : Toutes les 15 minutes
```
Cron → CoinGecko/Yahoo API → Supabase Insert
```

### Workflow 2 : Bitcoin Indicators
**Fréquence** : Toutes les heures
```
Cron → TradingView API → Calculate → Supabase Upsert
```

### Workflow 3 : Daily Snapshots
**Fréquence** : Minuit UTC
```
Cron → Get Users → Calculate Totals → Supabase Insert
```

---

## 📈 Roadmap

### ✅ Phase 1 : MVP (Done)
- [x] Dashboard & analytics
- [x] Gestion d'actifs
- [x] Indicateurs Bitcoin
- [x] Chat IA
- [x] Base Supabase configurée

### 🔄 Phase 2 : Supabase (En cours)
- [ ] Migration localStorage → Supabase
- [ ] Auth Supabase
- [ ] Sync multi-device
- [ ] Real-time updates

### 🚀 Phase 3 : Automation
- [ ] N8N workflows
- [ ] Scraping market data
- [ ] Daily portfolio snapshots

### 🎯 Phase 4 : Advanced
- [ ] Notifications push
- [ ] Export PDF/Excel
- [ ] API publique
- [ ] Mobile app

---

## 🤝 Contributing

Les contributions sont bienvenues ! 

1. Fork le projet
2. Crée une branche (`git checkout -b feature/AmazingFeature`)
3. Commit tes changements (`git commit -m 'Add AmazingFeature'`)
4. Push sur la branche (`git push origin feature/AmazingFeature`)
5. Ouvre une Pull Request

---

## 📄 License

MIT License - voir [LICENSE](LICENSE) pour plus de détails

---

## 🙏 Remerciements

- [Supabase](https://supabase.com) - Backend as a Service
- [Recharts](https://recharts.org) - Graphiques React
- [Lucide](https://lucide.dev) - Icons
- [Tailwind CSS](https://tailwindcss.com) - UI Framework
- [Google Gemini](https://ai.google.dev) - IA Conversationnelle

---

## 📞 Support

- 📧 Email : bnjm.elias@gmail.com
- 🐛 Issues : [GitHub Issues](https://github.com/eva-sentience/MyPatrimoineX/issues)
- 📚 Docs : Voir les fichiers `.md` dans le repo

---

<div align="center">

**Développé avec ❤️ pour la gestion patrimoniale moderne**

[⭐ Star ce projet](https://github.com/eva-sentience/MyPatrimoineX) si tu le trouves utile !

</div>
