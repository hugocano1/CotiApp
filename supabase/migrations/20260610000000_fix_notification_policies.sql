-- Migration: Restore notification select policy and refine security
-- Description: Ensures users can read their own notifications.

-- Asegurar que la tabla tenga RLS habilitado
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 1. Política de Lectura (SELECT)
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Authenticated users can see notifications" ON public.notifications; -- Nombres posibles de migraciones antiguas

CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 2. Asegurar política de Inserción (INSERT) - Refuerzo
DROP POLICY IF EXISTS "Secure notification insertion" ON public.notifications;
DROP POLICY IF EXISTS "Users can only create their own notifications" ON public.notifications;

CREATE POLICY "Secure notification insertion"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 3. Política de Actualización (UPDATE) - Necesaria para marcar como leída
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;

CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
