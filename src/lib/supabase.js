import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

let supabase = null;

try {
  if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
  } else {
    console.warn('Missing Supabase environment variables. The app will run in offline mode.');
  }
} catch (err) {
  console.error('Failed to initialize Supabase client:', err);
}

export { supabase };
