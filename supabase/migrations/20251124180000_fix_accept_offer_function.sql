CREATE OR REPLACE FUNCTION public.accept_offer(offer_id_to_accept uuid, list_id_to_close uuid)
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
BEGIN
  -- 1. VERIFICACIÓN DE AUTORIZACIÓN
  -- Obtener el dueño de la lista de compras
  SELECT buyer_id INTO list_owner_id FROM public.shopping_lists WHERE id = list_id_to_close;

  -- Verificar que el usuario que llama a la función es el dueño de la lista
  IF list_owner_id IS NULL THEN
    RAISE EXCEPTION 'La lista de compras con id % no fue encontrada.', list_id_to_close;
  END IF;
  
  IF list_owner_id != auth.uid() THEN
    RAISE EXCEPTION 'No tienes permiso para aceptar ofertas en esta lista.';
  END IF;

  -- 2. LÓGICA DE LA FUNCIÓN
  -- Actualizar la oferta aceptada
  UPDATE public.offers
  SET status = 'accepted'
  WHERE id = offer_id_to_accept
  RETURNING * INTO accepted_offer;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No se encontró la oferta con el id %', offer_id_to_accept;
  END IF;

  -- Obtener el buyer_id y delivery_type desde la tabla shopping_lists
  SELECT buyer_id, delivery_type INTO shopping_list_buyer_id, list_delivery_type FROM public.shopping_lists WHERE id = list_id_to_close;

  -- Generar código de recogida si es necesario
  IF list_delivery_type = 'pickup' THEN
    v_pickup_code := UPPER(SUBSTRING(gen_random_uuid()::text, 1, 6));
  END IF;

  -- Rechazar las otras ofertas
  UPDATE public.offers
  SET status = 'rejected'
  WHERE shopping_list_id = list_id_to_close AND id != offer_id_to_accept;

  -- Cerrar la lista de compras
  UPDATE public.shopping_lists
  SET status = 'closed'
  WHERE id = list_id_to_close;

  -- Crear el nuevo pedido en la tabla 'orders'
  INSERT INTO public.orders(shopping_list_id, offer_id, buyer_id, seller_id, total_price, status, pickup_code)
  VALUES(list_id_to_close, offer_id_to_accept, shopping_list_buyer_id, accepted_offer.seller_id, accepted_offer.price, 'confirmed', v_pickup_code)
  RETURNING id INTO new_order_id;

  -- --- LÓGICA DE NOTIFICACIÓN ---
  
  -- Buscar el push_token del vendedor ganador
  SELECT push_token INTO seller_push_token
  FROM public.seller_profiles
  WHERE user_id = accepted_offer.seller_id;
  
  -- Buscar el nombre del comprador para el mensaje
  SELECT nombre INTO buyer_name
  FROM public.buyer_profiles
  WHERE user_id = shopping_list_buyer_id;

  -- Preparar el contenido de la notificación
  v_title := '¡Tu oferta fue aceptada! 🎉';
  v_body := (COALESCE(buyer_name, 'Un comprador') || ' ha aceptado tu oferta. ¡Prepara el pedido!');
  v_data := jsonb_build_object('orderId', new_order_id);

  -- Guardar la notificación en la base de datos para el vendedor
  INSERT INTO public.notifications(user_id, title, body, data)
  VALUES (accepted_offer.seller_id, v_title, v_body, v_data);

  -- Si encontramos un token, enviamos también la notificación push
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