-- Check User Data - Run this to see what's in your database

-- 1. Check auth.users table (Google OAuth data)
SELECT 
  id,
  email,
  raw_user_meta_data->>'full_name' as google_full_name,
  raw_user_meta_data->>'name' as google_name,
  raw_user_meta_data->>'avatar_url' as google_avatar,
  created_at as auth_created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;

-- 2. Check profiles table (your app data)
SELECT 
  id,
  email,
  full_name,
  people,
  recipes_per_week,
  skill_level,
  subscription_status,
  delivery_day,
  created_at as profile_created_at
FROM public.profiles
ORDER BY created_at DESC
LIMIT 5;

-- 3. Check if there's a mismatch (users without profiles)
SELECT 
  au.id,
  au.email,
  au.raw_user_meta_data->>'full_name' as google_name,
  p.full_name as profile_name,
  CASE 
    WHEN p.id IS NULL THEN '❌ PROFILE MISSING'
    WHEN p.full_name IS NULL THEN '⚠️ NAME MISSING'
    ELSE '✅ OK'
  END as status
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
ORDER BY au.created_at DESC
LIMIT 5;

