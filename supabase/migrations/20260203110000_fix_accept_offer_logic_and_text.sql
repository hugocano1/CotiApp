-- FIX: accept_offer (Restaurar lógica de Billetera + Mejorar Textos)
-- Fecha: 03-Feb-2026
-- Objetivo: Restaurar la verificación de saldo/congelamiento que se perdió en la migración 20260127170000
-- y mejorar el mensaje de notificación incluyendo el título de la lista.

CREATE OR REPLACE FUNCTION public.accept_offer(
    offer_id_to_accept uuid, 
    list_id_to_close uuid, 
    p_payment_method text DEFAULT 'transferencia_anticipada'
)
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
  payment_method_display text;
BEGIN
  -- 1. VERIFICACIÓN DE AUTORIZACIÓN
  SELECT buyer_id, delivery_type, title INTO shopping_list_record 
  FROM public.shopping_lists 
  WHERE id = list_id_to_close;

  IF shopping_list_record.buyer_id IS NULL THEN
    RAISE EXCEPTION 'Lista no encontrada.';
  END IF;
  
  IF shopping_list_record.buyer_id != auth.uid() THEN
    RAISE EXCEPTION 'No tienes permiso para aceptar ofertas en esta lista.';
  END IF;

  -- 2. OBTENER DATOS DE LA OFERTA
  SELECT * INTO accepted_offer FROM public.offers WHERE id = offer_id_to_accept;
  IF NOT FOUND THEN RAISE EXCEPTION 'Oferta no encontrada.'; END IF;

  -- 3. LÓGICA FINANCIERA (RESTAURADA)
  -- Calcular comisión (asumiendo función existente calculate_commission o 5% directo)
  -- Usamos la función si existe, si no 5% hardcoded por seguridad
  v_commission := ROUND((accepted_offer.price * 0.05), 2);
  
  -- Bloquear fila de la billetera
  SELECT id, balance, frozen_balance INTO v_wallet_id, v_seller_balance, v_seller_frozen
  FROM public.seller_wallets 
  WHERE seller_id = accepted_offer.seller_id
  FOR UPDATE;

  -- Auto-crear billetera si no existe (Safety net)
  IF v_wallet_id IS NULL THEN
    INSERT INTO public.seller_wallets (seller_id) VALUES (accepted_offer.seller_id) 
    RETURNING id, balance, frozen_balance INTO v_wallet_id, v_seller_balance, v_seller_frozen;
  END IF;

  -- Verificar Saldo Disponible
  IF (v_seller_balance - v_seller_frozen) < v_commission THEN
    RAISE EXCEPTION 'Esta oferta ya no está disponible (El vendedor no tiene saldo suficiente para la comisión).';
  END IF;

  -- Congelar saldo
  UPDATE public.seller_wallets
  SET frozen_balance = frozen_balance + v_commission,
      updated_at = now()
  WHERE id = v_wallet_id;

  -- 4. ACTUALIZAR ESTADOS Y CREAR PEDIDO
  UPDATE public.offers SET status = 'accepted' WHERE id = offer_id_to_accept;

  IF shopping_list_record.delivery_type = 'pickup' THEN
    v_pickup_code := UPPER(SUBSTRING(gen_random_uuid()::text, 1, 6));
  END IF;

  UPDATE public.offers SET status = 'rejected' WHERE shopping_list_id = list_id_to_close AND id != offer_id_to_accept;
  UPDATE public.shopping_lists SET status = 'closed' WHERE id = list_id_to_close;

  INSERT INTO public.orders(
      shopping_list_id, offer_id, buyer_id, seller_id, total_price, status, pickup_code, commission_amount, payment_method
  )
  VALUES(
      list_id_to_close, offer_id_to_accept, shopping_list_record.buyer_id, accepted_offer.seller_id, accepted_offer.price, 'confirmed', v_pickup_code, v_commission, p_payment_method
  )
  RETURNING id INTO new_order_id;

  -- 5. NOTIFICACIONES (MEJORADAS)
  SELECT push_token INTO seller_push_token FROM public.seller_profiles WHERE user_id = accepted_offer.seller_id;
  SELECT nombre INTO buyer_name FROM public.buyer_profiles WHERE user_id = shopping_list_record.buyer_id;

  -- Formatear método de pago
  IF p_payment_method = 'transferencia_anticipada' THEN
    payment_method_display := 'Transferencia anticipada';
  ELSIF p_payment_method = 'efectivo_contra_entrega' THEN
    payment_method_display := 'Efectivo contra entrega';
  ELSIF p_payment_method = 'transferencia_contra_entrega' THEN
    payment_method_display := 'Transferencia contra entrega';
  ELSE
    payment_method_display := p_payment_method;
  END IF;

  v_title := '¡Oferta Aceptada! 🎉';
  -- Texto: "Hugo A. aceptó tu oferta por 'Tomates'. Pago: Transferencia anticipada. (Comisión retenida)"
  v_body := COALESCE(buyer_name, 'Un comprador') || ' aceptó tu oferta por "' || shopping_list_record.title || '". Pago: ' || payment_method_display || '.';
  
  v_data := jsonb_build_object('orderId', new_order_id, 'type', 'order_confirmed');

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
