// Database configuration and client setup
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// Environment validation
// Public client envs (required)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Enforce required configuration (no mocks)
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Configure Supabase to run the app."
  );
}

// Optional service role key for server-side/admin operations (keep secret)
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

// Public (browser-safe) client
export const supabase = createClient<Database>(
  SUPABASE_URL!,
  SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

// Admin client (server-side only). This will be undefined if no service role key is provided.
export const supabaseAdmin = SUPABASE_SERVICE_ROLE_KEY
  ? createClient<Database>(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    })
  : undefined;

// Helper to pick the correct client. Use admin=true only from server-side code.
export function getSupabase({ admin = false } = {}) {
  if (admin) {
    if (typeof window !== "undefined") {
      throw new Error("Admin Supabase client cannot be used in the browser");
    }
    if (!supabaseAdmin) {
      throw new Error("Supabase admin client not configured. Set SUPABASE_SERVICE_ROLE_KEY");
    }
    return supabaseAdmin;
  }
  return supabase;
}

export type { Database } from "./types";
