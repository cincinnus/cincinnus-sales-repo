
import { createClient } from '@supabase/supabase-js';

// Specific connection details provided by the user
const supabaseUrl = process.env.SUPABASE_URL || 'https://cexjqtvgqenwovgisgbs.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNleGpxdHZncWVud292Z2lzZ2JzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzNjM0ODEsImV4cCI6MjA4NTkzOTQ4MX0.03aKf2eKBtz2ixK66Bd7WgxGwZXfl-jdDsONs0o670w';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
