/**
 * Service pour récupérer les indicateurs techniques Bitcoin depuis Supabase
 * Workflow N8N met à jour les données toutes les 15 minutes
 */

import { supabase } from './supabaseClient';
import type {
  BTCPriceData,
  MovingAveragesData,
  RSIData,
  MACDData,
  BollingerBandsData,
  OBVData,
  TradingSignalData,
  AllIndicators
} from './supabaseClient';

// ============================================
// FONCTIONS DE RÉCUPÉRATION INDIVIDUELLES
// ============================================

/**
 * Récupère le dernier prix Bitcoin et volume
 */
export async function getLatestBTCPrice(): Promise<BTCPriceData | null> {
  try {
    const { data, error } = await supabase
      .from('indicator_btc_price_history')
      .select('*')
      .order('date', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('❌ Error fetching BTC price:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('❌ Exception fetching BTC price:', err);
    return null;
  }
}

/**
 * Récupère les dernières moyennes mobiles (SMA 20/50/200, EMA 12/26)
 */
export async function getLatestMovingAverages(): Promise<MovingAveragesData | null> {
  try {
    const { data, error } = await supabase
      .from('indicator_moving_averages')
      .select('*')
      .order('date', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('❌ Error fetching Moving Averages:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('❌ Exception fetching Moving Averages:', err);
    return null;
  }
}

/**
 * Récupère le dernier RSI (14 périodes)
 */
export async function getLatestRSI(): Promise<RSIData | null> {
  try {
    const { data, error } = await supabase
      .from('indicator_rsi')
      .select('*')
      .order('date', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('❌ Error fetching RSI:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('❌ Exception fetching RSI:', err);
    return null;
  }
}

/**
 * Récupère le dernier MACD (Line, Signal, Histogram)
 */
export async function getLatestMACD(): Promise<MACDData | null> {
  try {
    const { data, error } = await supabase
      .from('indicator_macd')
      .select('*')
      .order('date', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('❌ Error fetching MACD:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('❌ Exception fetching MACD:', err);
    return null;
  }
}

/**
 * Récupère les dernières Bollinger Bands
 */
export async function getLatestBollingerBands(): Promise<BollingerBandsData | null> {
  try {
    const { data, error } = await supabase
      .from('indicator_bollinger_bands')
      .select('*')
      .order('date', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('❌ Error fetching Bollinger Bands:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('❌ Exception fetching Bollinger Bands:', err);
    return null;
  }
}

/**
 * Récupère le dernier OBV (On-Balance Volume)
 */
export async function getLatestOBV(): Promise<OBVData | null> {
  try {
    const { data, error } = await supabase
      .from('indicator_obv')
      .select('*')
      .order('date', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('❌ Error fetching OBV:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('❌ Exception fetching OBV:', err);
    return null;
  }
}

/**
 * Récupère le dernier signal de trading (BUY/SELL/NEUTRAL + force)
 */
export async function getLatestTradingSignal(): Promise<TradingSignalData | null> {
  try {
    const { data, error } = await supabase
      .from('indicator_trading_signals')
      .select('*')
      .order('date', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('❌ Error fetching Trading Signal:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('❌ Exception fetching Trading Signal:', err);
    return null;
  }
}

// ============================================
// FONCTION POUR RÉCUPÉRER TOUS LES INDICATEURS
// ============================================

/**
 * Récupère tous les indicateurs Bitcoin en une seule fois
 * Optimisé pour réduire le nombre de requêtes
 */
export async function getAllLatestIndicators(): Promise<AllIndicators | null> {
  try {
    const [
      price,
      movingAverages,
      rsi,
      macd,
      bollingerBands,
      obv,
      tradingSignal
    ] = await Promise.all([
      getLatestBTCPrice(),
      getLatestMovingAverages(),
      getLatestRSI(),
      getLatestMACD(),
      getLatestBollingerBands(),
      getLatestOBV(),
      getLatestTradingSignal()
    ]);

    // Vérifier que toutes les données sont présentes
    if (!price || !movingAverages || !rsi || !macd || !bollingerBands || !obv || !tradingSignal) {
      console.error('❌ Some indicators are missing');
      return null;
    }

    return {
      price,
      movingAverages,
      rsi,
      macd,
      bollingerBands,
      obv,
      tradingSignal
    };
  } catch (err) {
    console.error('❌ Exception fetching all indicators:', err);
    return null;
  }
}

// ============================================
// FONCTIONS POUR L'HISTORIQUE
// ============================================

/**
 * Récupère l'historique des prix Bitcoin (N derniers jours)
 */
export async function getBTCPriceHistory(days: number = 30): Promise<BTCPriceData[]> {
  try {
    const { data, error } = await supabase
      .from('indicator_btc_price_history')
      .select('*')
      .order('date', { ascending: false })
      .limit(days);

    if (error) {
      console.error('❌ Error fetching BTC price history:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('❌ Exception fetching BTC price history:', err);
    return [];
  }
}

/**
 * Récupère l'historique du RSI (N derniers jours)
 */
export async function getRSIHistory(days: number = 30): Promise<RSIData[]> {
  try {
    const { data, error } = await supabase
      .from('indicator_rsi')
      .select('*')
      .order('date', { ascending: false })
      .limit(days);

    if (error) {
      console.error('❌ Error fetching RSI history:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('❌ Exception fetching RSI history:', err);
    return [];
  }
}

/**
 * Récupère l'historique des signaux de trading (N derniers jours)
 */
export async function getTradingSignalHistory(days: number = 30): Promise<TradingSignalData[]> {
  try {
    const { data, error } = await supabase
      .from('indicator_trading_signals')
      .select('*')
      .order('date', { ascending: false })
      .limit(days);

    if (error) {
      console.error('❌ Error fetching Trading Signal history:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('❌ Exception fetching Trading Signal history:', err);
    return [];
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Calcule le temps écoulé depuis la dernière mise à jour
 */
export function getMinutesSinceUpdate(updated_at: string): number {
  const now = new Date();
  const updatedDate = new Date(updated_at);
  const diffMs = now.getTime() - updatedDate.getTime();
  return Math.floor(diffMs / 60000); // Convertir en minutes
}

/**
 * Formate une date pour affichage
 */
export function formatUpdateTime(updated_at: string): string {
  const minutes = getMinutesSinceUpdate(updated_at);
  
  if (minutes < 1) return "À l'instant";
  if (minutes === 1) return "Il y a 1 minute";
  if (minutes < 60) return `Il y a ${minutes} minutes`;
  
  const hours = Math.floor(minutes / 60);
  if (hours === 1) return "Il y a 1 heure";
  if (hours < 24) return `Il y a ${hours} heures`;
  
  const days = Math.floor(hours / 24);
  if (days === 1) return "Il y a 1 jour";
  return `Il y a ${days} jours`;
}

/**
 * Détermine le statut visuel basé sur la fraîcheur des données
 */
export function getDataFreshnessStatus(updated_at: string): 'fresh' | 'stale' | 'old' {
  const minutes = getMinutesSinceUpdate(updated_at);
  
  if (minutes < 20) return 'fresh';  // Données fraîches (< 20 min)
  if (minutes < 60) return 'stale';  // Données vieillissantes (20-60 min)
  return 'old';                      // Données anciennes (> 60 min)
}
/**
 * Récupère le dernier Fear & Greed Index depuis Supabase
 */
export const getLatestFearGreedFromSupabase = async () => {
  try {
    const { data, error } = await supabase
      .from('indicateurs_top_marche')
      .select('*')
      .eq('nom_indicateur', 'fear-greed')
      .order('date_valeur', { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;
    
    return {
      value: data.valeur_numerique,
      status: data.valeur_texte,
      unit: data.unite,
      source: data.source_api,
      date: data.date_valeur,
      isMet: data.valeur_numerique > 75
    };
  } catch (error) {
    console.error('❌ Error fetching Fear & Greed from Supabase:', error);
    return null;
  }
};

/**
 * Récupère le dernier Halving Countdown depuis Supabase
 */
export const getLatestHalvingCountdown = async () => {
  try {
    const { data, error } = await supabase
      .from('indicateurs_top_marche')
      .select('*')
      .eq('nom_indicateur', 'halving_countdown')
      .order('date_valeur', { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;
    
    const years = data.valeur_numerique;
    const days = Math.floor(years * 365);
    
    return {
      years: years,
      days: days,
      status: data.valeur_texte,
      unit: data.unite,
      source: data.source_api,
      date: data.date_valeur,
      isMet: years > 2
    };
  } catch (error) {
    console.error('❌ Error fetching Halving Countdown from Supabase:', error);
    return null;
  }
};