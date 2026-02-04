-- Add payment_method column to orders table
ALTER TABLE public.orders 
ADD COLUMN payment_method text;

-- Update accept_offer function to accept payment_method
CREATE OR REPLACE FUNCTION public.accept_offer(offer_id_to_accept uuid, list_id_to_close uuid, p_payment_method text DEFAULT 'transferencia_anticipada')
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  list_owner_id uuid;
  accepted_offer offers;
  shopping_list_buyer_id uuid;
  list_delivery_type text;
  v_pickup_code text;
  seller_push_token text;
  buyer_name text;
  new_order_id uuid;
  v_title text;
  v_body text;
  v_data jsonb;
  expo_access_token text := current_setting('app.secrets.EXPO_ACCESS_TOKEN', true);
  payment_method_display text;
BEGIN
  -- 1. VERIFICACIÓN DE AUTORIZACIÓN
  SELECT buyer_id INTO list_owner_id FROM public.shopping_lists WHERE id = list_id_to_close;

  IF list_owner_id IS NULL THEN
    RAISE EXCEPTION 'La lista de compras con id % no fue encontrada.', list_id_to_close;
  END IF;
  
  IF list_owner_id != auth.uid() THEN
    RAISE EXCEPTION 'No tienes permiso para aceptar ofertas en esta lista.';
  END IF;

  -- 2. LÓGICA DE LA FUNCIÓN
  UPDATE public.offers
  SET status = 'accepted'
  WHERE id = offer_id_to_accept
  RETURNING * INTO accepted_offer;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No se encontró la oferta con el id %', offer_id_to_accept;
  END IF;

  SELECT buyer_id, delivery_type INTO shopping_list_buyer_id, list_delivery_type FROM public.shopping_lists WHERE id = list_id_to_close;

  IF list_delivery_type = 'pickup' THEN
    v_pickup_code := UPPER(SUBSTRING(gen_random_uuid()::text, 1, 6));
  END IF;

  UPDATE public.offers
  SET status = 'rejected'
  WHERE shopping_list_id = list_id_to_close AND id != offer_id_to_accept;

  UPDATE public.shopping_lists
  SET status = 'closed'
  WHERE id = list_id_to_close;

  -- Insert order with payment_method
  INSERT INTO public.orders(shopping_list_id, offer_id, buyer_id, seller_id, total_price, status, pickup_code, payment_method)
  VALUES(list_id_to_close, offer_id_to_accept, shopping_list_buyer_id, accepted_offer.seller_id, accepted_offer.price, 'confirmed', v_pickup_code, p_payment_method)
  RETURNING id INTO new_order_id;

  -- --- NOTIFICACIÓN ---
  SELECT push_token INTO seller_push_token
  FROM public.seller_profiles
  WHERE user_id = accepted_offer.seller_id;
  
  SELECT nombre INTO buyer_name
  FROM public.buyer_profiles
  WHERE user_id = shopping_list_buyer_id;

  -- Mapear metodo de pago a texto legible para la notificacion
  IF p_payment_method = 'transferencia_anticipada' THEN
    payment_method_display := 'Transferencia anticipada';
  ELSIF p_payment_method = 'efectivo_contra_entrega' THEN
    payment_method_display := 'Efectivo contra entrega';
  ELSIF p_payment_method = 'transferencia_contra_entrega' THEN
    payment_method_display := 'Transferencia contra entrega';
  ELSE
    payment_method_display := p_payment_method;
  END IF;

  v_title := '¡Tu oferta fue aceptada! 🎉';
  v_body := (COALESCE(buyer_name, 'Un comprador') || ' ha aceptado tu oferta. Pago: ' || payment_method_display || '.');
  v_data := jsonb_build_object('orderId', new_order_id);

  INSERT INTO public.notifications(user_id, title, body, data)
  VALUES (accepted_offer.seller_id, v_title, v_body, v_data);

  IF seller_push_token IS NOT NULL THEN
    PERFORM net.http_post(
        url := 'https://exp.host/--/api/v2/push/send',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || expo_access_token
        ),
        body := jsonb_build_object(
            'to', seller_push_token,
            'sound', 'default',
            'title', v_title,
            'body', v_body,
            'data', v_data
        )
    );
  END IF;

END;
$function$;