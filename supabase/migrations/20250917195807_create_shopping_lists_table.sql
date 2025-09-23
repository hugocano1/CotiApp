CREATE TABLE public.shopping_lists (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    buyer_id uuid NOT NULL REFERENCES public.buyer_profiles(user_id) ON DELETE CASCADE,
    title text NOT NULL,
    items jsonb,
    status text NOT NULL DEFAULT 'active',
    delivery_type text NOT NULL DEFAULT 'delivery',
    delivery_date timestamp with time zone,
    min_budget numeric,
    max_budget numeric,
    delivery_address_text text,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.shopping_lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Buyers can see their own lists"
ON public.shopping_lists FOR SELECT
TO authenticated
USING (auth.uid() = buyer_id);

CREATE POLICY "Sellers can see active lists"
ON public.shopping_lists FOR SELECT
TO authenticated
USING (status = 'active');

CREATE POLICY "Buyers can create lists"
ON public.shopping_lists FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Buyers can update their own lists"
ON public.shopping_lists FOR UPDATE
TO authenticated
USING (auth.uid() = buyer_id)
WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Buyers can delete their own lists"
ON public.shopping_lists FOR DELETE
TO authenticated
USING (auth.uid() = buyer_id);
