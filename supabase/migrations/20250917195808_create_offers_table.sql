
CREATE TABLE public.offers (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    shopping_list_id uuid NOT NULL REFERENCES public.shopping_lists(id) ON DELETE CASCADE,
    seller_id uuid NOT NULL REFERENCES public.seller_profiles(user_id) ON DELETE CASCADE,
    price numeric NOT NULL,
    notes text,
    status text NOT NULL DEFAULT 'pending',
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sellers can see offers they made"
ON public.offers FOR SELECT
TO authenticated
USING (auth.uid() = seller_id);

CREATE POLICY "Buyers can see offers for their lists"
ON public.offers FOR SELECT
TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.shopping_lists
    WHERE shopping_lists.id = offers.shopping_list_id AND shopping_lists.buyer_id = auth.uid()
));

CREATE POLICY "Sellers can create offers"
ON public.offers FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can update their own offers"
ON public.offers FOR UPDATE
TO authenticated
USING (auth.uid() = seller_id)
WITH CHECK (auth.uid() = seller_id);
