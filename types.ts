
export enum Platform {
  META = 'Meta',
  GOOGLE = 'Google',
  MIXED = 'Mixed'
}

export interface AdSpend {
  awareness: number;
  reels: number;
  sales: number;
  leads: number;
}

export interface PlatformSales {
  orders: number;
  units: number;
  revenue: number;
}

export interface SalesData {
  website: PlatformSales;
  amazon: PlatformSales;
  flipkart: PlatformSales;
  blinkit: PlatformSales;
  myntra: PlatformSales;
  offline: PlatformSales;
}

export interface CalculatedMetrics {
  totalSpend: number;
  totalOrders: number;
  totalUnits: number;
  totalRevenue: number;
  cpo: number;
  cpu: number;
  roas: number;
  conversionEfficiency: number;
}

export interface Report {
  id: string;
  date: string;
  brandName: string;
  platform: Platform;
  spend: AdSpend;
  sales: SalesData;
  metrics: CalculatedMetrics;
  status: 'Poor' | 'Average' | 'Excellent';
  insights?: string[];
}

export interface AppSettings {
  currency: string;
  targetRoas: number;
  targetCpo: number;
  defaultBrand: string;
  theme: 'light' | 'dark';
}

export interface Comparison {
  revenueDelta: number;
  spendDelta: number;
  roasDelta: number;
}
