# Supabase Database Setup for World Time Ticket

This directory contains the database schema and setup files for the World Time Ticket people marketplace platform.

## Files

## Database Structure

### Core Tables

1. **profiles** - User profiles (linked to Supabase auth)
2. **people** - Person/seller profiles with rates and availability
3. **person_skills** - Skills and categories for each person
4. **bookings** - Session bookings between clients and people
5. **payments** - Payment tracking and escrow functionality
6. **reviews** - Client reviews and ratings for people
7. **review_tags** - Categorized feedback tags
8. **notifications** - System notifications

# Supabase — World Time Ticket (current)

This folder contains the simplified Supabase schema used by the app. The project was slimmed down for a hackathon: the schema focuses on a small, practical set of tables — `profiles`, `people`, `bookings`, and `reviews` — instead of the older, larger "experts" model.

This README documents what exists in the repo and how to apply the schema safely.

Files in this folder

- `schema.sql` — simplified schema (types, tables, RLS policies, triggers)
- `README.md` — this file

What this schema contains (short)

- `profiles` — user profiles tied to `auth.users` (triggered on auth.user insert)
- `people` — simplified seller/person records (skills as text[])
- `bookings` — sessions between a client (`profiles`) and a `person`
- `reviews` — rating & text tied to bookings; trigger updates `people.average_rating`
- Enums: `booking_status`, `currency_type`
- RLS policies enabled on all public tables (see `schema.sql` for details)
- Triggers: user creation -> create `profiles`; review insert/update -> refresh `people` rating

Running the app locally (env vars)

Create a `.env.local` file in the project root and add at minimum:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-public-anon-key
# Only required when running admin/server scripts that modify auth.users
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Security note: do NOT commit `SUPABASE_SERVICE_ROLE_KEY` to git. Treat it like a secret and only use it in server environments (CI or your host's secret store).

Check script (included)

This repo includes a small read-only check script at `scripts/check-db.mjs`. It uses the public anon key and reads sample rows from `profiles`, `people`, `bookings`, and `reviews` (respecting RLS).

Example (local):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co \
NEXT_PUBLIC_SUPABASE_ANON_KEY=ey... \
npm run check-db
```

The script prints sample rows and approximate counts. If those calls fail, check your RLS policies and that your anon key is correct.

Calendly mock

Development & Next steps

```bash
npm install @supabase/supabase-js
```

Troubleshooting

Where to look in the repo

If you want me to add a server-side seeder script or re-add the previous `scripts/load-seed.mjs`, say the word and I'll add a small, secure implementation you can run with `SUPABASE_SERVICE_ROLE_KEY`.
