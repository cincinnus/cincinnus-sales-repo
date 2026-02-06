
import { Report, AppSettings } from '../types';
import { DEFAULT_SETTINGS } from '../constants';
import { supabase } from './supabase';

const REPORTS_TABLE = 'reports';
const SETTINGS_TABLE = 'settings';
const GLOBAL_SETTINGS_ID = 'global_config';

export const storageService = {
  getReports: async (): Promise<Report[]> => {
    try {
      const { data, error } = await supabase
        .from(REPORTS_TABLE)
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      return (data || []) as Report[];
    } catch (e) {
      console.error("Error fetching reports from Supabase:", e);
      // Fallback to local storage if needed or return empty
      return [];
    }
  },

  saveReport: async (report: Report) => {
    try {
      const { error } = await supabase
        .from(REPORTS_TABLE)
        .upsert(report);

      if (error) throw error;
    } catch (e) {
      console.error("Error saving report to Supabase:", e);
    }
  },

  deleteReport: async (id: string) => {
    try {
      const { error } = await supabase
        .from(REPORTS_TABLE)
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (e) {
      console.error("Error deleting report from Supabase:", e);
    }
  },

  getSettings: async (): Promise<AppSettings> => {
    try {
      const { data, error } = await supabase
        .from(SETTINGS_TABLE)
        .select('config')
        .eq('id', GLOBAL_SETTINGS_ID)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // Record not found
          return DEFAULT_SETTINGS;
        }
        throw error;
      }
      return { ...DEFAULT_SETTINGS, ...(data?.config || {}) } as AppSettings;
    } catch (e) {
      console.error("Error fetching settings from Supabase:", e);
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings: async (settings: AppSettings) => {
    try {
      const { error } = await supabase
        .from(SETTINGS_TABLE)
        .upsert({ id: GLOBAL_SETTINGS_ID, config: settings });

      if (error) throw error;
    } catch (e) {
      console.error("Error saving settings to Supabase:", e);
    }
  },

  getPreviousDayReport: async (currentDate: string): Promise<Report | null> => {
    try {
      const current = new Date(currentDate);
      const prevDate = new Date(current);
      prevDate.setDate(current.getDate() - 1);
      const prevDateStr = prevDate.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from(REPORTS_TABLE)
        .select('*')
        .eq('date', prevDateStr)
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as Report | null;
    } catch (e) {
      console.error("Error fetching previous report:", e);
      return null;
    }
  }
};
