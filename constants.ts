import { AssetType, CategoryConfig, EducationItem, MarketIndicator } from './types';

export const ASSET_CATEGORIES: CategoryConfig[] = [
  {
    type: AssetType.FRANCE_INVEST,
    label: 'France Eco',
    color: 'text-blue-600',
    iconName: 'Flag',
    gradient: 'from-blue-600/20 to-transparent',
  },
  {
    type: AssetType.STOCKS,
    label: 'Bourse',
    color: 'text-emerald-600',
    iconName: 'TrendingUp',
    gradient: 'from-emerald-500/20 to-transparent',
  },
  {
    type: AssetType.CRYPTO,
    label: 'Crypto',
    color: 'text-fuchsia-600',
    iconName: 'Bitcoin',
    gradient: 'from-fuchsia-500/20 to-transparent',
  },
  {
    type: AssetType.REAL_ESTATE,
    label: 'Immobilier',
    color: 'text-amber-600',
    iconName: 'Building',
    gradient: 'from-amber-500/20 to-transparent',
  },
  {
    type: AssetType.PRECIOUS_METALS,
    label: 'Or & Argent',
    color: 'text-yellow-500',
    iconName: 'Coins',
    gradient: 'from-yellow-500/20 to-transparent',
  },
  {
    type: AssetType.BONDS,
    label: 'Obligations',
    color: 'text-cyan-600',
    iconName: 'Scroll',
    gradient: 'from-cyan-500/20 to-transparent',
  },
  {
    type: AssetType.PRIVATE_EQUITY,
    label: 'Private Equity',
    color: 'text-purple-600',
    iconName: 'Briefcase',
    gradient: 'from-purple-500/20 to-transparent',
  },
  {
    type: AssetType.EXOTIC,
    label: 'Exotique',
    color: 'text-rose-600',
    iconName: 'Gem',
    gradient: 'from-rose-500/20 to-transparent',
  },
];

export const TOP_MARKET_INDICATORS: MarketIndicator[] = [
  {
    titleEng: "2B2:H4200 days Moving Average",
    titleFr: "Moyenne mobile 200 jours",
    description: "Cours moyen du prix du Bitcoin sur une période de 200 jours.",
    objective: "Prix du Bitcoin au dessus de la moyenne mobile 200 (en journalier)",
    source: "Tradingview",
    url: "https://www.tradingview.com",
    thresholdType: 'GT',
    thresholdValue: 52000 // Approx 200DMA
  },
  {
    titleEng: "Bitcoin Dominance",
    titleFr: "Dominance du Bitcoin",
    description: "La dominance du Bitcoin (BTC) est un indicateur qui offre un aperçu de la position et de l'influence de ce dernier sur le marché des cryptomonnaies.",
    objective: "Dominance Bitcoin inférieure à 45%",
    source: "Coinstats",
    url: "https://coinstats.app/btc-dominance/",
    thresholdType: 'LT',
    thresholdValue: 45
  },
  {
    titleEng: "Bitcoin Rainbow Price Chart Indicator",
    titleFr: "Indicateur arc en ciel du prix du bitcoin",
    description: "C'est un outil d'évaluation à long terme pour Bitcoin. Il utilise une courbe de croissance logarithmique pour prévoir l'orientation future potentielle des prix du Bitcoin.",
    objective: "Zone Rouge / Orange / Jaune",
    source: "Bitcoin Magazine Pro",
    url: "https://www.bitcoinmagazinepro.com/charts/bitcoin-rainbow-chart/",
    thresholdType: 'ZONE',
  },
  {
    titleEng: "Mayer Multiple",
    titleFr: "Multiple de Mayer",
    description: "Le multiple de Mayer est utilisé pour déterminer si le Bitcoin est suracheté, à un prix raisonnable ou sous-évalué.",
    objective: "Multiple de Mayer > 2,5",
    source: "Bitcoinition",
    url: "https://bitcoinition.com/charts/mayer-multiple/",
    thresholdType: 'GT',
    thresholdValue: 2.5
  },
  {
    titleEng: "Pi Cycle Top Indicator",
    titleFr: "Indicateur du Top du cycle PI",
    description: "L'indicateur Pi Cycle Top utilise la moyenne mobile de 111 jours (111DMA) et un multiple de la moyenne mobile de 350 jours (350DMA x 2).",
    objective: "Prix du bitcoin > courbe verte (350DMA x 2)",
    source: "Bitcoin Magazine Pro",
    url: "https://www.bitcoinmagazinepro.com/charts/pi-cycle-top-indicator/",
    thresholdType: 'BOOL', 
  },
  {
    titleEng: "Monthly RSI",
    titleFr: "RSI mensuel",
    description: "L'indice de force relative (RSI) mesure la vitesse et l'ampleur des changements récents de prix du Bitcoin.",
    objective: "RSI > 70",
    source: "Bitbo",
    url: "https://charts.bitbo.io/monthly-rsi/",
    thresholdType: 'GT',
    thresholdValue: 70
  },
  {
    titleEng: "Bitcoin Cycle Master",
    titleFr: "Maitre du cycle Bitcoin",
    description: "Cet indicateur identifie les périodes de risque accru ou faible en fonction du comportement des transactions on-chain.",
    objective: "Prix du bitcoin > Courbe Violet / Rouge",
    source: "TradingView",
    url: "https://www.tradingview.com",
    thresholdType: 'BOOL',
  },
  {
    titleEng: "Stock to flow model",
    titleFr: "Model du Stock to Flow",
    description: "Le ratio Stock / Flow (S/F) suppose que la rareté génère de la valeur.",
    objective: "Prix du bitcoin > Courbe de base",
    source: "Bitcoin Magazine Pro",
    url: "https://www.bitcoinmagazinepro.com/charts/stock-to-flow-model/",
    thresholdType: 'BOOL',
  },
  {
    titleEng: "ColinTalksCrypto Bitcoin Bull Run Index",
    titleFr: "Indice CBBI",
    description: "Le CBBI est un indice Bitcoin qui utilise une analyse avancée en temps réel de 9 mesures pour comprendre le cycle.",
    objective: "Supérieur à 80",
    source: "CoinGlass",
    url: "https://www.coinglass.com/fr/pro/i/cbbi-index",
    thresholdType: 'GT',
    thresholdValue: 80
  },
  {
    titleEng: "Crypto total marketcap",
    titleFr: "Marketcap total du marché crypto",
    description: "Il permet de calculer la capitalisation de l'ensemble des cryptomonnaies sur le marché à l'instant T.",
    objective: "Crypto total Marketcap à l'ATH",
    source: "CoinMarketCap",
    url: "https://coinmarketcap.com/charts/",
    thresholdType: 'BOOL',
  }
];

export const MARKET_DATA: any = {
  [AssetType.CRYPTO]: {
    kpis: [
      { label: "Total Market Cap", value: "$2.45T", trend: "+3.2%", status: "good", subValue: "Vol 24h: $89B" },
      { label: "Bitcoin Dominance", value: "54.2%", trend: "+0.5%", status: "good", subValue: "ETH: 17.8%" },
      { label: "Fear & Greed", value: "72", trend: "Greed", status: "good", subValue: "Last Month: 50" },
      { label: "DeFi TVL", value: "$98.5B", trend: "+1.1%", status: "good", subValue: "+22% YTD" },
    ],
    charts: [
      { title: "TradingView Integration", type: "custom", data: [] } 
    ],
    topAssets: [
      { name: "Bitcoin", symbol: "BTC", price: "$68,450", change: "+2.4%", mcap: "$1.3T" },
      { name: "Ethereum", symbol: "ETH", price: "$3,520", change: "+1.8%", mcap: "$420B" },
      { name: "Solana", symbol: "SOL", price: "$145", change: "+5.2%", mcap: "$68B" },
      { name: "Dogwifhat", symbol: "WIF", price: "$2.85", change: "+12.5%", mcap: "$2.8B" },
    ]
  },
  [AssetType.STOCKS]: {
    kpis: [
      { label: "S&P 500", value: "5,420", trend: "+0.8%", status: "good", subValue: "ATH" },
      { label: "CAC 40", value: "7,950", trend: "-0.2%", status: "warning", subValue: "Luxe en baisse" },
      { label: "NASDAQ 100", value: "18,800", trend: "+1.2%", status: "good", subValue: "Tech Lead" },
      { label: "VIX (Volatilité)", value: "12.4", trend: "-5%", status: "good", subValue: "Risque Faible" },
    ],
    charts: [
      {
        title: "Performance Comparée (1 An)",
        type: "line",
        dataKey1: "S&P 500",
        dataKey2: "CAC 40",
        data: [
          { name: "T1", value1: 100, value2: 100 },
          { name: "T2", value1: 105, value2: 102 },
          { name: "T3", value1: 112, value2: 104 },
          { name: "T4", value1: 118, value2: 101 },
          { name: "T1 (N+1)", value1: 124, value2: 103 },
        ]
      }
    ],
    topAssets: [
      { name: "NVIDIA", symbol: "NVDA", price: "$1,120", change: "+3.5%", mcap: "$2.8T" },
      { name: "LVMH", symbol: "MC", price: "€780", change: "-1.2%", mcap: "€390B" },
      { name: "TotalEnergies", symbol: "TTE", price: "€68", change: "+0.8%", mcap: "€160B" },
      { name: "Air Liquide", symbol: "AI", price: "€185", change: "+0.4%", mcap: "€98B" },
    ]
  },
  [AssetType.REAL_ESTATE]: {
    kpis: [
      { label: "Prix Moyen France", value: "3 150 €/m²", trend: "-1.5%", status: "warning", subValue: "Correction en cours" },
      { label: "Taux Crédit (20 ans)", value: "3.85%", trend: "Stable", status: "neutral", subValue: "Pic atteint ?" },
      { label: "Rendement SCPI", value: "4.52%", trend: "+0.1%", status: "good", subValue: "Distribution T1" },
      { label: "Volume Transactions", value: "850k", trend: "-15%", status: "critical", subValue: "Annuel" },
    ],
    charts: [
      {
        title: "Rendement SCPI vs Inflation",
        type: "bar",
        dataKey1: "SCPI",
        dataKey2: "Inflation",
        data: [
          { name: "2019", value1: 4.4, value2: 1.1 },
          { name: "2020", value1: 4.18, value2: 0.5 },
          { name: "2021", value1: 4.49, value2: 1.6 },
          { name: "2022", value1: 4.53, value2: 5.2 },
          { name: "2023", value1: 4.52, value2: 4.9 },
        ]
      }
    ],
    // Special field for the Map
    regionalData: [
      { region: "Île-de-France", value: "9 400 €/m²", status: "warning", x: 50, y: 25 },
      { region: "Auvergne-Rhône-Alpes", value: "3 800 €/m²", status: "good", x: 65, y: 55 },
      { region: "Nouvelle-Aquitaine", value: "3 200 €/m²", status: "good", x: 30, y: 65 },
      { region: "PACA", value: "4 500 €/m²", status: "good", x: 75, y: 80 },
      { region: "Hauts-de-France", value: "2 100 €/m²", status: "neutral", x: 52, y: 10 },
      { region: "Grand Est", value: "1 900 €/m²", status: "neutral", x: 75, y: 25 },
    ],
    topAssets: [
      { name: "Corum Origin", symbol: "SCPI", price: "€1,135", change: "6.06%", mcap: "Yield" },
      { name: "Iroko Zen", symbol: "SCPI", price: "€200", change: "7.12%", mcap: "Yield" },
      { name: "ActivImmo", symbol: "SCPI", price: "€610", change: "5.50%", mcap: "Yield" },
    ]
  },
  [AssetType.PRECIOUS_METALS]: {
    kpis: [
      { label: "Or (Once)", value: "$2,350", trend: "+12%", status: "good", subValue: "Refuge" },
      { label: "Argent (Once)", value: "$28.5", trend: "+15%", status: "good", subValue: "Industriel" },
      { label: "Ratio Or/Argent", value: "82.4", trend: "-2%", status: "neutral", subValue: "Spread" },
      { label: "Dollar Index", value: "104.2", trend: "+0.1%", status: "warning", subValue: "DXY" },
    ],
    charts: [
      {
        title: "Cours de l'Or (USD/oz)",
        type: "area",
        dataKey1: "Gold",
        data: [
          { name: "Jan", value1: 2050, fill: "#fbbf24" },
          { name: "Feb", value1: 2020, fill: "#fbbf24" },
          { name: "Mar", value1: 2150, fill: "#fbbf24" },
          { name: "Apr", value1: 2300, fill: "#fbbf24" },
          { name: "May", value1: 2350, fill: "#fbbf24" },
          { name: "Jun", value1: 2320, fill: "#fbbf24" },
        ]
      }
    ],
    topAssets: [
      { name: "Lingot Or 1kg", symbol: "XAU", price: "€72,500", change: "+1.2%", mcap: "-" },
      { name: "Napoléon 20F", symbol: "Coin", price: "€415", change: "+0.5%", mcap: "-" },
      { name: "Lingot Argent 1kg", symbol: "XAG", price: "€850", change: "+2.1%", mcap: "-" },
    ]
  }
};

export const FRANCE_MACRO_DATA = {
  kpis: [
    { 
      label: "Dette Publique", 
      value: "116.0%", 
      subValue: "du PIB", 
      trend: "+4.2%", 
      status: "critical", 
      source: "INSEE / ACDEFI",
      description: "Explosion de la dette depuis 2017. Objectif 120% en 2026."
    },
    { 
      label: "Déficit Public", 
      value: "-5.5%", 
      subValue: "du PIB", 
      trend: "-0.1%", 
      status: "critical", 
      source: "Eurostat",
      description: "La France 'cancre' de la zone Euro derrière la Grèce."
    },
    { 
      label: "Défaillances", 
      value: "68 227", 
      subValue: "Entreprises", 
      trend: "+24%", 
      status: "warning", 
      source: "Banque de France",
      description: "Record historique absolu, dépassant le niveau de 2009."
    },
    { 
      label: "Taux OAT 10 ans", 
      value: "3.50%", 
      subValue: "Rendement", 
      trend: "+290 bps", 
      status: "warning", 
      source: "Agence France Trésor",
      description: "Coût de la dette insoutenable à moyen terme."
    }
  ],
  regionalHotspots: [
    { region: "Île-de-France", value: "PIB +0.5%", status: "neutral", x: 50, y: 25 },
    { region: "Hauts-de-France", value: "Chômage 8.9%", status: "critical", x: 52, y: 10 },
    { region: "Grand Est", value: "Ind. -2%", status: "warning", x: 75, y: 25 },
    { region: "PACA", value: "Tourisme +2%", status: "good", x: 75, y: 80 },
    { region: "Nouvelle-Aquitaine", value: "Agri -4%", status: "warning", x: 30, y: 65 },
    { region: "Auvergne-Rhône-Alpes", value: "Tech +1%", status: "good", x: 65, y: 55 }
  ]
};

export const MOCK_NEWS = {
  [AssetType.STOCKS]: [
    { title: "Le CAC 40 atteint de nouveaux sommets grâce au secteur du luxe", source: "Les Echos", time: "Il y a 2h" },
    { title: "Les marchés mondiaux rebondissent sur les résultats tech", source: "Bloomberg", time: "Il y a 4h" },
    { title: "Fiscalité des dividendes : Ce qui change en 2025", source: "Investir", time: "Il y a 6h" },
  ],
  [AssetType.CRYPTO]: [
    { title: "Bitcoin brise la résistance des 65 000 €", source: "CoinDesk", time: "Il y a 10m" },
    { title: "Régulation MiCA : Impact complet en UE", source: "Decrypt", time: "Il y a 1h" },
  ],
  [AssetType.REAL_ESTATE]: [
    { title: "Les prix de l'immobilier parisien se stabilisent", source: "Le Parisien", time: "Il y a 1j" },
    { title: "La hausse des taux impacte les crédits immo", source: "Boursorama", time: "Il y a 2j" },
  ],
  [AssetType.FRANCE_INVEST]: [
    { title: "Dette publique : La France sous surveillance", source: "Le Figaro", time: "Il y a 3h" },
    { title: "Investissements étrangers : Record en 2024", source: "Business France", time: "Il y a 5h" },
  ]
};

export const EDUCATIONAL_CONTENT: Record<AssetType, EducationItem[]> = {
  [AssetType.STOCKS]: [
    { 
      title: "ETF vs Stock Picking : La vérité mathématique", 
      type: "Analyse Vidéo", 
      duration: "18 min",
      releaseDate: "15 Oct 2024",
      author: "Finary",
      sourceUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      imageUrl: "https://images.unsplash.com/photo-1611974765270-ca1258634369?auto=format&fit=crop&q=80",
      summary: "Une analyse approfondie comparant la gestion passive (ETF) et la gestion active (Stock Picking).",
      complexity: "Intermédiaire",
      keyPoints: [
        "Performance historique des ETF vs Fonds gérés.",
        "Impact des frais sur le long terme.",
        "Différences de diversification.",
        "Psychologie de l'investisseur."
      ],
      charts: [
        {
          title: "Comparaison de Performance",
          slideType: "chart",
          type: "bar",
          dataKey1: "ETF",
          dataKey2: "Stock Picking",
          data: [
             { name: "1 an", value1: 8, value2: 6 },
             { name: "5 ans", value1: 45, value2: 30 },
             { name: "10 ans", value1: 120, value2: 85 },
          ],
          description: "Rendement cumulé moyen sur différentes périodes."
        }
      ]
    }
  ],
  [AssetType.CRYPTO]: [],
  [AssetType.REAL_ESTATE]: [],
  [AssetType.FRANCE_INVEST]: [],
  [AssetType.PRECIOUS_METALS]: [],
  [AssetType.BONDS]: [],
  [AssetType.PRIVATE_EQUITY]: [],
  [AssetType.EXOTIC]: [],
};

// ============================================================================
// 🆕 INDICATEURS DE TOP - 44 INDICATEURS EN 4 CATÉGORIES
// ============================================================================

// 1️⃣ INDICATEURS DE BASE (10) - Reprend TOP_MARKET_INDICATORS avec category
export const BASE_INDICATORS = TOP_MARKET_INDICATORS.map(ind => ({
  ...ind,
  category: 'base' as const
}));

// 2️⃣ INDICATEURS MACRO (7)
export const MACRO_INDICATORS: MarketIndicator[] = [
  {
    titleEng: "US Liquidity",
    titleFr: "Liquidités sur le marché US",
    description: "Indicateur qui prend en compte le bilan de la Réserve fédérale, les accords de prise en pension (RRP) et le compte général du Trésor Américain (TGA).",
    objective: "Liquidités > 20%",
    source: "Capriole",
    url: "https://capriole.com/Charts/",
    category: 'macro'
  },
  {
    titleEng: "M2 Money Supply",
    titleFr: "Masse monétaire M2",
    description: "M2 est une mesure de la masse monétaire qui comprend les espèces, les dépôts-chèques et autres dépôts facilement convertibles. Les chiffres M2 sont étroitement surveillés en tant qu'indicateurs de la masse monétaire globale.",
    objective: "À la hausse sur les 2/3 derniers mois",
    source: "Trading Economics",
    url: "https://tradingeconomics.com/united-states/money-supply-m2",
    category: 'macro'
  },
  {
    titleEng: "US Stock Market (Nasdaq)",
    titleFr: "Indice du Nasdaq",
    description: "Le NASDAQ est une bourse américaine spécialisée dans les sociétés technologiques. Quand le marché boursier est à la hausse, cela est souvent très positif pour le marché crypto.",
    objective: "À la hausse sur les 2/3 derniers mois",
    source: "YCharts",
    url: "https://ycharts.com/indices/%5EIXIC",
    category: 'macro'
  },
  {
    titleEng: "Fed Interest Rate",
    titleFr: "Taux d'intérêt de la FED",
    description: "C'est le taux de refinancement minimum qui permet aux établissements bancaires de se refinancer auprès de la banque centrale. Des taux faibles stimulent l'économie par abondance de liquidités.",
    objective: "En baisse",
    source: "FRED",
    url: "https://fred.stlouisfed.org/series/FEDFUNDS",
    category: 'macro'
  },
  {
    titleEng: "Fed Pivot",
    titleFr: "Pivot de la FED",
    description: "Changement de politique monétaire : Un pivot de la Fed implique souvent un passage de la hausse des taux d'intérêt à leur baisse, ou vice-versa.",
    objective: "A déjà eu lieu",
    source: "FRED",
    url: "https://fred.stlouisfed.org/series/FEDFUNDS",
    category: 'macro'
  },
  {
    titleEng: "US Stock Market (S&P 500)",
    titleFr: "Indice du S&P 500",
    description: "L'indice S&P 500 est construit à partir de 500 grandes entreprises cotées aux USA. Quand le marché boursier est à la hausse, cela est souvent très positif pour le marché crypto.",
    objective: "À la hausse sur les 2/3 derniers mois",
    source: "Business Insider",
    url: "https://markets.businessinsider.com/index/s&p_500",
    category: 'macro'
  },
  {
    titleEng: "ETF Inflow",
    titleFr: "Entrées d'argent dans les ETFs Bitcoin",
    description: "Correspond à l'argent des investisseurs qui est investi sur Bitcoin via l'ensemble des ETFs spot.",
    objective: "Demande constante ou en hausse",
    source: "Cryptonary",
    url: "https://cryptonary.com/bitcoin-etf-inflows-tracker/",
    category: 'macro'
  }
];

// 3️⃣ INDICATEURS ON-CHAIN (15)
export const ONCHAIN_INDICATORS: MarketIndicator[] = [
  {
    titleEng: "Bitcoin Heater",
    titleFr: "Surchauffe du Bitcoin",
    description: "Cet indicateur représente la survalorisation potentielle du Bitcoin en analysant notamment les produits dérivés. Des valeurs hautes suggèrent un fort sentiment de cupidité sur le marché.",
    objective: "Bitcoin Heater > 0.8",
    source: "Capriole",
    url: "https://capriole.com/Charts/",
    category: 'onchain'
  },
  {
    titleEng: "Dynamic Range NVT",
    titleFr: "Plage dynamique NVT",
    description: "Le NVT est le rapport entre les transactions on-chain et la capitalisation boursière. L'utilisation de bandes permet d'identifier les régions de sous-évaluation et de surévaluation.",
    objective: "Dynamic range NVT > Courbe rouge",
    source: "Capriole",
    url: "https://capriole.com/Charts/",
    category: 'onchain'
  },
  {
    titleEng: "On-chain Transaction Fees (Bitcoin)",
    titleFr: "Frais de transaction On-chain (Bitcoin)",
    description: "Représente les frais moyens par transaction sur Bitcoin. En période euphorique et de surchauffe de marché, les frais et les temps de transactions augmentent fortement.",
    objective: "Frais moyen en constante augmentation sur les 6 derniers mois",
    source: "BitInfoCharts",
    url: "https://bitinfocharts.com/comparison/bitcoin-transactionfees.html",
    category: 'onchain'
  },
  {
    titleEng: "Fees on Ethereum",
    titleFr: "Frais de transaction sur Ethereum",
    description: "Représente les frais moyens par transaction sur Ethereum. En période euphorique, les frais augmentent fortement.",
    objective: "Frais moyen en constante augmentation sur les 6 derniers mois",
    source: "BitInfoCharts",
    url: "https://bitinfocharts.com/comparison/ethereum-median_transaction_fee.html",
    category: 'onchain'
  },
  {
    titleEng: "Percent Addresses in Profit",
    titleFr: "Pourcentage d'adresses en profit",
    description: "Pourcentage d'adresses uniques dont les fonds ont un prix d'achat moyen inférieur au prix actuel.",
    objective: "Percent of addresses in profit au dessus de 90%",
    source: "Bitcoin Magazine Pro",
    url: "https://www.bitcoinmagazinepro.com/charts/percent-addresses-in-profit/",
    category: 'onchain'
  },
  {
    titleEng: "MVRV Z-Score",
    titleFr: "Score MVRV-Z",
    description: "Permet d'identifier les périodes pendant lesquelles Bitcoin est extrêmement surévalué ou sous-évalué par rapport à sa juste valeur. Utilise la valeur marchande, la valeur réalisée et un test d'écart type.",
    objective: "MVRV Z proche de la zone rouge ou dans la zone rouge",
    source: "Bitcoin Magazine Pro",
    url: "https://www.bitcoinmagazinepro.com/charts/mvrv-zscore/",
    category: 'onchain'
  },
  {
    titleEng: "Net Unrealized Profit/Loss (NUPL)",
    titleFr: "Bénéfice/Perte Net Non Réalisé (NUPL)",
    description: "Dérivé de la valeur marchande et de la valeur réalisée. Les profits/pertes non réalisés estiment le total des profits/pertes papier en Bitcoin détenus par les investisseurs.",
    objective: "Courbe bleue dans la zone orange ou rouge",
    source: "Bitcoin Magazine Pro",
    url: "https://www.bitcoinmagazinepro.com/charts/relative-unrealized-profit--loss/",
    category: 'onchain'
  },
  {
    titleEng: "Reserve Risk",
    titleFr: "Risque de réserve",
    description: "Permet de visualiser la confiance des détenteurs de Bitcoin à long terme par rapport à son prix. Quand la confiance est faible et que le prix est élevé, le rapport risque/récompense est peu attrayant.",
    objective: "Reserve Risk proche de la zone rouge ou dans la zone rouge",
    source: "Bitcoin Magazine Pro",
    url: "https://www.bitcoinmagazinepro.com/charts/reserve-risk/",
    category: 'onchain'
  },
  {
    titleEng: "Top Cap",
    titleFr: "Top Cap",
    description: "Calculé en prenant le Cap Moyen (somme cumulée de la capitalisation boursière divisée par l'âge du marché) multiplié par 35. A correctement prédit les sommets des cycles précédents.",
    objective: "Prix du Bitcoin touche la courbe bleue ou s'en rapproche dangereusement",
    source: "Bitcoin Magazine Pro",
    url: "https://www.bitcoinmagazinepro.com/charts/top-cap/",
    category: 'onchain'
  },
  {
    titleEng: "Delta Top",
    titleFr: "Delta Top",
    description: "Delta Cap = Plafond réalisé - Plafond moyen. Les valeurs de Delta Cap sont ensuite multipliées par 7 pour obtenir Delta Top.",
    objective: "Prix du Bitcoin touche la courbe violette ou s'en rapproche dangereusement",
    source: "Bitcoin Magazine Pro",
    url: "https://www.bitcoinmagazinepro.com/charts/delta-top/",
    category: 'onchain'
  },
  {
    titleEng: "Terminal Price",
    titleFr: "Prix terminal",
    description: "Calculé à partir du prix transféré (somme des Coin Days Destroyed divisée par l'offre existante) multiplié par 21. Crée une valeur terminale.",
    objective: "Prix du Bitcoin touche la courbe rouge ou s'en rapproche dangereusement",
    source: "Bitcoin Magazine Pro",
    url: "https://www.bitcoinmagazinepro.com/charts/terminal-price/",
    category: 'onchain'
  },
  {
    titleEng: "HODL Wave",
    titleFr: "Vague HODL",
    description: "Montre la quantité de Bitcoin en circulation regroupée en différentes tranches d'âge. Une forte augmentation des coins jeunes indique que des bitcoins anciens sont vendus, souvent proche des sommets.",
    objective: "Les nuances de rouge ont tendance à augmenter rapidement",
    source: "Bitcoin Magazine Pro",
    url: "https://www.bitcoinmagazinepro.com/charts/hodl-waves/",
    category: 'onchain'
  },
  {
    titleEng: "Fear and Greed Index",
    titleFr: "Indice de peur et de cupidité",
    description: "Identifie si le marché devient trop craintif ou trop cupide. Quand les acteurs sont extrêmement cupides, le prix est peut-être trop élevé.",
    objective: "Greed ou Extreme Greed",
    source: "Alternative.me",
    url: "https://alternative.me/crypto/fear-and-greed-index/",
    category: 'onchain'
  },
  {
    titleEng: "Time Until Next Halving",
    titleFr: "Temps avant le prochain Halving",
    description: "Le halving est un événement programmé qui se produit tous les 4 ans (210 000 blocs) et divise par deux la quantité de nouveaux bitcoins créés.",
    objective: "Halving dans plus de 2 ans",
    source: "CoinGecko",
    url: "https://www.coingecko.com/en/coins/bitcoin/bitcoin-halving",
    category: 'onchain'
  },
  {
    titleEng: "Puell Multiple",
    titleFr: "Multiple de Puell",
    description: "Examine les cycles du marché du point de vue des revenus miniers. Calculé en divisant la valeur d'émission quotidienne des bitcoins par la moyenne mobile sur 365 jours.",
    objective: "Multiple Puell dans la zone Rouge",
    source: "Bitcoin Magazine Pro",
    url: "https://www.bitcoinmagazinepro.com/charts/puell-multiple/",
    category: 'onchain'
  }
];

// 4️⃣ INDICATEURS EMPIRIQUES (12)
export const EMPIRICAL_INDICATORS: MarketIndicator[] = [
  {
    titleEng: "Ranking Crypto App Store",
    titleFr: "Classement applications Crypto sur l'App Store",
    description: "Observer le classement des apps crypto donne des indications sur la popularité du marché. Voir Coinbase ou Binance dans le Top 10 peut être synonyme de surchauffe.",
    objective: "Classement > 20 (catégorie finance)",
    source: "The Block",
    url: "https://www.theblock.co/data/alternative-crypto-metrics/app-usage",
    category: 'empirique'
  },
  {
    titleEng: "Lots of New Projects Launched",
    titleFr: "Lancement de nombreux nouveaux projets",
    description: "En général, en bull market beaucoup de projets sont lancés via ICO/IEO/IDO. C'est l'inverse en bear.",
    objective: "Beaucoup de nouveaux lancements",
    source: "CoinCodex",
    url: "https://coincodex.com/ieo-list/binance/",
    category: 'empirique'
  },
  {
    titleEng: "Google Trends (Bitcoin)",
    titleFr: "Google Trends (Bitcoin)",
    description: "Volume de recherche pour le terme Bitcoin sur Google. Un intérêt élevé indique souvent une attention du grand public.",
    objective: "Volume de recherche historique > 50",
    source: "Google Trends",
    url: "https://trends.google.fr/trends/explore?q=bitcoin",
    category: 'empirique'
  },
  {
    titleEng: "Google Trends (Ethereum)",
    titleFr: "Google Trends (Ethereum)",
    description: "Volume de recherche pour le terme Ethereum sur Google. Un intérêt élevé indique souvent une attention du grand public.",
    objective: "Volume de recherche historique > 50",
    source: "Google Trends",
    url: "https://trends.google.fr/trends/explore?q=ethereum",
    category: 'empirique'
  },
  {
    titleEng: "Google Trends (Buy Bitcoin)",
    titleFr: "Google Trends (Acheter Bitcoin)",
    description: "Volume de recherche pour buy bitcoin. Un pic indique que beaucoup de nouveaux investisseurs cherchent à entrer sur le marché.",
    objective: "Volume de recherche historique > 50",
    source: "Google Trends",
    url: "https://trends.google.fr/trends/explore?q=buy%20bitcoin",
    category: 'empirique'
  },
  {
    titleEng: "Google Trends (Buy Ethereum)",
    titleFr: "Google Trends (Acheter Ethereum)",
    description: "Volume de recherche pour buy ethereum. Un pic indique que beaucoup de nouveaux investisseurs cherchent à entrer sur le marché.",
    objective: "Volume de recherche historique > 50",
    source: "Google Trends",
    url: "https://trends.google.fr/trends/explore?q=buy%20ethereum",
    category: 'empirique'
  },
  {
    titleEng: "Crypto on Every Media",
    titleFr: "Présence crypto sur tous les médias",
    description: "Voir des informations très positives sur le marché en continu à la télé/radio/YouTube renseigne sur le sentiment global. Il est important d'acheter la dépression et revendre en période euphorique.",
    objective: "Contenu très positif partout",
    source: "Cointelegraph",
    url: "https://fr.cointelegraph.com/",
    category: 'empirique'
  },
  {
    titleEng: "Everyone Talking About Profit",
    titleFr: "Tout le monde parle de ses profits",
    description: "Quand tout le monde affiche ses gains sur les réseaux sociaux, c'est souvent signe d'euphorie de marché proche d'un sommet.",
    objective: "Contenu très positif partout",
    source: "Cointelegraph",
    url: "https://fr.cointelegraph.com/",
    category: 'empirique'
  },
  {
    titleEng: "Crypto Content Very Popular",
    titleFr: "Le contenu crypto est très populaire",
    description: "Quand le contenu crypto génère beaucoup d'engagement (vues, likes, partages), cela indique un fort intérêt du public.",
    objective: "Contenu très positif partout",
    source: "Cointelegraph",
    url: "https://fr.cointelegraph.com/",
    category: 'empirique'
  },
  {
    titleEng: "Parabolic Price Move",
    titleFr: "Augmentation parabolique du prix",
    description: "Une hausse parabolique du prix (montée verticale sur le graphique) indique souvent une phase finale de cycle proche du sommet.",
    objective: "Mouvement de prix parabolique observé",
    source: "TradingView",
    url: "https://www.tradingview.com",
    category: 'empirique'
  },
  {
    titleEng: "Only Good News",
    titleFr: "Uniquement des bonnes nouvelles",
    description: "Quand tous les médias ne relaient que des nouvelles positives sans aucune critique, c'est souvent signe d'euphorie excessive.",
    objective: "Contenu très positif partout",
    source: "Cointelegraph",
    url: "https://fr.cointelegraph.com/",
    category: 'empirique'
  },
  {
    titleEng: "Lots of Updates on Popular Projects",
    titleFr: "Mises à jour de projets populaires",
    description: "En tendance haussière, de nouvelles mises à jour importantes sont annoncées même si elles étaient disponibles depuis plusieurs mois.",
    objective: "Beaucoup de mises à jour",
    source: "Cointelegraph",
    url: "https://fr.cointelegraph.com/",
    category: 'empirique'
  }
];

// 🎯 EXPORT GLOBAL : 44 INDICATEURS COMBINÉS
export const ALL_TOP_INDICATORS: MarketIndicator[] = [
  ...BASE_INDICATORS,
  ...MACRO_INDICATORS,
  ...ONCHAIN_INDICATORS,
  ...EMPIRICAL_INDICATORS
];