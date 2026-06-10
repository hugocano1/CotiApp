-- Migration: Add ratings and comments to orders
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS rating_for_buyer numeric,
ADD COLUMN IF NOT EXISTS comment_for_seller text,
ADD COLUMN IF NOT EXISTS comment_for_buyer text;

-- Add is_read to order_messages for unread counts
ALTER TABLE public.order_messages
ADD COLUMN IF NOT EXISTS is_read boolean DEFAULT false;

