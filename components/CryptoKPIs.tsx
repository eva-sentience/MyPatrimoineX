import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Activity, DollarSign } from 'lucide-react';

interface CryptoKPI {
  label: string;
  value: string;
  subValue?: string;
  trend: string;
  status: 'good' | 'warning' | 'bad';
}

export const CryptoKPIs: React.FC = () => {
  const [kpis, setKpis] = useState<CryptoKPI[]>([
    {
      label: 'Prix Bitcoin',
      value: '$--,---',
      trend: 'Chargement...',
      status: 'good',
    },
    {
      label: 'Market Cap',
      value: '$-- T',
      trend: 'Chargement...',
      status: 'good',
    },
    {
      label: 'Volume 24h',
      value: '$-- Mds',
      trend: 'Chargement...',
      status: 'good',
    },
    {
      label: 'Dominance BTC',
      value: '--%',
      trend: 'Chargement...',
      status: 'good',
    },
  ]);

  useEffect(() => {
    const fetchCryptoData = async () => {
      try {
        // Fetch Bitcoin price from CoinGecko
        const response = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true'
        );
        const data = await response.json();

        // Fetch global data
        const globalResponse = await fetch('https://api.coingecko.com/api/v3/global');
        const globalData = await globalResponse.json();

        const btcPrice = data.bitcoin.usd;
        const btcChange = data.bitcoin.usd_24h_change;
        const marketCap = data.bitcoin.usd_market_cap;
        const volume24h = data.bitcoin.usd_24h_vol;
        const btcDominance = globalData.data.market_cap_percentage.btc;

        setKpis([
          {
            label: 'Prix Bitcoin',
            value: `$${btcPrice.toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
            trend: `${btcChange >= 0 ? '+' : ''}${btcChange.toFixed(2)}% (24h)`,
            status: btcChange >= 0 ? 'good' : 'bad',
          },
          {
            label: 'Market Cap',
            value: `$${(marketCap / 1e12).toFixed(2)} T`,
            trend: 'Capitalisation totale',
            status: 'good',
          },
          {
            label: 'Volume 24h',
            value: `$${(volume24h / 1e9).toFixed(1)} Mds`,
            trend: 'Volume d\'échange',
            status: 'good',
          },
          {
            label: 'Dominance BTC',
            value: `${btcDominance.toFixed(1)}%`,
            trend: 'Part de marché',
            status: btcDominance > 50 ? 'good' : 'warning',
          },
        ]);
      } catch (error) {
        console.error('Error fetching crypto data:', error);
        // Keep default values on error
      }
    };

    fetchCryptoData();
    // Refresh every 60 seconds
    const interval = setInterval(fetchCryptoData, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpis.map((kpi, idx) => (
        <div
          key={idx}
          className="glass-panel p-6 rounded-xl border-l-4 border-l-transparent hover:border-l-blue-500 transition relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-gray-400 text-xs uppercase tracking-wider font-bold">
              {kpi.label}
            </h4>
            <Activity size={16} className="text-blue-500" />
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-bold text-white">{kpi.value}</span>
            {kpi.subValue && (
              <span className="text-xs text-gray-500">{kpi.subValue}</span>
            )}
          </div>
          <p
            className={`text-xs font-medium flex items-center gap-1 ${
              kpi.status === 'good'
                ? 'text-emerald-400'
                : kpi.status === 'warning'
                  ? 'text-amber-400'
                  : 'text-red-400'
            }`}
          >
            {kpi.status === 'good' && <TrendingUp size={12} />}
            {kpi.status === 'bad' && <TrendingDown size={12} />}
            {kpi.trend}
          </p>
        </div>
      ))}
    </div>
  );
};
