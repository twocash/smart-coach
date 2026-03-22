import { createClient } from '@supabase/supabase-js';

// Service role client — bypasses RLS, used only in server-side API routes
// NEVER expose this key to the browser
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default supabase;
