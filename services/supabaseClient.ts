import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase credentials missing. Using localStorage fallback.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      // Tables existantes
      patrimoinex_assets: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          type: string;
          amount: number;
          current_value: number;
          currency: string;
          purchase_date: string;
          purchase_price: number | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['patrimoinex_assets']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['patrimoinex_assets']['Insert']>;
      };
      patrimoinex_market_data: {
        Row: {
          id: string;
          asset_type: string;
          symbol: string | null;
          metric_name: string;
          metric_value: number;
          metric_change_24h: number | null;
          source: string | null;
          timestamp: string;
          raw_data: any;
        };
      };
      patrimoinex_market_indicators: {
        Row: {
          id: string;
          title_eng: string;
          title_fr: string;
          description: string | null;
          objective: string | null;
          source: string | null;
          source_url: string | null;
          threshold_type: string | null;
          threshold_value: number | null;
          current_value: number | null;
          is_met: boolean | null;
          display_value: string | null;
          analyzed_at: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      patrimoinex_portfolio_snapshots: {
        Row: {
          id: string;
          user_id: string;
          snapshot_date: string;
          total_value: number;
          allocation: any;
          performance_24h: number | null;
          performance_7d: number | null;
          performance_30d: number | null;
          performance_ytd: number | null;
          created_at: string;
        };
      };

      // ============================================
      // NOUVELLES TABLES - INDICATEURS BITCOIN
      // ============================================

      // Table 1: Prix et volume Bitcoin
      indicator_btc_price_history: {
        Row: {
          date: string;
          price_usd: number;
          price_eur: number;
          volume_24h: number;
          market_cap: number;
          updated_at: string;
        };
      };

      // Table 2: Moyennes mobiles
      indicator_moving_averages: {
        Row: {
          date: string;
          sma_20: number;
          sma_50: number;
          sma_200: number;
          ema_12: number;
          ema_26: number;
          updated_at: string;
        };
      };

      // Table 3: RSI (Relative Strength Index)
      indicator_rsi: {
        Row: {
          date: string;
          rsi_14: number;
          avg_gain_14: number;
          avg_loss_14: number;
          updated_at: string;
        };
      };

      // Table 4: MACD
      indicator_macd: {
        Row: {
          date: string;
          macd_line: number;
          signal_line: number;
          histogram: number;
          updated_at: string;
        };
      };

      // Table 5: Bollinger Bands
      indicator_bollinger_bands: {
        Row: {
          date: string;
          upper_band: number;
          middle_band: number;
          lower_band: number;
          bandwidth: number;
          percent_b: number;
          updated_at: string;
        };
      };

      // Table 6: OBV (On-Balance Volume)
      indicator_obv: {
        Row: {
          date: string;
          obv: number;
          obv_ema: number;
          updated_at: string;
        };
      };

      // Table 7: Signaux de trading
      indicator_trading_signals: {
        Row: {
          date: string;
          overall_signal: string; // "BUY" | "SELL" | "NEUTRAL"
          signal_strength: number; // 0-100
          strong_buy_count: number;
          buy_count: number;
          neutral_count: number;
          sell_count: number;
          strong_sell_count: number;
          updated_at: string;
        };
      };
    };
  };
}

// ============================================
// TYPES HELPER POUR LES INDICATEURS
// ============================================

export type BTCPriceData = Database['public']['Tables']['indicator_btc_price_history']['Row'];
export type MovingAveragesData = Database['public']['Tables']['indicator_moving_averages']['Row'];
export type RSIData = Database['public']['Tables']['indicator_rsi']['Row'];
export type MACDData = Database['public']['Tables']['indicator_macd']['Row'];
export type BollingerBandsData = Database['public']['Tables']['indicator_bollinger_bands']['Row'];
export type OBVData = Database['public']['Tables']['indicator_obv']['Row'];
export type TradingSignalData = Database['public']['Tables']['indicator_trading_signals']['Row'];

// Type combiné pour tous les indicateurs
export interface AllIndicators {
  price: BTCPriceData;
  movingAverages: MovingAveragesData;
  rsi: RSIData;
  macd: MACDData;
  bollingerBands: BollingerBandsData;
  obv: OBVData;
  tradingSignal: TradingSignalData;
}
