import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { Asset, AssetType } from '../types';
import { ASSET_CATEGORIES } from '../constants';

interface DashboardProps {
  assets: Asset[];
}

export const Dashboard: React.FC<DashboardProps> = ({ assets }) => {
  const totalNetWorth = assets.reduce((acc, a) => acc + (a.amount * a.currentValue), 0);
  
  // Filter out France Invest from charts as it is informational only
  const dataByCategory = ASSET_CATEGORIES
    .filter(c => c.type !== AssetType.FRANCE_INVEST)
    .map(cat => {
        const value = assets
        .filter(a => a.type === cat.type)
        .reduce((acc, a) => acc + (a.amount * a.currentValue), 0);
        
        return {
        name: cat.label,
        value: value,
        color: cat.color // This is a tailwind class, we need hex for Recharts
        };
    }).filter(d => d.value > 0);

  const getHexColor = (twClass: string) => {
    if (twClass.includes('amber')) return '#f59e0b';
    if (twClass.includes('emerald')) return '#10b981';
    if (twClass.includes('blue')) return '#60a5fa';
    if (twClass.includes('indigo')) return '#6366f1';
    if (twClass.includes('fuchsia')) return '#d946ef';
    if (twClass.includes('yellow')) return '#facc15';
    if (twClass.includes('rose')) return '#f43f5e';
    if (twClass.includes('purple')) return '#a855f7';
    return '#ffffff';
  };

  return (
    <div className="flex-1 h-full overflow-y-auto p-8 space-y-8">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="glass-panel p-6 rounded-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-20 bg-blue-500/10 blur-3xl rounded-full pointer-events-none" />
            <h3 className="text-gray-400 text-sm uppercase tracking-wider font-medium">Patrimoine Net</h3>
            <div className="mt-2 flex items-baseline gap-2">
               <span className="text-4xl font-bold text-white">€{totalNetWorth.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</span>
               <span className="text-emerald-400 text-sm font-medium">+2.4%</span>
            </div>
         </div>
         <div className="glass-panel p-6 rounded-xl">
            <h3 className="text-gray-400 text-sm uppercase tracking-wider font-medium">Meilleure Perf.</h3>
            <div className="mt-2">
               <span className="text-2xl font-semibold text-white">Bitcoin</span>
               <p className="text-gray-500 text-sm">Crypto • +12% ce mois</p>
            </div>
         </div>
         <div className="glass-panel p-6 rounded-xl">
             <h3 className="text-gray-400 text-sm uppercase tracking-wider font-medium">Score Diversification</h3>
             <div className="mt-2 flex items-center gap-4">
                <div className="h-2 flex-1 bg-gray-800 rounded-full overflow-hidden">
                   <div className="h-full w-[75%] bg-gradient-to-r from-blue-500 to-purple-500" />
                </div>
                <span className="text-white font-bold">75/100</span>
             </div>
         </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Allocation Pie */}
        <div className="glass-panel p-6 rounded-xl h-[400px] flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-6">Allocation d'Actifs</h3>
          <div className="flex-1 w-full">
            {dataByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dataByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {dataByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getHexColor(ASSET_CATEGORIES.find(c => c.label === entry.name)?.color || '')} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#050505', borderColor: '#333', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(value: number) => `€${value.toLocaleString()}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
               <div className="h-full flex items-center justify-center text-gray-500">
                 Aucune donnée. Ajoutez des actifs pour voir la répartition.
               </div>
            )}
          </div>
        </div>

        {/* Simple Breakdown List */}
        <div className="glass-panel p-6 rounded-xl h-[400px] overflow-y-auto">
           <h3 className="text-lg font-semibold text-white mb-6">Répartition par Catégorie</h3>
           <div className="space-y-4">
              {dataByCategory.map((cat) => (
                <div key={cat.name} className="flex items-center justify-between p-3 hover:bg-white/5 rounded-lg transition">
                   <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: getHexColor(ASSET_CATEGORIES.find(c => c.label === cat.name)?.color || '')}} />
                      <span className="text-white font-medium">{cat.name}</span>
                   </div>
                   <div className="text-right">
                      <p className="text-white font-medium">€{cat.value.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">{((cat.value / totalNetWorth) * 100).toFixed(1)}%</p>
                   </div>
                </div>
              ))}
              {dataByCategory.length === 0 && <p className="text-gray-500">Aucun investissement enregistré.</p>}
           </div>
        </div>
      </div>
    </div>
  );
};