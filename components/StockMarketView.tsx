import React from 'react';
import { Activity, TrendingUp, TrendingDown } from 'lucide-react';

interface StockKPI {
  label: string;
  value: string;
  subValue?: string;
  trend: string;
  status: 'good' | 'warning' | 'bad';
}

const STOCK_KPIS: StockKPI[] = [
  {
    label: 'CAC 40',
    value: '7,450',
    subValue: 'pts',
    trend: '+1.2% (24h)',
    status: 'good',
  },
  {
    label: 'S&P 500',
    value: '4,890',
    subValue: 'pts',
    trend: '+0.8% (24h)',
    status: 'good',
  },
  {
    label: 'NASDAQ',
    value: '15,320',
    subValue: 'pts',
    trend: '+1.5% (24h)',
    status: 'good',
  },
  {
    label: 'DAX',
    value: '16,800',
    subValue: 'pts',
    trend: '+0.5% (24h)',
    status: 'good',
  },
];

const TOP_STOCKS = [
  {
    name: 'Apple',
    symbol: 'AAPL',
    price: '$185.50',
    change: '+2.3%',
    mcap: '$2.9T',
  },
  {
    name: 'Microsoft',
    symbol: 'MSFT',
    price: '$378.20',
    change: '+1.8%',
    mcap: '$2.8T',
  },
  {
    name: 'NVIDIA',
    symbol: 'NVDA',
    price: '$495.30',
    change: '+3.5%',
    mcap: '$1.2T',
  },
  {
    name: 'Amazon',
    symbol: 'AMZN',
    price: '$155.80',
    change: '+1.2%',
    mcap: '$1.6T',
  },
];

export const StockMarketView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {STOCK_KPIS.map((kpi, idx) => (
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

      {/* Top Stocks */}
      <div className="glass-panel p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <Activity size={18} className="text-blue-500" />
          Actions Tendance
        </h3>
        <div className="space-y-4">
          {TOP_STOCKS.map((stock, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-4 hover:bg-white/5 rounded-lg transition cursor-pointer border border-transparent hover:border-white/5"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${
                    stock.change.startsWith('+')
                      ? 'bg-emerald-900/30 text-emerald-400'
                      : 'bg-red-900/30 text-red-400'
                  }`}
                >
                  {stock.symbol.substring(0, 2)}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{stock.name}</p>
                  <p className="text-xs text-gray-500">{stock.symbol} • {stock.mcap}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-white">{stock.price}</p>
                <p
                  className={`text-xs font-medium ${
                    stock.change.startsWith('+')
                      ? 'text-emerald-400'
                      : 'text-red-400'
                  }`}
                >
                  {stock.change}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
