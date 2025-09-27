-- WorldTimeTicket Database Schema (fits current app)

-- Enable required extensions
create extension if not exists "uuid-ossp";

do $$ begin
  create type booking_status as enum ('pending', 'confirmed', 'completed', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type currency_type as enum ('WLD', 'USDC');
exception when duplicate_object then null; end $$;

create table if not exists public.profiles (
  id uuid default uuid_generate_v4() primary key,
  email text unique,
  wallet_address text,
  username text,
  full_name text,
  avatar_url text,
  bio text,
  world_id_verified boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Backfill-safe column additions for existing deployments
alter table public.profiles add column if not exists wallet_address text;
alter table public.profiles add column if not exists username text;
-- Ensure email is optional
do $$ begin
  alter table public.profiles alter column email drop not null;
exception when undefined_column then null; end $$;
-- Ensure id has a default and no FK to auth.users
alter table public.profiles alter column id set default uuid_generate_v4();
do $$ begin
  alter table public.profiles drop constraint profiles_id_fkey;
exception when undefined_object then null; end $$;

-- Unique index on lowercase wallet address (ignoring nulls)
create unique index if not exists idx_profiles_wallet_address_lower
  on public.profiles (lower(wallet_address))
  where wallet_address is not null;

create table if not exists public.people (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  is_active boolean default true,
  hourly_rate decimal(10,2) not null check (hourly_rate > 0),
  currency currency_type not null default 'USDC',
  calendly_url text,
  skills text[],
  availability_status text default 'Available this week',
  average_rating decimal(3,2) default 0 check (average_rating >= 0 and average_rating <= 5),
  total_reviews integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.bookings (
  id uuid default uuid_generate_v4() primary key,
  client_id uuid references public.profiles(id) on delete cascade not null,
  person_id uuid references public.people(id) on delete cascade not null,
  status booking_status default 'pending' not null,
  session_notes text,
  scheduled_date timestamp with time zone,
  hourly_rate decimal(10,2) not null,
  currency currency_type not null,
  total_amount decimal(10,2) not null,
  calendly_event_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.reviews (
  id uuid default uuid_generate_v4() primary key,
  booking_id uuid references public.bookings(id) on delete cascade not null unique,
  client_id uuid references public.profiles(id) on delete cascade not null,
  person_id uuid references public.people(id) on delete cascade not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  tags text[], -- Simple text array
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_people_user_id on public.people(user_id);
create index if not exists idx_people_is_active on public.people(is_active);
create index if not exists idx_bookings_client_id on public.bookings(client_id);
create index if not exists idx_bookings_person_id on public.bookings(person_id);
create index if not exists idx_reviews_person_id on public.reviews(person_id);

alter table public.profiles enable row level security;
alter table public.people enable row level security;
alter table public.bookings enable row level security;
alter table public.reviews enable row level security;

drop policy if exists "Public profiles are viewable by everyone" on public.profiles;
create policy "Public profiles are viewable by everyone" on public.profiles
  for select using (true);

drop policy if exists "Users can manage their own profile" on public.profiles;
create policy "Users can select own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can delete own profile" on public.profiles for delete using (auth.uid() = id);

drop policy if exists "Active people are viewable by everyone" on public.people;
create policy "Active people are viewable by everyone" on public.people
  for select using (is_active = true);

drop policy if exists "Users can manage their own person profile" on public.people;
create policy "Users can select own person" on public.people for select using (auth.uid() = user_id);
create policy "Users can insert own person" on public.people for insert with check (auth.uid() = user_id);
create policy "Users can update own person" on public.people for update using (auth.uid() = user_id);
create policy "Users can delete own person" on public.people for delete using (auth.uid() = user_id);

drop policy if exists "Users can view their bookings" on public.bookings;
create policy "Users can view their bookings" on public.bookings
  for select using (
    auth.uid() = client_id or 
    auth.uid() in (select user_id from public.people where id = bookings.person_id)
  );

drop policy if exists "Users can create bookings" on public.bookings;
create policy "Users can create bookings" on public.bookings
  for insert with check (auth.uid() = client_id);

drop policy if exists "Booking participants can update bookings" on public.bookings;
create policy "Booking participants can update bookings" on public.bookings
  for update using (
    auth.uid() = client_id or 
    auth.uid() in (select user_id from public.people where id = bookings.person_id)
  );

drop policy if exists "Public reviews are viewable by everyone" on public.reviews;
create policy "Public reviews are viewable by everyone" on public.reviews
  for select using (true);

drop policy if exists "Clients can create reviews for completed bookings" on public.reviews;
create policy "Clients can create reviews for completed bookings" on public.reviews
  for insert with check (
    auth.uid() = client_id and
    exists (
      select 1 from public.bookings 
      where id = reviews.booking_id 
      and client_id = auth.uid() 
      and status = 'completed'
    )
  );

-- Simple function to update ratings
create or replace function public.update_person_rating()
returns trigger as $$
begin
  update public.people
  set 
    average_rating = (
      select avg(rating)::decimal(3,2)
      from public.reviews
      where person_id = new.person_id
    ),
    total_reviews = (
      select count(*)
      from public.reviews
      where person_id = new.person_id
    )
  where id = new.person_id;
  
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for rating updates
drop trigger if exists on_review_created_or_updated on public.reviews;
create trigger on_review_created_or_updated
  after insert or update on public.reviews
  for each row execute function public.update_person_rating();

-- Function to handle new user registration
-- No automatic auth.users trigger; profiles are managed by app server
drop function if exists public.handle_new_user() cascade;

-- Trigger for new user registration
-- Remove any old auth.users trigger linkage
drop trigger if exists on_auth_user_created on auth.users;