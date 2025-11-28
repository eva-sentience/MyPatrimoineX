
export enum AssetType {
  REAL_ESTATE = 'Real Estate',
  STOCKS = 'Stocks',
  BONDS = 'Bonds',
  PRIVATE_EQUITY = 'Private Equity',
  CRYPTO = 'Cryptocurrency',
  PRECIOUS_METALS = 'Precious Metals',
  FRANCE_INVEST = 'France Invest',
  EXOTIC = 'Exotic',
}

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  amount: number;
  currentValue: number; // Unit value in EUR
  currency: string;
  purchaseDate: string;
  notes?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  isAuthenticated: boolean;
  hasSetup2FA: boolean;
  subscriptionTier: 'free' | 'premium';
}

export interface CategoryConfig {
  type: AssetType;
  label: string;
  color: string;
  iconName: string;
  gradient: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface ChartPoint {
  name: string;
  value1?: number; // Primary metric
  value2?: number; // Secondary metric (optional comparison)
  value3?: number; // Tertiary metric
  label?: string; // For categorical axes
  fill?: string; // Specific color for bars
}

export interface ChartAnnotationLine {
  text: string;
  color?: string; // Hex or Tailwind class if handled manually
  className?: string; // Tailwind classes for bold, size, etc.
}

export interface ChartAnnotation {
  x: number; // Percentage from left (0-100)
  y: number; // Percentage from top (0-100)
  type?: 'text' | 'arrow'; // New field for arrow support
  arrowHeight?: number; // Height in percentage for the arrow
  lines: ChartAnnotationLine[];
  backgroundColor?: string;
  rotate?: number;
}

export interface ChartDefinition {
  title: string;
  slideType?: 'chart' | 'text'; // Type of slide
  textContent?: string[]; // For text slides
  type?: 'bar' | 'line' | 'area' | 'composed' | 'waterfall'; 
  data?: ChartPoint[];
  dataKey1?: string;
  dataKey2?: string;
  dataKey3?: string;
  description?: string; // Oral commentary / Notes
  source?: string; // Name of the source
  sourceUrl?: string; // URL to the source
  yAxisDomain?: [number | 'auto' | 'dataMin' | 'dataMax', number | 'auto' | 'dataMin' | 'dataMax']; // Custom Y scale
  yAxisTicks?: number[]; // Custom ticks
  annotations?: ChartAnnotation[]; // Text overlays
}

export interface EducationItem {
  title: string;
  type: 'Analyse Vidéo' | 'Guide' | 'Deep Dive';
  duration: string;
  releaseDate: string; // Date of publication
  author: string;
  sourceUrl: string; // URL to the original content
  imageUrl: string; // Specific cover image
  summary: string;
  complexity: 'Débutant' | 'Intermédiaire' | 'Avancé';
  keyPoints: string[];
  charts?: ChartDefinition[]; // Changed to array to support multiple graphs
}

export interface MarketIndicator {
  titleEng: string;
  titleFr: string;
  description: string;
  objective: string;
  source: string;
  url: string;
  // Logic helpers
  thresholdType: 'GT' | 'LT' | 'ZONE' | 'BOOL'; 
  thresholdValue?: number; 
  currentValue?: string | number; 
  isMet?: boolean; 
  // New fields for strict reporting
  displayValue?: string; // The exact value found/calculated (e.g. "58.42%")
  analyzedAt?: string; // ISO Timestamp of the calculation
}

export interface AnalysisHistoryEntry {
  date: string; // YYYY-MM-DD
  percentage: number;
  details?: MarketIndicator[];
}

export type TabView = 'investments' | 'education' | 'news' | 'macro' | 'market' | 'analysis';
