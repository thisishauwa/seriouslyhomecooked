-- Fix User Profile - Run this if your profile is missing or has wrong data
-- This will create/update your profile with data from Google Auth

-- Step 1: Check if you have a profile
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.created_at,
  au.raw_user_meta_data
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
WHERE au.email = 'YOUR_EMAIL@gmail.com'; -- Replace with your actual email

-- Step 2: If profile is missing, create it manually
-- (Replace the UUID and email with your actual values from Step 1)
INSERT INTO public.profiles (id, email, full_name, avatar_url)
SELECT 
  au.id,
  au.email,
  COALESCE(
    au.raw_user_meta_data->>'full_name',
    au.raw_user_meta_data->>'name',
    split_part(au.email, '@', 1)
  ) as full_name,
  au.raw_user_meta_data->>'avatar_url'
FROM auth.users au
WHERE au.email = 'YOUR_EMAIL@gmail.com' -- Replace with your actual email
ON CONFLICT (id) DO UPDATE
SET 
  full_name = EXCLUDED.full_name,
  avatar_url = EXCLUDED.avatar_url,
  updated_at = NOW();

-- Step 3: Verify it worked
SELECT 
  id,
  email,
  full_name,
  people,
  recipes_per_week,
  skill_level,
  subscription_status,
  created_at
FROM public.profiles
WHERE email = 'YOUR_EMAIL@gmail.com'; -- Replace with your actual email

