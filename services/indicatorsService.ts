// ============================================
// INDICATORS SERVICE - Real-time Bitcoin Indicators
// ============================================

import { supabase } from './supabaseClient';

export interface IndicatorValue {
  indicator: string;
  date: string;
  is_met: boolean;
  signal: string;
  details: Record<string, any>;
}

export interface MA200Data {
  date: string;
  ma200_value: number;
  current_price: number;
  distance_from_ma: number;
  is_above_ma200: boolean;
  signal: string;
}

export interface RainbowData {
  date: string;
  current_price: number;
  logarithmic_regression: number;
  zone: string;
  signal: string;
}

export interface DominanceData {
  date: string;
  dominance_percent: number;
  btc_market_cap: number;
  total_market_cap: number;
  is_below_45: boolean;
  signal: string;
}

export interface CompositeScore {
  indicators_met: number;
  total_indicators: number;
  percentage: number;
}

export const indicatorsService = {
  /**
   * Get all latest indicator values
   */
  async getLatestIndicators(): Promise<IndicatorValue[]> {
    const { data, error } = await supabase
      .from('indicator_latest_values')
      .select('*')
      .order('indicator', { ascending: true });

    if (error) {
      console.error('Error fetching indicators:', error);
      throw error;
    }

    return data || [];
  },

  /**
   * Get MA200 history for chart (default 30 days)
   */
  async getMA200History(days: number = 30): Promise<MA200Data[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('indicator_ma200_history')
      .select('*')
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching MA200 history:', error);
      throw error;
    }

    return data || [];
  },

  /**
   * Get Rainbow Chart history
   */
  async getRainbowHistory(days: number = 90): Promise<RainbowData[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('indicator_rainbow_history')
      .select('*')
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching rainbow history:', error);
      throw error;
    }

    return data || [];
  },

  /**
   * Get Dominance history
   */
  async getDominanceHistory(days: number = 30): Promise<DominanceData[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('indicator_dominance_history')
      .select('*')
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching dominance history:', error);
      throw error;
    }

    return data || [];
  },

  /**
   * Get Mayer Multiple history
   */
  async getMayerHistory(days: number = 90): Promise<any[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('indicator_mayer_history')
      .select('*')
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching Mayer history:', error);
      throw error;
    }

    return data || [];
  },

  /**
   * Get Pi Cycle history
   */
  async getPiCycleHistory(days: number = 180): Promise<any[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('indicator_pi_cycle_history')
      .select('*')
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching Pi Cycle history:', error);
      throw error;
    }

    return data || [];
  },

  /**
   * Get Stock-to-Flow history
   */
  async getS2FHistory(days: number = 365): Promise<any[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('indicator_s2f_history')
      .select('*')
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching S2F history:', error);
      throw error;
    }

    return data || [];
  },

  /**
   * Get composite score (how many indicators are met)
   */
  async getCompositeScore(): Promise<CompositeScore> {
    const indicators = await this.getLatestIndicators();
    
    const met = indicators.filter(i => i.is_met).length;
    const total = indicators.length;
    const percentage = total > 0 ? Math.round((met / total) * 100) : 0;

    return {
      indicators_met: met,
      total_indicators: total,
      percentage
    };
  },

  /**
   * Get BTC price history
   */
  async getBTCPriceHistory(days: number = 30): Promise<any[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('indicator_btc_price_history')
      .select('date, price_usd, volume_24h')
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching BTC price history:', error);
      throw error;
    }

    return data || [];
  },

  /**
   * Subscribe to real-time indicator updates
   */
  subscribeToIndicators(callback: (payload: any) => void) {
    const channel = supabase
      .channel('indicators-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'indicator_ma200_history'
        },
        (payload) => {
          console.log('MA200 updated:', payload);
          callback(payload);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'indicator_dominance_history'
        },
        (payload) => {
          console.log('Dominance updated:', payload);
          callback(payload);
        }
      )
      .subscribe();

    return channel;
  },

  /**
   * Manually trigger indicator calculation for today
   * (requires service role key - only for admin)
   */
  async triggerCalculation(): Promise<void> {
    const { error } = await supabase.rpc('update_all_indicators', {
      target_date: new Date().toISOString().split('T')[0]
    });

    if (error) {
      console.error('Error triggering calculation:', error);
      throw error;
    }
  },

  /**
   * Get indicator summary for dashboard
   */
  async getIndicatorSummary(): Promise<any> {
    const [latest, composite, btcPrice] = await Promise.all([
      this.getLatestIndicators(),
      this.getCompositeScore(),
      this.getBTCPriceHistory(1)
    ]);

    return {
      indicators: latest,
      composite_score: composite,
      current_btc_price: btcPrice[btcPrice.length - 1]?.price_usd || 0,
      last_update: latest[0]?.date || new Date().toISOString().split('T')[0]
    };
  }
};
