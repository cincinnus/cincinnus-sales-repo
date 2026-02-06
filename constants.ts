
import { AppSettings, Platform } from './types';

export const DEFAULT_SETTINGS: AppSettings = {
  currency: '₹',
  targetRoas: 4.0,
  targetCpo: 150,
  defaultBrand: '',
  theme: 'light'
};

export const INITIAL_SPEND = {
  awareness: 0,
  reels: 0,
  sales: 0,
  leads: 0
};

export const INITIAL_PLATFORM_SALES = {
  orders: 0,
  units: 0,
  revenue: 0
};

export const INITIAL_SALES = {
  website: { ...INITIAL_PLATFORM_SALES },
  amazon: { ...INITIAL_PLATFORM_SALES },
  flipkart: { ...INITIAL_PLATFORM_SALES },
  blinkit: { ...INITIAL_PLATFORM_SALES },
  myntra: { ...INITIAL_PLATFORM_SALES },
  offline: { ...INITIAL_PLATFORM_SALES }
};

export const CURRENCIES = [
  { symbol: '₹', name: 'INR' },
  { symbol: '$', name: 'USD' },
  { symbol: '€', name: 'EUR' },
  { symbol: '£', name: 'GBP' }
];

export const PLATFORMS = [Platform.META, Platform.GOOGLE, Platform.MIXED];
