
import React, { useMemo } from 'react';
import { Report, AppSettings, Comparison, SalesData } from '../types';
import { Card } from './ui/Card';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell
} from 'recharts';
import { 
  ArrowUpRight, ArrowDownRight, DollarSign, ShoppingBag, Target, 
  Zap, Share2, Download, Sparkles, AlertCircle
} from 'lucide-react';

interface ReportDashboardProps {
  report: Report;
  previousReport: Report | null;
  settings: AppSettings;
  onExportImage: () => void;
}

export const ReportDashboard: React.FC<ReportDashboardProps> = ({ report, previousReport, settings, onExportImage }) => {
  const comparison: Comparison = useMemo(() => {
    if (!previousReport) return { revenueDelta: 0, spendDelta: 0, roasDelta: 0 };
    return {
      revenueDelta: ((report.metrics.totalRevenue - previousReport.metrics.totalRevenue) / (previousReport.metrics.totalRevenue || 1)) * 100,
      spendDelta: ((report.metrics.totalSpend - previousReport.metrics.totalSpend) / (previousReport.metrics.totalSpend || 1)) * 100,
      roasDelta: ((report.metrics.roas - previousReport.metrics.roas) / (previousReport.metrics.roas || 1)) * 100
    };
  }, [report, previousReport]);

  const spendChartData = [
    { name: 'Awareness', value: report.spend.awareness, color: '#6366f1' },
    { name: 'Reels', value: report.spend.reels, color: '#8b5cf6' },
    { name: 'Sales', value: report.spend.sales, color: '#ec4899' },
    { name: 'Leads', value: report.spend.leads, color: '#f59e0b' }
  ].filter(d => d.value > 0);

  const channels: (keyof SalesData)[] = ['website', 'amazon', 'flipkart', 'blinkit', 'myntra', 'offline'];
  const platformChartData = channels
    .map(key => ({ 
      name: key.charAt(0).toUpperCase() + key.slice(1), 
      revenue: report.sales[key]?.revenue || 0, 
      orders: report.sales[key]?.orders || 0 
    }))
    .filter(d => d.revenue > 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Excellent': return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10';
      case 'Average': return 'text-amber-500 bg-amber-50 dark:bg-amber-500/10';
      case 'Poor': return 'text-rose-500 bg-rose-50 dark:bg-rose-500/10';
      default: return 'text-slate-500 bg-slate-50';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-poppins text-slate-900 dark:text-white flex items-center gap-3">
            {report.brandName}
            <span className={`text-sm px-3 py-1 rounded-full font-bold ${getStatusColor(report.status)}`}>
              {report.status}
            </span>
          </h1>
          <p className="text-slate-500 mt-1">{new Date(report.date).toLocaleDateString('en-US', { dateStyle: 'full' })}</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={onExportImage}
            className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 text-sm font-semibold transition-all shadow-sm"
          >
            <Download className="w-4 h-4" /> Export Image
          </button>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 flex items-center gap-2 text-sm font-semibold transition-all shadow-lg shadow-indigo-100 dark:shadow-none">
            <Share2 className="w-4 h-4" /> Share
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard 
          label="Total Revenue" 
          value={`${settings.currency}${report.metrics.totalRevenue.toLocaleString()}`} 
          icon={<DollarSign className="w-6 h-6 text-emerald-500" />}
          delta={comparison.revenueDelta}
        />
        <SummaryCard 
          label="Total Spend" 
          value={`${settings.currency}${report.metrics.totalSpend.toLocaleString()}`} 
          icon={<Zap className="w-6 h-6 text-indigo-500" />}
          delta={comparison.spendDelta}
          inverseDelta
        />
        <SummaryCard 
          label="ROAS" 
          value={report.metrics.roas.toFixed(2)} 
          icon={<Target className="w-6 h-6 text-rose-500" />}
          delta={comparison.roasDelta}
        />
        <SummaryCard 
          label="Orders" 
          value={report.metrics.totalOrders.toLocaleString()} 
          icon={<ShoppingBag className="w-6 h-6 text-amber-500" />}
          subValue={`CPO: ${settings.currency}${report.metrics.cpo.toFixed(0)}`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Revenue Distribution">
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={platformChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => [`${settings.currency}${value.toLocaleString()}`, 'Revenue']}
                />
                <Bar dataKey="revenue" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Ad Spend Allocation">
          <div className="h-80 w-full flex flex-col md:flex-row items-center">
            <div className="flex-1 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={spendChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {spendChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: any) => [`${settings.currency}${value.toLocaleString()}`, 'Spend']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full md:w-48 space-y-2 mt-4 md:mt-0">
              {spendChartData.map((entry) => (
                <div key={entry.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-slate-600 dark:text-slate-400 font-medium">{entry.name}</span>
                  </div>
                  <span className="font-bold dark:text-slate-200">{((entry.value / report.metrics.totalSpend) * 100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <Card title="AI Strategy Insights">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {report.insights?.map((insight, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 flex gap-4">
              <div className="bg-indigo-600 h-8 w-8 rounded-lg flex items-center justify-center shrink-0 text-white shadow-lg shadow-indigo-200 dark:shadow-none">
                <Sparkles className="w-4 h-4" />
              </div>
              <p className="text-sm text-indigo-900 dark:text-indigo-200 leading-relaxed font-medium">
                {insight}
              </p>
            </div>
          )) || (
             <div className="col-span-3 py-10 flex flex-col items-center text-slate-400">
                <AlertCircle className="w-10 h-10 mb-2 opacity-20" />
                <p>Generating insights...</p>
             </div>
          )}
        </div>
      </Card>

      <Card title="Channel Breakdown">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <th className="py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Platform</th>
                <th className="py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Orders</th>
                <th className="py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Revenue</th>
                <th className="py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Contribution</th>
              </tr>
            </thead>
            <tbody>
              {channels.map((name) => {
                const data = report.sales[name];
                if (!data || data.revenue === 0) return null;
                return (
                  <tr key={name} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 font-semibold capitalize dark:text-slate-200">{name}</td>
                    <td className="py-4 text-right dark:text-slate-300">{data.orders}</td>
                    <td className="py-4 text-right font-medium dark:text-slate-200">{settings.currency}{data.revenue.toLocaleString()}</td>
                    <td className="py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                         <span className="text-sm font-bold dark:text-slate-300">{((data.revenue / (report.metrics.totalRevenue || 1)) * 100).toFixed(1)}%</span>
                         <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-indigo-500 rounded-full" 
                              style={{ width: `${(data.revenue / (report.metrics.totalRevenue || 1)) * 100}%` }}
                            />
                         </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

interface SummaryCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  subValue?: string;
  delta?: number;
  inverseDelta?: boolean;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ label, value, icon, subValue, delta, inverseDelta }) => {
  const isPositive = delta && delta > 0;
  const showGreen = inverseDelta ? !isPositive : isPositive;

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 group-hover:scale-110 transition-transform">
          {icon}
        </div>
        {delta !== undefined && delta !== 0 && (
          <div className={`flex items-center gap-0.5 text-xs font-bold px-2 py-1 rounded-full ${showGreen ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10' : 'text-rose-600 bg-rose-50 dark:bg-rose-500/10'}`}>
            {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(delta).toFixed(1)}%
          </div>
        )}
      </div>
      <div>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{label}</p>
        <h4 className="text-2xl font-bold dark:text-white">{value}</h4>
        {subValue && <p className="text-xs text-slate-400 mt-1 font-medium">{subValue}</p>}
      </div>
    </div>
  );
};
