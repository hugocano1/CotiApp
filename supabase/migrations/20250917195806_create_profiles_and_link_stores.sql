-- Create buyer_profiles table
CREATE TABLE public.buyer_profiles (
    user_id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre text,
    apellido text,
    foto_perfil text,
    calificacion_comprador numeric,
    direccion text,
    gender text,
    birth_date date
);

-- Create seller_profiles table
CREATE TABLE public.seller_profiles (
    user_id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre text,
    foto_perfil text,
    calificacion_vendedor numeric,
    store_description text,
    store_id uuid REFERENCES public.stores(id) ON DELETE SET NULL,
    push_token text
);

-- Function to create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Check the user's role from auth.users table metadata
  IF (NEW.raw_user_meta_data->>'role' = 'buyer') THEN
    INSERT INTO public.buyer_profiles (user_id, nombre)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'name');
  ELSIF (NEW.raw_user_meta_data->>'role' = 'seller') THEN
    INSERT INTO public.seller_profiles (user_id, nombre)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'name');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_user_profile();
