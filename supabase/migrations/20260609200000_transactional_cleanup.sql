-- Migration: Transactional Data Cleanup
-- Description: Wipes all market activity but keeps users and stores.

BEGIN;

  -- 1. Limpiar actividad de mercado
  -- El CASCADE se encarga de tablas dependientes como offer_items
  TRUNCATE TABLE public.shopping_lists CASCADE;
  -- Al truncar shopping_lists con CASCADE, se borran automáticamente:
  -- - offers
  -- - offer_items
  -- - orders
  -- - order_messages (si está linkeada a orders)
  
  -- 2. Limpiar comunicación y alertas (por si no fueron borradas por cascade)
  TRUNCATE TABLE public.order_messages CASCADE;
  TRUNCATE TABLE public.notifications CASCADE;
  
  -- 3. Reiniciar Billeteras
  TRUNCATE TABLE public.wallet_transactions CASCADE;
  UPDATE public.seller_wallets SET balance = 0, frozen_balance = 0, updated_at = now();

COMMIT;
