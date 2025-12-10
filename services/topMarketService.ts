import { supabase } from './supabaseClient';
import { TopMarketIndicator, TopMarketIndicatorDisplay } from '../types/indicators';

/**
 * Récupère les indicateurs Top Marché depuis Supabase
 */
export async function fetchTopMarketIndicators(): Promise<TopMarketIndicator[]> {
  const { data, error } = await supabase
    .from('indicateurs_top_marche')
    .select('*')
    .order('derniere_maj', { ascending: false });

  if (error) {
    console.error('Erreur fetch indicateurs top marché:', error);
    throw error;
  }

  return data || [];
}

/**
 * Récupère les dernières valeurs de chaque indicateur (1 par nom)
 */
export async function fetchLatestTopMarketIndicators(): Promise<TopMarketIndicator[]> {
  const { data, error } = await supabase
    .from('indicateurs_top_marche')
    .select('*')
    .order('date_valeur', { ascending: false });

  if (error) {
    console.error('Erreur fetch latest indicateurs:', error);
    throw error;
  }

  // Grouper par nom_indicateur et garder seulement le plus récent
  const latestByName = new Map<string, TopMarketIndicator>();
  
  (data || []).forEach((indicator) => {
    if (!latestByName.has(indicator.nom_indicateur)) {
      latestByName.set(indicator.nom_indicateur, indicator);
    }
  });

  return Array.from(latestByName.values());
}

/**
 * Transforme un indicateur brut en format d'affichage
 */
export function transformIndicatorForDisplay(
  indicator: TopMarketIndicator
): TopMarketIndicatorDisplay {
  const labels: Record<string, string> = {
    fear_greed: 'Fear & Greed Index',
    halving_countdown: 'Temps avant Halving',
  };

  const getStatus = (valeurTexte: 'OUI' | 'NON'): 'positive' | 'negative' | 'neutral' => {
    if (valeurTexte === 'OUI') return 'positive';
    if (valeurTexte === 'NON') return 'negative';
    return 'neutral';
  };

  const formatValue = (indicator: TopMarketIndicator): string => {
    if (indicator.nom_indicateur === 'fear_greed') {
      return `${indicator.valeur_numerique} (${indicator.metadata?.classification || 'N/A'})`;
    }
    if (indicator.nom_indicateur === 'halving_countdown') {
      return `${indicator.valeur_numerique} ${indicator.unite}`;
    }
    return `${indicator.valeur_numerique} ${indicator.unite}`;
  };

  const formatDetail = (indicator: TopMarketIndicator): string | undefined => {
    if (indicator.nom_indicateur === 'halving_countdown' && indicator.metadata) {
      return `${indicator.metadata.jours_restants} jours restants (≈ ${indicator.metadata.date_estimee})`;
    }
    return undefined;
  };

  return {
    label: labels[indicator.nom_indicateur] || indicator.nom_indicateur,
    value: formatValue(indicator),
    status: getStatus(indicator.valeur_texte),
    detail: formatDetail(indicator),
    updatedAt: new Date(indicator.derniere_maj).toLocaleString('fr-FR'),
  };
}
