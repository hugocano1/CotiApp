-- Migration: Performance and Privacy Optimizations
-- Description: Adds critical indices for scaling and restricts profile visibility to improve security.

-- 1. RENDIMIENTO: Índices en Claves Foráneas (Foreign Keys)
-- Estos índices evitan escaneos completos de tablas en consultas comunes de la app.

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
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_order_id ON public.wallet_transactions(order_id);

-- 2. PRIVACIDAD: Restricción de visibilidad en buyer_profiles
-- Antes, cualquier usuario logueado podía ver la dirección y datos de cualquier comprador.
-- Ahora, solo se permite si hay una relación comercial (Pedido u Oferta).

DROP POLICY IF EXISTS "Authenticated users can view buyer profiles" ON public.buyer_profiles;

CREATE POLICY "View buyer profiles with interaction"
ON public.buyer_profiles
FOR SELECT
TO authenticated
USING (
    auth.uid() = user_id -- El propio usuario siempre puede ver su perfil
    OR 
    EXISTS (
        -- Vendedores con pedidos (activos o pasados) de este comprador
        SELECT 1 FROM public.orders 
        WHERE orders.buyer_id = buyer_profiles.user_id 
        AND orders.seller_id = auth.uid()
    )
    OR
    EXISTS (
        -- Vendedores que han enviado una oferta a alguna lista de este comprador
        SELECT 1 FROM public.offers o
        JOIN public.shopping_lists l ON o.shopping_list_id = l.id
        WHERE l.buyer_id = buyer_profiles.user_id
        AND o.seller_id = auth.uid()
    )
);

-- 3. SEGURIDAD: Refuerzo de políticas de notificaciones
-- Aseguramos que un usuario no pueda "inyectar" notificaciones a otros.

DROP POLICY IF EXISTS "Users can insert their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Add insert policy to notifications" ON public.notifications; -- Nombre común en scripts antiguos

CREATE POLICY "Users can only create their own notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 4. LIMPIEZA: Eliminación de columna redundante en stores (si aplica)
-- He detectado que 'direccion' en stores podría ser redundante si ya se usa en perfiles,
-- pero por ahora la mantenemos para no romper el flujo de 'Crear Tienda'.
