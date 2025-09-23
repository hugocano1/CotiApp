CREATE OR REPLACE FUNCTION public.accept_offer(offer_id_to_accept uuid, list_id_to_close uuid)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
DECLARE
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

  -- DEBUGGING: Log the delivery type found
  RAISE NOTICE 'DEBUG: List ID -> %, Delivery Type -> %', list_id_to_close, list_delivery_type;

  -- Generar código de recogida si es necesario
  IF list_delivery_type = 'pickup' THEN
    v_pickup_code := UPPER(SUBSTRING(gen_random_uuid()::text, 1, 6));
    -- DEBUGGING: Log the generated code
    RAISE NOTICE 'DEBUG: Generated pickup_code -> %', v_pickup_code;
  ELSE
    -- DEBUGGING: Log why no code was generated
    RAISE NOTICE 'DEBUG: Not a pickup order, skipping pickup_code generation.';
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

  -- DEBUGGING: Log the inserted code
  RAISE NOTICE 'DEBUG: Inserted order % with pickup_code -> %', new_order_id, v_pickup_code;

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