-- 1. FUNCIONALIDAD DE ELIMINACIÓN DE CUENTA
-- Esta función permite a un usuario eliminar su propia cuenta de forma segura.
CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar si hay pedidos activos (comprador o vendedor)
  IF EXISTS (
    SELECT 1 FROM public.orders 
    WHERE (buyer_id = auth.uid() OR seller_id = auth.uid())
    AND status NOT IN ('completed', 'cancelled')
  ) THEN
    RAISE EXCEPTION 'No puedes eliminar tu cuenta mientras tengas pedidos en curso.';
  END IF;

  -- Eliminar el usuario de auth.users (el cascade se encargará de los perfiles y datos relacionados)
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;

-- 2. PRIVACIDAD DE UBICACIÓN
-- Renombramos las columnas actuales a "exactas" para protegerlas
ALTER TABLE public.shopping_lists RENAME COLUMN latitude TO latitude_exact;
ALTER TABLE public.shopping_lists RENAME COLUMN longitude TO longitude_exact;

-- Añadimos las columnas de ubicación aproximada (públicas para descubrimiento)
ALTER TABLE public.shopping_lists ADD COLUMN latitude double precision;
ALTER TABLE public.shopping_lists ADD COLUMN longitude double precision;

-- Función para aproximar coordenadas (Truncar a 2 decimales ~ 1.1km de precisión)
CREATE OR REPLACE FUNCTION public.approximate_coordinate(coord double precision)
RETURNS double precision AS $$
BEGIN
  RETURN ROUND(coord::numeric, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger para mantener las coordenadas aproximadas
CREATE OR REPLACE FUNCTION public.sync_approximate_location()
RETURNS TRIGGER AS $$
BEGIN
  NEW.latitude := public.approximate_coordinate(NEW.latitude_exact);
  NEW.longitude := public.approximate_coordinate(NEW.longitude_exact);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_shopping_list_location_change
  BEFORE INSERT OR UPDATE OF latitude_exact, longitude_exact ON public.shopping_lists
  FOR EACH ROW EXECUTE FUNCTION public.sync_approximate_location();

-- Actualizar registros existentes
UPDATE public.shopping_lists 
SET latitude = public.approximate_coordinate(latitude_exact),
    longitude = public.approximate_coordinate(longitude_exact)
WHERE latitude_exact IS NOT NULL;

-- 3. SEGURIDAD DE RLS PARA UBICACIÓN EXACTA
-- Por defecto, nadie (excepto el dueño) debería ver las exactas.
-- Usaremos una función para obtener la ubicación exacta solo si se cumplen los requisitos.

CREATE OR REPLACE FUNCTION public.get_exact_location(p_list_id uuid)
RETURNS TABLE (lat_exact double precision, lng_exact double precision) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_list_record record;
BEGIN
  SELECT * INTO v_list_record FROM public.shopping_lists WHERE id = p_list_id;
  
  -- Solo permitir si:
  -- 1. Es el dueño de la lista
  -- 2. Es el vendedor de un pedido CONFIRMADO/EN CURSO para esa lista (Solo si es DELIVERY)
  IF (v_list_record.buyer_id = auth.uid()) OR (
      v_list_record.delivery_type = 'delivery' AND
      EXISTS (
        SELECT 1 FROM public.orders 
        WHERE shopping_list_id = p_list_id 
        AND seller_id = auth.uid()
        AND status NOT IN ('completed', 'cancelled')
      )
  ) THEN
    RETURN QUERY SELECT v_list_record.latitude_exact, v_list_record.longitude_exact;
  ELSE
    RAISE EXCEPTION 'No tienes permiso para ver la ubicación exacta.';
  END IF;
END;
$$;
