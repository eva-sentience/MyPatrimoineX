
import { Asset, UserProfile, AssetType, ChatMessage, AnalysisHistoryEntry } from '../types';

const KEYS = {
  USER: 'investifr_user',
  ASSETS: 'investifr_assets',
  SIDEBAR_ORDER: 'investifr_order',
  CHAT_HISTORY: 'investifr_chat',
  SLIDE_NOTES: 'investifr_slide_notes',
  CRYPTO_WATCHLIST: 'investifr_watchlist',
  MARKET_ANALYSIS_HISTORY: 'investifr_market_analysis_history'
};

export const storageService = {
  getUser: (): UserProfile | null => {
    const data = localStorage.getItem(KEYS.USER);
    return data ? JSON.parse(data) : null;
  },

  saveUser: (user: UserProfile) => {
    localStorage.setItem(KEYS.USER, JSON.stringify(user));
  },

  getAssets: (): Asset[] => {
    const data = localStorage.getItem(KEYS.ASSETS);
    return data ? JSON.parse(data) : [];
  },

  saveAssets: (assets: Asset[]) => {
    localStorage.setItem(KEYS.ASSETS, JSON.stringify(assets));
  },

  addAsset: (asset: Asset) => {
    const current = storageService.getAssets();
    storageService.saveAssets([...current, asset]);
  },

  updateAsset: (asset: Asset) => {
    const current = storageService.getAssets();
    const index = current.findIndex(a => a.id === asset.id);
    if (index !== -1) {
      current[index] = asset;
      storageService.saveAssets(current);
    }
  },

  deleteAsset: (id: string) => {
    const current = storageService.getAssets();
    storageService.saveAssets(current.filter(a => a.id !== id));
  },

  getSidebarOrder: (defaults: AssetType[]): AssetType[] => {
    const data = localStorage.getItem(KEYS.SIDEBAR_ORDER);
    return data ? JSON.parse(data) : defaults;
  },

  saveSidebarOrder: (order: AssetType[]) => {
    localStorage.setItem(KEYS.SIDEBAR_ORDER, JSON.stringify(order));
  },

  getChatHistory: (): ChatMessage[] => {
    const data = localStorage.getItem(KEYS.CHAT_HISTORY);
    return data ? JSON.parse(data) : [];
  },

  saveChatHistory: (history: ChatMessage[]) => {
    localStorage.setItem(KEYS.CHAT_HISTORY, JSON.stringify(history));
  },

  getSlideNotes: (): Record<string, Record<number, string>> => {
    const data = localStorage.getItem(KEYS.SLIDE_NOTES);
    return data ? JSON.parse(data) : {};
  },

  saveSlideNote: (educationTitle: string, slideIndex: number, note: string) => {
    const allNotes = storageService.getSlideNotes();
    if (!allNotes[educationTitle]) {
      allNotes[educationTitle] = {};
    }
    allNotes[educationTitle][slideIndex] = note;
    localStorage.setItem(KEYS.SLIDE_NOTES, JSON.stringify(allNotes));
  },

  getWatchlist: (): any[] => {
    const data = localStorage.getItem(KEYS.CRYPTO_WATCHLIST);
    return data ? JSON.parse(data) : [];
  },

  saveWatchlist: (watchlist: any[]) => {
    localStorage.setItem(KEYS.CRYPTO_WATCHLIST, JSON.stringify(watchlist));
  },

  addToWatchlist: (item: any) => {
    const current = storageService.getWatchlist();
    // Prevent duplicates
    if (!current.some(i => i.symbol === item.symbol)) {
      const updated = [...current, item];
      storageService.saveWatchlist(updated);
    }
  },

  removeFromWatchlist: (symbol: string) => {
    const current = storageService.getWatchlist();
    const updated = current.filter(i => i.symbol !== symbol);
    storageService.saveWatchlist(updated);
  },

  getAnalysisHistory: (): AnalysisHistoryEntry[] => {
    const data = localStorage.getItem(KEYS.MARKET_ANALYSIS_HISTORY);
    return data ? JSON.parse(data) : [];
  },

  saveAnalysisHistory: (history: AnalysisHistoryEntry[]) => {
    localStorage.setItem(KEYS.MARKET_ANALYSIS_HISTORY, JSON.stringify(history));
  }
};
