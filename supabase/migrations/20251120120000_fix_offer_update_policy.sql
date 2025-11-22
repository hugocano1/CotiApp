-- Drop the old, restrictive policy
DROP POLICY IF EXISTS "Sellers can update their own offers" ON public.offers;

-- Create a new, more permissive policy that allows buyers to accept
CREATE POLICY "Users can update offers they are involved with"
ON public.offers FOR UPDATE
TO authenticated
USING (
  -- The user is the seller who made the offer
  auth.uid() = seller_id 
  OR 
  -- The user is the buyer who owns the shopping list
  EXISTS (
    SELECT 1 FROM public.shopping_lists
    WHERE shopping_lists.id = offers.shopping_list_id AND shopping_lists.buyer_id = auth.uid()
  )
)
WITH CHECK (
  -- The user is the seller who made the offer
  auth.uid() = seller_id 
  OR 
  -- The user is the buyer who owns the shopping list
  EXISTS (
    SELECT 1 FROM public.shopping_lists
    WHERE shopping_lists.id = offers.shopping_list_id AND shopping_lists.buyer_id = auth.uid()
  )
);
