ALTER TABLE public.notifications
ADD COLUMN type text,
ADD COLUMN reference_id uuid;
