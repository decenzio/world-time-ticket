#!/usr/bin/env node
/*
  Lightweight DB check script using public anon key.
  Usage (example):
    NEXT_PUBLIC_SUPABASE_URL=https://your.supabase.co NEXT_PUBLIC_SUPABASE_ANON_KEY=ey... node scripts/check-db.mjs

  This script only uses the anon key and reads public tables (respecting RLS).
*/

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !ANON_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, ANON_KEY)

async function check() {
  console.log('Checking Supabase public tables: profiles, people, bookings, reviews')

  const checks = [
    { name: 'profiles', q: () => supabase.from('profiles').select('id,email,full_name').limit(5) },
    { name: 'people', q: () => supabase.from('people').select('id,user_id,hourly_rate,currency,skills').limit(5) },
    { name: 'bookings', q: () => supabase.from('bookings').select('id,client_id,person_id,status').limit(5) },
    { name: 'reviews', q: () => supabase.from('reviews').select('id,booking_id,client_id,person_id,rating').limit(5) },
  ]

  for (const c of checks) {
    try {
      const { data, error } = await c.q()
      if (error) {
        console.error(`${c.name}: error`, error.message || error)
      } else {
        console.log(`\n${c.name}: sample rows (${(data || []).length})`)
        console.dir(data, { depth: 2 })
      }
    } catch (err) {
      console.error(`${c.name}: unexpected error`, err)
    }
  }

  // counts
  const tables = ['profiles', 'people', 'bookings', 'reviews']
  for (const t of tables) {
    try {
      const { count, error } = await supabase.from(t).select('*', { count: 'exact', head: true })
      if (error) {
        console.error(`${t}: count error`, error.message || error)
      } else {
        // when head=true, data is null; use the returned count property
        console.log(`${t}: approx count ->`, count)
      }
    } catch (err) {
      console.error(`${t}: unexpected count error`, err)
    }
  }
}

check().then(() => process.exit(0)).catch((e) => { console.error('check failed', e); process.exit(1) })
