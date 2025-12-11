-- 1. Enable RLS for the seller_profiles table
ALTER TABLE public.seller_profiles ENABLE ROW LEVEL SECURITY;

-- 2. Create a policy for SELECT
-- This policy allows any authenticated user to view any seller's profile.
-- This maintains the necessary visibility for the app's features (e.g., buyers seeing store info).
CREATE POLICY "Authenticated users can view seller profiles"
ON public.seller_profiles
FOR SELECT
TO authenticated
USING (true);

-- 3. Create a policy for UPDATE
-- This policy allows a user to update ONLY their own profile.
CREATE POLICY "Users can update their own seller profile"
ON public.seller_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 4. Create a policy for DELETE
-- This policy allows a user to delete ONLY their own profile.
CREATE POLICY "Users can delete their own seller profile"
ON public.seller_profiles
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
