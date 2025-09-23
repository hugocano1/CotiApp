CREATE OR REPLACE FUNCTION public.cancel_order(p_order_id uuid, p_reason text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    order_status text;
    buyer_uuid uuid;
BEGIN
    -- Get order status and buyer_id
    SELECT status, buyer_id INTO order_status, buyer_uuid
    FROM public.orders
    WHERE id = p_order_id;

    -- Check if the user is the buyer of the order
    IF buyer_uuid IS NULL OR buyer_uuid <> auth.uid() THEN
        RAISE EXCEPTION 'No tienes permiso para cancelar este pedido.';
    END IF;

    -- Check if the order can be cancelled
    IF order_status <> 'confirmed' THEN
        RAISE EXCEPTION 'Solo se pueden cancelar pedidos con estado "confirmado". Estado actual: %', order_status;
    END IF;

    -- Update order status to 'cancelled' and save the reason
    UPDATE public.orders
    SET status = 'cancelled', cancellation_reason = p_reason
    WHERE id = p_order_id;
END;
$function$;