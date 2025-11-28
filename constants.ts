

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
    description: "C'est un outil d’évaluation à long terme pour Bitcoin. Il utilise une courbe de croissance logarithmique pour prévoir l’orientation future potentielle des prix du Bitcoin.",
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
    description: "L’indicateur Pi Cycle Top utilise la moyenne mobile de 111 jours (111DMA) et un multiple de la moyenne mobile de 350 jours (350DMA x 2).",
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
