CREATE OR REPLACE FUNCTION public.delete_shopping_list(p_list_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    list_status text;
    accepted_offers_count int;
BEGIN
    -- Check if the user is the owner of the shopping list
    IF NOT EXISTS (SELECT 1 FROM public.shopping_lists WHERE id = p_list_id AND buyer_id = auth.uid()) THEN
        RAISE EXCEPTION 'No tienes permiso para eliminar esta lista de compras.';
    END IF;

    -- Get the status of the shopping list
    SELECT status INTO list_status FROM public.shopping_lists WHERE id = p_list_id;

    -- Check if there are any accepted offers for this shopping list
    SELECT count(*) INTO accepted_offers_count
    FROM public.offers
    WHERE shopping_list_id = p_list_id AND status = 'accepted';

    IF accepted_offers_count > 0 THEN
        RAISE EXCEPTION 'No se puede eliminar la lista de compras porque ya tiene ofertas aceptadas.';
    END IF;

    -- Delete the shopping list
    DELETE FROM public.shopping_lists WHERE id = p_list_id;
END;
$function$;