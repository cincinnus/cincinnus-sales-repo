
import React, { useState } from 'react';
import { Report, AppSettings } from '../types';
import { Card } from './ui/Card';
import { FileDown, Calendar as CalendarIcon, CheckCircle2, TrendingUp, DollarSign, Target } from 'lucide-react';

interface AggregationReportProps {
  reports: Report[];
  settings: AppSettings;
}

export const AggregationReport: React.FC<AggregationReportProps> = ({ reports, settings }) => {
  const [range, setRange] = useState<'week' | 'month' | 'custom'>('week');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const getFilteredReports = () => {
    const now = new Date();
    now.setHours(23, 59, 59, 999);
    
    if (range === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 7);
      weekAgo.setHours(0, 0, 0, 0);
      return reports.filter(r => new Date(r.date) >= weekAgo);
    }
    if (range === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(now.getMonth() - 1);
      monthAgo.setHours(0, 0, 0, 0);
      return reports.filter(r => new Date(r.date) >= monthAgo);
    }
    if (range === 'custom' && startDate && endDate) {
      return reports.filter(r => r.date >= startDate && r.date <= endDate);
    }
    return reports;
  };

  const downloadCSV = () => {
    const filtered = getFilteredReports().sort((a, b) => a.date.localeCompare(b.date));
    if (filtered.length === 0) {
      alert('No data available in the selected range to export.');
      return;
    }

    const headers = [
      'Date', 'Brand', 'Platform', 'Total Spend', 'Total Revenue', 'Total Orders', 'ROAS', 'CPO',
      'Website Rev', 'Amazon Rev', 'Flipkart Rev', 'Blinkit Rev', 'Myntra Rev', 'Offline Rev'
    ];

    const rows = filtered.map(r => [
      r.date, 
      `"${r.brandName}"`, 
      r.platform,
      r.metrics.totalSpend, 
      r.metrics.totalRevenue, 
      r.metrics.totalOrders,
      r.metrics.roas.toFixed(2), 
      r.metrics.cpo.toFixed(2),
      r.sales.website.revenue, 
      r.sales.amazon.revenue, 
      r.sales.flipkart.revenue,
      r.sales.blinkit.revenue, 
      r.sales.myntra.revenue, 
      r.sales.offline.revenue
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Cincinnus_${range.toUpperCase()}_Report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const stats = getFilteredReports().reduce((acc, r) => ({
    revenue: acc.revenue + r.metrics.totalRevenue,
    spend: acc.spend + r.metrics.totalSpend,
    orders: acc.orders + r.metrics.totalOrders,
    count: acc.count + 1
  }), { revenue: 0, spend: 0, orders: 0, count: 0 });

  const avgRoas = stats.spend > 0 ? stats.revenue / stats.spend : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <Card title="Database Reporting Center" subtitle="Extract aggregated performance data from the local database">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {(['week', 'month', 'custom'] as const).map(r => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-5 py-2.5 rounded-lg text-sm font-bold capitalize transition-all ${
                  range === r 
                    ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600' 
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                {r === 'week' ? 'Last 7 Days' : r === 'month' ? 'Last 30 Days' : 'Custom Range'}
              </button>
            ))}
          </div>

          {range === 'custom' && (
            <div className="flex items-center gap-2 animate-in slide-in-from-left-2 duration-300">
              <input 
                type="date" 
                value={startDate} 
                onChange={e => setStartDate(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-slate-400 font-medium">to</span>
              <input 
                type="date" 
                value={endDate} 
                onChange={e => setEndDate(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <AggStat 
            label="Period Revenue" 
            value={`${settings.currency}${stats.revenue.toLocaleString()}`}
            icon={<DollarSign className="w-4 h-4 text-emerald-500" />}
          />
          <AggStat 
            label="Period Ad Spend" 
            value={`${settings.currency}${stats.spend.toLocaleString()}`}
            icon={<TrendingUp className="w-4 h-4 text-indigo-500" />}
          />
          <AggStat 
            label="Average ROAS" 
            value={avgRoas.toFixed(2)}
            icon={<Target className="w-4 h-4 text-rose-500" />}
          />
          <AggStat 
            label="Total Orders" 
            value={stats.orders.toLocaleString()}
            icon={<CalendarIcon className="w-4 h-4 text-amber-500" />}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={downloadCSV}
            disabled={stats.count === 0}
            className={`flex-1 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all ${
              stats.count > 0 
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-100 dark:shadow-none active:scale-[0.98]' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <FileDown className="w-5 h-5" /> Download Excel-Ready CSV
          </button>
        </div>
      </Card>
      
      <div className="bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl p-6 flex gap-4">
        <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
        <div>
          <h4 className="font-bold text-emerald-900 dark:text-emerald-100">Live Database Active</h4>
          <p className="text-sm text-emerald-700 dark:text-emerald-400/80 leading-relaxed">
            All records are automatically persisted to the Cincinnus Report local storage. 
            The reporting module identifies and aggregates your historical data in real-time.
          </p>
        </div>
      </div>
    </div>
  );
};

const AggStat = ({ label, value, icon }: { label: string; value: string, icon: React.ReactNode }) => (
  <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
    <div className="flex items-center gap-2 mb-2">
      <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800">
        {icon}
      </div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</p>
    </div>
    <p className="text-xl font-bold dark:text-slate-100">{value}</p>
  </div>
);
