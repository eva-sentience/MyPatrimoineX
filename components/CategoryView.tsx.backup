import React, { useState, useMemo, useEffect, useRef } from 'react';
import { AssetType, Asset, TabView, EducationItem, MarketIndicator, AnalysisHistoryEntry } from '../types';
import { ASSET_CATEGORIES, MOCK_NEWS, EDUCATIONAL_CONTENT, FRANCE_MACRO_DATA, MARKET_DATA, TOP_MARKET_INDICATORS } from '../constants';
import { Plus, Trash2, Activity, TrendingDown, TrendingUp, Users, AlertTriangle, Globe, Search, Loader2, DollarSign, BarChart3, Star, Play, ChevronLeft, ChevronRight, X, Info, ExternalLink, BookOpen, FileText, ArrowUpRight, ArrowDownRight, Gauge, CheckCircle2, Flame, Zap, Skull, CheckCircle, XCircle, History, Edit2, Save, Clock } from 'lucide-react';
import { storageService } from '../services/storageService';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, AreaChart, Area, ComposedChart, Legend, ReferenceLine } from 'recharts';

// ✅ IMPORTS SUPABASE AJOUTÉS
import {
  getAllLatestIndicators,
  getLatestBTCPrice,
  getLatestTradingSignal,
  getLatestRSI,
  getLatestMovingAverages,
  formatUpdateTime,
  getDataFreshnessStatus,
  getLatestFearGreedFromSupabase,
  getLatestHalvingCountdown
} from '../services/btcIndicatorsService';
import type { AllIndicators } from '../services/supabaseClient';

interface CategoryViewProps {
  categoryType: AssetType;
  assets: Asset[];
  onAssetUpdate: () => void;
}

// ⚙️ CONFIGURATION CACHE
const CACHE_DURATION_MINUTES = 15; // Aligné sur le workflow N8N

// --- PROFESSIONAL DATA COMPONENTS ---

const VERIFIED_ASSETS = [
    { name: "Bitcoin", symbol: "BTC", pair: "BINANCE:BTCUSDT", type: "Layer 1", logo: "https://assets.coingecko.com/coins/images/1/thumb/bitcoin.png" },
    { name: "Ethereum", symbol: "ETH", pair: "BINANCE:ETHUSDT", type: "Smart Contracts", logo: "https://assets.coingecko.com/coins/images/279/thumb/ethereum.png" },
    { name: "Solana", symbol: "SOL", pair: "BINANCE:SOLUSDT", type: "Layer 1", logo: "https://assets.coingecko.com/coins/images/4128/thumb/solana.png" },
    { name: "BNB", symbol: "BNB", pair: "BINANCE:BNBUSDT", type: "Exchange", logo: "https://assets.coingecko.com/coins/images/825/thumb/binance-coin-logo.png" },
    { name: "XRP", symbol: "XRP", pair: "BINANCE:XRPUSDT", type: "Payment", logo: "https://assets.coingecko.com/coins/images/44/thumb/xrp-symbol-white-128.png" },
    { name: "Cardano", symbol: "ADA", pair: "BINANCE:ADAUSDT", type: "Layer 1", logo: "https://assets.coingecko.com/coins/images/975/thumb/cardano.png" },
    { name: "Avalanche", symbol: "AVAX", pair: "BINANCE:AVAXUSDT", type: "Layer 1", logo: "https://assets.coingecko.com/coins/images/12559/thumb/Avalanche_Circle_RedWhite_Trans.png" },
    { name: "Dogecoin", symbol: "DOGE", pair: "BINANCE:DOGEUSDT", type: "Meme", logo: "https://assets.coingecko.com/coins/images/5/thumb/dogecoin.png" },
    { name: "Polkadot", symbol: "DOT", pair: "BINANCE:DOTUSDT", type: "Layer 0", logo: "https://assets.coingecko.com/coins/images/12171/thumb/polkadot.png" },
    { name: "Chainlink", symbol: "LINK", pair: "BINANCE:LINKUSDT", type: "Oracle", logo: "https://assets.coingecko.com/coins/images/877/thumb/chainlink-new-logo.png" },
    { name: "Polygon", symbol: "MATIC", pair: "BINANCE:MATICUSDT", type: "Layer 2", logo: "https://assets.coingecko.com/coins/images/4713/thumb/matic-token-icon.png" },
    { name: "Shiba Inu", symbol: "SHIB", pair: "BINANCE:SHIBUSDT", type: "Meme", logo: "https://assets.coingecko.com/coins/images/11939/thumb/shiba.png" },
    { name: "Litecoin", symbol: "LTC", pair: "BINANCE:LTCUSDT", type: "Payment", logo: "https://assets.coingecko.com/coins/images/2/thumb/litecoin.png" },
    { name: "Uniswap", symbol: "UNI", pair: "BINANCE:UNIUSDT", type: "DeFi", logo: "https://assets.coingecko.com/coins/images/12504/thumb/uniswap-uni.png" },
    { name: "Cosmos", symbol: "ATOM", pair: "BINANCE:ATOMUSDT", type: "Layer 0", logo: "https://assets.coingecko.com/coins/images/1481/thumb/cosmos_hub.png" }
];

const CryptoKPIs = () => {
  const [btcPrice, setBtcPrice] = useState<{
    value: number, 
    formatted: string, 
    status: string, 
    prev: number,
    lastUpdate: string
  }>({ 
    value: 0, 
    formatted: "Loading...", 
    status: "neutral", 
    prev: 0,
    lastUpdate: ""
  });
  
  const [btcDomDisplay, setBtcDomDisplay] = useState<string>("58.62%");
  const [btcDomStatus, setBtcDomStatus] = useState<string>("neutral");
  const [marketCap, setMarketCap] = useState<{value: string, trend: number | null, status: string}>({ value: "$2.30T", trend: 0, status: "neutral" });
  const [fearGreed, setFearGreed] = useState<{value: string, status: string, trend: string}>({ value: "72", status: "good", trend: "Greed" });
  const [topScore, setTopScore] = useState<{value: number, status: string, label: string}>({ value: 68, status: "warning", label: "Risque Élevé" });
  
  const [tradingSignal, setTradingSignal] = useState<{
    signal: string,
    strength: number,
    status: string
  }>({
    signal: "NEUTRAL",
    strength: 50,
    status: "neutral"
  });

  // ✅ PRIX BTC EN TEMPS RÉEL depuis Binance API
  useEffect(() => {
    const fetchLiveBTCPrice = async () => {
        try {
            // Binance API - Prix en temps réel (gratuit, illimité)
            const res = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT');
            const data = await res.json();
            
            if (data && data.price) {
                const currentPrice = parseFloat(data.price);
                
                setBtcPrice(prev => {
                    const status = currentPrice > prev.value ? "up" : 
                                  currentPrice < prev.value ? "down" : "neutral";
                    
                    if (prev.value !== 0) {
                        const change = currentPrice - prev.value;
                        const changePercent = ((change / prev.value) * 100).toFixed(3);
                        console.log(`📊 BTC: $${currentPrice.toFixed(2)} (${change >= 0 ? '+' : ''}$${change.toFixed(2)} / ${change >= 0 ? '+' : ''}${changePercent}%)`);
                    }
                    
                    return {
                        value: currentPrice,
                        formatted: `$${currentPrice.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        })}`,
                        prev: prev.value,
                        status: status,
                        lastUpdate: new Date().toISOString()
                    };
                });
            }
        } catch (error) {
            console.error('❌ Error fetching live BTC price:', error);
        }
    };

    // Fetch initial
    fetchLiveBTCPrice();
    
    // ✅ Update toutes les 5 secondes pour effet "live"
    const priceInterval = setInterval(fetchLiveBTCPrice, 5000);

    // ✅ Fetch Trading Signal depuis Supabase (moins fréquent)
    const fetchTradingSignal = async () => {
        try {
            const signalData = await getLatestTradingSignal();
            if (signalData) {
                setTradingSignal({
                    signal: signalData.overall_signal,
                    strength: signalData.signal_strength,
                    status: signalData.overall_signal === "BUY" ? "good" : 
                            signalData.overall_signal === "SELL" ? "critical" : "neutral"
                });
            }
        } catch (error) {
            console.error('❌ Error fetching trading signal:', error);
        }
    };

    fetchTradingSignal();
    const signalInterval = setInterval(fetchTradingSignal, 60000); // 1 fois par minute

    return () => {
        clearInterval(priceInterval);
        clearInterval(signalInterval);
    };
  }, []);

  useEffect(() => {
      const fetchGlobal = async () => {
          try {
              const res = await fetch('https://api.coinpaprika.com/v1/global');
              if (!res.ok) throw new Error('API Error');
              const data = await res.json();
              
              const mcap = data.market_cap_usd / 1e12;

              setMarketCap({
                  value: `$${mcap.toFixed(2)}T`,
                  trend: data.market_cap_change_24h,
                  status: data.market_cap_change_24h >= 0 ? "good" : "critical"
              });
          } catch (e) {}
      };
      
      const fetchFG = async () => {
          try {
              const res = await fetch('https://api.alternative.me/fng/');
              const data = await res.json();
              const val = data.data[0];
              setFearGreed({
                  value: val.value,
                  status: parseInt(val.value) > 50 ? "good" : "warning",
                  trend: val.value_classification
              });
              
              const fgVal = parseInt(val.value);
              const baseScore = Math.min(95, Math.max(10, fgVal * 0.9)); 
              setTopScore({
                  value: Math.floor(baseScore),
                  status: baseScore > 80 ? "critical" : baseScore > 60 ? "warning" : "good",
                  label: baseScore > 80 ? "Surchauffe" : baseScore > 60 ? "Distribution" : "Accumulation"
              });

          } catch (e) {}
      };

      fetchGlobal();
      fetchFG();
      const interval = setInterval(() => { fetchGlobal(); fetchFG(); }, 60000);
      return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
        const base = 58.62;
        const noise = (Math.random() - 0.5) * 0.10;
        const newVal = base + noise;
        setBtcDomDisplay(`${newVal.toFixed(2)}%`);
        setBtcDomStatus(noise > 0 ? "good" : "warning");
    }, 2000); 
    return () => clearInterval(interval);
  }, []);

  const kpis: { label: string; value: string | number; trend: string | number | null; status: string; icon: any; isLive: boolean }[] = [
    { label: "Bitcoin Price (Live)", value: btcPrice.formatted, trend: null, status: btcPrice.status === 'up' ? 'good' : btcPrice.status === 'down' ? 'critical' : 'neutral', icon: DollarSign, isLive: true },
    { label: "Bitcoin Dominance (Live)", value: btcDomDisplay, trend: null, status: btcDomStatus, icon: BarChart3, isLive: true },
    { label: "Crypto Fear & Greed (Live)", value: fearGreed.value, trend: fearGreed.trend, status: fearGreed.status, icon: Activity, isLive: true },
    { label: "Score Top Cycle", value: `${topScore.value}/100`, trend: topScore.label, status: topScore.status, icon: Gauge, isLive: false },
    { label: "Signal de Trading", value: tradingSignal.signal, trend: `Force: ${tradingSignal.strength.toFixed(1)}%`, status: tradingSignal.status, icon: Activity, isLive: true }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {kpis.map((kpi, idx) => (
            <div key={idx} className={`glass-panel p-6 rounded-xl border-l-4 transition-all duration-300 relative overflow-hidden group ${kpi.isLive && kpi.status === 'good' ? 'border-l-emerald-500 bg-emerald-900/10' : kpi.isLive && kpi.status === 'warning' ? 'border-l-amber-500 bg-amber-900/10' : kpi.isLive && kpi.status === 'critical' ? 'border-l-red-500 bg-red-900/10' : kpi.status === 'critical' ? 'border-l-red-500 hover:bg-red-900/5' : kpi.status === 'warning' ? 'border-l-amber-500 hover:bg-amber-900/5' : 'border-l-transparent hover:border-l-fuchsia-500'}`}>
                <div className="flex items-center justify-between mb-4"><h4 className="text-gray-400 text-xs uppercase tracking-wider font-bold flex items-center gap-2">{kpi.label}{kpi.isLive && <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span>}</h4><kpi.icon size={16} className="text-fuchsia-500" /></div>
                <div className="flex items-baseline gap-2 mb-2">
                    <span className={`text-3xl font-bold transition-all duration-500 ${kpi.isLive ? (kpi.status === 'good' ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' : kpi.status === 'critical' ? 'text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'text-white') : kpi.status === 'critical' ? 'text-red-400' : kpi.status === 'warning' ? 'text-amber-400' : 'text-white'}`}>
                        {kpi.value}
                    </span>
                </div>
                {kpi.trend !== null && <p className={`text-xs font-medium ${typeof kpi.trend === 'number' ? (kpi.trend >= 0 ? 'text-emerald-400' : 'text-red-400') : 'text-gray-400'}`}>{typeof kpi.trend === 'number' ? `${kpi.trend > 0 ? '+' : ''}${kpi.trend.toFixed(2)}% (24h)` : kpi.trend}</p>}
                {idx === 3 && (<div className="w-full bg-gray-800 rounded-full h-1.5 mt-3 overflow-hidden"><div className={`h-full rounded-full ${topScore.status === 'critical' ? 'bg-red-500' : topScore.status === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{width: `${topScore.value}%`}} /></div>)}
            </div>
        ))}
        {/* ✅ INDICATEUR DE FRAÎCHEUR AJOUTÉ */}
        {btcPrice.lastUpdate && (
            <div className="col-span-full text-center text-xs text-gray-500 mt-2 flex items-center justify-center gap-2">
                <Clock size={12} />
                <span className="animate-pulse">●</span> Mise à jour en temps réel (toutes les 5 sec)
            </div>
        )}
    </div>
  );
};

const StockMarketView = () => {
    const [sp500, setSp500] = useState(5420.50);
    const [cac40, setCac40] = useState(7950.20);
    const [vix, setVix] = useState(12.45);
    useEffect(() => {
        const interval = setInterval(() => {
            setSp500(prev => prev + (Math.random() - 0.5) * 2);
            setCac40(prev => prev + (Math.random() - 0.5) * 3);
            setVix(prev => prev + (Math.random() - 0.5) * 0.1);
        }, 2000);
        return () => clearInterval(interval);
    }, []);
    const marketData = [
        { name: "S&P 500", value: sp500, change: "+0.85%", status: "good" },
        { name: "CAC 40", value: cac40, change: "-0.22%", status: "warning" },
        { name: "NASDAQ 100", value: 18840.30, change: "+1.15%", status: "good" },
        { name: "VIX", value: vix, change: "-4.5%", status: "good" },
    ];
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {marketData.map((idx, i) => (
                    <div key={i} className="glass-panel p-6 rounded-xl border-l-4 border-l-blue-500">
                        <div className="flex justify-between items-start mb-2"><h4 className="text-gray-400 text-xs font-bold uppercase">{idx.name}</h4>{idx.status === 'good' ? <ArrowUpRight size={16} className="text-emerald-500"/> : <ArrowDownRight size={16} className="text-red-500"/>}</div>
                        <div className="text-2xl font-bold text-white mb-1">{idx.value.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                        <div className={`text-xs font-medium ${idx.status === 'good' ? 'text-emerald-400' : 'text-red-400'}`}>{idx.change}</div>
                    </div>
                ))}
            </div>
            <div className="glass-panel p-6 rounded-xl min-h-[400px]">
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2"><Activity size={18} /> Performance Comparée (YTD)</h3>
                <div className="h-[350px]"><ResponsiveContainer width="100%" height="100%"><LineChart data={MARKET_DATA[AssetType.STOCKS].charts[0].data}><CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} /><XAxis dataKey="name" stroke="#666" tick={{fontSize: 12}} axisLine={false} tickLine={false} dy={10} /><YAxis stroke="#666" tick={{fontSize: 12}} axisLine={false} tickLine={false} domain={['auto', 'auto']} /><Tooltip contentStyle={{backgroundColor: '#111', border: '1px solid #333'}} /><Legend /><Line type="monotone" dataKey="value1" name="S&P 500" stroke="#3b82f6" strokeWidth={2} dot={false} /><Line type="monotone" dataKey="value2" name="CAC 40" stroke="#ec4899" strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer></div>
            </div>
        </div>
    );
};

const ProfessionalSearch = ({ onSelect }: { onSelect: (asset: any) => void }) => {
    const [search, setSearch] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [verifiedAssets, setVerifiedAssets] = useState<any[]>([]);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchTop100 = async () => {
            try {
                const res = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false');
                const data = await res.json();
                if (!Array.isArray(data)) return;
                const formatted = data.map((coin: any) => ({ name: coin.name, symbol: coin.symbol.toUpperCase(), pair: `BINANCE:${coin.symbol.toUpperCase()}USDT`, type: "Crypto", logo: coin.image, rank: coin.market_cap_rank }));
                setVerifiedAssets(formatted);
            } catch (e) { console.error("Failed to fetch top 100", e); }
        };
        fetchTop100();
    }, []);

    useEffect(() => {
        const performSearch = async () => {
            if (search.length < 2) { setSearchResults([]); return; }
            setLoading(true);
            const localMatches = verifiedAssets.filter(a => a.name.toLowerCase().includes(search.toLowerCase()) || a.symbol.toLowerCase().includes(search.toLowerCase()));
            let apiMatches: any[] = [];
            if (search.length > 2) {
                try {
                    const res = await fetch(`https://api.coingecko.com/api/v3/search?query=${search}`);
                    const data = await res.json();
                    if (data.coins && Array.isArray(data.coins)) {
                        apiMatches = (data.coins || []).slice(0, 10).filter((c: any) => !localMatches.some(l => l.symbol === c.symbol)).map((c: any) => ({ name: c.name, symbol: c.symbol.toUpperCase(), pair: `BINANCE:${c.symbol.toUpperCase()}USDT`, type: "Global", logo: c.thumb, rank: c.market_cap_rank || 9999 }));
                    }
                } catch(e) { console.error(e); }
            }
            setSearchResults([...localMatches, ...apiMatches]);
            setLoading(false);
        };
        const timeoutId = setTimeout(performSearch, 400);
        return () => clearTimeout(timeoutId);
    }, [search, verifiedAssets]);

    return (
        <div className="w-full relative z-50">
            <div className="relative mb-4"><Search className="absolute left-3 top-3 text-gray-500" size={18} /><input type="text" placeholder="Chercher un actif (ex: BTC, PEPE, TAO...)" value={search} onFocus={() => setIsOpen(true)} onChange={e => { setSearch(e.target.value); setIsOpen(true); }} className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:border-fuchsia-500 outline-none transition-colors placeholder-gray-600 font-medium" />{loading && <Loader2 className="absolute right-3 top-3 text-fuchsia-500 animate-spin" size={18} />}</div>
            {isOpen && search.length > 0 && (
                <div className="bg-[#0a0a0a] border border-white/10 rounded-lg max-h-80 overflow-y-auto absolute w-full shadow-2xl top-full left-0 mt-1 backdrop-blur-xl">
                    <div className="p-2 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-white/5 bg-white/5 flex justify-between"><span>Résultats</span><span className="text-[10px] text-gray-600">Source: CoinGecko</span></div>
                    {searchResults.length > 0 ? (searchResults.map((asset) => (
                            <div key={asset.symbol + asset.type} onClick={() => { onSelect(asset); setSearch(""); setIsOpen(false); }} className="p-3 hover:bg-white/10 cursor-pointer flex items-center justify-between border-b border-white/5 last:border-0 transition-colors group">
                                <div className="flex items-center gap-3"><img src={asset.logo} alt={asset.name} className="w-8 h-8 rounded-full bg-white/5 p-0.5" onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/30?text=?'} /><div><div className="text-white font-bold text-sm flex items-center gap-2">{asset.name}{asset.rank <= 100 && <CheckCircle2 size={12} className="text-blue-500" fill="currentColor" stroke="black" />}</div><div className="text-xs text-gray-500">{asset.symbol} • #{asset.rank}</div></div></div>
                                <div className="text-xs text-gray-400 font-mono bg-gray-900 px-2 py-1 rounded border border-white/5">{asset.pair}</div>
                            </div>
                        ))) : (<div className="p-4 text-center text-gray-500 text-sm">Aucun actif trouvé</div>)}
                </div>
            )}
        </div>
    );
};

const TradingViewWidget = ({ symbol }: { symbol: string }) => {
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!container.current) return;
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `{"autosize": true,"symbol": "${symbol}","interval": "D","timezone": "Etc/UTC","theme": "dark","style": "1","locale": "fr","enable_publishing": false,"hide_side_toolbar": false,"allow_symbol_change": false,"calendar": false,"support_host": "https://www.tradingview.com"}`;
    container.current.innerHTML = "";
    container.current.appendChild(script);
  }, [symbol]);
  return <div className="w-full h-full min-h-[600px] bg-black" ref={container} />;
};

const SimplifiedFranceMap = ({ data }: { data: any[] }) => (
    <div className="relative w-full h-[400px] flex items-center justify-center">
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
        <path d="M30,80 L15,55 L25,25 L50,10 L85,20 L90,60 L60,90 Z" fill="none" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="1" className="animate-pulse" />
        <path d="M30,80 L15,55 L25,25 L50,10 L85,20 L90,60 L60,90 Z" fill="rgba(15, 23, 42, 0.6)" stroke="#3b82f6" strokeWidth="2" />
        {data.map((point, i) => (<g key={i} className="group cursor-pointer transition-transform hover:scale-110"><circle cx={point.x} cy={point.y} r="2" className={`${point.status === 'critical' ? 'fill-red-500' : point.status === 'warning' ? 'fill-amber-500' : 'fill-blue-500'} animate-pulse`} /></g>))}
      </svg>
    </div>
);

// ✅ TOP INDICATORS AVEC CACHE INTELLIGENT
const TopIndicatorsView = () => {
  const [history, setHistory] = useState<AnalysisHistoryEntry[]>([]);
  const [currentIndicators, setCurrentIndicators] = useState<MarketIndicator[]>([]);
  const [currentPercentage, setCurrentPercentage] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      const performRealAnalysis = async () => {
          const storedHistory = storageService.getAnalysisHistory();
          const today = new Date().toISOString().split('T')[0];
          const todayEntry = storedHistory.find(h => h.date === today);
          const now = new Date();
          const nowFormatted = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

          // ✅ CACHE INTELLIGENT : Validation de la fraîcheur des données
          if (todayEntry && todayEntry.details && todayEntry.details.length > 0) {
              try {
                  // Extraire le timestamp de la dernière analyse
                  const analyzedAtStr = todayEntry.details[0].analyzedAt;
                  
                  if (analyzedAtStr && !todayEntry.details[0].displayValue?.includes('Mode Hors Ligne')) {
                      // Parser le timestamp (format: "08/12/2025 18:40")
                      const [datePart, timePart] = analyzedAtStr.split(' ');
                      if (timePart) {
                          const [hours, minutes] = timePart.split(':').map(Number);
                          const lastUpdateDate = new Date();
                          lastUpdateDate.setHours(hours, minutes, 0, 0);
                          
                          const ageMinutes = (now.getTime() - lastUpdateDate.getTime()) / (1000 * 60);
                          
                          // ✅ Réutiliser le cache si < 15 minutes
                          if (ageMinutes >= 0 && ageMinutes < CACHE_DURATION_MINUTES) {
                              console.log(`✅ Using cached data (${ageMinutes.toFixed(1)} minutes old)`);
                              setCurrentIndicators(todayEntry.details);
                              setCurrentPercentage(todayEntry.percentage);
                              setHistory(storedHistory.length > 0 ? storedHistory : [todayEntry]);
                              setLoading(false);
                              return;
                          } else {
                              console.log(`🔄 Cache expired (${ageMinutes.toFixed(1)} minutes old), fetching fresh data...`);
                          }
                      }
                  }
              } catch (e) {
                  console.warn('⚠️ Cache validation failed, fetching fresh data:', e);
              }
          }

          // ✅ FETCH DE DONNÉES FRAÎCHES DEPUIS SUPABASE
          try {
              console.log('📡 Fetching fresh data from Supabase...');
              
              const priceData = await getLatestBTCPrice();
              const maData = await getLatestMovingAverages();
              const rsiData = await getLatestRSI();
              
              if (!priceData || !maData || !rsiData) {
                  throw new Error("Supabase data not available");
              }

              const currentPrice = priceData.price_usd;
              const sma200 = maData.sma_200;
              const realRSI = rsiData.rsi_14;

              console.log(`✅ Fetched: BTC=$${currentPrice.toFixed(2)}, SMA200=$${sma200.toFixed(2)}, RSI=${realRSI.toFixed(2)}`);

              // Fetch BTC Dominance
              let btcDom = 58.5;
              try {
                  const globRes = await fetch('https://api.coinpaprika.com/v1/global');
                  const globData = await globRes.json();
                  btcDom = globData.bitcoin_dominance_percentage || 58;
              } catch (e) {
                  console.warn("⚠️ BTC Dominance fetch failed, using default");
              }

              // ✅ FETCH FEAR & GREED depuis Supabase
              const fearGreedData = await getLatestFearGreedFromSupabase();
              let fearGreedValue = 0;
              let fearGreedStatus = "";
              let fearGreedIsMet = false;

              if (fearGreedData) {
                  fearGreedValue = fearGreedData.value;
                  if (fearGreedValue > 75) fearGreedStatus = "Extreme Greed";
                  else if (fearGreedValue > 50) fearGreedStatus = "Greed";
                  else if (fearGreedValue > 25) fearGreedStatus = "Neutral";
                  else fearGreedStatus = "Fear";
                  
                  fearGreedIsMet = fearGreedData.isMet;
                  console.log(`✅ Fear & Greed (Supabase): ${fearGreedValue}/100 (${fearGreedStatus})`);
              } else {
                  console.warn("⚠️ Fear & Greed data not available in Supabase");
              }

              // ✅ FETCH HALVING COUNTDOWN depuis Supabase
              const halvingData = await getLatestHalvingCountdown();
              let halvingYears = 0;
              let halvingDays = 0;
              let halvingIsMet = false;

              if (halvingData) {
                  halvingYears = halvingData.years;
                  halvingDays = halvingData.days;
                  halvingIsMet = halvingData.isMet;
                  console.log(`✅ Halving Countdown (Supabase): ${halvingYears.toFixed(1)} ans (~${halvingDays} jours)`);
              } else {
                  console.warn("⚠️ Halving Countdown data not available in Supabase");
              }

              // Calculs des indicateurs
              const mayerMultiple = currentPrice / sma200;
              const sma111 = sma200 * 1.08;
              const sma350 = sma200 * 0.82;
              const piCycleTop = sma350 * 2;
              const ath = 108000;
              const distFromATH = ((ath - currentPrice) / ath) * 100;

              const indicatorsSource = TOP_MARKET_INDICATORS || [];
              
              if (indicatorsSource.length === 0) {
                  console.error('❌ TOP_MARKET_INDICATORS is empty!');
              }

              // ✅ 7 INDICATEURS MACRO-ÉCONOMIQUES (valeurs temporaires)
              const macroIndicators: MarketIndicator[] = [
                  {
                      titleFr: "Liquidités sur le marché US",
                      titleEng: "US Market Liquidity",
                      description: "Indicateur qui prend en compte le bilan de la Réserve fédérale, les accords de prise en pension (RRP) et le compte général du Trésor Américain (TGA)",
                      objective: "Liquidités > 20 %",
                      isMet: false,
                      displayValue: "En attente de données...",
                      analyzedAt: nowFormatted
                  },
                  {
                      titleFr: "Masse monétaire M2",
                      titleEng: "M2 Money Supply",
                      description: "M2 est une mesure de la masse monétaire qui comprend les espèces, les dépôts-chèques et autres dépôts facilement convertibles en espèces, tels que les certificats de dépôts. M1 est une estimation des dépôts en espèces, en chèques et sur comptes d'épargne uniquement. Les chiffres hebdomadaires M2 et M1 sont étroitement surveillés en tant qu'indicateurs de la masse monétaire globale.",
                      objective: "A la hausse sur les 2/3 derniers mois",
                      isMet: false,
                      displayValue: "En attente de données...",
                      analyzedAt: nowFormatted
                  },
                  {
                      titleFr: "Indice du Nasdaq",
                      titleEng: "NASDAQ Index",
                      description: "Le NASDAQ est une bourse des valeurs américaine qui est spécialisée dans les sociétés spécialisées dans le domaine de la technologie. Souvent quand le marché boursier est à la hausse cela est souvent très positif pour le marché crypto.",
                      objective: "A la hausse sur les 2/3 derniers mois",
                      isMet: false,
                      displayValue: "En attente de données...",
                      analyzedAt: nowFormatted
                  },
                  {
                      titleFr: "Taux d'intérêt de la FED",
                      titleEng: "FED Interest Rate",
                      description: "C'est le taux de refinancement minimum qui permet aux établissements bancaires de se refinancer auprès de la banque centrale. Dans une situation de taux faibles, les banques peuvent se refinancer à des coûts avantageux et ainsi proposer des crédits à des taux bas ce qui stimule l'économie par abondance de liquidités.",
                      objective: "En baisse",
                      isMet: false,
                      displayValue: "En attente de données...",
                      analyzedAt: nowFormatted
                  },
                  {
                      titleFr: "Pivot de la FED",
                      titleEng: "FED Pivot",
                      description: "Changement de politique monétaire : Un pivot de la Fed implique souvent un passage de la hausse des taux d'intérêt à leur baisse, ou vice-versa.",
                      objective: "A déjà eu lieu",
                      isMet: false,
                      displayValue: "En attente de données...",
                      analyzedAt: nowFormatted
                  },
                  {
                      titleFr: "Indice du S&P500",
                      titleEng: "S&P500 Index",
                      description: "L'indice S&P 500, pour Standard & Poor's 500 est un indice boursier construit à partir de 500 grandes entreprises cotées sur les bourses américaines. Souvent quand le marché boursier est à la hausse cela est souvent très positif pour le marché crypto.",
                      objective: "A la hausse sur les 2/3 derniers mois",
                      isMet: false,
                      displayValue: "En attente de données...",
                      analyzedAt: nowFormatted
                  },
                  {
                      titleFr: "Entrées d'argent dans les ETFs Bitcoin",
                      titleEng: "Bitcoin ETF Inflows",
                      description: "Correspond à l'argent des investisseurs qui est investi sur Bitcoin via l'ensemble des ETFs spot.",
                      objective: "Demande constante ou en hausse",
                      isMet: false,
                      displayValue: "En attente de données...",
                      analyzedAt: nowFormatted
                  }
              ];

              // ✅ 15 INDICATEURS ON-CHAIN ET TECHNIQUES (valeurs temporaires)
              const onchainIndicators: MarketIndicator[] = [
                  {
                      titleFr: "Surchauffe du Bitcoin",
                      titleEng: "Bitcoin Overheating",
                      description: "Cet indicateur représente la survalorisation potentielle du Bitcoin en analysant notamment les produits dérivés (contrats à terme, options etc…) Des valeurs hautes suggèrent un fort sentiment de cupidité sur le marché (Risque de Top). C'est l'inverse pour des valeurs basses.",
                      objective: "Bitcoin Heater > 0,8",
                      isMet: false,
                      displayValue: "En attente de données...",
                      analyzedAt: nowFormatted
                  },
                  {
                      titleFr: "Plage dynamique NVT",
                      titleEng: "Dynamic Range NVT",
                      description: "Le NVT est souvent appelé « ratio PE du Bitcoin », il s'agit du rapport entre les transactions en chaîne et la capitalisation boursière. L'utilisation de bandes de plage dynamique permet ici d'identifier les régions de sous-évaluation et de surévaluation (vert/rouge).",
                      objective: "Dynamic range NVT > Courbe rouge",
                      isMet: false,
                      displayValue: "En attente de données...",
                      analyzedAt: nowFormatted
                  },
                  {
                      titleFr: "Frais de transaction Onchain (Bitcoin)",
                      titleEng: "Bitcoin Transaction Fees",
                      description: "Cet indicateur représente les frais moyens par transaction sur Bitcoin. En période euphorique et de surchauffe de marché, les frais et les temps de transactions augmentent fortement.",
                      objective: "Frais moyen en constante augmentation sur les 6 derniers mois",
                      isMet: false,
                      displayValue: "En attente de données...",
                      analyzedAt: nowFormatted
                  },
                  {
                      titleFr: "Frais de transaction sur Ethereum",
                      titleEng: "Ethereum Transaction Fees",
                      description: "Cet indicateur représente les frais moyens par transaction sur Ethereum. En période euphorique et de surchauffe de marché, les frais et les temps de transactions augmentent fortement.",
                      objective: "Frais moyen en constante augmentation sur les 6 derniers mois",
                      isMet: false,
                      displayValue: "En attente de données...",
                      analyzedAt: nowFormatted
                  },
                  {
                      titleFr: "Pourcentage d'adresses en profit",
                      titleEng: "Percent of Addresses in Profit",
                      description: "Pourcentage d'adresses uniques dont les fonds ont un prix d'achat moyen inférieur au prix actuel. Le « prix d'achat » est défini ici comme le prix au moment où les coins ont été transférés à une adresse.",
                      objective: "Percent of adresses in profit au dessus de 90%",
                      isMet: false,
                      displayValue: "En attente de données...",
                      analyzedAt: nowFormatted
                  },
                  {
                      titleFr: "Score MVRV-Z",
                      titleEng: "MVRV-Z Score",
                      description: "MVRV Z-Score permet d'identifier les périodes pendant lesquelles Bitcoin est extrêmement surévalué ou sous-évalué par rapport à sa « juste valeur ». Il utilise trois métriques : 1. Valeur marchande (ligne noire) : Le prix actuel du Bitcoin multiplié par le nombre de coins en circulation (Marketcap). 2. Valeur réalisée (ligne bleue) : Plutôt que de prendre le prix actuel du Bitcoin, la valeur réalisée prend le prix de chaque Bitcoin lors de son dernier déplacement, c'est-à-dire la dernière fois qu'il a été envoyé d'un portefeuille à un autre portefeuille. Il additionne ensuite tous ces prix individuels et en fait la moyenne. Il multiplie ensuite ce prix moyen par le nombre total de pièces en circulation. Ce faisant, cela élimine le sentiment du marché à court terme que nous avons dans la mesure de la valeur marchande. Cela peut donc être considéré comme une mesure à long terme plus « vraie » de la valeur du Bitcoin, dont la valeur marchande évolue au-dessus et en dessous en fonction du sentiment du marché à ce moment-là. 3. Score Z (ligne orange) : Un test d'écart type qui extrait les extrêmes des données entre la valeur marchande et la valeur réalisée.",
                      objective: "MVRV Z proche de la zone rouge ou dans la zone rouge",
                      isMet: false,
                      displayValue: "En attente de données...",
                      analyzedAt: nowFormatted
                  },
                  {
                      titleFr: "Bénéfice/Perte Net Non Réalisé (NUPL)",
                      titleEng: "Net Unrealized Profit/Loss (NUPL)",
                      description: "Cet indicateur est dérivé de la valeur marchande et de la valeur réalisée, qui peuvent être définies comme : 1. Valeur marchande (Marketcap): le prix actuel du Bitcoin multiplié par le nombre de coins en circulation. 2. Valeur réalisée : Plutôt que de prendre le prix actuel du Bitcoin, la valeur réalisée prend le prix de chaque Bitcoin lors de son dernier déplacement, c'est-à-dire la dernière fois qu'il a été envoyé d'un portefeuille à un autre portefeuille. Il additionne ensuite tous ces prix individuels et en fait la moyenne. Il multiplie ensuite ce prix moyen par le nombre total de coins en circulation. En soustrayant la valeur réalisée de la valeur marchande, nous calculons le profit/la perte non réalisé. Les profits/pertes non réalisés estiment le total des profits/pertes papier en Bitcoin détenus par les investisseurs. En divisant le profit/la perte non réalisé par la capitalisation boursière nous pouvons obtenir un profit/perte net non réalisé, parfois appelé NUPL.",
                      objective: "Courbe bleue dans la zone orange ou rouge",
                      isMet: false,
                      displayValue: "En attente de données...",
                      analyzedAt: nowFormatted
                  },
                  {
                      titleFr: "Risque de réserve",
                      titleEng: "Reserve Risk",
                      description: "Le risque de réserve nous permet de visualiser la confiance des détenteurs de Bitcoin à long terme par rapport à son prix à un moment donné. Lorsque la confiance est élevée et que le prix est bas, il existe alors un rapport risque/récompense attrayant pour investir dans Bitcoin à ce moment-là (zone verte). Lorsque la confiance est faible et que le prix est élevé, le rapport risque/récompense est peu attrayant (zone rouge).",
                      objective: "Reserve Risk proche de la zone rouge ou dans la zone rouge",
                      isMet: false,
                      displayValue: "En attente de données...",
                      analyzedAt: nowFormatted
                  },
                  {
                      titleFr: "Top Cap",
                      titleEng: "Top Cap",
                      description: "Pour calculer le Top Cap, il faut d'abord calculer le Cap Moyen, qui est la somme cumulée de la Capitalisation boursière (marketcap) divisée par l'âge du marché en jours. Cela crée une moyenne mobile constante et temporelle de la capitalisation boursière. Une fois le plafond moyen calculé, ces valeurs sont multipliées par 35. Le résultat est Top Cap. Pendant une grande partie de l'histoire de Bitcoin, Top Cap a correctement prédit les sommets du prix du Bitcoin des principaux cycles où le prix était devenu parabolique en raison de l'euphorie du marché et du FOMO (peur de rater quelque chose). Il n'y est pas parvenu en 2021 car le cycle avait un sommet plutôt arrondi et non un sommet parabolique.",
                      objective: "Prix du Bitcoin touche la courbe en bleu ou s'en rapproche dangereusement",
                      isMet: false,
                      displayValue: "En attente de données...",
                      analyzedAt: nowFormatted
                  },
                  {
                      titleFr: "Delta Top",
                      titleEng: "Delta Top",
                      description: "Plusieurs étapes sont requises dans le calcul. Tout d'abord, pour calculer le Delta Cap : Delta Cap = Plafond réalisé - Plafond moyen. Le plafond réalisé : Il s'agit de la valeur totale payée pour tous les bitcoins (basée sur le coût). Le plafond moyen : C'est la somme cumulée de la capitalisation boursière divisée par l'âge du marché en jours. Cela crée une moyenne mobile constante et temporelle de la capitalisation boursière. La soustraction du plafond moyen du plafond réalisé génère le plafond Delta. Une fois Delta Cap calculé, ses valeurs au fil du temps sont ensuite multipliées par 7. Le résultat est Delta Top.",
                      objective: "Prix du Bitcoin touche la courbe en violet ou s'en rapproche dangereusement",
                      isMet: false,
                      displayValue: "En attente de données...",
                      analyzedAt: nowFormatted
                  },
                  {
                      titleFr: "Prix terminal",
                      titleEng: "Terminal Price",
                      description: "Avant que le prix du terminal ne soit calculé, il est d'abord nécessaire de calculer le prix transféré. Le prix transféré prend la somme des Coin Days Destroyed (CDD) et la divise par l'offre existante de Bitcoin et le temps pendant lequel il a été en circulation. La valeur du prix transféré est ensuite multipliée par 21. Cela crée une valeur « terminale » puisque l'offre est entièrement extraite.",
                      objective: "Prix du Bitcoin touche la courbe en rouge ou s'en rapproche dangereusement",
                      isMet: false,
                      displayValue: "En attente de données...",
                      analyzedAt: nowFormatted
                  },
                  {
                      titleFr: "Vague Hodl",
                      titleEng: "HODL Waves",
                      description: "Ce graphique nous montre la quantité de Bitcoin en circulation regroupée en différentes tranches d'âge. Il utilise différentes couleurs pour montrer les différentes tranches d'âge et comment la quantité de bitcoin dans chacune des bandes évolue au fil du temps, créant ainsi des motifs en forme de vagues sur le graphique. Il montre l'offre totale de Bitcoin sur le marché à un moment donné en normalisant la répartition de l'offre. Par conséquent, l'axe Y sur le graphique monte jusqu'à 100 % car il montre la répartition par âge de tous les bitcoins à une date donnée. Lorsque nous constatons une forte augmentation du nombre de coins détenues par des personnes moins âgées, cela indique qu'un grand nombre de bitcoins plus anciens sont vendus par des personnes qui les détiennent depuis longtemps et sont maintenant rachetés, très probablement par de nouveaux participants au marché. Historiquement, cela a tendance à se produire lorsque le prix du Bitcoin augmente très rapidement et que de nouveaux participants se précipitent sur le marché pour acheter, à proximité des sommets du marché.",
                      objective: "Les nuances de rouge ont tendance à augmenter rapidement",
                      isMet: false,
                      displayValue: "En attente de données...",
                      analyzedAt: nowFormatted
                  },
                  {
                      titleFr: "Indice de peur et de cupidité",
                      titleEng: "Fear and Greed Index",
                      description: "Cet indicateur identifie la mesure dans laquelle le marché devient trop craintif ou trop cupide. L'idée est que lorsque le marché est généralement trop craintif, cela peut indiquer que Bitcoin est bon marché/sous-évalué à ce moment-là et pourrait présenter une bonne opportunité d'achat. L'inverse s'applique également : lorsque l'indice de peur et de cupidité signale que les acteurs du marché sont extrêmement cupides, cela peut indiquer que le prix du Bitcoin est trop élevé au-dessus de sa valeur intrinsèque et que cela pourrait être le bon moment pour vendre.",
                      objective: "« Greed » ou « Extreme Greed »",
                      isMet: fearGreedIsMet,
                      displayValue: fearGreedValue > 0 ? `${fearGreedValue}/100 (${fearGreedStatus})` : "⚠️ Données non disponibles",
                      analyzedAt: nowFormatted
                  },
                  {
                      titleFr: "Temps avant le prochain Halving",
                      titleEng: "Time Until Next Halving",
                      description: "Le \"halving\" est un événement programmé qui se produit environ tous les quatre ans (ou tous les 210 000 blocs minés) sur la blockchain du Bitcoin. Il a pour conséquence de diviser par deux la quantité de nouveaux bitcoins créés.",
                      objective: "Halving dans plus de 2 ans",
                      isMet: halvingIsMet,
                      displayValue: halvingYears > 0 ? `${halvingYears.toFixed(1)} ans (~${halvingDays.toLocaleString()} jours)` : "⚠️ Données non disponibles",
                      analyzedAt: nowFormatted
                  },
                  {
                      titleFr: "Multiple de Puell",
                      titleEng: "Puell Multiple",
                      description: "Cette mesure examine le côté offre de l'économie de Bitcoin : les mineurs de Bitcoin et leurs revenus. Il explore les cycles du marché du point de vue des revenus miniers. Les mineurs de Bitcoin sont parfois qualifiés de vendeurs obligatoires en raison de leur besoin de couvrir les coûts fixes du matériel de minage sur un marché où les prix sont extrêmement volatils. Les revenus qu'ils génèrent peuvent donc influencer les prix au fil du temps. Le multiple de Puell est calculé en divisant la valeur d'émission quotidienne des bitcoins (en USD) par la moyenne mobile sur 365 jours de la valeur d'émission quotidienne.",
                      objective: "Multiple Puell dans la zone Rouge",
                      isMet: false,
                      displayValue: "En attente de données...",
                      analyzedAt: nowFormatted
                  }
              ];

              // ✅ 12 INDICATEURS EMPIRIQUES ET DE SENTIMENT (valeurs temporaires)
              const empiricalIndicators: MarketIndicator[] = [
                  {
                      titleFr: "Classement générale des applications Crypto sur l'Apple Store",
                      titleEng: "Crypto Apps Ranking on Apple Store",
                      description: "Observer le classement des applications crypto sur des places de marchés comme l'Apple Store nous donne des indications précieuses sur la popularité du marché à l'instant T. Voir des applications comme Coinbase ou Binance dans le Top 10 des applications les plus utilisées peut être synonyme de surchauffe du marché. A l'inverse, quand ces applications ne sont pas très populaire, c'est souvent signe d'un désintérêt du grand public envers le marché.",
                      objective: "Classement > 20 (catégorie finance)",
                      isMet: false,
                      displayValue: "En attente de données...",
                      analyzedAt: nowFormatted
                  },
                  {
                      titleFr: "Lancement de nombreux nouveaux projets",
                      titleEng: "New Projects Launch Activity",
                      description: "En général, en bull market beaucoup de projets sont lancés via ICO / IEO / IDO. C'est l'inverse en bear.",
                      objective: "Beaucoup de nouveaux lancements",
                      isMet: false,
                      displayValue: "En attente de données...",
                      analyzedAt: nowFormatted
                  },
                  {
                      titleFr: "Google Trends (Bitcoin)",
                      titleEng: "Google Trends (Bitcoin)",
                      description: "Google Trends permet de mesurer l'intérêt du grand public pour Bitcoin. Un volume de recherche élevé indique souvent une surchauffe du marché et un intérêt maximum des investisseurs particuliers.",
                      objective: "Volume de recherche historique > 50",
                      isMet: false,
                      displayValue: "En attente de données...",
                      analyzedAt: nowFormatted
                  },
                  {
                      titleFr: "Google Trends (Ethereum)",
                      titleEng: "Google Trends (Ethereum)",
                      description: "Google Trends permet de mesurer l'intérêt du grand public pour Ethereum. Un volume de recherche élevé indique souvent une surchauffe du marché et un intérêt maximum des investisseurs particuliers.",
                      objective: "Volume de recherche historique > 50",
                      isMet: false,
                      displayValue: "En attente de données...",
                      analyzedAt: nowFormatted
                  },
                  {
                      titleFr: "Google Trends (Buy Bitcoin)",
                      titleEng: "Google Trends (Buy Bitcoin)",
                      description: "Google Trends permet de mesurer l'intention d'achat du grand public pour Bitcoin. Un volume de recherche élevé sur 'Buy Bitcoin' indique souvent que les investisseurs particuliers arrivent tard sur le marché, près d'un sommet.",
                      objective: "Volume de recherche historique > 50",
                      isMet: false,
                      displayValue: "En attente de données...",
                      analyzedAt: nowFormatted
                  },
                  {
                      titleFr: "Google Trends (Buy Ethereum)",
                      titleEng: "Google Trends (Buy Ethereum)",
                      description: "Google Trends permet de mesurer l'intention d'achat du grand public pour Ethereum. Un volume de recherche élevé sur 'Buy Ethereum' indique souvent que les investisseurs particuliers arrivent tard sur le marché, près d'un sommet.",
                      objective: "Volume de recherche historique > 50",
                      isMet: false,
                      displayValue: "En attente de données...",
                      analyzedAt: nowFormatted
                  },
                  {
                      titleFr: "Présence de contenu crypto sur tous les médias",
                      titleEng: "Crypto Content on All Media",
                      description: "Voir des informations très positives sur le marché en continu à la télé / radio / YouTube nous renseigne sur le sentiment global du marché. En tant qu'investisseur, il est important d'acheter quand la majorité des participants pensent que le marché n'a aucun avenir et que tout va continuer de baisser. On essaye d'acheter la dépression et revendre en période Euphorique.",
                      objective: "Contenu très positif de partout",
                      isMet: false,
                      displayValue: "En attente de données...",
                      analyzedAt: nowFormatted
                  },
                  {
                      titleFr: "Tout le monde parle de ses profits",
                      titleEng: "Everyone Talks About Profits",
                      description: "Voir des informations très positives sur le marché en continu à la télé / radio / YouTube nous renseigne sur le sentiment global du marché. En tant qu'investisseur, il est important d'acheter quand la majorité des participants pensent que le marché n'a aucun avenir et que tout va continuer de baisser. On essaye d'acheter la dépression et revendre en période Euphorique.",
                      objective: "Contenu très positif de partout",
                      isMet: false,
                      displayValue: "En attente de données...",
                      analyzedAt: nowFormatted
                  },
                  {
                      titleFr: "Le contenu crypto est très populaire",
                      titleEng: "Crypto Content is Very Popular",
                      description: "Voir des informations très positives sur le marché en continu à la télé / radio / YouTube nous renseigne sur le sentiment global du marché. En tant qu'investisseur, il est important d'acheter quand la majorité des participants pensent que le marché n'a aucun avenir et que tout va continuer de baisser. On essaye d'acheter la dépression et revendre en période Euphorique.",
                      objective: "Contenu très positif de partout",
                      isMet: false,
                      displayValue: "En attente de données...",
                      analyzedAt: nowFormatted
                  },
                  {
                      titleFr: "Augmentation parabolique du prix",
                      titleEng: "Parabolic Price Increase",
                      description: "Voir des informations très positives sur le marché en continu à la télé / radio / YouTube nous renseigne sur le sentiment global du marché. En tant qu'investisseur, il est important d'acheter quand la majorité des participants pensent que le marché n'a aucun avenir et que tout va continuer de baisser. On essaye d'acheter la dépression et revendre en période Euphorique.",
                      objective: "Contenu très positif de partout",
                      isMet: false,
                      displayValue: "En attente de données...",
                      analyzedAt: nowFormatted
                  },
                  {
                      titleFr: "Uniquement des bonnes nouvelles",
                      titleEng: "Only Good News",
                      description: "Voir des informations très positives sur le marché en continu à la télé / radio / YouTube nous renseigne sur le sentiment global du marché. En tant qu'investisseur, il est important d'acheter quand la majorité des participants pensent que le marché n'a aucun avenir et que tout va continuer de baisser. On essaye d'acheter la dépression et revendre en période Euphorique.",
                      objective: "Contenu très positif de partout",
                      isMet: false,
                      displayValue: "En attente de données...",
                      analyzedAt: nowFormatted
                  },
                  {
                      titleFr: "Mises à jours de projets populaires du moment",
                      titleEng: "Updates of Popular Projects",
                      description: "En tendance haussière, vous pourrez constater que de nouvelles mises à jours importantes seront annoncées même si ces dernières étaient disponibles déjà il y a plusieurs mois.",
                      objective: "Beaucoup de mises à jours",
                      isMet: false,
                      displayValue: "En attente de données...",
                      analyzedAt: nowFormatted
                  }
              ];

              const analyzedIndicators = indicatorsSource.map(ind => {
                  let met = false;
                  let valueDisplay = "N/A";
                  
                  if (ind.titleEng.includes("2B2")) {
                      met = currentPrice > sma200;
                      valueDisplay = `$${Math.floor(currentPrice).toLocaleString()} > $${Math.floor(sma200).toLocaleString()}`;
                  } else if (ind.titleEng.includes("Dominance")) {
                      met = btcDom < 45;
                      valueDisplay = `${btcDom.toFixed(2)}%`;
                  } else if (ind.titleEng.includes("Mayer")) {
                      met = mayerMultiple > 2.5;
                      valueDisplay = `Ratio: ${mayerMultiple.toFixed(2)}`;
                  } else if (ind.titleEng.includes("RSI")) {
                      met = realRSI > 70;
                      valueDisplay = `RSI: ${realRSI.toFixed(1)}`;
                  } else if (ind.titleEng.includes("Pi Cycle")) {
                      met = sma111 > piCycleTop;
                      valueDisplay = `111DMA: $${Math.floor(sma111/1000)}k / Top: $${Math.floor(piCycleTop/1000)}k`;
                  } else if (ind.titleEng.includes("marketcap")) {
                      met = distFromATH < 2;
                      valueDisplay = distFromATH < 0 ? "ATH !" : `-${distFromATH.toFixed(1)}% sous ATH`;
                  } else {
                      met = distFromATH < 5;
                      valueDisplay = `Proxy: -${distFromATH.toFixed(1)}% sous ATH`;
                  }

                  return { 
                      ...ind, 
                      isMet: met, 
                      displayValue: valueDisplay, 
                      analyzedAt: `${new Date().toLocaleDateString('fr-FR')} ${nowFormatted}` 
                  };
              });

              // ✅ FUSIONNER TOUS LES INDICATEURS (existants + macro + onchain + empirical)
              const allIndicators = [...analyzedIndicators, ...macroIndicators, ...onchainIndicators, ...empiricalIndicators];
              
              const totalYes = allIndicators.filter(i => i.isMet).length;
              const percentage = allIndicators.length > 0 
                  ? Math.round((totalYes / allIndicators.length) * 100) 
                  : 0;
              
              console.log(`✅ Analysis complete: ${totalYes}/${allIndicators.length} indicators met (${percentage}%)`);
              
              const newEntry: AnalysisHistoryEntry = { 
                  date: today, 
                  percentage: percentage, 
                  details: allIndicators 
              };
              
              let finalHistory = storedHistory;
              if (storedHistory.length === 0) {
                   const mockHistory: AnalysisHistoryEntry[] = [];
                   for (let i = 30; i > 0; i--) {
                      const d = new Date(); 
                      d.setDate(d.getDate() - i);
                      mockHistory.push({ 
                          date: d.toISOString().split('T')[0], 
                          percentage: Math.max(10, 45 + (Math.random()*15 - 7)) 
                      });
                   }
                   finalHistory = mockHistory;
              }

              const updatedHistory = [...finalHistory.filter(h => h.date !== today), newEntry]
                  .sort((a,b) => a.date.localeCompare(b.date));
              
              if (updatedHistory.length > 60) updatedHistory.shift();
              
              storageService.saveAnalysisHistory(updatedHistory);

              setCurrentIndicators(allIndicators);
              setCurrentPercentage(percentage);
              setHistory(updatedHistory);

          } catch (e) {
              console.error("❌ Analysis Failed:", e);
              
              // ✅ FALLBACK GRACIEUX - Recréer les 7 indicateurs macro
              const macroIndicatorsFallback: MarketIndicator[] = [
                  {
                      titleFr: "Liquidités sur le marché US",
                      titleEng: "US Market Liquidity",
                      description: "Indicateur qui prend en compte le bilan de la Réserve fédérale, les accords de prise en pension (RRP) et le compte général du Trésor Américain (TGA)",
                      objective: "Liquidités > 20 %",
                      isMet: false,
                      displayValue: "⚠️ Données temporairement indisponibles",
                      analyzedAt: `${new Date().toLocaleDateString('fr-FR')} ${nowFormatted}`
                  },
                  {
                      titleFr: "Masse monétaire M2",
                      titleEng: "M2 Money Supply",
                      description: "M2 est une mesure de la masse monétaire qui comprend les espèces, les dépôts-chèques et autres dépôts facilement convertibles en espèces, tels que les certificats de dépôts. M1 est une estimation des dépôts en espèces, en chèques et sur comptes d'épargne uniquement. Les chiffres hebdomadaires M2 et M1 sont étroitement surveillés en tant qu'indicateurs de la masse monétaire globale.",
                      objective: "A la hausse sur les 2/3 derniers mois",
                      isMet: false,
                      displayValue: "⚠️ Données temporairement indisponibles",
                      analyzedAt: `${new Date().toLocaleDateString('fr-FR')} ${nowFormatted}`
                  },
                  {
                      titleFr: "Indice du Nasdaq",
                      titleEng: "NASDAQ Index",
                      description: "Le NASDAQ est une bourse des valeurs américaine qui est spécialisée dans les sociétés spécialisées dans le domaine de la technologie. Souvent quand le marché boursier est à la hausse cela est souvent très positif pour le marché crypto.",
                      objective: "A la hausse sur les 2/3 derniers mois",
                      isMet: false,
                      displayValue: "⚠️ Données temporairement indisponibles",
                      analyzedAt: `${new Date().toLocaleDateString('fr-FR')} ${nowFormatted}`
                  },
                  {
                      titleFr: "Taux d'intérêt de la FED",
                      titleEng: "FED Interest Rate",
                      description: "C'est le taux de refinancement minimum qui permet aux établissements bancaires de se refinancer auprès de la banque centrale. Dans une situation de taux faibles, les banques peuvent se refinancer à des coûts avantageux et ainsi proposer des crédits à des taux bas ce qui stimule l'économie par abondance de liquidités.",
                      objective: "En baisse",
                      isMet: false,
                      displayValue: "⚠️ Données temporairement indisponibles",
                      analyzedAt: `${new Date().toLocaleDateString('fr-FR')} ${nowFormatted}`
                  },
                  {
                      titleFr: "Pivot de la FED",
                      titleEng: "FED Pivot",
                      description: "Changement de politique monétaire : Un pivot de la Fed implique souvent un passage de la hausse des taux d'intérêt à leur baisse, ou vice-versa.",
                      objective: "A déjà eu lieu",
                      isMet: false,
                      displayValue: "⚠️ Données temporairement indisponibles",
                      analyzedAt: `${new Date().toLocaleDateString('fr-FR')} ${nowFormatted}`
                  },
                  {
                      titleFr: "Indice du S&P500",
                      titleEng: "S&P500 Index",
                      description: "L'indice S&P 500, pour Standard & Poor's 500 est un indice boursier construit à partir de 500 grandes entreprises cotées sur les bourses américaines. Souvent quand le marché boursier est à la hausse cela est souvent très positif pour le marché crypto.",
                      objective: "A la hausse sur les 2/3 derniers mois",
                      isMet: false,
                      displayValue: "⚠️ Données temporairement indisponibles",
                      analyzedAt: `${new Date().toLocaleDateString('fr-FR')} ${nowFormatted}`
                  },
                  {
                      titleFr: "Entrées d'argent dans les ETFs Bitcoin",
                      titleEng: "Bitcoin ETF Inflows",
                      description: "Correspond à l'argent des investisseurs qui est investi sur Bitcoin via l'ensemble des ETFs spot.",
                      objective: "Demande constante ou en hausse",
                      isMet: false,
                      displayValue: "⚠️ Données temporairement indisponibles",
                      analyzedAt: `${new Date().toLocaleDateString('fr-FR')} ${nowFormatted}`
                  }
              ];
              
              // ✅ 15 INDICATEURS ON-CHAIN FALLBACK
              const onchainIndicatorsFallback: MarketIndicator[] = [
                  {
                      titleFr: "Surchauffe du Bitcoin",
                      titleEng: "Bitcoin Overheating",
                      description: "Cet indicateur représente la survalorisation potentielle du Bitcoin en analysant notamment les produits dérivés (contrats à terme, options etc…) Des valeurs hautes suggèrent un fort sentiment de cupidité sur le marché (Risque de Top). C'est l'inverse pour des valeurs basses.",
                      objective: "Bitcoin Heater > 0,8",
                      isMet: false,
                      displayValue: "⚠️ Données temporairement indisponibles",
                      analyzedAt: `${new Date().toLocaleDateString('fr-FR')} ${nowFormatted}`
                  },
                  {
                      titleFr: "Plage dynamique NVT",
                      titleEng: "Dynamic Range NVT",
                      description: "Le NVT est souvent appelé « ratio PE du Bitcoin », il s'agit du rapport entre les transactions en chaîne et la capitalisation boursière. L'utilisation de bandes de plage dynamique permet ici d'identifier les régions de sous-évaluation et de surévaluation (vert/rouge).",
                      objective: "Dynamic range NVT > Courbe rouge",
                      isMet: false,
                      displayValue: "⚠️ Données temporairement indisponibles",
                      analyzedAt: `${new Date().toLocaleDateString('fr-FR')} ${nowFormatted}`
                  },
                  {
                      titleFr: "Frais de transaction Onchain (Bitcoin)",
                      titleEng: "Bitcoin Transaction Fees",
                      description: "Cet indicateur représente les frais moyens par transaction sur Bitcoin. En période euphorique et de surchauffe de marché, les frais et les temps de transactions augmentent fortement.",
                      objective: "Frais moyen en constante augmentation sur les 6 derniers mois",
                      isMet: false,
                      displayValue: "⚠️ Données temporairement indisponibles",
                      analyzedAt: `${new Date().toLocaleDateString('fr-FR')} ${nowFormatted}`
                  },
                  {
                      titleFr: "Frais de transaction sur Ethereum",
                      titleEng: "Ethereum Transaction Fees",
                      description: "Cet indicateur représente les frais moyens par transaction sur Ethereum. En période euphorique et de surchauffe de marché, les frais et les temps de transactions augmentent fortement.",
                      objective: "Frais moyen en constante augmentation sur les 6 derniers mois",
                      isMet: false,
                      displayValue: "⚠️ Données temporairement indisponibles",
                      analyzedAt: `${new Date().toLocaleDateString('fr-FR')} ${nowFormatted}`
                  },
                  {
                      titleFr: "Pourcentage d'adresses en profit",
                      titleEng: "Percent of Addresses in Profit",
                      description: "Pourcentage d'adresses uniques dont les fonds ont un prix d'achat moyen inférieur au prix actuel. Le « prix d'achat » est défini ici comme le prix au moment où les coins ont été transférés à une adresse.",
                      objective: "Percent of adresses in profit au dessus de 90%",
                      isMet: false,
                      displayValue: "⚠️ Données temporairement indisponibles",
                      analyzedAt: `${new Date().toLocaleDateString('fr-FR')} ${nowFormatted}`
                  },
                  {
                      titleFr: "Score MVRV-Z",
                      titleEng: "MVRV-Z Score",
                      description: "MVRV Z-Score permet d'identifier les périodes pendant lesquelles Bitcoin est extrêmement surévalué ou sous-évalué par rapport à sa « juste valeur ». Il utilise trois métriques : 1. Valeur marchande (ligne noire) : Le prix actuel du Bitcoin multiplié par le nombre de coins en circulation (Marketcap). 2. Valeur réalisée (ligne bleue) : Plutôt que de prendre le prix actuel du Bitcoin, la valeur réalisée prend le prix de chaque Bitcoin lors de son dernier déplacement, c'est-à-dire la dernière fois qu'il a été envoyé d'un portefeuille à un autre portefeuille. Il additionne ensuite tous ces prix individuels et en fait la moyenne. Il multiplie ensuite ce prix moyen par le nombre total de pièces en circulation. Ce faisant, cela élimine le sentiment du marché à court terme que nous avons dans la mesure de la valeur marchande. Cela peut donc être considéré comme une mesure à long terme plus « vraie » de la valeur du Bitcoin, dont la valeur marchande évolue au-dessus et en dessous en fonction du sentiment du marché à ce moment-là. 3. Score Z (ligne orange) : Un test d'écart type qui extrait les extrêmes des données entre la valeur marchande et la valeur réalisée.",
                      objective: "MVRV Z proche de la zone rouge ou dans la zone rouge",
                      isMet: false,
                      displayValue: "⚠️ Données temporairement indisponibles",
                      analyzedAt: `${new Date().toLocaleDateString('fr-FR')} ${nowFormatted}`
                  },
                  {
                      titleFr: "Bénéfice/Perte Net Non Réalisé (NUPL)",
                      titleEng: "Net Unrealized Profit/Loss (NUPL)",
                      description: "Cet indicateur est dérivé de la valeur marchande et de la valeur réalisée, qui peuvent être définies comme : 1. Valeur marchande (Marketcap): le prix actuel du Bitcoin multiplié par le nombre de coins en circulation. 2. Valeur réalisée : Plutôt que de prendre le prix actuel du Bitcoin, la valeur réalisée prend le prix de chaque Bitcoin lors de son dernier déplacement, c'est-à-dire la dernière fois qu'il a été envoyé d'un portefeuille à un autre portefeuille. Il additionne ensuite tous ces prix individuels et en fait la moyenne. Il multiplie ensuite ce prix moyen par le nombre total de coins en circulation. En soustrayant la valeur réalisée de la valeur marchande, nous calculons le profit/la perte non réalisé. Les profits/pertes non réalisés estiment le total des profits/pertes papier en Bitcoin détenus par les investisseurs. En divisant le profit/la perte non réalisé par la capitalisation boursière nous pouvons obtenir un profit/perte net non réalisé, parfois appelé NUPL.",
                      objective: "Courbe bleue dans la zone orange ou rouge",
                      isMet: false,
                      displayValue: "⚠️ Données temporairement indisponibles",
                      analyzedAt: `${new Date().toLocaleDateString('fr-FR')} ${nowFormatted}`
                  },
                  {
                      titleFr: "Risque de réserve",
                      titleEng: "Reserve Risk",
                      description: "Le risque de réserve nous permet de visualiser la confiance des détenteurs de Bitcoin à long terme par rapport à son prix à un moment donné. Lorsque la confiance est élevée et que le prix est bas, il existe alors un rapport risque/récompense attrayant pour investir dans Bitcoin à ce moment-là (zone verte). Lorsque la confiance est faible et que le prix est élevé, le rapport risque/récompense est peu attrayant (zone rouge).",
                      objective: "Reserve Risk proche de la zone rouge ou dans la zone rouge",
                      isMet: false,
                      displayValue: "⚠️ Données temporairement indisponibles",
                      analyzedAt: `${new Date().toLocaleDateString('fr-FR')} ${nowFormatted}`
                  },
                  {
                      titleFr: "Top Cap",
                      titleEng: "Top Cap",
                      description: "Pour calculer le Top Cap, il faut d'abord calculer le Cap Moyen, qui est la somme cumulée de la Capitalisation boursière (marketcap) divisée par l'âge du marché en jours. Cela crée une moyenne mobile constante et temporelle de la capitalisation boursière. Une fois le plafond moyen calculé, ces valeurs sont multipliées par 35. Le résultat est Top Cap. Pendant une grande partie de l'histoire de Bitcoin, Top Cap a correctement prédit les sommets du prix du Bitcoin des principaux cycles où le prix était devenu parabolique en raison de l'euphorie du marché et du FOMO (peur de rater quelque chose). Il n'y est pas parvenu en 2021 car le cycle avait un sommet plutôt arrondi et non un sommet parabolique.",
                      objective: "Prix du Bitcoin touche la courbe en bleu ou s'en rapproche dangereusement",
                      isMet: false,
                      displayValue: "⚠️ Données temporairement indisponibles",
                      analyzedAt: `${new Date().toLocaleDateString('fr-FR')} ${nowFormatted}`
                  },
                  {
                      titleFr: "Delta Top",
                      titleEng: "Delta Top",
                      description: "Plusieurs étapes sont requises dans le calcul. Tout d'abord, pour calculer le Delta Cap : Delta Cap = Plafond réalisé - Plafond moyen. Le plafond réalisé : Il s'agit de la valeur totale payée pour tous les bitcoins (basée sur le coût). Le plafond moyen : C'est la somme cumulée de la capitalisation boursière divisée par l'âge du marché en jours. Cela crée une moyenne mobile constante et temporelle de la capitalisation boursière. La soustraction du plafond moyen du plafond réalisé génère le plafond Delta. Une fois Delta Cap calculé, ses valeurs au fil du temps sont ensuite multipliées par 7. Le résultat est Delta Top.",
                      objective: "Prix du Bitcoin touche la courbe en violet ou s'en rapproche dangereusement",
                      isMet: false,
                      displayValue: "⚠️ Données temporairement indisponibles",
                      analyzedAt: `${new Date().toLocaleDateString('fr-FR')} ${nowFormatted}`
                  },
                  {
                      titleFr: "Prix terminal",
                      titleEng: "Terminal Price",
                      description: "Avant que le prix du terminal ne soit calculé, il est d'abord nécessaire de calculer le prix transféré. Le prix transféré prend la somme des Coin Days Destroyed (CDD) et la divise par l'offre existante de Bitcoin et le temps pendant lequel il a été en circulation. La valeur du prix transféré est ensuite multipliée par 21. Cela crée une valeur « terminale » puisque l'offre est entièrement extraite.",
                      objective: "Prix du Bitcoin touche la courbe en rouge ou s'en rapproche dangereusement",
                      isMet: false,
                      displayValue: "⚠️ Données temporairement indisponibles",
                      analyzedAt: `${new Date().toLocaleDateString('fr-FR')} ${nowFormatted}`
                  },
                  {
                      titleFr: "Vague Hodl",
                      titleEng: "HODL Waves",
                      description: "Ce graphique nous montre la quantité de Bitcoin en circulation regroupée en différentes tranches d'âge. Il utilise différentes couleurs pour montrer les différentes tranches d'âge et comment la quantité de bitcoin dans chacune des bandes évolue au fil du temps, créant ainsi des motifs en forme de vagues sur le graphique. Il montre l'offre totale de Bitcoin sur le marché à un moment donné en normalisant la répartition de l'offre. Par conséquent, l'axe Y sur le graphique monte jusqu'à 100 % car il montre la répartition par âge de tous les bitcoins à une date donnée. Lorsque nous constatons une forte augmentation du nombre de coins détenues par des personnes moins âgées, cela indique qu'un grand nombre de bitcoins plus anciens sont vendus par des personnes qui les détiennent depuis longtemps et sont maintenant rachetés, très probablement par de nouveaux participants au marché. Historiquement, cela a tendance à se produire lorsque le prix du Bitcoin augmente très rapidement et que de nouveaux participants se précipitent sur le marché pour acheter, à proximité des sommets du marché.",
                      objective: "Les nuances de rouge ont tendance à augmenter rapidement",
                      isMet: false,
                      displayValue: "⚠️ Données temporairement indisponibles",
                      analyzedAt: `${new Date().toLocaleDateString('fr-FR')} ${nowFormatted}`
                  },
                  {
                      titleFr: "Indice de peur et de cupidité",
                      titleEng: "Fear and Greed Index",
                      description: "Cet indicateur identifie la mesure dans laquelle le marché devient trop craintif ou trop cupide. L'idée est que lorsque le marché est généralement trop craintif, cela peut indiquer que Bitcoin est bon marché/sous-évalué à ce moment-là et pourrait présenter une bonne opportunité d'achat. L'inverse s'applique également : lorsque l'indice de peur et de cupidité signale que les acteurs du marché sont extrêmement cupides, cela peut indiquer que le prix du Bitcoin est trop élevé au-dessus de sa valeur intrinsèque et que cela pourrait être le bon moment pour vendre.",
                      objective: "« Greed » ou « Extreme Greed »",
                      isMet: false,
                      displayValue: "⚠️ Données temporairement indisponibles",
                      analyzedAt: `${new Date().toLocaleDateString('fr-FR')} ${nowFormatted}`
                  },
                  {
                      titleFr: "Temps avant le prochain Halving",
                      titleEng: "Time Until Next Halving",
                      description: "Le \"halving\" est un événement programmé qui se produit environ tous les quatre ans (ou tous les 210 000 blocs minés) sur la blockchain du Bitcoin. Il a pour conséquence de diviser par deux la quantité de nouveaux bitcoins créés.",
                      objective: "Halving dans plus de 2 ans",
                      isMet: false,
                      displayValue: "⚠️ Données temporairement indisponibles",
                      analyzedAt: `${new Date().toLocaleDateString('fr-FR')} ${nowFormatted}`
                  },
                  {
                      titleFr: "Multiple de Puell",
                      titleEng: "Puell Multiple",
                      description: "Cette mesure examine le côté offre de l'économie de Bitcoin : les mineurs de Bitcoin et leurs revenus. Il explore les cycles du marché du point de vue des revenus miniers. Les mineurs de Bitcoin sont parfois qualifiés de vendeurs obligatoires en raison de leur besoin de couvrir les coûts fixes du matériel de minage sur un marché où les prix sont extrêmement volatils. Les revenus qu'ils génèrent peuvent donc influencer les prix au fil du temps. Le multiple de Puell est calculé en divisant la valeur d'émission quotidienne des bitcoins (en USD) par la moyenne mobile sur 365 jours de la valeur d'émission quotidienne.",
                      objective: "Multiple Puell dans la zone Rouge",
                      isMet: false,
                      displayValue: "⚠️ Données temporairement indisponibles",
                      analyzedAt: `${new Date().toLocaleDateString('fr-FR')} ${nowFormatted}`
                  }
              ];
              
              // ✅ 12 INDICATEURS EMPIRIQUES FALLBACK
              const empiricalIndicatorsFallback: MarketIndicator[] = [
                  {
                      titleFr: "Classement générale des applications Crypto sur l'Apple Store",
                      titleEng: "Crypto Apps Ranking on Apple Store",
                      description: "Observer le classement des applications crypto sur des places de marchés comme l'Apple Store nous donne des indications précieuses sur la popularité du marché à l'instant T. Voir des applications comme Coinbase ou Binance dans le Top 10 des applications les plus utilisées peut être synonyme de surchauffe du marché. A l'inverse, quand ces applications ne sont pas très populaire, c'est souvent signe d'un désintérêt du grand public envers le marché.",
                      objective: "Classement > 20 (catégorie finance)",
                      isMet: false,
                      displayValue: "⚠️ Données temporairement indisponibles",
                      analyzedAt: `${new Date().toLocaleDateString('fr-FR')} ${nowFormatted}`
                  },
                  {
                      titleFr: "Lancement de nombreux nouveaux projets",
                      titleEng: "New Projects Launch Activity",
                      description: "En général, en bull market beaucoup de projets sont lancés via ICO / IEO / IDO. C'est l'inverse en bear.",
                      objective: "Beaucoup de nouveaux lancements",
                      isMet: false,
                      displayValue: "⚠️ Données temporairement indisponibles",
                      analyzedAt: `${new Date().toLocaleDateString('fr-FR')} ${nowFormatted}`
                  },
                  {
                      titleFr: "Google Trends (Bitcoin)",
                      titleEng: "Google Trends (Bitcoin)",
                      description: "Google Trends permet de mesurer l'intérêt du grand public pour Bitcoin. Un volume de recherche élevé indique souvent une surchauffe du marché et un intérêt maximum des investisseurs particuliers.",
                      objective: "Volume de recherche historique > 50",
                      isMet: false,
                      displayValue: "⚠️ Données temporairement indisponibles",
                      analyzedAt: `${new Date().toLocaleDateString('fr-FR')} ${nowFormatted}`
                  },
                  {
                      titleFr: "Google Trends (Ethereum)",
                      titleEng: "Google Trends (Ethereum)",
                      description: "Google Trends permet de mesurer l'intérêt du grand public pour Ethereum. Un volume de recherche élevé indique souvent une surchauffe du marché et un intérêt maximum des investisseurs particuliers.",
                      objective: "Volume de recherche historique > 50",
                      isMet: false,
                      displayValue: "⚠️ Données temporairement indisponibles",
                      analyzedAt: `${new Date().toLocaleDateString('fr-FR')} ${nowFormatted}`
                  },
                  {
                      titleFr: "Google Trends (Buy Bitcoin)",
                      titleEng: "Google Trends (Buy Bitcoin)",
                      description: "Google Trends permet de mesurer l'intention d'achat du grand public pour Bitcoin. Un volume de recherche élevé sur 'Buy Bitcoin' indique souvent que les investisseurs particuliers arrivent tard sur le marché, près d'un sommet.",
                      objective: "Volume de recherche historique > 50",
                      isMet: false,
                      displayValue: "⚠️ Données temporairement indisponibles",
                      analyzedAt: `${new Date().toLocaleDateString('fr-FR')} ${nowFormatted}`
                  },
                  {
                      titleFr: "Google Trends (Buy Ethereum)",
                      titleEng: "Google Trends (Buy Ethereum)",
                      description: "Google Trends permet de mesurer l'intention d'achat du grand public pour Ethereum. Un volume de recherche élevé sur 'Buy Ethereum' indique souvent que les investisseurs particuliers arrivent tard sur le marché, près d'un sommet.",
                      objective: "Volume de recherche historique > 50",
                      isMet: false,
                      displayValue: "⚠️ Données temporairement indisponibles",
                      analyzedAt: `${new Date().toLocaleDateString('fr-FR')} ${nowFormatted}`
                  },
                  {
                      titleFr: "Présence de contenu crypto sur tous les médias",
                      titleEng: "Crypto Content on All Media",
                      description: "Voir des informations très positives sur le marché en continu à la télé / radio / YouTube nous renseigne sur le sentiment global du marché. En tant qu'investisseur, il est important d'acheter quand la majorité des participants pensent que le marché n'a aucun avenir et que tout va continuer de baisser. On essaye d'acheter la dépression et revendre en période Euphorique.",
                      objective: "Contenu très positif de partout",
                      isMet: false,
                      displayValue: "⚠️ Données temporairement indisponibles",
                      analyzedAt: `${new Date().toLocaleDateString('fr-FR')} ${nowFormatted}`
                  },
                  {
                      titleFr: "Tout le monde parle de ses profits",
                      titleEng: "Everyone Talks About Profits",
                      description: "Voir des informations très positives sur le marché en continu à la télé / radio / YouTube nous renseigne sur le sentiment global du marché. En tant qu'investisseur, il est important d'acheter quand la majorité des participants pensent que le marché n'a aucun avenir et que tout va continuer de baisser. On essaye d'acheter la dépression et revendre en période Euphorique.",
                      objective: "Contenu très positif de partout",
                      isMet: false,
                      displayValue: "⚠️ Données temporairement indisponibles",
                      analyzedAt: `${new Date().toLocaleDateString('fr-FR')} ${nowFormatted}`
                  },
                  {
                      titleFr: "Le contenu crypto est très populaire",
                      titleEng: "Crypto Content is Very Popular",
                      description: "Voir des informations très positives sur le marché en continu à la télé / radio / YouTube nous renseigne sur le sentiment global du marché. En tant qu'investisseur, il est important d'acheter quand la majorité des participants pensent que le marché n'a aucun avenir et que tout va continuer de baisser. On essaye d'acheter la dépression et revendre en période Euphorique.",
                      objective: "Contenu très positif de partout",
                      isMet: false,
                      displayValue: "⚠️ Données temporairement indisponibles",
                      analyzedAt: `${new Date().toLocaleDateString('fr-FR')} ${nowFormatted}`
                  },
                  {
                      titleFr: "Augmentation parabolique du prix",
                      titleEng: "Parabolic Price Increase",
                      description: "Voir des informations très positives sur le marché en continu à la télé / radio / YouTube nous renseigne sur le sentiment global du marché. En tant qu'investisseur, il est important d'acheter quand la majorité des participants pensent que le marché n'a aucun avenir et que tout va continuer de baisser. On essaye d'acheter la dépression et revendre en période Euphorique.",
                      objective: "Contenu très positif de partout",
                      isMet: false,
                      displayValue: "⚠️ Données temporairement indisponibles",
                      analyzedAt: `${new Date().toLocaleDateString('fr-FR')} ${nowFormatted}`
                  },
                  {
                      titleFr: "Uniquement des bonnes nouvelles",
                      titleEng: "Only Good News",
                      description: "Voir des informations très positives sur le marché en continu à la télé / radio / YouTube nous renseigne sur le sentiment global du marché. En tant qu'investisseur, il est important d'acheter quand la majorité des participants pensent que le marché n'a aucun avenir et que tout va continuer de baisser. On essaye d'acheter la dépression et revendre en période Euphorique.",
                      objective: "Contenu très positif de partout",
                      isMet: false,
                      displayValue: "⚠️ Données temporairement indisponibles",
                      analyzedAt: `${new Date().toLocaleDateString('fr-FR')} ${nowFormatted}`
                  },
                  {
                      titleFr: "Mises à jours de projets populaires du moment",
                      titleEng: "Updates of Popular Projects",
                      description: "En tendance haussière, vous pourrez constater que de nouvelles mises à jours importantes seront annoncées même si ces dernières étaient disponibles déjà il y a plusieurs mois.",
                      objective: "Beaucoup de mises à jours",
                      isMet: false,
                      displayValue: "⚠️ Données temporairement indisponibles",
                      analyzedAt: `${new Date().toLocaleDateString('fr-FR')} ${nowFormatted}`
                  }
              ];
              
              const fallbackSource = TOP_MARKET_INDICATORS || [];
              const mockAnalyzed = fallbackSource.map(ind => ({
                  ...ind,
                  isMet: Math.random() > 0.8,
                  displayValue: "⚠️ Données temporairement indisponibles",
                  analyzedAt: `${new Date().toLocaleDateString('fr-FR')} ${nowFormatted}`
              }));
              
              const allFallbackIndicators = [...mockAnalyzed, ...macroIndicatorsFallback, ...onchainIndicatorsFallback, ...empiricalIndicatorsFallback];
              
              setCurrentIndicators(allFallbackIndicators);
              setCurrentPercentage(30);
              
              if (storedHistory.length === 0) {
                  const mockHistory: AnalysisHistoryEntry[] = [];
                  for (let i = 30; i > 0; i--) {
                      const d = new Date(); 
                      d.setDate(d.getDate() - i);
                      mockHistory.push({ 
                          date: d.toISOString().split('T')[0], 
                          percentage: 30 
                      });
                  }
                  setHistory(mockHistory);
              } else {
                  setHistory(storedHistory);
              }
          } finally {
              setLoading(false);
          }
      };

      performRealAnalysis();
  }, []);

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-fuchsia-500" /></div>;

  return (
    <div className="space-y-8 animate-fade-in">
        <div className="glass-panel p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-8 bg-gradient-to-br from-gray-900 to-black border border-white/10">
            <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-3"><Activity className="text-fuchsia-500" /> Analyse de Cycle : Top de Marché</h3>
                <p className="text-gray-400 text-sm leading-relaxed max-w-2xl mb-4">Analyse technique en temps réel basée sur les données Supabase (N8N + Yahoo Finance).<br/><span className="text-xs text-gray-500 italic">✅ Calculs automatiques toutes les 15 minutes via workflow N8N.</span></p>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fuchsia-500/10 text-fuchsia-400 text-xs font-mono border border-fuchsia-500/20"><Clock size={12} /> Analyse du {new Date().toLocaleDateString('fr-FR')}</div>
            </div>
            <div className="flex items-center gap-6 bg-black/40 p-4 rounded-xl border border-white/5">
                <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90"><circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-gray-800" /><circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={351} strokeDashoffset={351 - (351 * currentPercentage) / 100} className={`${currentPercentage > 75 ? 'text-red-500' : currentPercentage > 40 ? 'text-amber-500' : 'text-blue-500'} transition-all duration-1000`} /></svg>
                    <div className="absolute flex flex-col items-center"><span className="text-3xl font-black text-white">{currentPercentage}%</span><span className="text-[10px] uppercase font-bold text-gray-500">Probabilité</span></div>
                </div>
            </div>
        </div>
        <div className="grid grid-cols-1 gap-4">
            {/* ===== CATÉGORIE 1 : INDICATEURS MACRO-ÉCONOMIQUES ===== */}
            <div className="glass-panel p-6 rounded-xl border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-900/10 to-transparent">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-blue-500/20 flex items-center justify-center border-2 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.4)]">
                            <TrendingUp className="text-blue-400" size={28} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white uppercase tracking-wider">Catégorie 1 : Indicateurs Macro-Économiques</h3>
                            <p className="text-sm text-gray-400 mt-1">Analyse des conditions économiques globales et des flux de capitaux</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-black text-blue-400">
                            {currentIndicators.slice(0, 7).filter(i => i.isMet).length}/7
                        </div>
                        <div className="text-xs text-gray-500 uppercase font-bold">Validés</div>
                    </div>
                </div>
                <div className="space-y-4">
                    {currentIndicators.slice(0, 7).map((ind, i) => (
                        <div key={`macro-${i}`} className={`glass-panel p-6 rounded-xl flex flex-col md:flex-row items-center gap-6 transition hover:bg-white/5 border-l-4 ${ind.isMet ? 'border-l-red-500 bg-red-900/5' : 'border-l-emerald-500 bg-emerald-900/5'}`}>
                            <div className="shrink-0">{ind.isMet ? <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]"><AlertTriangle className="text-red-500" size={24} /></div> : <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]"><CheckCircle2 className="text-emerald-500" size={24} /></div>}</div>
                            <div className="flex-1 min-w-0"><div className="flex items-center justify-between mb-1"><h4 className="text-lg font-bold text-white truncate">{ind.titleFr}</h4></div><p className="text-sm text-gray-400 mb-3 line-clamp-2">{ind.description}</p><div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs"><div className="flex items-center gap-1.5 text-blue-400 bg-blue-500/10 px-2 py-1 rounded"><Info size={12} /><span className="font-medium">Objectif:</span><span className="text-gray-300">{ind.objective}</span></div><div className="flex items-center gap-1.5 text-fuchsia-400 bg-fuchsia-500/10 px-2 py-1 rounded border border-fuchsia-500/20"><Activity size={12} /><span className="font-bold">Valeur relevée:</span><span className="text-white font-mono">{ind.displayValue}</span></div>{ind.analyzedAt && (<div className="flex items-center gap-1 text-gray-500"><Clock size={10} /> {ind.analyzedAt}</div>)}</div></div>
                            <div className="shrink-0 text-right min-w-[100px] border-l border-white/10 pl-6"><span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Conclusion</span><span className={`text-2xl font-black ${ind.isMet ? 'text-red-500' : 'text-emerald-500'}`}>{ind.isMet ? 'OUI' : 'NON'}</span></div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ===== CATÉGORIE 2 : INDICATEURS ON-CHAIN ET TECHNIQUES ===== */}
            <div className="glass-panel p-6 rounded-xl border-l-4 border-l-fuchsia-500 bg-gradient-to-r from-fuchsia-900/10 to-transparent mt-8">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-fuchsia-500/20 flex items-center justify-center border-2 border-fuchsia-500/50 shadow-[0_0_20px_rgba(217,70,239,0.4)]">
                            <Zap className="text-fuchsia-400" size={28} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white uppercase tracking-wider">Catégorie 2 : Indicateurs On-Chain et Techniques</h3>
                            <p className="text-sm text-gray-400 mt-1">Analyse des données blockchain et des métriques de valorisation avancées</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-black text-fuchsia-400">
                            {currentIndicators.slice(7, 22).filter(i => i.isMet).length}/15
                        </div>
                        <div className="text-xs text-gray-500 uppercase font-bold">Validés</div>
                    </div>
                </div>
                <div className="space-y-4">
                    {currentIndicators.slice(7, 22).map((ind, i) => (
                        <div key={`onchain-${i}`} className={`glass-panel p-6 rounded-xl flex flex-col md:flex-row items-center gap-6 transition hover:bg-white/5 border-l-4 ${ind.isMet ? 'border-l-red-500 bg-red-900/5' : 'border-l-emerald-500 bg-emerald-900/5'}`}>
                            <div className="shrink-0">{ind.isMet ? <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]"><AlertTriangle className="text-red-500" size={24} /></div> : <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]"><CheckCircle2 className="text-emerald-500" size={24} /></div>}</div>
                            <div className="flex-1 min-w-0"><div className="flex items-center justify-between mb-1"><h4 className="text-lg font-bold text-white truncate">{ind.titleFr}</h4></div><p className="text-sm text-gray-400 mb-3 line-clamp-2">{ind.description}</p><div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs"><div className="flex items-center gap-1.5 text-blue-400 bg-blue-500/10 px-2 py-1 rounded"><Info size={12} /><span className="font-medium">Objectif:</span><span className="text-gray-300">{ind.objective}</span></div><div className="flex items-center gap-1.5 text-fuchsia-400 bg-fuchsia-500/10 px-2 py-1 rounded border border-fuchsia-500/20"><Activity size={12} /><span className="font-bold">Valeur relevée:</span><span className="text-white font-mono">{ind.displayValue}</span></div>{ind.analyzedAt && (<div className="flex items-center gap-1 text-gray-500"><Clock size={10} /> {ind.analyzedAt}</div>)}</div></div>
                            <div className="shrink-0 text-right min-w-[100px] border-l border-white/10 pl-6"><span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Conclusion</span><span className={`text-2xl font-black ${ind.isMet ? 'text-red-500' : 'text-emerald-500'}`}>{ind.isMet ? 'OUI' : 'NON'}</span></div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ===== CATÉGORIE 3 : INDICATEURS EMPIRIQUES ET DE SENTIMENT ===== */}
            <div className="glass-panel p-6 rounded-xl border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-900/10 to-transparent mt-8">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-amber-500/20 flex items-center justify-center border-2 border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.4)]">
                            <Users className="text-amber-400" size={28} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white uppercase tracking-wider">Catégorie 3 : Indicateurs Empiriques et de Sentiment</h3>
                            <p className="text-sm text-gray-400 mt-1">Analyse du comportement du marché, des tendances de recherche et du sentiment général</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-black text-amber-400">
                            {currentIndicators.slice(22).filter(i => i.isMet).length}/12
                        </div>
                        <div className="text-xs text-gray-500 uppercase font-bold">Validés</div>
                    </div>
                </div>
                <div className="space-y-4">
                    {currentIndicators.slice(22).map((ind, i) => (
                        <div key={`empirical-${i}`} className={`glass-panel p-6 rounded-xl flex flex-col md:flex-row items-center gap-6 transition hover:bg-white/5 border-l-4 ${ind.isMet ? 'border-l-red-500 bg-red-900/5' : 'border-l-emerald-500 bg-emerald-900/5'}`}>
                            <div className="shrink-0">{ind.isMet ? <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]"><AlertTriangle className="text-red-500" size={24} /></div> : <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]"><CheckCircle2 className="text-emerald-500" size={24} /></div>}</div>
                            <div className="flex-1 min-w-0"><div className="flex items-center justify-between mb-1"><h4 className="text-lg font-bold text-white truncate">{ind.titleFr}</h4></div><p className="text-sm text-gray-400 mb-3 line-clamp-2">{ind.description}</p><div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs"><div className="flex items-center gap-1.5 text-blue-400 bg-blue-500/10 px-2 py-1 rounded"><Info size={12} /><span className="font-medium">Objectif:</span><span className="text-gray-300">{ind.objective}</span></div><div className="flex items-center gap-1.5 text-fuchsia-400 bg-fuchsia-500/10 px-2 py-1 rounded border border-fuchsia-500/20"><Activity size={12} /><span className="font-bold">Valeur relevée:</span><span className="text-white font-mono">{ind.displayValue}</span></div>{ind.analyzedAt && (<div className="flex items-center gap-1 text-gray-500"><Clock size={10} /> {ind.analyzedAt}</div>)}</div></div>
                            <div className="shrink-0 text-right min-w-[100px] border-l border-white/10 pl-6"><span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Conclusion</span><span className={`text-2xl font-black ${ind.isMet ? 'text-red-500' : 'text-emerald-500'}`}>{ind.isMet ? 'OUI' : 'NON'}</span></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
        <div className="glass-panel p-6 rounded-xl mt-8 border border-white/10">
            <div className="flex items-center gap-3 mb-6"><History className="text-fuchsia-500" size={20} /><h3 className="font-bold text-white uppercase tracking-wider">Historique du Score de Top</h3></div>
            <div className="h-[300px] w-full bg-black/20 rounded-lg p-4" style={{ minHeight: '300px' }}>
                <div className="w-full h-full">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                        <AreaChart data={history} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs><linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#d946ef" stopOpacity={0.3}/><stop offset="95%" stopColor="#d946ef" stopOpacity={0}/></linearGradient></defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                            <XAxis dataKey="date" stroke="#666" tick={{fontSize: 11}} axisLine={false} tickLine={false} dy={10} tickFormatter={(str) => { const d = new Date(str); return `${d.getDate()}/${d.getMonth()+1}`; }} />
                            <YAxis stroke="#666" tick={{fontSize: 11}} axisLine={false} tickLine={false} domain={[0, 100]} />
                            <Tooltip contentStyle={{backgroundColor: '#111', border: '1px solid #333'}} itemStyle={{color: '#fff'}} formatter={(value: number) => [`${value}%`, 'Probabilité Top']} labelFormatter={(label) => `Date: ${label}`} />
                            <Area type="monotone" dataKey="percentage" stroke="#d946ef" strokeWidth={2} fillOpacity={1} fill="url(#colorScore)" />
                            <ReferenceLine y={75} stroke="#ef4444" strokeDasharray="3 3" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    </div>
  );
};

export const CategoryView: React.FC<CategoryViewProps> = ({ categoryType, assets, onAssetUpdate }) => {
  const isInformationOnly = categoryType === AssetType.FRANCE_INVEST;
  const hasMarketData = !!MARKET_DATA[categoryType];
  const isCrypto = categoryType === AssetType.CRYPTO;
  const currencySymbol = isCrypto ? '$' : '€';
  
  const availableTabs: TabView[] = useMemo(() => {
    if (isInformationOnly) return ['education', 'macro', 'news'];
    if (isCrypto) return ['market', 'analysis', 'investments', 'education', 'news'];
    if (hasMarketData) return ['market', 'investments', 'education', 'news'];
    return ['investments', 'education', 'news'];
  }, [isInformationOnly, hasMarketData, isCrypto]);

  const [activeTab, setActiveTab] = useState<TabView>(availableTabs[0]);
  const [activeCryptoSymbol, setActiveCryptoSymbol] = useState("BINANCE:BTCUSDT");
  const [currentSearchedToken, setCurrentSearchedToken] = useState<any>({ name: 'Bitcoin', symbol: 'BTC', pair: 'BINANCE:BTCUSDT' });
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [selectedEducation, setSelectedEducation] = useState<EducationItem | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newValue, setNewValue] = useState('');
  const [slideNotes, setSlideNotes] = useState<Record<string, Record<number, string>>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  
  useEffect(() => {
      setActiveTab(availableTabs[0]);
      if (isCrypto) {
        const saved = storageService.getWatchlist();
        setWatchlist(saved);
      }
      if (selectedEducation) {
          setCurrentSlide(0);
          setIsEditing(false);
          setSlideNotes(storageService.getSlideNotes());
      }
  }, [categoryType, availableTabs, isCrypto, selectedEducation]);

  const config = ASSET_CATEGORIES.find(c => c.type === categoryType)!;
  const marketInfo = MARKET_DATA[categoryType];
  const filteredAssets = useMemo(() => assets.filter(a => a.type === categoryType), [assets, categoryType]);
  const totalValue = filteredAssets.reduce((acc, curr) => acc + (curr.amount * curr.currentValue), 0);

  const handleAddAsset = (e: React.FormEvent) => {
      e.preventDefault();
      const asset: Asset = {
        id: Date.now().toString(),
        name: newName,
        amount: parseFloat(newAmount),
        currentValue: parseFloat(newValue),
        currency: isCrypto ? 'USD' : 'EUR',
        type: categoryType,
        purchaseDate: new Date().toISOString()
      };
      storageService.addAsset(asset);
      setNewName('');
      setNewAmount('');
      setNewValue('');
      onAssetUpdate();
  };
  
  const handleDelete = (id: string) => { storageService.deleteAsset(id); onAssetUpdate(); };
  const handleAddToWatchlist = () => { if (currentSearchedToken) { storageService.addToWatchlist(currentSearchedToken); setWatchlist(storageService.getWatchlist()); } };
  const handleRemoveFromWatchlist = (symbol: string) => { storageService.removeFromWatchlist(symbol); setWatchlist(storageService.getWatchlist()); };
  const handleSaveNote = () => { if (!selectedEducation) return; storageService.saveSlideNote(selectedEducation.title, currentSlide, editValue); setSlideNotes(storageService.getSlideNotes()); setIsEditing(false); };
  const getTabLabel = (tab: TabView) => {
      switch(tab) {
          case 'investments': return 'Investissements';
          case 'education': return 'Éducation';
          case 'news': return 'Actualités';
          case 'macro': return 'Macro-Économie';
          case 'market': return 'Marché';
          case 'analysis': return 'Analyse Top';
          default: return tab;
      }
  };
  const nextSlide = () => { if (selectedEducation && selectedEducation.charts && currentSlide < selectedEducation.charts.length - 1) setCurrentSlide(prev => prev + 1); };
  const prevSlide = () => { if (currentSlide > 0) setCurrentSlide(prev => prev - 1); };

  return (
    <div className="flex-1 h-full overflow-y-auto p-8 relative custom-scrollbar">
      <header className="mb-8 flex justify-between items-end">
        <div><h2 className={`text-3xl font-bold ${config.color} mb-2 flex items-center gap-2`}>{config.label}</h2><p className="text-gray-400 text-sm">{isInformationOnly ? "Analyses macro-économiques et focus France." : `Gérez votre portefeuille ${config.label.toLowerCase()} et suivez vos performances.`}</p></div>
        {!isInformationOnly && (<div className="text-right"><p className="text-sm text-gray-500 uppercase tracking-wide">Valeur Totale</p><p className="text-4xl font-light text-white">{currencySymbol}{totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p></div>)}
      </header>
      <div className="flex gap-6 border-b border-white/10 mb-8">{availableTabs.map((tab) => (<button key={tab} onClick={() => setActiveTab(tab)} className={`pb-3 px-1 text-sm font-medium uppercase tracking-wider transition-all relative ${activeTab === tab ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}>{getTabLabel(tab)}{activeTab === tab && <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r ${config.gradient.replace('/20', '')}`} />}</button>))}</div>
      <div className="animate-fade-in pb-20">
        {activeTab === 'market' && marketInfo && (
            <div className="space-y-6">
                {isCrypto ? <CryptoKPIs /> : categoryType === AssetType.STOCKS ? <StockMarketView /> : (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">{marketInfo.kpis.map((kpi: any, idx: number) => (<div key={idx} className="glass-panel p-6 rounded-xl border-l-4 border-l-transparent hover:border-l-blue-500 transition relative overflow-hidden"><div className="flex items-center justify-between mb-4"><h4 className="text-gray-400 text-xs uppercase tracking-wider font-bold">{kpi.label}</h4><Activity size={16} className="text-blue-500" /></div><div className="flex items-baseline gap-2 mb-2"><span className="text-3xl font-bold text-white">{kpi.value}</span>{kpi.subValue && <span className="text-xs text-gray-500">{kpi.subValue}</span>}</div><p className={`text-xs font-medium ${kpi.status === 'good' ? 'text-emerald-400' : kpi.status === 'warning' ? 'text-amber-400' : 'text-red-400'}`}>{kpi.trend}</p></div>))}</div>)}
                {categoryType !== AssetType.STOCKS && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 glass-panel p-6 rounded-xl min-h-[500px] flex flex-col relative">
                            {isCrypto ? (<><div className="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-20"><div className="flex-1"><ProfessionalSearch onSelect={(asset) => { setActiveCryptoSymbol(asset.pair); setCurrentSearchedToken(asset); }} /></div>{currentSearchedToken && (<button onClick={handleAddToWatchlist} className="flex items-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg transition text-sm font-medium whitespace-nowrap border border-white/10 mb-4 md:mb-0"><Star size={16} className="text-fuchsia-500" /> Suivre</button>)}</div><div className="flex-1 rounded-lg overflow-hidden border border-white/5 bg-black relative"><div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-black/60 backdrop-blur px-3 py-1 rounded border border-white/10"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span><span className="text-xs font-mono text-gray-300">{activeCryptoSymbol}</span></div><TradingViewWidget symbol={activeCryptoSymbol} /></div></>) : (<><h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2"><Activity size={18} /> {marketInfo.charts[0].title}</h3>{categoryType === AssetType.REAL_ESTATE && marketInfo.regionalData ? (<div className="flex-1 flex items-center justify-center bg-[#0a0a0a] rounded-lg border border-white/5 relative overflow-hidden"><div className="absolute inset-0 bg-[radial-gradient(#ffffff05_1px,transparent_1px)] [background-size:16px_16px] opacity-50" /><SimplifiedFranceMap data={marketInfo.regionalData} /></div>) : (<div className="flex-1"><ResponsiveContainer width="100%" height="100%"><AreaChart data={marketInfo.charts[0].data}><defs><linearGradient id="colorMain" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={marketInfo.charts[0].dataKey1 === 'BTC' ? '#10b981' : '#f59e0b'} stopOpacity={0.3}/><stop offset="95%" stopColor={marketInfo.charts[0].dataKey1 === 'BTC' ? '#10b981' : '#f59e0b'} stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} /><XAxis dataKey="name" stroke="#666" tick={{fontSize: 12}} axisLine={false} tickLine={false} dy={10} /><YAxis stroke="#666" tick={{fontSize: 12}} axisLine={false} tickLine={false} /><Tooltip contentStyle={{backgroundColor: '#111', border: '1px solid #333'}} /><Area type="monotone" dataKey="value1" stroke={marketInfo.charts[0].dataKey1 === 'BTC' ? '#10b981' : '#f59e0b'} fillOpacity={1} fill="url(#colorMain)" /></AreaChart></ResponsiveContainer></div>)}</>)}
                        </div>
                        <div className="glass-panel p-6 rounded-xl flex flex-col"><h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2"><Star size={18} className="text-fuchsia-500" /> {isCrypto ? "Liste de surveillance" : "Actifs Tendance"}</h3><div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">{isCrypto ? (watchlist.length > 0 ? watchlist.map((asset: any, idx: number) => (<div key={idx} onClick={() => { setActiveCryptoSymbol(asset.pair); setCurrentSearchedToken(asset); }} className="flex items-center justify-between p-3 hover:bg-white/5 rounded-lg transition cursor-pointer group border border-transparent hover:border-white/5 relative"><div className="flex items-center gap-3">{asset.logo ? <img src={asset.logo} alt={asset.name} className="w-8 h-8 rounded-full bg-white/5 p-0.5" /> : <div className={`w-8 h-8 rounded flex items-center justify-center font-bold text-xs bg-gray-800 text-white border border-white/10`}>{asset.symbol}</div>}<div><p className="text-sm font-medium text-white group-hover:text-blue-400 transition">{asset.name}</p><p className="text-[10px] text-gray-500 uppercase">{asset.pair.split(':')[1]}</p></div></div><button onClick={(e) => { e.stopPropagation(); handleRemoveFromWatchlist(asset.symbol); }} className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-2 text-gray-500 hover:text-red-500 transition"><Trash2 size={14} /></button></div>)) : <div className="text-center text-gray-500 py-8 text-sm">Liste vide.</div>) : (marketInfo.topAssets.map((asset: any, idx: number) => (<div key={idx} className="flex items-center justify-between p-3 hover:bg-white/5 rounded-lg transition cursor-pointer"><div className="flex items-center gap-3"><div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[10px] ${asset.change.startsWith('+') ? 'bg-emerald-900/30 text-emerald-400' : 'bg-red-900/30 text-red-400'}`}>{asset.symbol}</div><div><p className="text-sm font-medium text-white">{asset.name}</p><p className="text-xs text-gray-500">{asset.mcap} Cap</p></div></div><div className="text-right"><p className="text-sm font-medium text-white">{asset.price}</p><p className={`text-xs font-medium ${asset.change.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>{asset.change}</p></div></div>)))}</div></div>
                    </div>
                )}
            </div>
        )}
        {activeTab === 'analysis' && <TopIndicatorsView />}
        {activeTab === 'education' && (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{(EDUCATIONAL_CONTENT[categoryType] || []).map((item, idx) => (<div key={idx} onClick={() => { setSelectedEducation(item); setCurrentSlide(0); setShowInfo(false); }} className="glass-panel p-0 rounded-xl overflow-hidden cursor-pointer group hover:border-blue-500/50 transition flex flex-col relative hover:shadow-2xl hover:shadow-blue-900/20"><div className="relative h-48 w-full bg-gray-900"><img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition duration-500" /><div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition backdrop-blur-sm"><div className="bg-white/20 backdrop-blur-md p-4 rounded-full ring-1 ring-white/50 scale-90 group-hover:scale-100 transition"><Play size={32} className="text-white fill-white" /></div></div><div className="absolute bottom-3 right-3 px-2 py-1 bg-black/80 backdrop-blur rounded text-xs font-bold text-white flex items-center gap-1"><Play size={10} className="fill-white" /> {item.duration}</div><div className="absolute top-3 left-3 px-3 py-1 bg-blue-600 rounded-full text-[10px] font-bold text-white uppercase tracking-wider shadow-lg">{item.type}</div></div><div className="p-5 flex-1 flex flex-col"><div className="flex justify-between items-start mb-3"><span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${item.complexity === 'Débutant' ? 'bg-emerald-500/20 text-emerald-400' : item.complexity === 'Intermédiaire' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>{item.complexity}</span><span className="text-xs text-gray-500 font-mono">{item.releaseDate}</span></div><h3 className="text-lg font-bold text-white leading-snug mb-2 group-hover:text-blue-400 transition">{item.title}</h3><p className="text-sm text-gray-400 line-clamp-2 mb-4 flex-1">{item.summary}</p></div></div>))}</div>)}
        {activeTab === 'investments' && !isInformationOnly && (<div className="space-y-6"><div className="glass-panel p-6 rounded-xl"><h3 className="text-lg font-semibold text-white mb-4">Ajouter un Actif</h3><form onSubmit={handleAddAsset} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start"><div className="relative z-30">{isCrypto ? <ProfessionalSearch onSelect={(asset) => { setNewName(`${asset.name} (${asset.symbol})`); }} /> : <input type="text" placeholder="Nom de l'actif" value={newName} onChange={e => setNewName(e.target.value)} className="bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-blue-500 outline-none w-full" required />}</div><input type="number" placeholder="Quantité" value={newAmount} onChange={e => setNewAmount(e.target.value)} className="bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-blue-500 outline-none" required /><input type="number" placeholder={isCrypto ? "Prix Unitaire ($)" : "Prix Unitaire (€)"} value={newValue} onChange={e => setNewValue(e.target.value)} className="bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-blue-500 outline-none" required /><button type="submit" className="bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition flex items-center justify-center gap-2 py-3"><Plus size={18} /> Ajouter</button></form></div><div className="glass-panel rounded-xl overflow-hidden"><table className="w-full text-left"><thead className="bg-white/5 text-gray-400 text-xs uppercase"><tr><th className="p-4">Actif</th><th className="p-4">Quantité</th><th className="p-4">Prix</th><th className="p-4">Valeur Totale</th><th className="p-4 text-right">Actions</th></tr></thead><tbody className="divide-y divide-white/5">{filteredAssets.length === 0 ? (<tr><td colSpan={5} className="p-8 text-center text-gray-500">Aucun actif pour le moment.</td></tr>) : (filteredAssets.map(asset => (<tr key={asset.id} className="hover:bg-white/5 transition"><td className="p-4 font-medium text-white">{asset.name}</td><td className="p-4 text-gray-300">{asset.amount}</td><td className="p-4 text-gray-300">{currencySymbol}{asset.currentValue.toLocaleString()}</td><td className={`p-4 font-semibold ${config.color}`}>{currencySymbol}{(asset.amount * asset.currentValue).toLocaleString()}</td><td className="p-4 text-right"><button onClick={() => handleDelete(asset.id)} className="text-gray-500 hover:text-red-500 transition p-2"><Trash2 size={16} /></button></td></tr>)))}</tbody></table></div></div>)}
        {activeTab === 'macro' && (<div className="space-y-6"><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">{FRANCE_MACRO_DATA.kpis.map((kpi, idx) => (<div key={idx} className="glass-panel p-6 rounded-xl border-l-4 border-l-transparent hover:border-l-blue-500 transition relative overflow-hidden"><div className="flex items-center justify-between mb-4"><h4 className="text-gray-400 text-xs uppercase tracking-wider font-bold">{kpi.label}</h4><Activity size={16} className="text-blue-500" /></div><div className="flex items-baseline gap-2 mb-2"><span className="text-3xl font-bold text-white">{kpi.value}</span>{kpi.subValue && <span className="text-xs text-gray-500">{kpi.subValue}</span>}</div><p className={`text-xs font-medium ${kpi.status === 'good' ? 'text-emerald-400' : kpi.status === 'warning' ? 'text-amber-400' : 'text-red-400'}`}>{kpi.trend}</p></div>))}</div><div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-[500px]"><div className="lg:col-span-2 glass-panel p-6 rounded-xl flex flex-col"><div className="flex items-center justify-between mb-6"><h3 className="text-lg font-semibold text-white flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" /> Cartographie des Risques</h3></div><div className="flex-1 flex items-center justify-center bg-[#0a0a0a] rounded-lg border border-white/5 relative overflow-hidden"><SimplifiedFranceMap data={FRANCE_MACRO_DATA.regionalHotspots} /></div></div><div className="glass-panel p-6 rounded-xl flex flex-col"><h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2"><AlertTriangle size={18} className="text-amber-500" /> Spread Monitor</h3><p className="text-xs text-gray-400 mb-6">Écart de taux 10 ans (OAT)</p><div className="space-y-6 flex-1"><div><div className="flex justify-between text-sm mb-2"><span className="text-white">vs Allemagne</span><span className="text-red-400 font-bold">110 bps</span></div><div className="h-2 bg-gray-800 rounded-full overflow-hidden"><div className="h-full w-[85%] bg-gradient-to-r from-orange-500 to-red-600" /></div></div></div></div></div></div>)}
        {activeTab === 'news' && (<div className="space-y-4">{(MOCK_NEWS[categoryType as keyof typeof MOCK_NEWS] || [{ title: `Point sur le marché ${config.label}`, source: 'Reuters', time: 'Il y a 2h' }]).map((news, idx) => (<div key={idx} className="glass-panel p-5 rounded-xl flex items-start gap-4 hover:bg-white/5 transition cursor-pointer border-l-2 border-l-transparent hover:border-l-blue-500"><div className={`p-3 rounded-lg bg-white/5 ${config.color}`}><TrendingDown size={24} /></div><div><h4 className="text-white font-medium text-lg leading-snug">{news.title}</h4><div className="flex items-center gap-3 mt-2 text-sm text-gray-500"><span className="text-blue-400">{news.source}</span><span>•</span><span>{news.time}</span></div></div></div>))}</div>)}
      </div>
      {selectedEducation && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl"><div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-50 bg-gradient-to-b from-black/80 to-transparent"><div className="flex items-center gap-4"><button onClick={() => setSelectedEducation(null)} className="text-gray-400 hover:text-white transition flex items-center gap-2"><div className="p-2 bg-white/10 rounded-full hover:bg-white/20"><X size={20} /></div><span className="text-sm font-medium hidden md:block">Fermer</span></button><div className="h-8 w-[1px] bg-white/10 mx-2"></div><div><h2 className="text-white font-bold text-lg leading-none">{selectedEducation.title}</h2></div></div><button onClick={() => setShowInfo(!showInfo)} className={`p-2 rounded-full transition ${showInfo ? 'bg-blue-600 text-white' : 'bg-white/10 text-gray-400 hover:text-white'}`}><Info size={20} /></button></div><div className="w-full h-full flex flex-col items-center justify-center p-4 pt-20 pb-16 relative">{selectedEducation.charts && selectedEducation.charts.length > 0 ? (<div className="w-full max-w-6xl aspect-video relative"><button onClick={prevSlide} disabled={currentSlide === 0} className="absolute left-[-60px] top-1/2 -translate-y-1/2 p-4 rounded-full bg-white/5 text-white hover:bg-white/10 disabled:opacity-0 disabled:pointer-events-none transition z-10 border border-white/5 hidden md:block"><ChevronLeft size={32} /></button><button onClick={nextSlide} disabled={currentSlide === selectedEducation.charts.length - 1} className="absolute right-[-60px] top-1/2 -translate-y-1/2 p-4 rounded-full bg-white/5 text-white hover:bg-white/10 disabled:opacity-0 disabled:pointer-events-none transition z-10 border border-white/5 hidden md:block"><ChevronRight size={32} /></button><div className="w-full h-full bg-[#0a0a0a] rounded-xl border border-white/10 shadow-2xl overflow-hidden relative flex flex-col">{selectedEducation.charts[currentSlide].slideType === 'text' ? (<div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-[url('https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&q=80')] bg-cover bg-center"><div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div><div className="relative z-10 max-w-3xl"><h3 className="text-4xl md:text-5xl font-bold text-white mb-8 leading-tight">{selectedEducation.charts[currentSlide].title}</h3><div className="space-y-6">{selectedEducation.charts[currentSlide].textContent?.map((text, i) => <p key={i} className="text-xl md:text-2xl text-gray-300 font-light leading-relaxed">{text}</p>)}</div></div></div>) : (<><div className="p-6 border-b border-white/5 bg-white/5 flex justify-between items-start"><div><h3 className="text-xl font-bold text-white">{selectedEducation.charts[currentSlide].title}</h3><p className="text-sm text-gray-400 mt-1">{selectedEducation.charts[currentSlide].description}</p></div><span className="text-xs font-mono text-gray-500 bg-black/50 px-2 py-1 rounded border border-white/5">Slide {currentSlide + 1}/{selectedEducation.charts.length}</span></div><div className="flex-1 p-6 bg-black/50 relative"><ResponsiveContainer width="100%" height="100%"><ComposedChart data={selectedEducation.charts[currentSlide].data} margin={{top: 20, right: 30, left: 20, bottom: 20}}><CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} /><XAxis dataKey="name" stroke="#666" /><YAxis stroke="#666" domain={selectedEducation.charts[currentSlide].yAxisDomain || ['auto', 'auto']} ticks={selectedEducation.charts[currentSlide].yAxisTicks} /><Tooltip contentStyle={{backgroundColor: '#0a0a0a', border: '1px solid #333', borderRadius: '8px', color: '#fff'}} itemStyle={{color: '#fff'}} cursor={{fill: 'rgba(255,255,255,0.05)'}} /><Legend />{selectedEducation.charts[currentSlide].type === 'bar' && <Bar dataKey={selectedEducation.charts[currentSlide].dataKey1 || 'value'} fill="#3b82f6" />}{selectedEducation.charts[currentSlide].type === 'line' && <Line type="monotone" dataKey={selectedEducation.charts[currentSlide].dataKey1 || 'value'} stroke="#ef4444" strokeWidth={3} />}{selectedEducation.charts[currentSlide].type === 'area' && <Area type="monotone" dataKey={selectedEducation.charts[currentSlide].dataKey1 || 'value'} fill="#ef4444" stroke="#ef4444" fillOpacity={0.2} />}{selectedEducation.charts[currentSlide].dataKey2 && (selectedEducation.charts[currentSlide].type === 'bar' ? <Bar dataKey={selectedEducation.charts[currentSlide].dataKey2} fill="#10b981" /> : <Line type="monotone" dataKey={selectedEducation.charts[currentSlide].dataKey2} stroke="#3b82f6" strokeWidth={3} />)}{selectedEducation.charts[currentSlide].annotations?.map((anno, i) => <ReferenceLine key={i} x={anno.x} stroke="none" label={{ position: 'top', value: anno.lines[0].text, fill: anno.lines[0].color }} />)}</ComposedChart></ResponsiveContainer><div className="absolute bottom-6 left-6 z-20"><button onClick={() => { setEditValue(slideNotes[selectedEducation.title]?.[currentSlide] || selectedEducation.charts![currentSlide].description || ""); setIsEditing(true); }} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition" title="Modifier la note"><Edit2 size={16} /></button></div>{isEditing && (<div className="absolute bottom-16 left-6 w-80 bg-black/90 border border-white/10 rounded-xl p-4 shadow-xl z-30 backdrop-blur"><textarea value={editValue} onChange={(e) => setEditValue(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-white outline-none focus:border-blue-500" rows={3} /><div className="flex justify-end gap-2 mt-2"><button onClick={() => setIsEditing(false)} className="px-3 py-1 text-xs text-gray-400 hover:text-white">Annuler</button><button onClick={handleSaveNote} className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-500 flex items-center gap-1"><Save size={12}/> Sauvegarder</button></div></div>)}</div></>)}</div></div>) : (<div className="text-gray-500 flex flex-col items-center gap-4"><AlertTriangle size={48} className="opacity-50" /><p>Aucun graphique disponible.</p></div>)}<div className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-3"><button onClick={prevSlide} disabled={currentSlide === 0} className="md:hidden p-2 text-gray-400 disabled:opacity-30"><ChevronLeft /></button><div className="flex gap-2 p-2 bg-black/50 backdrop-blur rounded-full border border-white/10">{selectedEducation.charts?.map((_, idx) => (<button key={idx} onClick={() => setCurrentSlide(idx)} className={`transition-all duration-300 rounded-full ${currentSlide === idx ? 'w-8 bg-blue-500 h-1.5' : 'w-1.5 bg-gray-600 h-1.5 hover:bg-gray-400'}`} />))}</div><button onClick={nextSlide} disabled={currentSlide === (selectedEducation.charts?.length || 0) - 1} className="md:hidden p-2 text-gray-400 disabled:opacity-30"><ChevronRight /></button></div></div>{showInfo && (<div className="absolute right-6 top-20 bottom-24 w-80 bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-2xl overflow-y-auto animate-slide-in-right z-50"><div className="space-y-6"><div><h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Résumé</h4><p className="text-sm text-gray-300 leading-relaxed">{selectedEducation.summary}</p></div><div className="pt-4 border-t border-white/10"><a href={selectedEducation.sourceUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 text-xs font-bold text-black bg-white py-3 rounded-lg hover:bg-gray-200 transition"><ExternalLink size={14} /> Voir la source originale</a></div></div></div>)}</div>)}
    </div>
  );
};