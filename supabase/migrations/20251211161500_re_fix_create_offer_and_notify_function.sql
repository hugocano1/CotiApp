CREATE OR REPLACE FUNCTION public.create_offer_and_notify(
    p_shopping_list_id uuid,
    p_total_price numeric,
    p_notes text,
    p_shipping_cost numeric,
    p_items jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_seller_id uuid := auth.uid();
    v_offer_id uuid;
    v_item record;
    v_list_title text;
    v_buyer_id uuid;
    v_buyer_push_token text;
    v_seller_name text;
    v_title text;
    v_body text;
    v_data jsonb;
    expo_access_token text := current_setting('app.secrets.EXPO_ACCESS_TOKEN', true);
BEGIN
    -- 1. Insertar la oferta principal
    INSERT INTO public.offers (shopping_list_id, seller_id, price, notes, status, shipping_cost)
    VALUES (p_shopping_list_id, v_seller_id, p_total_price, p_notes, 'pending', p_shipping_cost)
    RETURNING id INTO v_offer_id;

    -- 2. Insertar los artículos de la oferta desde el JSON
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(
        item_name text,
        quantity numeric,
        unit text,
        brand text,
        unit_price numeric,
        list_item_id uuid
    )
    LOOP
        INSERT INTO public.offer_items (offer_id, list_item_id, item_name, quantity, unit, brand, unit_price)
        VALUES (v_offer_id, v_item.list_item_id, v_item.item_name, v_item.quantity, v_item.unit, v_item.brand, v_item.unit_price);
    END LOOP;

    -- --- LÓGICA DE NOTIFICACIÓN ---

    -- 3. Obtener datos necesarios para la notificación
    SELECT l.buyer_id, l.title, p.push_token
    INTO v_buyer_id, v_list_title, v_buyer_push_token
    FROM public.shopping_lists l
    JOIN public.buyer_profiles p ON l.buyer_id = p.user_id
    WHERE l.id = p_shopping_list_id;

    IF v_buyer_id IS NULL THEN
        RETURN v_offer_id;
    END IF;

    -- 4. Obtener el nombre de la tienda del vendedor (CORREGIDO)
    SELECT s.name 
    INTO v_seller_name 
    FROM public.seller_profiles sp
    JOIN public.stores s ON sp.store_id = s.id
    WHERE sp.user_id = v_seller_id;
    
    -- 5. Preparar el contenido de la notificación
    v_title := '¡Has recibido una nueva oferta! 报价';
    v_body := 'La tienda "' || COALESCE(v_seller_name, 'un vendedor') || '" te ha enviado una oferta para tu lista "' || v_list_title || '".';
    v_data := jsonb_build_object('listId', p_shopping_list_id);

    -- 6. Guardar la notificación en la base de datos para el comprador
    INSERT INTO public.notifications(user_id, title, body, data, type, reference_id)
    VALUES (v_buyer_id, v_title, v_body, v_data, 'new_offer', v_offer_id);

    -- 7. Si encontramos un token, enviamos también la notificación push
    IF v_buyer_push_token IS NOT NULL THEN
        PERFORM net.http_post(
            url := 'https://exp.host/--/api/v2/push/send',
            headers := jsonb_build_object(
                'Content-Type', 'application/json',
                'Authorization', 'Bearer ' || expo_access_token
            ),
            body := jsonb_build_object(
                'to', v_buyer_push_token,
                'sound', 'default',
                'title', v_title,
                'body', v_body,
                'data', v_data
            )
        );
    END IF;
    
    RETURN v_offer_id;
END;
$$;