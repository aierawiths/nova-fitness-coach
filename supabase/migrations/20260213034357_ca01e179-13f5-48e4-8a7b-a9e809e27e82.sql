
-- Table to store OTP codes for phone authentication
CREATE TABLE public.phone_otps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.phone_otps ENABLE ROW LEVEL SECURITY;

-- Only edge functions (service role) should access this table, no client policies needed
-- This keeps OTP codes secure

-- Add phone column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;

-- Index for fast lookups
CREATE INDEX idx_phone_otps_phone_expires ON public.phone_otps (phone, expires_at);
