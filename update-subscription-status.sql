-- Update subscription_status to include 'inactive' and change default
-- Run this to update your existing database

-- Step 1: Drop the old constraint
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_subscription_status_check;

-- Step 2: Add new constraint with 'inactive' option
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_subscription_status_check 
CHECK (subscription_status IN ('active', 'inactive', 'paused', 'cancelled'));

-- Step 3: Update existing users to 'inactive' (they haven't paid yet)
UPDATE public.profiles 
SET subscription_status = 'inactive'
WHERE subscription_status = 'active';

-- Step 4: Set the new default for future users
ALTER TABLE public.profiles 
ALTER COLUMN subscription_status SET DEFAULT 'inactive';

-- Verify the changes
SELECT 
  email,
  subscription_status,
  created_at
FROM public.profiles
ORDER BY created_at DESC;

