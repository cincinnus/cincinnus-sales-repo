
import React, { useState, useEffect, useRef } from 'react';
import { Report, AppSettings } from './types';
import { storageService } from './services/storageService';
import { generateAIInsights } from './services/geminiService';
import { calculateMetrics, determineStatus } from './utils/calculations';
import { ReportForm } from './components/ReportForm';
import { ReportDashboard } from './components/ReportDashboard';
import { AggregationReport } from './components/AggregationReport';
import { ExportTemplate } from './components/ExportTemplate';
import { Settings, Plus, LayoutDashboard, History, ShieldCheck, ChevronLeft, Trash2, Calendar, FileText, Download } from 'lucide-react';
import { toPng } from 'html-to-image';

const App: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'form' | 'history' | 'settings' | 'agg_reports'>('history');
  const [reports, setReports] = useState<Report[]>([]);
  const [settings, setSettings] = useState<AppSettings>(storageService.getSettings());
  const [activeReport, setActiveReport] = useState<Report | null>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  
  const squareExportRef = useRef<HTMLDivElement>(null);
  const portraitExportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    const data = storageService.getReports().sort((a, b) => b.date.localeCompare(a.date));
    setReports(data);
  };

  const handleSaveReport = async (formData: any) => {
    const metrics = calculateMetrics(formData.spend, formData.sales);
    const status = determineStatus(metrics, settings);
    
    const newReport: Report = {
      id: Math.random().toString(36).substr(2, 9),
      ...formData,
      metrics,
      status,
      insights: []
    };

    // Database save happens immediately
    storageService.saveReport(newReport);
    refreshData();
    setActiveReport(newReport);
    setView('dashboard');
    setIsLoadingInsights(true);

    try {
      const insights = await generateAIInsights(newReport);
      newReport.insights = insights;
      storageService.saveReport(newReport); // Update in DB with AI insights
      refreshData();
    } catch (err) {
      console.error("Failed to generate AI insights:", err);
    } finally {
      setIsLoadingInsights(false);
    }
  };

  const handleExportImage = async () => {
    if (!activeReport) return;
    
    const exportOptions = {
      pixelRatio: 2,
      skipFonts: false,
      cacheBust: true,
    };

    try {
      if (squareExportRef.current) {
        const dataUrl = await toPng(squareExportRef.current, exportOptions);
        const link = document.createElement('a');
        link.download = `Cincinnus_${activeReport.brandName}_SQ_${activeReport.date}.png`;
        link.href = dataUrl;
        link.click();
      }
      if (portraitExportRef.current) {
        const dataUrl = await toPng(portraitExportRef.current, exportOptions);
        const link = document.createElement('a');
        link.download = `Cincinnus_${activeReport.brandName}_PT_${activeReport.date}.png`;
        link.href = dataUrl;
        link.click();
      }
    } catch (error) {
      console.error('Image export failed:', error);
      alert('Report image generation failed. Please check your network connection or browser font settings.');
    }
  };

  const handleDeleteReport = (id: string) => {
    if (window.confirm('Are you sure you want to permanently delete this record from the Cincinnus database?')) {
      storageService.deleteReport(id);
      refreshData();
      if (activeReport?.id === id) setActiveReport(null);
    }
  };

  const NavItem = ({ icon: Icon, label, id, active }: any) => (
    <button 
      onClick={() => setView(id)}
      className={`flex flex-col items-center gap-1.5 py-3 px-4 transition-all relative ${
        active ? 'text-indigo-600 scale-105' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
      }`}
    >
      <Icon className={`w-5 h-5 transition-transform ${active ? 'scale-110' : ''}`} />
      <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
      {active && <div className="absolute top-0 w-8 h-1 bg-indigo-600 rounded-b-full shadow-[0_2px_10px_rgba(79,70,229,0.5)]" />}
    </button>
  );

  return (
    <div className={`min-h-screen pb-24 transition-colors duration-300 ${settings.theme === 'dark' ? 'dark bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('history')}>
            <div className="bg-indigo-600 p-2.5 rounded-2xl text-white shadow-lg shadow-indigo-100 dark:shadow-none">
               <ShieldCheck className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold font-poppins tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-indigo-400">
              Cincinnus Report
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
               onClick={() => setView('form')}
               className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-2xl flex items-center gap-2 font-bold text-sm shadow-xl shadow-indigo-100 dark:shadow-none transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" /> New Entry
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {view === 'form' && (
          <div className="max-w-4xl mx-auto">
             <div className="flex items-center gap-2 mb-8 cursor-pointer text-slate-500 hover:text-indigo-600 transition-colors" onClick={() => setView('history')}>
                <ChevronLeft className="w-5 h-5" /> Back to History
             </div>
             <h2 className="text-3xl font-bold mb-8 font-poppins">Daily Sales Log</h2>
             <ReportForm settings={settings} onSubmit={handleSaveReport} />
          </div>
        )}

        {view === 'dashboard' && activeReport && (
          <div className="max-w-5xl mx-auto">
             <div className="flex items-center gap-2 mb-8 cursor-pointer text-slate-500 hover:text-indigo-600 transition-colors" onClick={() => setView('history')}>
                <ChevronLeft className="w-5 h-5" /> Back to History
             </div>
             <ReportDashboard 
               report={activeReport} 
               previousReport={storageService.getPreviousDayReport(activeReport.date)} 
               settings={settings}
               onExportImage={handleExportImage}
             />
             <ExportTemplate report={activeReport} settings={settings} containerRef={squareExportRef} variant="square" />
             <ExportTemplate report={activeReport} settings={settings} containerRef={portraitExportRef} variant="portrait" />
          </div>
        )}

        {view === 'agg_reports' && (
          <div className="max-w-5xl mx-auto">
             <h2 className="text-3xl font-bold mb-8 font-poppins">Reporting & Analytics</h2>
             <AggregationReport reports={reports} settings={settings} />
          </div>
        )}

        {view === 'history' && (
          <div className="space-y-8 animate-in fade-in duration-500">
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                   <h2 className="text-3xl font-bold font-poppins">Entry Database</h2>
                   <p className="text-slate-500 dark:text-slate-400">View and analyze your historical platform performance.</p>
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 px-4 py-2 rounded-full">
                   <Calendar className="w-4 h-4" /> {reports.length} Records Logged
                </div>
             </div>
             
             {reports.length === 0 ? (
               <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800">
                  <LayoutDashboard className="w-20 h-20 text-slate-200 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold mb-2">The Database is Empty</h3>
                  <p className="text-slate-400 mb-8 max-w-sm mx-auto">Start documenting your sales and marketing performance to see trends and AI insights.</p>
                  <button onClick={() => setView('form')} className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-2xl shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 transition-all active:scale-95">
                    Create First Entry
                  </button>
               </div>
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {reports.map((report) => (
                   <div 
                    key={report.id} 
                    className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 p-7 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all group"
                   >
                     <div className="flex justify-between items-start mb-5">
                        <div className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1.5 rounded-lg">
                          {new Date(report.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteReport(report.id); }} className="p-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-50 rounded-lg">
                           <Trash2 className="w-4 h-4" />
                        </button>
                     </div>
                     <h4 className="text-xl font-bold mb-3 truncate font-poppins">{report.brandName}</h4>
                     <div className="grid grid-cols-2 gap-4 mb-8">
                        <div>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Total Revenue</p>
                           <p className="font-bold text-lg dark:text-slate-100">{settings.currency}{report.metrics.totalRevenue.toLocaleString()}</p>
                        </div>
                        <div>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">ROAS</p>
                           <p className="font-bold text-lg dark:text-slate-100">{report.metrics.roas.toFixed(2)}</p>
                        </div>
                     </div>
                     <button 
                        onClick={() => { setActiveReport(report); setView('dashboard'); }}
                        className="w-full py-3.5 bg-slate-50 dark:bg-slate-800 group-hover:bg-indigo-600 group-hover:text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2 shadow-sm group-hover:shadow-indigo-200 dark:group-hover:shadow-none"
                     >
                       <FileText className="w-4 h-4" /> Analyze Results
                     </button>
                   </div>
                 ))}
               </div>
             )}
          </div>
        )}

        {view === 'settings' && (
          <div className="max-w-2xl mx-auto space-y-8 animate-in slide-in-from-right-4 duration-500">
             <h2 className="text-3xl font-bold font-poppins">Preferences</h2>
             
             <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-200 dark:border-slate-800 space-y-8 shadow-sm">
                <div className="space-y-3">
                   <label className="text-sm font-bold text-slate-400 uppercase tracking-widest">Global Currency</label>
                   <select 
                    value={settings.currency}
                    onChange={(e) => {
                      const newSettings = { ...settings, currency: e.target.value };
                      setSettings(newSettings);
                      storageService.saveSettings(newSettings);
                    }}
                    className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 dark:bg-slate-800 dark:border-slate-700 font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                   >
                     <option value="₹">Indian Rupee (₹)</option>
                     <option value="$">US Dollar ($)</option>
                     <option value="€">Euro (€)</option>
                     <option value="£">British Pound (£)</option>
                   </select>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-400 uppercase tracking-widest">Target ROAS</label>
                    <input 
                      type="number" 
                      step="0.1"
                      value={settings.targetRoas}
                      onChange={(e) => {
                        const newSettings = { ...settings, targetRoas: parseFloat(e.target.value) || 0 };
                        setSettings(newSettings);
                        storageService.saveSettings(newSettings);
                      }}
                      className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 dark:bg-slate-800 dark:border-slate-700 font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-400 uppercase tracking-widest">Target CPO</label>
                    <input 
                      type="number" 
                      value={settings.targetCpo}
                      onChange={(e) => {
                        const newSettings = { ...settings, targetCpo: parseFloat(e.target.value) || 0 };
                        setSettings(newSettings);
                        storageService.saveSettings(newSettings);
                      }}
                      className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 dark:bg-slate-800 dark:border-slate-700 font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                   <label className="text-sm font-bold text-slate-400 uppercase tracking-widest">Default Brand Name</label>
                   <input 
                    type="text" 
                    value={settings.defaultBrand}
                    onChange={(e) => {
                      const newSettings = { ...settings, defaultBrand: e.target.value };
                      setSettings(newSettings);
                      storageService.saveSettings(newSettings);
                    }}
                    placeholder="Enter business name"
                    className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 dark:bg-slate-800 dark:border-slate-700 font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                   />
                </div>

                <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
                   <div className="flex items-center justify-between p-5 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl">
                      <div className="flex items-center gap-4">
                         <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                            <ShieldCheck className="w-6 h-6 text-indigo-600" />
                         </div>
                         <div>
                            <span className="block font-bold text-indigo-900 dark:text-indigo-200 text-sm">Automated Storage</span>
                            <span className="text-xs text-indigo-600/70 font-bold uppercase tracking-wider">Database Sync Active</span>
                         </div>
                      </div>
                      <span className="text-[10px] bg-indigo-600 text-white px-2 py-1 rounded font-bold uppercase tracking-widest">Secured</span>
                   </div>
                </div>
             </div>
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl border-t border-slate-200 dark:border-slate-800 z-50">
        <div className="max-w-lg mx-auto flex justify-around items-center h-20">
          <NavItem icon={History} label="History" id="history" active={view === 'history'} />
          <NavItem icon={Download} label="Reports" id="agg_reports" active={view === 'agg_reports'} />
          <NavItem icon={LayoutDashboard} label="Dashboard" id="dashboard" active={view === 'dashboard'} />
          <NavItem icon={Settings} label="Settings" id="settings" active={view === 'settings'} />
        </div>
      </nav>
    </div>
  );
};

export default App;
