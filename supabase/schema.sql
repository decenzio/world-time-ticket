-- Simplified World Time Ticket Database Schema for Hackathon
-- Because we can't let the kids starve! 🍕

-- Enable required extensions
create extension if not exists "uuid-ossp";

-- Create simple types
create type booking_status as enum ('pending', 'confirmed', 'completed', 'cancelled');
create type currency_type as enum ('WLD', 'USDC');

-- Users/Profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  bio text,
  world_id_verified boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- People (formerly experts) table - simplified
create table public.people (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null unique,
  is_active boolean default true,
  hourly_rate decimal(10,2) not null check (hourly_rate > 0),
  currency currency_type not null default 'USDC',
  calendly_url text,
  skills text[], -- Simple text array instead of separate table
  availability_status text default 'Available this week',
  average_rating decimal(3,2) default 0 check (average_rating >= 0 and average_rating <= 5),
  total_reviews integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Bookings table - simplified
create table public.bookings (
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

-- Reviews table - simplified
create table public.reviews (
  id uuid default uuid_generate_v4() primary key,
  booking_id uuid references public.bookings(id) on delete cascade not null unique,
  client_id uuid references public.profiles(id) on delete cascade not null,
  person_id uuid references public.people(id) on delete cascade not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  tags text[], -- Simple text array
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create essential indexes only
create index idx_people_user_id on public.people(user_id);
create index idx_people_is_active on public.people(is_active);
create index idx_bookings_client_id on public.bookings(client_id);
create index idx_bookings_person_id on public.bookings(person_id);
create index idx_reviews_person_id on public.reviews(person_id);

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.people enable row level security;
alter table public.bookings enable row level security;
alter table public.reviews enable row level security;

-- Simple RLS policies
create policy "Public profiles are viewable by everyone" on public.profiles
  for select using (true);

create policy "Users can manage their own profile" on public.profiles
  for all using (auth.uid() = id);

create policy "Active people are viewable by everyone" on public.people
  for select using (is_active = true);

create policy "Users can manage their own person profile" on public.people
  for all using (auth.uid() = user_id);

create policy "Users can view their bookings" on public.bookings
  for select using (
    auth.uid() = client_id or 
    auth.uid() in (select user_id from public.people where id = bookings.person_id)
  );

create policy "Users can create bookings" on public.bookings
  for insert with check (auth.uid() = client_id);

create policy "Booking participants can update bookings" on public.bookings
  for update using (
    auth.uid() = client_id or 
    auth.uid() in (select user_id from public.people where id = bookings.person_id)
  );

create policy "Public reviews are viewable by everyone" on public.reviews
  for select using (true);

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
create trigger on_review_created_or_updated
  after insert or update on public.reviews
  for each row execute function public.update_person_rating();

-- Function to handle new user registration
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user registration
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();