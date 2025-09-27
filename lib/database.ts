// Database configuration and client setup
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// Environment validation
// Public client envs (required)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// For development, we'll create a mock client if env vars are missing
const isSupabaseConfigured = !!(SUPABASE_URL && SUPABASE_ANON_KEY);

if (!isSupabaseConfigured) {
  console.warn(
    "Supabase not configured. Using mock client for development."
  );
}

// Optional service role key for server-side/admin operations (keep secret)
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

// Public (browser-safe) client
export const supabase = isSupabaseConfigured
  ? createClient<Database>(
      SUPABASE_URL!,
      SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      }
    )
  : createClient<Database>(
      "https://mock.supabase.co",
      "mock-anon-key",
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      }
    );

// Admin client (server-side only). This will be undefined if no service role key is provided.
export const supabaseAdmin = isSupabaseConfigured && SUPABASE_SERVICE_ROLE_KEY
  ? createClient<Database>(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    })
  : undefined;

// Helper to pick the correct client. Use admin=true only from server-side code.
export function getSupabase({ admin = false } = {}) {
  if (admin && typeof window === "undefined" && supabaseAdmin) {
    return supabaseAdmin;
  }
  return supabase;
}

export type { Database } from "./types";
