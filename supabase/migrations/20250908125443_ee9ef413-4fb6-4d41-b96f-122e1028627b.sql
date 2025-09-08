-- Remove the foreign key constraint to auth.users which is causing the issue
ALTER TABLE public.access_codes DROP CONSTRAINT IF EXISTS access_codes_user_id_fkey;

-- The user_id column should remain but without the foreign key constraint
-- since we can't reference auth.users from public schema