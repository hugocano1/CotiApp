CREATE OR REPLACE FUNCTION public.update_order_status(order_id_to_update uuid, new_status text)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
DECLARE
  buyer_push_token text;
  seller_store_name text;
  order_buyer_id uuid;
  expo_access_token text := current_setting('app.secrets.EXPO_ACCESS_TOKEN', true);
BEGIN
  -- Primero, verificamos que el usuario que llama es el vendedor de este pedido
  if not exists (
    select 1
    from public.orders
    where id = order_id_to_update and seller_id = auth.uid()
  ) then
    raise exception 'No tienes permiso para actualizar este pedido.';
  end if;

  -- Si el permiso es correcto, actualizamos el estado
  update public.orders
  set status = new_status
  where id = order_id_to_update;

  -- Si el nuevo estado es 'enviado', enviamos una notificación al comprador
  IF new_status = 'enviado' THEN
    DECLARE
      v_title text;
      v_body text;
      v_data jsonb;
    BEGIN
      -- Obtener el id del comprador y el nombre de la tienda del vendedor
      SELECT o.buyer_id, s.name 
      INTO order_buyer_id, seller_store_name
      FROM public.orders o
      LEFT JOIN public.seller_profiles sp ON o.seller_id = sp.user_id
      LEFT JOIN public.stores s ON sp.store_id = s.id
      WHERE o.id = order_id_to_update;

      -- Obtener el push token del comprador
      SELECT push_token INTO buyer_push_token
      FROM public.buyer_profiles
      WHERE user_id = order_buyer_id;

      -- Preparar el contenido de la notificación
      v_title := '¡Tu pedido está en camino! 🚚';
      v_body := (COALESCE(seller_store_name, 'El vendedor') || ' ha despachado tu pedido.');
      v_data := jsonb_build_object('orderId', order_id_to_update);

      -- Guardar la notificación en la base de datos para el comprador
      INSERT INTO public.notifications(user_id, title, body, data)
      VALUES (order_buyer_id, v_title, v_body, v_data);

      -- Si encontramos un token, enviamos también la notificación push
      IF buyer_push_token IS NOT NULL THEN
        PERFORM net.http_post(
            url := 'https://exp.host/--/api/v2/push/send',
            headers := jsonb_build_object(
                'Content-Type', 'application/json',
                'Authorization', 'Bearer ' || expo_access_token
            ),
            body := jsonb_build_object(
                'to', buyer_push_token,
                'sound', 'default',
                'title', v_title,
                'body', v_body,
                'data', v_data
            )
        );
      END IF;
    END;
  END IF;

END;
$function$;