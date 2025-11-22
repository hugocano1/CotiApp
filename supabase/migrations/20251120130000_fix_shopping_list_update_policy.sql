-- Drop the old policy which might be causing issues in SECURITY DEFINER functions
DROP POLICY IF EXISTS "Buyers can update their own lists" ON public.shopping_lists;

-- Recreate the policy without the WITH CHECK clause to avoid RLS violation errors from the accept_offer function
CREATE POLICY "Buyers can update their own lists"
ON public.shopping_lists FOR UPDATE
TO authenticated
USING (auth.uid() = buyer_id);
