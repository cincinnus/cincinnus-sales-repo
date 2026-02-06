
import { Report, AppSettings } from '../types';
import { DEFAULT_SETTINGS } from '../constants';

const REPORTS_KEY = 'adpulse_reports';
const SETTINGS_KEY = 'adpulse_settings';

export const storageService = {
  getReports: (): Report[] => {
    const data = localStorage.getItem(REPORTS_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveReport: (report: Report) => {
    const reports = storageService.getReports();
    const index = reports.findIndex(r => r.id === report.id || r.date === report.date);
    
    if (index > -1) {
      reports[index] = report;
    } else {
      reports.push(report);
    }
    
    localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
  },

  deleteReport: (id: string) => {
    const reports = storageService.getReports();
    const filtered = reports.filter(r => r.id !== id);
    localStorage.setItem(REPORTS_KEY, JSON.stringify(filtered));
  },

  getSettings: (): AppSettings => {
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
  },

  saveSettings: (settings: AppSettings) => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  },

  getPreviousDayReport: (currentDate: string): Report | null => {
    const reports = storageService.getReports();
    const current = new Date(currentDate);
    const prevDate = new Date(current);
    prevDate.setDate(current.getDate() - 1);
    
    const prevDateStr = prevDate.toISOString().split('T')[0];
    return reports.find(r => r.date === prevDateStr) || null;
  }
};
