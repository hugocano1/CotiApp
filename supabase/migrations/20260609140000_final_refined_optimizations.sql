-- Migration: Refined Performance and Privacy Optimizations
-- Description: Balanced security that allows discovery while protecting data.

-- 1. RENDIMIENTO (Mantenemos los índices, son seguros y necesarios)
CREATE INDEX IF NOT EXISTS idx_shopping_lists_buyer_id ON public.shopping_lists(buyer_id);
CREATE INDEX IF NOT EXISTS idx_offers_shopping_list_id ON public.offers(shopping_list_id);
CREATE INDEX IF NOT EXISTS idx_offers_seller_id ON public.offers(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_shopping_list_id ON public.orders(shopping_list_id);
CREATE INDEX IF NOT EXISTS idx_orders_offer_id ON public.orders(offer_id);
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON public.orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller_id ON public.orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_order_messages_order_id ON public.order_messages(order_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_wallet_id ON public.wallet_transactions(wallet_id);

-- 2. PRIVACIDAD INTELIGENTE: buyer_profiles
-- Permitimos visibilidad si: es el dueño, tiene una lista activa (descubrimiento), o hay una relación comercial.

DROP POLICY IF EXISTS "Authenticated users can view buyer profiles" ON public.buyer_profiles;
DROP POLICY IF EXISTS "View buyer profiles with interaction" ON public.buyer_profiles;

CREATE POLICY "Discovery-aware buyer profiles visibility"
ON public.buyer_profiles
FOR SELECT
TO authenticated
USING (
    auth.uid() = user_id -- El propio usuario
    OR 
    EXISTS (
        -- Permitir ver si el comprador tiene una lista ACTIVA en este momento (Discovery)
        SELECT 1 FROM public.shopping_lists 
        WHERE shopping_lists.buyer_id = buyer_profiles.user_id 
        AND shopping_lists.status = 'active'
    )
    OR
    EXISTS (
        -- Relación por pedidos
        SELECT 1 FROM public.orders 
        WHERE orders.buyer_id = buyer_profiles.user_id 
        AND orders.seller_id = auth.uid()
    )
    OR
    EXISTS (
        -- Relación por ofertas
        SELECT 1 FROM public.offers o
        JOIN public.shopping_lists l ON o.shopping_list_id = l.id
        WHERE l.buyer_id = buyer_profiles.user_id
        AND o.seller_id = auth.uid()
    )
);

-- 3. SEGURIDAD: notifications
-- Evitamos que un usuario cree notificaciones para otros directamente desde el cliente.
-- Las funciones SECURITY DEFINER (como create_offer_and_notify) saltan esta restricción.

DROP POLICY IF EXISTS "Authenticated users can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can only create their own notifications" ON public.notifications;

CREATE POLICY "Secure notification insertion"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id); -- Solo puedes auto-notificarte desde el cliente.
