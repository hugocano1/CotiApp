-- Add latitude and longitude columns to shopping_lists table
alter table public.shopping_lists
add column latitude double precision,
add column longitude double precision;
