-- Add occupants list, married couple flag, and rules agreement timestamp
ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS is_married_couple boolean,
  ADD COLUMN IF NOT EXISTS occupants jsonb,
  ADD COLUMN IF NOT EXISTS rules_agreed_at timestamptz;
