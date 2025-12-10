import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react';
import { 
  fetchLatestTopMarketIndicators, 
  transformIndicatorForDisplay 
} from '../services/topMarketService';
import { TopMarketIndicatorDisplay } from '../types/indicators';

export default function TopMarketIndicators() {
  const [indicators, setIndicators] = useState<TopMarketIndicatorDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadIndicators = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchLatestTopMarketIndicators();
      const displayData = data.map(transformIndicatorForDisplay);
      setIndicators(displayData);
    } catch (err) {
      console.error('Erreur chargement indicateurs:', err);
      setError('Impossible de charger les indicateurs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIndicators();
  }, []);

  const getStatusIcon = (status: 'positive' | 'negative' | 'neutral') => {
    if (status === 'positive') return <TrendingUp className="w-5 h-5 text-green-500" />;
    if (status === 'negative') return <TrendingDown className="w-5 h-5 text-red-500" />;
    return <Minus className="w-5 h-5 text-gray-400" />;
  };

  const getStatusColor = (status: 'positive' | 'negative' | 'neutral') => {
    if (status === 'positive') return 'bg-green-50 border-green-200';
    if (status === 'negative') return 'bg-red-50 border-red-200';
    return 'bg-gray-50 border-gray-200';
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-24 bg-gray-100 rounded-xl"></div>
        <div className="h-24 bg-gray-100 rounded-xl"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-600 font-medium">{error}</p>
        <button
          onClick={loadIndicators}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors inline-flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Réessayer
        </button>
      </div>
    );
  }

  if (indicators.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
        <p className="text-gray-600">Aucun indicateur disponible</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Indicateurs Top Marché
        </h3>
        <button
          onClick={loadIndicators}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Rafraîchir"
        >
          <RefreshCw className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {indicators.map((indicator, index) => (
        <div
          key={index}
          className={`border rounded-xl p-6 transition-all hover:shadow-md ${getStatusColor(
            indicator.status
          )}`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                {getStatusIcon(indicator.status)}
                <h4 className="font-semibold text-gray-900">{indicator.label}</h4>
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">
                {indicator.value}
              </p>
              {indicator.detail && (
                <p className="text-sm text-gray-600 mb-2">{indicator.detail}</p>
              )}
              <p className="text-xs text-gray-500">
                Mis à jour : {indicator.updatedAt}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
