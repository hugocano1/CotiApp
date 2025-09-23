CREATE TABLE public.stores (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    direccion text,
    horario_atencion text,
    store_logo_url text,
    opciones_entrega text
);
