CREATE POLICY "Allow users to read their own notifications"
ON public.notifications
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
