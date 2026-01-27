-- 1. UTILS: Función de Cálculo de Comisión (5%)
CREATE OR REPLACE FUNCTION public.calculate_commission(order_total numeric)
RETURNS numeric
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT ROUND((order_total * 0.05), 2);
$$;

-- 2. TABLAS: Billetera y Transacciones
CREATE TABLE IF NOT EXISTS public.seller_wallets (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    seller_id uuid NOT NULL REFERENCES public.seller_profiles(user_id) ON DELETE CASCADE,
    balance numeric NOT NULL DEFAULT 0.00 CHECK (balance >= 0),
    frozen_balance numeric NOT NULL DEFAULT 0.00 CHECK (frozen_balance >= 0),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT seller_wallets_seller_id_key UNIQUE (seller_id)
);

CREATE TABLE IF NOT EXISTS public.wallet_transactions (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    wallet_id uuid NOT NULL REFERENCES public.seller_wallets(id),
    order_id uuid REFERENCES public.orders(id), -- Nullable para recargas manuales
    amount numeric NOT NULL, -- Negativo para cobros, positivo para recargas
    transaction_type text NOT NULL CHECK (transaction_type IN ('commission', 'top_up', 'refund', 'adjustment')),
    description text,
    created_at timestamp with time zone DEFAULT now()
);

-- Agregar columna de comisión histórica a la orden
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS commission_amount numeric DEFAULT 0;

-- 3. SEGURIDAD (RLS)
ALTER TABLE public.seller_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

-- Solo el dueño puede ver su saldo
CREATE POLICY "Sellers can view own wallet" ON public.seller_wallets
FOR SELECT TO authenticated USING (auth.uid() = seller_id);

-- Solo el dueño puede ver sus transacciones
CREATE POLICY "Sellers can view own transactions" ON public.wallet_transactions
FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.seller_wallets WHERE id = wallet_transactions.wallet_id AND seller_id = auth.uid())
);

-- NADIE puede insertar/actualizar directamente desde el cliente (Solo RPCs)
-- No creamos políticas FOR INSERT/UPDATE

-- 4. MIGRACIÓN DE DATOS (Backfill)
-- Crear billeteras para vendedores existentes que no la tengan
INSERT INTO public.seller_wallets (seller_id)
SELECT user_id FROM public.seller_profiles
ON CONFLICT (seller_id) DO NOTHING;


-- 5. RPC: accept_offer (Refactorizado con lógica financiera)
CREATE OR REPLACE FUNCTION public.accept_offer(offer_id_to_accept uuid, list_id_to_close uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  list_owner_id uuid;
  accepted_offer record;
  shopping_list_record record;
  v_pickup_code text;
  seller_push_token text;
  buyer_name text;
  new_order_id uuid;
  v_commission numeric;
  v_wallet_id uuid;
  v_seller_balance numeric;
  v_seller_frozen numeric;
  v_title text;
  v_body text;
  v_data jsonb;
  expo_access_token text := current_setting('app.secrets.EXPO_ACCESS_TOKEN', true);
BEGIN
  -- A. VERIFICACIÓN DE AUTORIZACIÓN
  SELECT buyer_id, delivery_type, title INTO shopping_list_record FROM public.shopping_lists WHERE id = list_id_to_close;

  IF shopping_list_record.buyer_id IS NULL THEN
    RAISE EXCEPTION 'Lista no encontrada.';
  END IF;
  
  IF shopping_list_record.buyer_id != auth.uid() THEN
    RAISE EXCEPTION 'No tienes permiso para aceptar ofertas en esta lista.';
  END IF;

  -- B. OBTENER DATOS DE LA OFERTA
  SELECT * INTO accepted_offer FROM public.offers WHERE id = offer_id_to_accept;
  IF NOT FOUND THEN RAISE EXCEPTION 'Oferta no encontrada.'; END IF;

  -- C. LÓGICA FINANCIERA (VALIDACIÓN Y CONGELAMIENTO)
  v_commission := public.calculate_commission(accepted_offer.price);
  
  -- Bloquear fila de la billetera para evitar condiciones de carrera
  SELECT id, balance, frozen_balance INTO v_wallet_id, v_seller_balance, v_seller_frozen
  FROM public.seller_wallets 
  WHERE seller_id = accepted_offer.seller_id
  FOR UPDATE;

  IF v_wallet_id IS NULL THEN
    -- Fallback por seguridad si el backfill falló o es un usuario nuevo corrupto
    INSERT INTO public.seller_wallets (seller_id) VALUES (accepted_offer.seller_id) RETURNING id, balance, frozen_balance INTO v_wallet_id, v_seller_balance, v_seller_frozen;
  END IF;

  -- Verificar Saldo Disponible (Balance Real - Congelado >= Comisión)
  IF (v_seller_balance - v_seller_frozen) < v_commission THEN
    RAISE EXCEPTION 'Esta oferta ya no está disponible (El vendedor no cumple los requisitos).';
  END IF;

  -- Congelar saldo
  UPDATE public.seller_wallets
  SET frozen_balance = frozen_balance + v_commission,
      updated_at = now()
  WHERE id = v_wallet_id;

  -- D. CREAR PEDIDO
  UPDATE public.offers SET status = 'accepted' WHERE id = offer_id_to_accept;

  IF shopping_list_record.delivery_type = 'pickup' THEN
    v_pickup_code := UPPER(SUBSTRING(gen_random_uuid()::text, 1, 6));
  END IF;

  UPDATE public.offers SET status = 'rejected' WHERE shopping_list_id = list_id_to_close AND id != offer_id_to_accept;
  UPDATE public.shopping_lists SET status = 'closed' WHERE id = list_id_to_close;

  INSERT INTO public.orders(shopping_list_id, offer_id, buyer_id, seller_id, total_price, status, pickup_code, commission_amount)
  VALUES(list_id_to_close, offer_id_to_accept, shopping_list_record.buyer_id, accepted_offer.seller_id, accepted_offer.price, 'confirmed', v_pickup_code, v_commission)
  RETURNING id INTO new_order_id;

  -- E. NOTIFICACIONES
  SELECT push_token INTO seller_push_token FROM public.seller_profiles WHERE user_id = accepted_offer.seller_id;
  SELECT nombre INTO buyer_name FROM public.buyer_profiles WHERE user_id = shopping_list_record.buyer_id;

  v_title := '¡Oferta Aceptada! 🎉';
  v_body := COALESCE(buyer_name, 'Un comprador') || ' aceptó tu oferta por "' || shopping_list_record.title || '". Tienes saldo retenido por la comisión.';
  v_data := jsonb_build_object('orderId', new_order_id);

  INSERT INTO public.notifications(user_id, title, body, data, type, reference_id)
  VALUES (accepted_offer.seller_id, v_title, v_body, v_data, 'order_confirmed', new_order_id);

  IF seller_push_token IS NOT NULL THEN
    PERFORM net.http_post(
        url := 'https://exp.host/--/api/v2/push/send',
        headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || expo_access_token),
        body := jsonb_build_object('to', seller_push_token, 'sound', 'default', 'title', v_title, 'body', v_body, 'data', v_data)
    );
  END IF;
END;
$function$;


-- 6. RPC: seller_dispatch_order (Nueva lógica logística condicional)
CREATE OR REPLACE FUNCTION public.seller_dispatch_order(order_id_param uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_order record;
  v_delivery_type text;
  v_new_status text;
  v_buyer_push_token text;
  v_seller_store_name text;
  v_title text;
  v_body text;
  v_data jsonb;
  expo_access_token text := current_setting('app.secrets.EXPO_ACCESS_TOKEN', true);
BEGIN
  -- Verificar propiedad
  SELECT * INTO v_order FROM public.orders WHERE id = order_id_param;
  IF v_order.seller_id != auth.uid() THEN RAISE EXCEPTION 'No autorizado.'; END IF;
  
  -- Obtener tipo de entrega original
  SELECT delivery_type INTO v_delivery_type FROM public.shopping_lists WHERE id = v_order.shopping_list_id;

  -- Determinar nuevo estado
  IF v_delivery_type = 'pickup' THEN
    v_new_status := 'ready_for_pickup';
    v_title := '¡Pedido Listo! 🛍️';
    v_body := 'Tu pedido está listo para recoger en la tienda.';
  ELSE
    v_new_status := 'in_transit';
    v_title := '¡Pedido en Camino! 🚚';
    v_body := 'Tu pedido ha sido despachado y va hacia tu dirección.';
  END IF;

  -- Actualizar
  UPDATE public.orders SET status = v_new_status WHERE id = order_id_param;

  -- Notificar al Comprador
  SELECT push_token INTO v_buyer_push_token FROM public.buyer_profiles WHERE user_id = v_order.buyer_id;
  SELECT s.name INTO v_seller_store_name 
  FROM public.seller_profiles sp JOIN public.stores s ON sp.store_id = s.id 
  WHERE sp.user_id = v_order.seller_id;

  v_body := COALESCE(v_seller_store_name, 'El vendedor') || ': ' || v_body;
  v_data := jsonb_build_object('orderId', order_id_param);

  INSERT INTO public.notifications(user_id, title, body, data, type, reference_id)
  VALUES (v_order.buyer_id, v_title, v_body, v_data, 'order_update', order_id_param);

  IF v_buyer_push_token IS NOT NULL THEN
    PERFORM net.http_post(
        url := 'https://exp.host/--/api/v2/push/send',
        headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || expo_access_token),
        body := jsonb_build_object('to', v_buyer_push_token, 'sound', 'default', 'title', v_title, 'body', v_body, 'data', v_data)
    );
  END IF;
END;
$function$;


-- 7. RPC: buyer_confirm_receipt (Paso intermedio)
CREATE OR REPLACE FUNCTION public.buyer_confirm_receipt(order_id_param uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_order record;
  v_seller_push_token text;
  v_buyer_name text;
  expo_access_token text := current_setting('app.secrets.EXPO_ACCESS_TOKEN', true);
BEGIN
  SELECT * INTO v_order FROM public.orders WHERE id = order_id_param;
  IF v_order.buyer_id != auth.uid() THEN RAISE EXCEPTION 'No autorizado.'; END IF;

  UPDATE public.orders SET status = 'delivered_pending_confirmation' WHERE id = order_id_param;

  -- Notificar al Vendedor
  SELECT push_token INTO v_seller_push_token FROM public.seller_profiles WHERE user_id = v_order.seller_id;
  SELECT nombre INTO v_buyer_name FROM public.buyer_profiles WHERE user_id = v_order.buyer_id;

  INSERT INTO public.notifications(user_id, title, body, data, type, reference_id)
  VALUES (v_order.seller_id, 'Comprador Recibió Pedido ✅', COALESCE(v_buyer_name, 'El comprador') || ' marcó el pedido como recibido. Verifica el pago y finaliza.', jsonb_build_object('orderId', order_id_param), 'action_needed', order_id_param);

  IF v_seller_push_token IS NOT NULL THEN
    PERFORM net.http_post(
        url := 'https://exp.host/--/api/v2/push/send',
        headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || expo_access_token),
        body := jsonb_build_object('to', v_seller_push_token, 'sound', 'default', 'title', 'Comprador Recibió Pedido ✅', 'body', 'Verifica el pago y finaliza el pedido.', 'data', jsonb_build_object('orderId', order_id_param))
    );
  END IF;
END;
$function$;


-- 8. RPC: seller_confirm_payment (Cierre Financiero)
CREATE OR REPLACE FUNCTION public.seller_confirm_payment(order_id_param uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_order record;
  v_commission numeric;
  v_wallet_id uuid;
  v_buyer_push_token text;
  expo_access_token text := current_setting('app.secrets.EXPO_ACCESS_TOKEN', true);
BEGIN
  -- Verificar propiedad y estado
  SELECT * INTO v_order FROM public.orders WHERE id = order_id_param;
  IF v_order.seller_id != auth.uid() THEN RAISE EXCEPTION 'No autorizado.'; END IF;
  
  IF v_order.status != 'delivered_pending_confirmation' AND v_order.status != 'confirmed' AND v_order.status != 'in_transit' AND v_order.status != 'ready_for_pickup' THEN 
    -- Permitimos confirmar desde otros estados por flexibilidad, pero idealmente debe seguir el flujo
    NULL; 
  END IF;

  v_commission := v_order.commission_amount;

  -- Mover Dinero
  SELECT id INTO v_wallet_id FROM public.seller_wallets WHERE seller_id = auth.uid();
  
  UPDATE public.seller_wallets
  SET balance = balance - v_commission,        -- Descontar Realmente
      frozen_balance = frozen_balance - v_commission, -- Liberar Retención
      updated_at = now()
  WHERE id = v_wallet_id;

  -- Registrar Transacción
  INSERT INTO public.wallet_transactions (wallet_id, order_id, amount, transaction_type, description)
  VALUES (v_wallet_id, order_id_param, -v_commission, 'commission', 'Comisión por pedido finalizado #' || SUBSTRING(order_id_param::text, 1, 8));

  -- Finalizar Orden
  UPDATE public.orders SET status = 'completed' WHERE id = order_id_param;

  -- Notificar Comprador
  SELECT push_token INTO v_buyer_push_token FROM public.buyer_profiles WHERE user_id = v_order.buyer_id;
  
  INSERT INTO public.notifications(user_id, title, body, data, type, reference_id)
  VALUES (v_order.buyer_id, 'Pedido Completado 🌟', 'Gracias por tu compra. ¡No olvides calificar al vendedor!', jsonb_build_object('orderId', order_id_param), 'order_completed', order_id_param);
  
   IF v_buyer_push_token IS NOT NULL THEN
    PERFORM net.http_post(
        url := 'https://exp.host/--/api/v2/push/send',
        headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || expo_access_token),
        body := jsonb_build_object('to', v_buyer_push_token, 'sound', 'default', 'title', 'Pedido Completado 🌟', 'body', 'Gracias por tu compra. ¡Califícanos!', 'data', jsonb_build_object('orderId', order_id_param))
    );
  END IF;
END;
$function$;


-- 9. UPDATE: cancel_order (Reembolso de saldo retenido)
CREATE OR REPLACE FUNCTION public.cancel_order(p_order_id uuid, p_reason text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_order record;
    v_commission numeric;
BEGIN
    SELECT * INTO v_order FROM public.orders WHERE id = p_order_id;
    
    -- Permitir cancelar solo si NO se ha completado
    IF v_order.status = 'completed' THEN
        RAISE EXCEPTION 'No se puede cancelar un pedido completado.';
    END IF;

    -- Validar permisos (Comprador o Vendedor pueden cancelar bajo ciertas reglas, aquí simplificado al comprador como estaba, o vendedor)
    IF v_order.buyer_id != auth.uid() AND v_order.seller_id != auth.uid() THEN
         RAISE EXCEPTION 'No tienes permiso para cancelar este pedido.';
    END IF;

    -- Liberar saldo retenido si la orden estaba confirmada
    IF v_order.commission_amount > 0 AND v_order.status != 'cancelled' THEN
        UPDATE public.seller_wallets
        SET frozen_balance = frozen_balance - v_order.commission_amount,
            updated_at = now()
        WHERE seller_id = v_order.seller_id;
    END IF;

    UPDATE public.orders
    SET status = 'cancelled', cancellation_reason = p_reason
    WHERE id = p_order_id;
END;
$function$;
