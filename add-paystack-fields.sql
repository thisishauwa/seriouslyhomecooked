-- Add Paystack fields to profiles table
-- Run this in Supabase SQL Editor

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS paystack_subscription_code TEXT,
ADD COLUMN IF NOT EXISTS paystack_customer_code TEXT,
ADD COLUMN IF NOT EXISTS paystack_authorization_code TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_paystack_subscription 
ON public.profiles(paystack_subscription_code);

CREATE INDEX IF NOT EXISTS idx_profiles_paystack_customer 
ON public.profiles(paystack_customer_code);

-- Verify the changes
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles' 
  AND column_name LIKE 'paystack%';

