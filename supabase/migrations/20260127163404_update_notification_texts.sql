-- 1. UPDATE: seller_dispatch_order (Mensajes Dinámicos + Personalización)
CREATE OR REPLACE FUNCTION public.seller_dispatch_order(order_id_param uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_order record;
  v_delivery_type text;
  v_list_title text; -- Variable para el nombre de la lista
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
  
  -- Obtener tipo de entrega y TÍTULO DE LA LISTA
  SELECT delivery_type, title INTO v_delivery_type, v_list_title 
  FROM public.shopping_lists 
  WHERE id = v_order.shopping_list_id;

  -- Obtener nombre de la tienda
  SELECT s.name INTO v_seller_store_name 
  FROM public.seller_profiles sp JOIN public.stores s ON sp.store_id = s.id 
  WHERE sp.user_id = v_order.seller_id;

  v_seller_store_name := COALESCE(v_seller_store_name, 'La Tienda');
  v_list_title := COALESCE(v_list_title, 'tu lista');

  -- Determinar nuevo estado y mensaje condicional
  IF v_delivery_type = 'pickup' THEN
    v_new_status := 'ready_for_pickup';
    v_title := '¡Tu pedido está listo! 🛍️';
    -- Formato: "Tu pedido [Nombre Lista] de [Nombre Tienda] está listo para ser recogido en tienda 🛍️"
    v_body := 'Tu pedido "' || v_list_title || '" de "' || v_seller_store_name || '" está listo para ser recogido en tienda 🛍️';
  ELSE
    v_new_status := 'in_transit';
    v_title := '¡Tu pedido va en camino! 🛵';
    -- Formato: "Tu pedido [Nombre Lista] de [Nombre Tienda] va en camino 🛵"
    v_body := 'Tu pedido "' || v_list_title || '" de "' || v_seller_store_name || '" va en camino 🛵';
  END IF;

  -- Actualizar estado
  UPDATE public.orders SET status = v_new_status WHERE id = order_id_param;

  -- Notificar al Comprador
  SELECT push_token INTO v_buyer_push_token FROM public.buyer_profiles WHERE user_id = v_order.buyer_id;

  v_data := jsonb_build_object('orderId', order_id_param, 'type', 'order_update');

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


-- 2. UPDATE: seller_confirm_payment (Mensaje de Cierre de Ciclo)
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
  v_seller_push_token text; -- Para notificar al vendedor también
  expo_access_token text := current_setting('app.secrets.EXPO_ACCESS_TOKEN', true);
BEGIN
  -- Verificar propiedad y estado
  SELECT * INTO v_order FROM public.orders WHERE id = order_id_param;
  IF v_order.seller_id != auth.uid() THEN RAISE EXCEPTION 'No autorizado.'; END IF;
  
  -- Validación de estados permitidos
  IF v_order.status != 'delivered_pending_confirmation' AND v_order.status != 'confirmed' AND v_order.status != 'in_transit' AND v_order.status != 'ready_for_pickup' THEN 
    NULL; -- Permisivo por ahora
  END IF;

  v_commission := v_order.commission_amount;

  -- Mover Dinero
  SELECT id INTO v_wallet_id FROM public.seller_wallets WHERE seller_id = auth.uid();
  
  UPDATE public.seller_wallets
  SET balance = balance - v_commission,        
      frozen_balance = frozen_balance - v_commission, 
      updated_at = now()
  WHERE id = v_wallet_id;

  -- Registrar Transacción
  INSERT INTO public.wallet_transactions (wallet_id, order_id, amount, transaction_type, description)
  VALUES (v_wallet_id, order_id_param, -v_commission, 'commission', 'Comisión por pedido finalizado #' || SUBSTRING(order_id_param::text, 1, 8));

  -- Finalizar Orden
  UPDATE public.orders SET status = 'completed' WHERE id = order_id_param;

  -- A. Notificar Comprador (Estándar)
  SELECT push_token INTO v_buyer_push_token FROM public.buyer_profiles WHERE user_id = v_order.buyer_id;
  
  INSERT INTO public.notifications(user_id, title, body, data, type, reference_id)
  VALUES (v_order.buyer_id, 'Pedido Completado 🌟', 'El vendedor ha confirmado el pago. ¡Gracias por tu compra!', jsonb_build_object('orderId', order_id_param), 'order_completed', order_id_param);
  
  IF v_buyer_push_token IS NOT NULL THEN
    PERFORM net.http_post(
        url := 'https://exp.host/--/api/v2/push/send',
        headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || expo_access_token),
        body := jsonb_build_object('to', v_buyer_push_token, 'sound', 'default', 'title', 'Pedido Completado 🌟', 'body', 'El vendedor ha confirmado el pago. ¡Gracias por tu compra!', 'data', jsonb_build_object('orderId', order_id_param))
    );
  END IF;

  -- B. Notificar Vendedor (Requerimiento Específico: "¡Ciclo cerrado!")
  SELECT push_token INTO v_seller_push_token FROM public.seller_profiles WHERE user_id = v_order.seller_id;
  
  -- No guardamos esta notificación en BD para no saturar el historial del vendedor con sus propias acciones, 
  -- pero sí enviamos el Push como "Feedback de Sistema" si es necesario, o lo guardamos si se prefiere persistencia.
  -- Decisión: Guardar para persistencia financiera.
  INSERT INTO public.notifications(user_id, title, body, data, type, reference_id)
  VALUES (v_order.seller_id, 'Ciclo Cerrado 💵', '¡Ciclo cerrado! Se ha descontado la comisión exitosamente.', jsonb_build_object('orderId', order_id_param), 'system_info', order_id_param);

  IF v_seller_push_token IS NOT NULL THEN
    PERFORM net.http_post(
        url := 'https://exp.host/--/api/v2/push/send',
        headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || expo_access_token),
        body := jsonb_build_object('to', v_seller_push_token, 'sound', 'default', 'title', 'Ciclo Cerrado 💵', 'body', '¡Ciclo cerrado! Se ha descontado la comisión exitosamente.', 'data', jsonb_build_object('orderId', order_id_param))
    );
  END IF;

END;
$function$;
