
import React from 'react';
import { Report, AppSettings, SalesData } from '../types';
import { Target, Zap, DollarSign, ShieldCheck, Globe, Store, Banknote } from 'lucide-react';

interface ExportTemplateProps {
  report: Report;
  settings: AppSettings;
  containerRef: React.RefObject<HTMLDivElement>;
  variant: 'square' | 'portrait';
}

export const ExportTemplate: React.FC<ExportTemplateProps> = ({ report, settings, containerRef, variant }) => {
  const isSquare = variant === 'square';
  const width = 1080;
  const height = isSquare ? 1080 : 1350;

  // Grouping logic for Online
  const onlineChannels: (keyof SalesData)[] = ['website', 'amazon', 'flipkart', 'blinkit', 'myntra'];
  
  const onlineStats = onlineChannels.reduce((acc, key) => ({
    revenue: acc.revenue + (report.sales[key]?.revenue || 0),
    orders: acc.orders + (report.sales[key]?.orders || 0)
  }), { revenue: 0, orders: 0 });

  const offlineStats = {
    revenue: report.sales.offline?.revenue || 0,
    orders: report.sales.offline?.orders || 0
  };

  return (
    <div className="fixed -left-[2000px] top-0 pointer-events-none">
      <div 
        ref={containerRef}
        style={{ width: `${width}px`, height: `${height}px` }}
        className="bg-slate-950 text-white p-12 flex flex-col font-['Inter'] relative overflow-hidden"
      >
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-indigo-600/20 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-purple-600/10 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />

        {/* Header Section (Performance badge removed) */}
        <div className="flex justify-between items-start mb-10 relative z-10">
          <div>
            <h1 className="text-6xl font-bold font-['Poppins'] tracking-tight mb-2 text-white">{report.brandName}</h1>
            <p className="text-2xl text-slate-400 font-medium">{new Date(report.date).toLocaleDateString('en-US', { dateStyle: 'long' })}</p>
          </div>
          <div className="flex flex-col items-end">
             <div className="bg-indigo-600 px-6 py-2 rounded-full text-xl font-bold mb-2 uppercase tracking-widest shadow-lg shadow-indigo-900/20">Cincinnus Report</div>
             <p className="text-xl text-slate-500 font-bold uppercase tracking-widest">{report.platform} Ads Performance</p>
          </div>
        </div>

        {/* Highlighted Total Sales Value Box */}
        <div className="relative z-10 mb-8">
           <div className="bg-gradient-to-r from-indigo-600/30 to-purple-600/30 border border-white/20 rounded-[40px] p-8 flex items-center justify-between backdrop-blur-md shadow-2xl">
              <div className="flex items-center gap-6">
                 <div className="bg-white/10 p-5 rounded-[2rem]">
                    <Banknote className="w-16 h-16 text-emerald-400" />
                 </div>
                 <div>
                    <p className="text-3xl font-bold text-slate-300 uppercase tracking-[0.2em] mb-1">Total Sales Value</p>
                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">Aggregate across all channels</p>
                 </div>
              </div>
              <div className="text-right">
                 <p className="text-8xl font-black text-white tracking-tighter">
                   {settings.currency}{report.metrics.totalRevenue.toLocaleString()}
                 </p>
                 <p className="text-2xl font-bold text-emerald-400 uppercase tracking-[0.3em]">Gross Sales</p>
              </div>
           </div>
        </div>

        {/* Top Level Ad Metrics */}
        <div className="grid grid-cols-2 gap-6 mb-10 relative z-10">
          <MetricSmall 
            label="Total Ad Spend" 
            value={`${settings.currency}${report.metrics.totalSpend.toLocaleString()}`} 
            icon={<Zap className="w-8 h-8 text-indigo-400" />}
          />
          <MetricSmall 
            label="Overall ROAS" 
            value={report.metrics.roas.toFixed(2)} 
            icon={<Target className="w-8 h-8 text-rose-400" />}
          />
        </div>

        {/* Main Content: Online & Offline Mixed Summary */}
        <div className="flex flex-col gap-8 relative z-10 flex-1">
          
          {/* Online Section */}
          <div className="bg-white/5 rounded-[40px] border border-white/10 p-8 flex flex-col gap-8">
            <div className="flex justify-between items-center border-b border-white/10 pb-6">
              <div className="flex items-center gap-4">
                <div className="bg-indigo-500/20 p-4 rounded-2xl">
                  <Globe className="w-10 h-10 text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-4xl font-bold text-white uppercase tracking-wider">Online Channel</h2>
                  <p className="text-slate-400 text-lg font-semibold tracking-wide">Digital Sales Summary</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-5xl font-bold text-white">{settings.currency}{onlineStats.revenue.toLocaleString()}</p>
                <p className="text-xl text-slate-400 font-bold uppercase tracking-widest">{onlineStats.orders} Orders</p>
              </div>
            </div>

            {/* Breakdown Grid for Online */}
            <div className="grid grid-cols-5 gap-4">
              {onlineChannels.map(key => {
                const data = report.sales[key];
                return (
                  <div key={key} className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col items-center text-center">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 truncate w-full">{key}</p>
                    <p className="text-xl font-bold text-white">{settings.currency}{(data?.revenue || 0).toLocaleString()}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">{data?.orders || 0} Orders</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Offline Section */}
          <div className="bg-white/5 rounded-[40px] border border-white/10 p-8 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="bg-amber-500/20 p-4 rounded-2xl">
                <Store className="w-10 h-10 text-amber-400" />
              </div>
              <div>
                <h2 className="text-4xl font-bold text-white uppercase tracking-wider">Offline Channel</h2>
                <p className="text-slate-400 text-lg font-semibold tracking-wide">Physical Sales Summary</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-5xl font-bold text-white">{settings.currency}{offlineStats.revenue.toLocaleString()}</p>
              <p className="text-xl text-slate-400 font-bold uppercase tracking-widest">{offlineStats.orders} Orders</p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="mt-10 flex justify-between items-center border-t border-white/10 pt-8 relative z-10">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-white" />
             </div>
             <p className="text-2xl font-bold text-slate-400 tracking-tighter">Cincinnus Analytics</p>
          </div>
          <p className="text-xl text-slate-500 tracking-tight">Auto-generated Performance Report • {report.platform}</p>
        </div>
      </div>
    </div>
  );
};

const MetricSmall: React.FC<{ label: string; value: string; icon: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="bg-white/5 rounded-[30px] p-6 border border-white/10 flex items-center gap-6">
    <div className="bg-white/5 p-4 rounded-2xl">
      {icon}
    </div>
    <div>
      <p className="text-lg font-bold text-slate-500 mb-0.5 uppercase tracking-widest">{label}</p>
      <p className="text-4xl font-bold tracking-tight text-white">{value}</p>
    </div>
  </div>
);
