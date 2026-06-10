-- 1. CREACIÓN DE LA TABLA DE MENSAJES
-- Esta tabla es totalmente nueva y no toca ninguna tabla existente.
CREATE TABLE IF NOT EXISTS public.order_messages (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    sender_id uuid NOT NULL REFERENCES auth.users(id),
    content text NOT NULL,
    is_image boolean DEFAULT false,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 2. SEGURIDAD (RLS)
ALTER TABLE public.order_messages ENABLE ROW LEVEL SECURITY;

-- Política de Lectura: Solo el comprador o el vendedor de la orden pueden leer los mensajes
CREATE POLICY "Users can read messages of their orders" ON public.order_messages
FOR SELECT TO authenticated USING (
    EXISTS (
        SELECT 1 FROM public.orders 
        WHERE orders.id = order_messages.order_id 
        AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid())
    )
);

-- Política de Inserción: Solo el comprador o el vendedor pueden enviar mensajes
CREATE POLICY "Users can send messages to their orders" ON public.order_messages
FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
        SELECT 1 FROM public.orders 
        WHERE orders.id = order_id 
        AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid())
    )
);

-- 3. HABILITAR REALTIME
-- Esto permite que los mensajes aparezcan instantáneamente sin recargar
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_messages;
