-- 1. Enable RLS for the buyer_profiles table
ALTER TABLE public.buyer_profiles ENABLE ROW LEVEL SECURITY;

-- 2. Create a policy for SELECT
-- This policy allows any authenticated user to view any buyer's profile.
-- This maintains the necessary visibility for the app's features (e.g., sellers seeing buyer info).
CREATE POLICY "Authenticated users can view buyer profiles"
ON public.buyer_profiles
FOR SELECT
TO authenticated
USING (true);

-- 3. Create a policy for UPDATE
-- This policy allows a user to update ONLY their own profile.
-- The USING clause checks which rows can be updated, the WITH CHECK clause ensures new data conforms.
CREATE POLICY "Users can update their own buyer profile"
ON public.buyer_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 4. Create a policy for DELETE
-- This policy allows a user to delete ONLY their own profile.
CREATE POLICY "Users can delete their own buyer profile"
ON public.buyer_profiles
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
