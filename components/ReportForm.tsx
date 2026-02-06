
import React, { useState, useEffect } from 'react';
import { AdSpend, SalesData, Platform, AppSettings } from '../types';
import { INITIAL_SPEND, INITIAL_SALES, PLATFORMS, INITIAL_PLATFORM_SALES } from '../constants';
import { Card } from './ui/Card';
import { Calendar, Building, Globe, TrendingUp } from 'lucide-react';

interface ReportFormProps {
  settings: AppSettings;
  onSubmit: (data: { date: string; brandName: string; platform: Platform; spend: AdSpend; sales: SalesData }) => void;
  initialData?: any;
}

export const ReportForm: React.FC<ReportFormProps> = ({ settings, onSubmit, initialData }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [brandName, setBrandName] = useState(settings.defaultBrand || '');
  const [platform, setPlatform] = useState<Platform>(Platform.META);
  const [spend, setSpend] = useState<AdSpend>(INITIAL_SPEND);
  const [sales, setSales] = useState<SalesData>(INITIAL_SALES);

  useEffect(() => {
    if (initialData) {
      setDate(initialData.date);
      setBrandName(initialData.brandName);
      setPlatform(initialData.platform);
      setSpend(initialData.spend);
      setSales(initialData.sales);
    } else {
      // Reset to defaults if no initialData (creating new)
      setDate(new Date().toISOString().split('T')[0]);
      setBrandName(settings.defaultBrand || '');
      setPlatform(Platform.META);
      setSpend(INITIAL_SPEND);
      setSales(INITIAL_SALES);
    }
  }, [initialData, settings.defaultBrand]);

  const handleSpendChange = (field: keyof AdSpend, value: string) => {
    setSpend(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
  };

  const handleSalesChange = (platformKey: keyof SalesData, field: keyof typeof INITIAL_PLATFORM_SALES, value: string) => {
    setSales(prev => ({
      ...prev,
      [platformKey]: { ...prev[platformKey], [field]: parseFloat(value) || 0 }
    }));
  };

  // Fixed TypeScript error on line 49 by providing an explicit type cast for spend values
  const totalSpend = (Object.values(spend) as number[]).reduce((a, b) => a + b, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ date, brandName, platform, spend, sales });
  };

  const channelList: { key: keyof SalesData; label: string }[] = [
    { key: 'website', label: 'Website' },
    { key: 'amazon', label: 'Amazon' },
    { key: 'flipkart', label: 'Flipkart' },
    { key: 'blinkit', label: 'Blinkit' },
    { key: 'myntra', label: 'Myntra' },
    { key: 'offline', label: 'Offline' }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2"><Calendar className="w-4 h-4 text-indigo-500" /> Date</label>
          <input 
            type="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:bg-slate-800 dark:border-slate-700"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2"><Building className="w-4 h-4 text-indigo-500" /> Brand Name</label>
          <input 
            type="text" 
            value={brandName} 
            onChange={(e) => setBrandName(e.target.value)}
            placeholder="e.g. Cincinnus Store"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:bg-slate-800 dark:border-slate-700"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2"><Globe className="w-4 h-4 text-indigo-500" /> Primary Platform</label>
          <select 
            value={platform} 
            onChange={(e) => setPlatform(e.target.value as Platform)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:bg-slate-800 dark:border-slate-700"
          >
            {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      <Card title="Ad Spend Breakdown" subtitle={`Total Spend: ${settings.currency}${totalSpend.toLocaleString()}`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(['awareness', 'reels', 'sales', 'leads'] as const).map(field => (
            <div key={field} className="space-y-1">
              <label className="text-xs font-semibold uppercase text-slate-500 tracking-wider">{field}</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">{settings.currency}</span>
                <input 
                  type="number" 
                  value={spend[field] || ''}
                  onChange={(e) => handleSpendChange(field, e.target.value)}
                  placeholder="0"
                  className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:bg-slate-800 dark:border-slate-700"
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {channelList.map(item => (
          <Card key={item.key} title={`${item.label} Performance`} className="hover:border-indigo-200 transition-colors">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Orders</label>
                <input 
                  type="number" 
                  value={sales[item.key].orders || ''}
                  onChange={(e) => handleSalesChange(item.key, 'orders', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-slate-800 dark:border-slate-700"
                  placeholder="0"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Units Sold</label>
                <input 
                  type="number" 
                  value={sales[item.key].units || ''}
                  onChange={(e) => handleSalesChange(item.key, 'units', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-slate-800 dark:border-slate-700"
                  placeholder="0"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Revenue</label>
                <div className="relative">
                   <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{settings.currency}</span>
                   <input 
                    type="number" 
                    value={sales[item.key].revenue || ''}
                    onChange={(e) => handleSalesChange(item.key, 'revenue', e.target.value)}
                    className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-slate-800 dark:border-slate-700"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <button 
        type="submit"
        className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-lg shadow-xl shadow-indigo-200 transition-all flex items-center justify-center gap-2 group dark:shadow-none"
      >
        <TrendingUp className="w-5 h-5 group-hover:scale-110 transition-transform" />
        {initialData ? 'Update Report' : 'Generate Report & Save to Database'}
      </button>
    </form>
  );
};
