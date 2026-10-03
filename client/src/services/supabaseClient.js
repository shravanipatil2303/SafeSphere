import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isDemoMode = !supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('YOUR_') || supabaseAnonKey.includes('YOUR_');

export const supabase = !isDemoMode
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const getModeStatus = () => {
  return {
    isDemoMode,
    modeLabel: isDemoMode ? 'DEMO MODE (Local Seed Store)' : 'REAL MODE (Supabase DB & Auth)',
    description: isDemoMode
      ? 'Running with local interactive disaster dataset and local agentic fallback'
      : 'Connected to live Supabase PostgreSQL database and real-time backend'
  };
};
