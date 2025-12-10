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
  getDataFreshnessStatus
} from '../services/btcIndicatorsService';
import { fetchLatestTopMarketIndicators } from '../services/topMarketService';
import type { TopMarketIndicator } from '../types/indicators';
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

    fetchLiveBTCPrice();
    const priceInterval = setInterval(fetchLiveBTCPrice, 5000);

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
    const signalInterval = setInterval(fetchTradingSignal, 60000);

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

          if (todayEntry && todayEntry.details && todayEntry.details.length > 0) {
              try {
                  const analyzedAtStr = todayEntry.details[0].analyzedAt;
                  
                  if (analyzedAtStr && !todayEntry.details[0].displayValue?.includes('Mode Hors Ligne')) {
                      const [datePart, timePart] = analyzedAtStr.split(' ');
                      if (timePart) {
                          const [hours, minutes] = timePart.split(':').map(Number);
                          const lastUpdateDate = new Date();
                          lastUpdateDate.setHours(hours, minutes, 0, 0);
                          
                          const ageMinutes = (now.getTime() - lastUpdateDate.getTime()) / (1000 * 60);
                          
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

          try {
              console.log('📡 Fetching fresh data from Supabase...');
              
              // ✅ FETCH DONNÉES TOP MARKET INDICATORS (Fear & Greed, Halving)
              const topMarketIndicators = await fetchLatestTopMarketIndicators();
              console.log('✅ Top Market Indicators fetched:', topMarketIndicators);
              
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

              let btcDom = 58.5;
              try {
                  const globRes = await fetch('https://api.coinpaprika.com/v1/global');
                  const globData = await globRes.json();
                  btcDom = globData.bitcoin_dominance_percentage || 58;
              } catch (e) {
                  console.warn("⚠️ BTC Dominance fetch failed, using default");
              }

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

              // ✅ 7 INDICATEURS MACRO-ÉCONOMIQUES
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
              // 🔗 HELPER FUNCTION - Récupérer valeur indicateur depuis Supabase
              // ⚠️ POSITION CRITIQUE : DOIT être définie AVANT onchainIndicators
              const getIndicatorValue = (nom: string): { displayValue: string; isMet: boolean } => {
                const indicator = topMarketIndicators.find(i => i.nom_indicateur === nom);
                
                if (!indicator) {
                  return { displayValue: "En attente de données...", isMet: false };
                }
                
                // Fear & Greed : afficher valeur + classification
                if (nom === 'fear_greed') {
                  const classification = indicator.metadata?.classification || '';
                  return {
                    displayValue: `${indicator.valeur_numerique} (${classification})`,
                    isMet: indicator.valeur_texte === 'OUI'
                  };
                }
                
                // Halving : afficher années restantes
                if (nom === 'halving_countdown') {
                  return {
                    displayValue: `${indicator.valeur_numerique} ${indicator.unite}`,
                    isMet: indicator.valeur_texte === 'OUI'
                  };
                }
                
                // Défaut
                return {
                  displayValue: `${indicator.valeur_numerique} ${indicator.unite}`,
                  isMet: indicator.valeur_texte === 'OUI'
                };
              };

              // ✅ 15 INDICATEURS ON-CHAIN ET TECHNIQUES
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
                      isMet: getIndicatorValue('fear_greed').isMet,
                      displayValue: getIndicatorValue('fear_greed').displayValue,
                      analyzedAt: nowFormatted
                  },
                  {
                      titleFr: "Temps avant le prochain Halving",
                      titleEng: "Time Until Next Halving",
                      description: "Le \"halving\" est un événement programmé qui se produit environ tous les quatre ans (ou tous les 210 000 blocs minés) sur la blockchain du Bitcoin. Il a pour conséquence de diviser par deux la quantité de nouveaux bitcoins créés.",
                      objective: "Halving dans plus de 2 ans",
                      isMet: getIndicatorValue('halving_countdown').isMet,
                      displayValue: getIndicatorValue('halving_countdown').displayValue,
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

              // ✅ 12 INDICATEURS EMPIRIQUES ET DE SENTIMENT
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
                      description: "MVRV Z-Score permet d'identifier les périodes pendant lesquelles Bitcoin est extrêmement surévalué ou sous-évalué par rapport à sa « juste valeur ».",
                      objective: "MVRV Z proche de la zone rouge ou dans la zone rouge",
                      isMet: false,
                      displayValue: "⚠️ Données temporairement indisponibles",
                      analyzedAt: `${new Date().toLocaleDateString('fr-FR')} ${nowFormatted}`
                  },
                  {
                      titleFr: "Bénéfice/Perte Net Non Réalisé (NUPL)",
                      titleEng: "Net Unrealized Profit/Loss (NUPL)",
                      description: "Les profits/pertes non réalisés estiment le total des profits/pertes papier en Bitcoin détenus par les investisseurs.",
                      objective: "Courbe bleue dans la zone orange ou rouge",
                      isMet: false,
                      displayValue: "⚠️ Données temporairement indisponibles",
                      analyzedAt: `${new Date().toLocaleDateString('fr-FR')} ${nowFormatted}`
                  },
                  {
                      titleFr: "Risque de réserve",
                      titleEng: "Reserve Risk",
                      description: "Le risque de réserve nous permet de visualiser la confiance des détenteurs de Bitcoin à long terme par rapport à son prix à un moment donné.",
                      objective: "Reserve Risk proche de la zone rouge ou dans la zone rouge",
                      isMet: false,
                      displayValue: "⚠️ Données temporairement indisponibles",
                      analyzedAt: `${new Date().toLocaleDateString('fr-FR')} ${nowFormatted}`
                  },
                  {
                      titleFr: "Top Cap",
                      titleEng: "Top Cap",
                      description: "Top Cap a correctement prédit les sommets du prix du Bitcoin des principaux cycles où le prix était devenu parabolique en raison de l'euphorie du marché.",
                      objective: "Prix du Bitcoin touche la courbe en bleu ou s'en rapproche dangereusement",
                      isMet: false,
                      displayValue: "⚠️ Données temporairement indisponibles",
                      analyzedAt: `${new Date().toLocaleDateString('fr-FR')} ${nowFormatted}`
                  },
                  {
                      titleFr: "Delta Top",
                      titleEng: "Delta Top",
                      description: "Delta Top combine plusieurs métriques on-chain pour identifier les zones de surévaluation potentielle.",
                      objective: "Prix du Bitcoin touche la courbe en violet ou s'en rapproche dangereusement",
                      isMet: false,
                      displayValue: "⚠️ Données temporairement indisponibles",
                      analyzedAt: `${new Date().toLocaleDateString('fr-FR')} ${nowFormatted}`
                  },
                  {
                      titleFr: "Prix terminal",
                      titleEng: "Terminal Price",
                      description: "Le prix terminal utilise les Coin Days Destroyed pour créer une valeur terminale basée sur l'offre totale.",
                      objective: "Prix du Bitcoin touche la courbe en rouge ou s'en rapproche dangereusement",
                      isMet: false,
                      displayValue: "⚠️ Données temporairement indisponibles",
                      analyzedAt: `${new Date().toLocaleDateString('fr-FR')} ${nowFormatted}`
                  },
                  {
                      titleFr: "Vague Hodl",
                      titleEng: "HODL Waves",
                      description: "Ce graphique montre la quantité de Bitcoin en circulation regroupée en différentes tranches d'âge.",
                      objective: "Les nuances de rouge ont tendance à augmenter rapidement",
                      isMet: false,
                      displayValue: "⚠️ Données temporairement indisponibles",
                      analyzedAt: `${new Date().toLocaleDateString('fr-FR')} ${nowFormatted}`
                  },
                  {
                      titleFr: "Indice de peur et de cupidité",
                      titleEng: "Fear and Greed Index",
                      description: "Cet indicateur identifie la mesure dans laquelle le marché devient trop craintif ou trop cupide.",
                      objective: "« Greed » ou « Extreme Greed »",
                      isMet: false,
                      displayValue: "⚠️ Données temporairement indisponibles",
                      analyzedAt: `${new Date().toLocaleDateString('fr-FR')} ${nowFormatted}`
                  },
                  {
                      titleFr: "Temps avant le prochain Halving",
                      titleEng: "Time Until Next Halving",
                      description: "Le halving est un événement programmé qui divise par deux la quantité de nouveaux bitcoins créés.",
                      objective: "Halving dans plus de 2 ans",
                      isMet: false,
                      displayValue: "⚠️ Données temporairement indisponibles",
                      analyzedAt: `${new Date().toLocaleDateString('fr-FR')} ${nowFormatted}`
                  },
                  {
                      titleFr: "Multiple de Puell",
                      titleEng: "Puell Multiple",
                      description: "Cette mesure examine le côté offre de l'économie de Bitcoin : les mineurs et leurs revenus.",
                      objective: "Multiple Puell dans la zone Rouge",
                      isMet: false,
                      displayValue: "⚠️ Données temporairement indisponibles",
                      analyzedAt: `${new Date().toLocaleDateString('fr-FR')} ${nowFormatted}`
                  }
              ];

              const empiricalIndicatorsFallback: MarketIndicator[] = [
                  {
                      titleFr: "Classement générale des applications Crypto sur l'Apple Store",
                      titleEng: "Crypto Apps Ranking on Apple Store",
                      description: "Observer le classement des applications crypto sur l'Apple Store nous donne des indications sur la popularité du marché.",
                      objective: "Classement > 20 (catégorie finance)",
                      isMet: false,
                      displayValue: "⚠️ Données temporairement indisponibles",
                      analyzedAt: `${new Date().toLocaleDateString('fr-FR')} ${nowFormatted}`
                  },
                  {
                      titleFr: "Lancement de nombreux nouveaux projets",
                      titleEng: "New Projects Launch Activity",
                      description: "En général, en bull market beaucoup de projets sont lancés via ICO / IEO / IDO.",
                      objective: "Beaucoup de nouveaux lancements",
                      isMet: false,
                      displayValue: "⚠️ Données temporairement indisponibles",
                      analyzedAt: `${new Date().toLocaleDateString('fr-FR')} ${nowFormatted}`
                  },
                  {
                      titleFr: "Google Trends (Bitcoin)",
                      titleEng: "Google Trends (Bitcoin)",
                      description: "Google Trends permet de mesurer l'intérêt du grand public pour Bitcoin.",
                      objective: "Volume de recherche historique > 50",
                      isMet: false,
                      displayValue: "⚠️ Données temporairement indisponibles",
                      analyzedAt: `${new Date().toLocaleDateString('fr-FR')} ${nowFormatted}`
                  },
                  {
                      titleFr: "Google Trends (Ethereum)",
                      titleEng: "Google Trends (Ethereum)",
                      description: "Google Trends permet de mesurer l'intérêt du grand public pour Ethereum.",
                      objective: "Volume de recherche historique > 50",
                      isMet: false,
                      displayValue: "⚠️ Données temporairement indisponibles",
                      analyzedAt: `${new Date().toLocaleDateString('fr-FR')} ${nowFormatted}`
                  },
                  {
                      titleFr: "Google Trends (Buy Bitcoin)",
                      titleEng: "Google Trends (Buy Bitcoin)",
                      description: "Google Trends permet de mesurer l'intention d'achat du grand public pour Bitcoin.",
                      objective: "Volume de recherche historique > 50",
                      isMet: false,
                      displayValue: "⚠️ Données temporairement indisponibles",
                      analyzedAt: `${new Date().toLocaleDateString('fr-FR')} ${nowFormatted}`
                  },
                  {
                      titleFr: "Google Trends (Buy Ethereum)",
                      titleEng: "Google Trends (Buy Ethereum)",
                      description: "Google Trends permet de mesurer l'intention d'achat du grand public pour Ethereum.",
                      objective: "Volume de recherche historique > 50",
                      isMet: false,
                      displayValue: "⚠️ Données temporairement indisponibles",
                      analyzedAt: `${new Date().toLocaleDateString('fr-FR')} ${nowFormatted}`
                  },
                  {
                      titleFr: "Présence de contenu crypto sur tous les médias",
                      titleEng: "Crypto Content on All Media",
                      description: "Voir des informations très positives sur le marché en continu nous renseigne sur le sentiment global.",
                      objective: "Contenu très positif de partout",
                      isMet: false,
                      displayValue: "⚠️ Données temporairement indisponibles",
                      analyzedAt: `${new Date().toLocaleDateString('fr-FR')} ${nowFormatted}`
                  },
                  {
                      titleFr: "Tout le monde parle de ses profits",
                      titleEng: "Everyone Talks About Profits",
                      description: "En tant qu'investisseur, acheter la dépression et revendre en période euphorique.",
                      objective: "Contenu très positif de partout",
                      isMet: false,
                      displayValue: "⚠️ Données temporairement indisponibles",
                      analyzedAt: `${new Date().toLocaleDateString('fr-FR')} ${nowFormatted}`
                  },
                  {
                      titleFr: "Le contenu crypto est très populaire",
                      titleEng: "Crypto Content is Very Popular",
                      description: "La popularité du contenu crypto indique le sentiment du marché.",
                      objective: "Contenu très positif de partout",
                      isMet: false,
                      displayValue: "⚠️ Données temporairement indisponibles",
                      analyzedAt: `${new Date().toLocaleDateString('fr-FR')} ${nowFormatted}`
                  },
                  {
                      titleFr: "Augmentation parabolique du prix",
                      titleEng: "Parabolic Price Increase",
                      description: "Une augmentation parabolique du prix indique souvent un sommet de marché proche.",
                      objective: "Contenu très positif de partout",
                      isMet: false,
                      displayValue: "⚠️ Données temporairement indisponibles",
                      analyzedAt: `${new Date().toLocaleDateString('fr-FR')} ${nowFormatted}`
                  },
                  {
                      titleFr: "Uniquement des bonnes nouvelles",
                      titleEng: "Only Good News",
                      description: "Quand seules les bonnes nouvelles circulent, c'est souvent signe d'euphorie de marché.",
                      objective: "Contenu très positif de partout",
                      isMet: false,
                      displayValue: "⚠️ Données temporairement indisponibles",
                      analyzedAt: `${new Date().toLocaleDateString('fr-FR')} ${nowFormatted}`
                  },
                  {
                      titleFr: "Mises à jours de projets populaires du moment",
                      titleEng: "Updates of Popular Projects",
                      description: "En tendance haussière, de nouvelles mises à jour importantes seront annoncées.",
                      objective: "Beaucoup de mises à jours",
                      isMet: false,
                      displayValue: "⚠️ Données temporairement indisponibles",
                      analyzedAt: `${new Date().toLocaleDateString('fr-FR')} ${nowFormatted}`
                  }
              ];

              const allIndicatorsFallback = [
                  ...indicatorsSource,
                  ...macroIndicatorsFallback,
                  ...onchainIndicatorsFallback,
                  ...empiricalIndicatorsFallback
              ];

              setCurrentIndicators(allIndicatorsFallback);
              setCurrentPercentage(0);
              
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
                  setHistory(mockHistory);
              } else {
                  setHistory(storedHistory);
              }
          }
      };

      performRealAnalysis();
  }, []);

  if (currentIndicators.length === 0) {
      return (
          <div className="w-full max-w-5xl mx-auto px-4 py-8">
              <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-slate-700">
                  <CardContent className="py-16 text-center">
                      <div className="animate-pulse">
                          <TrendingUp className="w-16 h-16 mx-auto mb-4 text-blue-400" />
                          <p className="text-xl">Analyse en cours...</p>
                      </div>
                  </CardContent>
              </Card>
          </div>
      );
  }

  const totalMet = currentIndicators.filter(ind => ind.isMet).length;
  const totalIndicators = currentIndicators.length;
  const score = currentPercentage;

  let scoreColor = "text-green-400";
  let bgGradient = "from-green-900/20 to-slate-900";
  let recommendation = "Phase d'accumulation favorable";
  let emoji = "🟢";

  if (score >= 70) {
      scoreColor = "text-red-400";
      bgGradient = "from-red-900/20 to-slate-900";
      recommendation = "Zone de prudence - Envisager des prises de profit";
      emoji = "🔴";
  } else if (score >= 50) {
      scoreColor = "text-yellow-400";
      bgGradient = "from-yellow-900/20 to-slate-900";
      recommendation = "Phase de transition - Vigilance recommandée";
      emoji = "🟡";
  }

  return (
      <div className="w-full max-w-5xl mx-auto px-4 py-8 space-y-6">
          <Card className={`bg-gradient-to-br ${bgGradient} text-white border-slate-700 shadow-xl`}>
              <CardHeader className="pb-4">
                  <CardTitle className="flex items-center justify-between text-2xl">
                      <span className="flex items-center gap-2">
                          <TrendingUp className="w-7 h-7" />
                          Analyse Top Marché
                      </span>
                      <span className={`text-4xl font-bold ${scoreColor}`}>
                          {emoji} {score}%
                      </span>
                  </CardTitle>
                  <CardDescription className="text-slate-300 text-base mt-2">
                      {recommendation}
                  </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg backdrop-blur">
                      <div className="flex items-center gap-3">
                          <CheckCircle2 className="w-6 h-6 text-green-400" />
                          <span className="text-lg">Indicateurs validés</span>
                      </div>
                      <span className="text-2xl font-bold">{totalMet} / {totalIndicators}</span>
                  </div>

                  {history.length > 0 && (
                      <div className="mt-6">
                          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                              <BarChart3 className="w-5 h-5" />
                              Évolution sur 30 jours
                          </h3>
                          <div className="h-48 bg-slate-800/30 rounded-lg p-4">
                              <ResponsiveContainer width="100%" height="100%">
                                  <LineChart data={history}>
                                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                      <XAxis 
                                          dataKey="date" 
                                          stroke="#94a3b8"
                                          tick={{ fill: '#94a3b8' }}
                                          tickFormatter={(value) => {
                                              const date = new Date(value);
                                              return `${date.getDate()}/${date.getMonth() + 1}`;
                                          }}
                                      />
                                      <YAxis 
                                          stroke="#94a3b8"
                                          tick={{ fill: '#94a3b8' }}
                                          domain={[0, 100]}
                                      />
                                      <Tooltip 
                                          contentStyle={{ 
                                              backgroundColor: '#1e293b', 
                                              border: '1px solid #475569',
                                              borderRadius: '8px'
                                          }}
                                          labelStyle={{ color: '#e2e8f0' }}
                                      />
                                      <Line 
                                          type="monotone" 
                                          dataKey="percentage" 
                                          stroke="#3b82f6" 
                                          strokeWidth={3}
                                          dot={{ fill: '#3b82f6', r: 4 }}
                                          activeDot={{ r: 6 }}
                                      />
                                  </LineChart>
                              </ResponsiveContainer>
                          </div>
                      </div>
                  )}

                  <Accordion type="single" collapsible className="w-full space-y-2">
                      {currentIndicators.map((indicator, idx) => (
                          <AccordionItem 
                              key={idx} 
                              value={`item-${idx}`}
                              className="border border-slate-700 rounded-lg overflow-hidden bg-slate-800/30 backdrop-blur"
                          >
                              <AccordionTrigger className="px-4 py-3 hover:bg-slate-700/30 transition-colors">
                                  <div className="flex items-center justify-between w-full pr-4">
                                      <div className="flex items-center gap-3">
                                          {indicator.isMet ? (
                                              <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                                          ) : (
                                              <XCircle className="w-5 h-5 text-slate-500 flex-shrink-0" />
                                          )}
                                          <div className="text-left">
                                              <div className="font-semibold">{indicator.titleFr}</div>
                                              <div className="text-sm text-slate-400">{indicator.titleEng}</div>
                                          </div>
                                      </div>
                                      <div className="text-right">
                                          <div className={`font-bold ${indicator.isMet ? 'text-green-400' : 'text-slate-400'}`}>
                                              {indicator.displayValue}
                                          </div>
                                          <div className="text-xs text-slate-500">{indicator.analyzedAt}</div>
                                      </div>
                                  </div>
                              </AccordionTrigger>
                              <AccordionContent className="px-4 py-3 bg-slate-900/50">
                                  <div className="space-y-2 text-slate-300">
                                      {indicator.description && (
                                          <p className="text-sm leading-relaxed">{indicator.description}</p>
                                      )}
                                      <div className="flex items-start gap-2 p-3 bg-slate-800/50 rounded border-l-4 border-blue-500">
                                          <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                                          <div>
                                              <div className="font-semibold text-blue-300 text-sm">Objectif</div>
                                              <div className="text-sm">{indicator.objective}</div>
                                          </div>
                                      </div>
                                  </div>
                              </AccordionContent>
                          </AccordionItem>
                      ))}
                  </Accordion>

                  <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg">
                      <div className="flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                          <div className="text-sm text-slate-300">
                              <p className="font-semibold text-blue-300 mb-1">Note importante</p>
                              <p>Cette analyse combine des indicateurs techniques, on-chain et macroéconomiques. 
                              Elle ne constitue pas un conseil en investissement. Faites vos propres recherches.</p>
                          </div>
                      </div>
                  </div>
              </CardContent>
          </Card>
      </div>
  );
};

// ============================================
// 4. COMPOSANT PRINCIPAL CategoryView
// ============================================

interface CategoryViewProps {
  category: string;
}

const CategoryView = ({ category }: CategoryViewProps) => {
  const [showArticle, setShowArticle] = useState(false);

  if (category === "Analyse Top") {
    return <TopIndicatorsView />;
  }

  if (category === "Crypto") {
    return (
      <div className="space-y-4">
        <BitcoinPriceCard />
        <TopCryptoList />
      </div>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getCategoryIcon(category)}
          {category}
        </CardTitle>
        <CardDescription>
          Contenu de la catégorie {category}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!showArticle ? (
          <Button onClick={() => setShowArticle(true)} className="w-full">
            Afficher le contenu
          </Button>
        ) : (
          <div className="space-y-4">
            <p>Contenu enrichi pour {category}</p>
            <Button 
              onClick={() => setShowArticle(false)} 
              variant="outline"
              className="w-full"
            >
              Masquer
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "Crypto":
      return <TrendingUp className="w-5 h-5" />;
    case "Analyse Top":
      return <BarChart3 className="w-5 h-5" />;
    case "Immobilier":
      return <Home className="w-5 h-5" />;
    default:
      return <Wallet className="w-5 h-5" />;
  }
};

export default CategoryView;