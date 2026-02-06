
import { createClient } from '@supabase/supabase-js';

// Specific connection details provided by the user
const supabaseUrl = process.env.SUPABASE_URL || 'https://fvkzpynrfnuyjqnigdco.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2a3pweW5yZm51eWpxbmlnZGNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzNjg4MDAsImV4cCI6MjA4NTk0NDgwMH0.hZkTNqlwyFZki1yGcnP8MBJcDsl1v3X4NJx_WoJ_GUQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
