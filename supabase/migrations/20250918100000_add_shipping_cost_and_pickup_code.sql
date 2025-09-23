-- Add shipping_cost to offers table
ALTER TABLE public.offers
ADD COLUMN shipping_cost numeric DEFAULT 0;

-- Add pickup_code to orders table
ALTER TABLE public.orders
ADD COLUMN pickup_code text;