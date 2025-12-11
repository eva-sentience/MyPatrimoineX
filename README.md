# 📊 PatrimoineX

Application complète d'analyse crypto avec 44 indicateurs de top de marché, dashboard interactif et automatisation N8N/Supabase.

## ✨ Fonctionnalités

### 🎯 Analyse Top de Marché
- **44 indicateurs** répartis en 4 catégories:
  - 7 Indicateurs Macro-Économiques
  - 15 Indicateurs On-Chain et Techniques
  - 12 Indicateurs Empiriques et de Sentiment
  - 10 Indicateurs Existants (2B2, Dominance, Mayer, RSI, etc.)

### 📈 Dashboard en Temps Réel
- Prix BTC live (Binance API - refresh 5s)
- Bitcoin Dominance animée
- Fear & Greed Index (Supabase + Alternative.me)
- Signal de Trading (force + direction)
- Score Top Cycle (calcul probabilité)

### 🔄 Automatisation
- Workflows N8N (refresh 15 minutes)
- Supabase pour Fear & Greed + Halving Countdown
- Cache intelligent (15 minutes aligné sur N8N)
- Historique sur 60 jours

### 🔍 Fonctionnalités Avancées
- Watchlist crypto personnalisée
- Recherche CoinGecko (Top 100)
- TradingView widget intégré
- Analyse par catégorie (Macro / On-Chain / Empirique)
- Système de scoring dynamique

## 🛠 Technologies

- **Frontend:** React 18, TypeScript, TailwindCSS
- **Backend:** Supabase (PostgreSQL)
- **Automation:** N8N
- **Charts:** Recharts, TradingView
- **Icons:** Lucide React
- **APIs:** Binance, CoinGecko, CoinPaprika, Alternative.me

## 📂 Structure du Projet

```
MyPatrimoineX/
├── components/
│   └── CategoryView.tsx        (1847 lignes - composant principal)
├── services/
│   ├── btcIndicatorsService.ts (fetch Supabase)
│   └── supabaseClient.ts       (client Supabase)
├── constants/
│   └── TOP_MARKET_INDICATORS   (44 indicateurs)
├── types/
│   └── index.ts               (types TypeScript)
└── docs/
    └── Stratégie_d_Automatisation.md
```

## 🚀 Installation

```bash
# Cloner le repo
git clone https://github.com/VOTRE_USERNAME/PatrimoineX.git

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos clés Supabase

# Lancer le projet
npm run dev
```

## 🔑 Configuration

### Supabase
1. Créer un projet sur https://supabase.com
2. Créer la table `indicateurs_top_marche`:
```sql
CREATE TABLE indicateurs_top_marche (
  id SERIAL PRIMARY KEY,
  nom_indicateur VARCHAR(100),
  valeur_numerique DECIMAL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### N8N
1. Installer N8N: https://n8n.io
2. Créer workflows pour:
   - Fear & Greed Index (Alternative.me)
   - Halving Countdown (calcul déterministe)

## 📊 Sources de Données

- **Binance API:** Prix BTC temps réel
- **Supabase:** Fear & Greed, Halving, historique
- **CoinGecko:** Recherche crypto (Top 100)
- **CoinPaprika:** Market cap global
- **Alternative.me:** Fear & Greed officiel
- **Yahoo Finance:** Données historiques

## 📈 Indicateurs Disponibles

### Macro-Économiques (7)
- Liquidités sur le marché US
- Masse monétaire M2
- Indice Nasdaq
- Taux d'intérêt FED
- Pivot de la FED
- Indice S&P500
- Entrées ETFs Bitcoin

### On-Chain et Techniques (15)
- Surchauffe Bitcoin
- Plage dynamique NVT
- Frais transaction BTC/ETH
- % Adresses en profit
- Score MVRV-Z
- NUPL
- Reserve Risk
- Top Cap / Delta Top / Prix Terminal
- HODL Waves
- Fear & Greed Index ✅ (Supabase)
- Halving Countdown ✅ (Supabase)
- Multiple de Puell

### Empiriques (12)
- Apps crypto Apple Store
- Lancements nouveaux projets
- Google Trends (Bitcoin, Ethereum, Buy Bitcoin, Buy Ethereum)
- Contenu crypto médias
- Sentiment général marché
- Prix parabolique
- Mises à jour projets

## 🎨 Interface

- Design glassmorphism moderne
- Animations fluides
- Responsive (mobile/tablet/desktop)
- Dark mode par défaut
- Système de catégories colorées

## 📝 Licence

MIT

## 👤 Auteur

**Benjamin** - PatrimoineX

---

⭐ Si ce projet vous aide, n'hésitez pas à lui donner une étoile !
