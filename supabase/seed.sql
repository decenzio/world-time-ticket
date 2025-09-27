-- Sample data for World Time Ticket platform (Hackathon Version)
-- Run this after creating the main schema

-- Create corresponding auth users. This must be run in Supabase SQL Editor (admin context)
-- or via the Admin API because it inserts into the auth schema.
insert into auth.users (id, aud, email, raw_user_meta_data, email_confirmed_at)
values
(
  '550e8400-e29b-41d4-a716-446655440001', 'authenticated', 'sarah.chen@example.com', '{"full_name": "Sarah Chen"}', now()
),
(
  '550e8400-e29b-41d4-a716-446655440002', 'authenticated', 'marcus.rodriguez@example.com', '{"full_name": "Marcus Rodriguez"}', now()
),
(
  '550e8400-e29b-41d4-a716-446655440003', 'authenticated', 'emily.watson@example.com', '{"full_name": "Emily Watson"}', now()
),
(
  '550e8400-e29b-41d4-a716-446655440004', 'authenticated', 'alex.kim@example.com', '{"full_name": "Alex Kim"}', now()
),
(
  '550e8400-e29b-41d4-a716-446655440005', 'authenticated', 'jennifer.liu@example.com', '{"full_name": "Jennifer Liu"}', now()
),
(
  '550e8400-e29b-41d4-a716-446655440006', 'authenticated', 'john.student@example.com', '{"full_name": "John Student"}', now()
)
ON CONFLICT DO NOTHING;

-- Ensure sample profiles exist so people.user_id foreign key is satisfied
-- Include required non-null columns (email) to satisfy table constraints
insert into public.profiles (id, email) values
(
  '550e8400-e29b-41d4-a716-446655440001',
  'sarah.chen@example.com'
),
(
  '550e8400-e29b-41d4-a716-446655440002',
  'marcus.rodriguez@example.com'
),
(
  '550e8400-e29b-41d4-a716-446655440003',
  'emily.watson@example.com'
),
(
  '550e8400-e29b-41d4-a716-446655440004',
  'alex.kim@example.com'
),
(
  '550e8400-e29b-41d4-a716-446655440005',
  'jennifer.liu@example.com'
),
(
  '550e8400-e29b-41d4-a716-446655440006',
  'john.student@example.com'
)
ON CONFLICT DO NOTHING;

-- Insert sample people (formerly experts)
insert into public.people (
  id,
  user_id,
  hourly_rate,
  currency,
  calendly_url,
  skills,
  availability_status,
  average_rating,
  total_reviews
) values 
(
  '550e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440001', -- This should match a real user ID
  120.00,
  'USDC',
  'https://calendly.com/sarah-chen/consultation',
  ARRAY['Product Design', 'UX Research', 'Figma', 'Design Systems'],
  'Available this week',
  4.9,
  47
),
(
  '550e8400-e29b-41d4-a716-446655440002',
  '550e8400-e29b-41d4-a716-446655440002',
  95.00,
  'USDC',
  'https://calendly.com/marcus-rodriguez/consultation',
  ARRAY['React', 'Node.js', 'AWS', 'TypeScript'],
  'Available today',
  4.8,
  32
),
(
  '550e8400-e29b-41d4-a716-446655440003',
  '550e8400-e29b-41d4-a716-446655440003',
  200.00,
  'USDC',
  'https://calendly.com/emily-watson/consultation',
  ARRAY['Business Strategy', 'Operations', 'MBA Consulting', 'Scaling'],
  'Available next week',
  5.0,
  28
),
(
  '550e8400-e29b-41d4-a716-446655440004',
  '550e8400-e29b-41d4-a716-446655440004',
  85.00,
  'WLD',
  'https://calendly.com/alex-kim/consultation',
  ARRAY['Growth Marketing', 'SEO', 'Content Strategy', 'Analytics'],
  'Available this week',
  4.7,
  61
),
(
  '550e8400-e29b-41d4-a716-446655440005',
  '550e8400-e29b-41d4-a716-446655440005',
  110.00,
  'USDC',
  'https://calendly.com/jennifer-liu/consultation',
  ARRAY['Data Science', 'Machine Learning', 'Python', 'Analytics'],
  'Available tomorrow',
  4.9,
  39
),
(
  '550e8400-e29b-41d4-a716-446655440006',
  '550e8400-e29b-41d4-a716-446655440006',
  50.00,
  'WLD',
  'https://calendly.com/john-student/consultation',
  ARRAY['Tutoring', 'Math', 'Physics', 'Chemistry'],
  'Available evenings',
  4.6,
  15
);
