CREATE TABLE public.orders (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    shopping_list_id uuid NOT NULL REFERENCES public.shopping_lists(id),
    offer_id uuid NOT NULL REFERENCES public.offers(id),
    buyer_id uuid NOT NULL REFERENCES public.buyer_profiles(user_id),
    seller_id uuid NOT NULL REFERENCES public.seller_profiles(user_id),
    total_price numeric NOT NULL,
    status text NOT NULL DEFAULT 'confirmed',
    rating_for_seller numeric,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see their own orders"
ON public.orders FOR SELECT
TO authenticated
USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
