-- Migration: Add subscription fields to profiles table
-- Run this if you already have the profiles table created

-- Add subscription-related columns
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'paused', 'cancelled')),
ADD COLUMN IF NOT EXISTS next_delivery_date DATE,
ADD COLUMN IF NOT EXISTS delivery_day TEXT DEFAULT 'Thursday' CHECK (delivery_day IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'));

-- Update existing rows to have default values
UPDATE public.profiles 
SET 
  subscription_status = COALESCE(subscription_status, 'active'),
  delivery_day = COALESCE(delivery_day, 'Thursday')
WHERE subscription_status IS NULL OR delivery_day IS NULL;

