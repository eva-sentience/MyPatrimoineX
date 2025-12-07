import { supabase } from './supabaseClient';
import { Asset, UserProfile, MarketIndicator, AnalysisHistoryEntry } from '../types';

/**
 * Supabase Service - Replaces localStorage with database persistence
 */

class SupabaseService {
  // ============================================
  // USER OPERATIONS
  // ============================================

  async getCurrentUser(): Promise<UserProfile | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!profile) return null;

      return {
        id: profile.id,
        email: user.email || '',
        isAuthenticated: true,
        hasSetup2FA: profile.has_setup_2fa || false,
        subscriptionTier: profile.subscription_tier || 'free'
      };
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }

  // ============================================
  // ASSETS OPERATIONS
  // ============================================

  async getAssets(userId: string): Promise<Asset[]> {
    try {
      const { data, error } = await supabase
        .from('patrimoinex_assets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(row => ({
        id: row.id,
        name: row.name,
        type: row.type as any,
        amount: Number(row.amount),
        currentValue: Number(row.current_value),
        currency: row.currency,
        purchaseDate: row.purchase_date,
        notes: row.notes || undefined
      }));
    } catch (error) {
      console.error('Error fetching assets:', error);
      return [];
    }
  }

  async addAsset(userId: string, asset: Omit<Asset, 'id'>): Promise<Asset | null> {
    try {
      const { data, error } = await supabase
        .from('patrimoinex_assets')
        .insert([{
          user_id: userId,
          name: asset.name,
          type: asset.type,
          amount: asset.amount,
          current_value: asset.currentValue,
          currency: asset.currency,
          purchase_date: asset.purchaseDate,
          notes: asset.notes
        }])
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        name: data.name,
        type: data.type as any,
        amount: Number(data.amount),
        currentValue: Number(data.current_value),
        currency: data.currency,
        purchaseDate: data.purchase_date,
        notes: data.notes || undefined
      };
    } catch (error) {
      console.error('Error adding asset:', error);
      return null;
    }
  }

  async updateAsset(assetId: string, updates: Partial<Asset>): Promise<boolean> {
    try {
      const updateData: any = {};
      if (updates.name) updateData.name = updates.name;
      if (updates.type) updateData.type = updates.type;
      if (updates.amount !== undefined) updateData.amount = updates.amount;
      if (updates.currentValue !== undefined) updateData.current_value = updates.currentValue;
      if (updates.currency) updateData.currency = updates.currency;
      if (updates.purchaseDate) updateData.purchase_date = updates.purchaseDate;
      if (updates.notes !== undefined) updateData.notes = updates.notes;

      const { error } = await supabase
        .from('patrimoinex_assets')
        .update(updateData)
        .eq('id', assetId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating asset:', error);
      return false;
    }
  }

  async deleteAsset(assetId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('patrimoinex_assets')
        .delete()
        .eq('id', assetId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting asset:', error);
      return false;
    }
  }

  // ============================================
  // MARKET DATA OPERATIONS
  // ============================================

  async getLatestMarketIndicators(): Promise<MarketIndicator[]> {
    try {
      const { data, error } = await supabase
        .from('patrimoinex_latest_indicators')
        .select('*');

      if (error) throw error;

      return (data || []).map(row => ({
        titleEng: row.title_eng,
        titleFr: row.title_fr,
        description: row.description || '',
        objective: row.objective || '',
        source: row.source || '',
        url: row.source_url || '',
        thresholdType: row.threshold_type as any,
        thresholdValue: row.threshold_value ? Number(row.threshold_value) : undefined,
        currentValue: row.current_value ? Number(row.current_value) : undefined,
        isMet: row.is_met || false,
        displayValue: row.display_value || undefined,
        analyzedAt: row.analyzed_at || undefined
      }));
    } catch (error) {
      console.error('Error fetching market indicators:', error);
      return [];
    }
  }

  async upsertMarketIndicator(indicator: MarketIndicator): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('patrimoinex_market_indicators')
        .upsert([{
          title_eng: indicator.titleEng,
          title_fr: indicator.titleFr,
          description: indicator.description,
          objective: indicator.objective,
          source: indicator.source,
          source_url: indicator.url,
          threshold_type: indicator.thresholdType,
          threshold_value: indicator.thresholdValue,
          current_value: indicator.currentValue,
          is_met: indicator.isMet,
          display_value: indicator.displayValue,
          analyzed_at: new Date().toISOString()
        }], {
          onConflict: 'title_eng'
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error upserting market indicator:', error);
      return false;
    }
  }

  // ============================================
  // PORTFOLIO SNAPSHOTS
  // ============================================

  async createPortfolioSnapshot(userId: string, assets: Asset[]): Promise<boolean> {
    try {
      // Calculate total value and allocation
      const totalValue = assets.reduce((sum, a) => sum + (a.amount * a.currentValue), 0);
      
      const allocation: Record<string, number> = {};
      assets.forEach(asset => {
        const value = asset.amount * asset.currentValue;
        allocation[asset.type] = (allocation[asset.type] || 0) + value;
      });

      // Convert to percentages
      Object.keys(allocation).forEach(key => {
        allocation[key] = (allocation[key] / totalValue) * 100;
      });

      const { error } = await supabase
        .from('patrimoinex_portfolio_snapshots')
        .upsert([{
          user_id: userId,
          snapshot_date: new Date().toISOString().split('T')[0],
          total_value: totalValue,
          allocation: allocation
        }], {
          onConflict: 'user_id,snapshot_date'
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error creating portfolio snapshot:', error);
      return false;
    }
  }

  async getPortfolioHistory(userId: string, days: number = 30): Promise<any[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('patrimoinex_portfolio_snapshots')
        .select('*')
        .eq('user_id', userId)
        .gte('snapshot_date', startDate.toISOString().split('T')[0])
        .order('snapshot_date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching portfolio history:', error);
      return [];
    }
  }

  // ============================================
  // ANALYSIS HISTORY
  // ============================================

  async saveAnalysisHistory(entry: AnalysisHistoryEntry): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('patrimoinex_analysis_history')
        .insert([{
          date: entry.date,
          percentage: entry.percentage,
          details: entry.details
        }]);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error saving analysis history:', error);
      return false;
    }
  }

  async getAnalysisHistory(days: number = 30): Promise<AnalysisHistoryEntry[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('patrimoinex_analysis_history')
        .select('*')
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: false });

      if (error) throw error;

      return (data || []).map(row => ({
        date: row.date,
        percentage: Number(row.percentage),
        details: row.details
      }));
    } catch (error) {
      console.error('Error fetching analysis history:', error);
      return [];
    }
  }
}

export const supabaseService = new SupabaseService();