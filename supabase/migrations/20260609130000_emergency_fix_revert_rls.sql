-- Emergency Fix: Revert restrictive RLS on buyer_profiles to diagnose loading issue
-- Description: Restores public visibility for authenticated users while we debug.

DROP POLICY IF EXISTS "View buyer profiles with interaction" ON public.buyer_profiles;

CREATE POLICY "Authenticated users can view buyer profiles"
ON public.buyer_profiles
FOR SELECT
TO authenticated
USING (true);

-- Also revert notification insert restriction just in case
DROP POLICY IF EXISTS "Users can only create their own notifications" ON public.notifications;

CREATE POLICY "Authenticated users can insert notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (true);
