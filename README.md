<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# PatrimoineX - Wealth OS

Plateforme de gestion patrimoniale intelligente avec analytics financier et IA advisor.

## 🚀 Stack Technique

- **Frontend**: React 19 + TypeScript + Vite
- **UI**: Tailwind CSS (Dark mode Obsidian)
- **Charts**: Recharts
- **IA**: Google Gemini API
- **Icons**: Lucide React

## 📦 Installation

### Prérequis
- Node.js 18+ 
- npm ou yarn
- Clé API Google Gemini

### Steps

1. **Cloner le repository**
```bash
git clone https://github.com/eva-sentience/MyPatrimoineX.git
cd MyPatrimoineX
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer l'environnement**
```bash
cp .env.local.example .env.local
```

Éditer `.env.local` et ajouter votre clé API Gemini :
```env
GEMINI_API_KEY=votre_clé_api_ici
```

> 🔑 Obtenir une clé API Gemini : https://makersuite.google.com/app/apikey

4. **Lancer le serveur de développement**
```bash
npm run dev
```

L'application sera accessible sur `http://localhost:3000`

## 🎯 Fonctionnalités

### 8 Classes d'actifs
- 🇫🇷 **France Invest** - Économie française
- 📈 **Stocks** - Bourse (S&P 500, CAC 40, NASDAQ)
- 💎 **Crypto** - Bitcoin, Ethereum, Altcoins
- 🏠 **Real Estate** - SCPI, Immobilier
- 🥇 **Precious Metals** - Or, Argent
- 📜 **Bonds** - Obligations
- 💼 **Private Equity**
- 💎 **Exotic** - Actifs alternatifs

### Fonctionnalités principales
- ✅ Dashboard avec allocation et KPIs
- ✅ Vue détaillée par catégorie d'actif
- ✅ 10 indicateurs Bitcoin (Top/Bottom signals)
- ✅ Macro-économie France (dette, déficit, défaillances)
- ✅ Market data en temps réel
- ✅ Charts interactifs (bar, line, area, waterfall)
- ✅ Contenu éducatif (analyses vidéo, guides)
- ✅ IA Financial Advisor (Gemini)

## 🏗️ Architecture

```
MyPatrimoineX/
├── App.tsx                 # Entry point + state
├── components/
│   ├── Auth.tsx           # Authentication
│   ├── Dashboard.tsx      # Portfolio overview
│   ├── CategoryView.tsx   # Detailed asset view
│   ├── GeminiChat.tsx     # AI advisor
│   └── Sidebar.tsx        # Navigation
├── services/
│   ├── geminiService.ts   # Gemini API integration
│   └── storageService.ts  # LocalStorage wrapper
├── types.ts               # TypeScript definitions
└── constants.ts           # Market data & indicators
```

## 📊 Data Sources

- **Crypto**: TradingView, CoinStats, Bitcoin Magazine Pro
- **Stocks**: Yahoo Finance, Boursorama
- **Real Estate**: SCPI providers, Banque de France
- **Macro**: INSEE, Eurostat, Agence France Trésor

## 🔧 Scripts disponibles

```bash
npm run dev      # Dev server (port 3000)
npm run build    # Production build
npm run preview  # Preview production build
```

## 🌐 Déploiement

### Vercel (recommandé)
```bash
vercel --prod
```

### Netlify
```bash
netlify deploy --prod
```

N'oubliez pas d'ajouter `GEMINI_API_KEY` dans les variables d'environnement.

## 📱 User par défaut (demo)

- Email: `bnjm.elias@gmail.com`
- Tier: Premium
- 2FA: Activé

## 🤝 Contribution

Les contributions sont bienvenues ! Ouvrez une issue ou une PR.

## 📄 Licence

MIT License

---

Développé avec ❤️ pour la gestion patrimoniale moderne
