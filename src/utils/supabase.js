import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    'Supabase environment variables are missing. ' +
    'Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in your .env file or Vercel dashboard.'
  );
}

// Only create a real client when credentials are available;
// otherwise export null so query functions can gracefully return errors.
export const supabase = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey)
  : null;
