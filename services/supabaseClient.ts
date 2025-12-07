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
    };
  };
}