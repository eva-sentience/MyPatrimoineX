import React, { useState, useEffect } from 'react';
import { AssetType } from '../types';
import { ASSET_CATEGORIES } from '../constants';
import { storageService } from '../services/storageService';
import { 
  LayoutDashboard, 
  Building, 
  TrendingUp, 
  Scroll, 
  Briefcase, 
  Bitcoin, 
  Coins, 
  Gem,
  GripVertical,
  Hexagon,
  Flag
} from 'lucide-react';

interface SidebarProps {
  activeCategory: AssetType | 'dashboard';
  onSelect: (category: AssetType | 'dashboard') => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Building, TrendingUp, Scroll, Briefcase, Bitcoin, Coins, Gem, Hexagon, Flag
};

export const Sidebar: React.FC<SidebarProps> = ({ activeCategory, onSelect }) => {
  const [order, setOrder] = useState<AssetType[]>([]);

  useEffect(() => {
    const defaultOrder = ASSET_CATEGORIES.map(c => c.type);
    const storedOrder = storageService.getSidebarOrder(defaultOrder);
    
    // Ensure all categories exist in the order (in case of updates)
    const mergedOrder = [...new Set([...storedOrder, ...defaultOrder])];
    // Also ensure we aren't keeping deleted categories
    const validOrder = mergedOrder.filter(type => ASSET_CATEGORIES.some(c => c.type === type));
    
    if (validOrder.length !== storedOrder.length) {
        storageService.saveSidebarOrder(validOrder);
    }
    setOrder(validOrder);
  }, []);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); 
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (isNaN(sourceIndex) || sourceIndex === targetIndex) return;

    const newOrder = [...order];
    const [movedItem] = newOrder.splice(sourceIndex, 1);
    newOrder.splice(targetIndex, 0, movedItem);

    setOrder(newOrder);
    storageService.saveSidebarOrder(newOrder);
  };

  return (
    <aside className="w-20 lg:w-64 bg-obsidian border-r border-white/10 flex flex-col h-screen shrink-0 transition-all duration-300">
      <div className="p-6 flex items-center gap-3 border-b border-white/5">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-purple-500/20">
          P
        </div>
        <span className="hidden lg:block font-bold text-lg tracking-tight text-white">Patrimoine<span className="text-purple-500">X</span></span>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 space-y-1">
        {/* Dashboard Main Link */}
        <button
          onClick={() => onSelect('dashboard')}
          className={`w-full px-4 py-3 flex items-center gap-3 transition-colors relative
            ${activeCategory === 'dashboard' ? 'text-white bg-white/5' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
        >
          {activeCategory === 'dashboard' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />}
          <LayoutDashboard size={20} />
          <span className="hidden lg:block font-medium">Tableau de bord</span>
        </button>

        <div className="px-4 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:block mt-4">
          Portefeuille
        </div>

        {order.map((type, index) => {
          const config = ASSET_CATEGORIES.find(c => c.type === type);
          if (!config) return null;
          const Icon = ICON_MAP[config.iconName] || Gem;
          
          return (
            <div
              key={type}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              onClick={() => onSelect(type)}
              className={`group relative w-full px-4 py-3 flex items-center gap-3 cursor-pointer transition-colors
                ${activeCategory === type ? `bg-white/5 text-white` : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}
              `}
            >
              {activeCategory === type && (
                <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${config.gradient.replace('/20', '')}`} />
              )}
              
              <div className="absolute left-1 opacity-0 group-hover:opacity-100 cursor-grab text-gray-600">
                <GripVertical size={12} />
              </div>

              <Icon size={20} className={`transition-colors ${activeCategory === type ? config.color : ''} ml-2`} />
              <span className="hidden lg:block font-medium truncate">{config.label}</span>
            </div>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
         <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-gray-700 to-gray-600 border border-white/10" />
            <div className="hidden lg:block overflow-hidden">
                <p className="text-sm font-medium text-white truncate">Investisseur</p>
                <p className="text-xs text-gray-500 truncate">Plan Premium</p>
            </div>
         </div>
      </div>
    </aside>
  );
};