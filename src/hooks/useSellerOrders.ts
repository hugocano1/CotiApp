// Ruta: src/hooks/useSellerOrders.ts
import { useState, useCallback } from 'react';
import { supabase } from '../services/auth/config/supabaseClient';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from './useAuth';
import { Order } from '../types/entities';

export function useSellerOrders(statusFilter?: string[]) {
  const { session } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!session?.user) {
      setOrders([]);
      setLoading(false);
      return;
    }

    try {
      setError(null);
      let query = supabase
        .from('orders')
        .select<string, Order>(
          `*,
          shopping_lists ( title, delivery_date ),
          buyer_profiles:buyer_id ( nombre, apellido, foto_perfil, calificacion_comprador )`
        )
        .eq('seller_id', session.user.id);

      if (statusFilter && statusFilter.length > 0) {
        query = query.in('status', statusFilter);
      }

      const { data, error: dbError } = await query.order('delivery_date', {
        foreignTable: 'shopping_lists',
        ascending: true,
      });

      if (dbError) throw dbError;
      setOrders(data || []);
    } catch (err: unknown) {
      console.error("Error fetching seller orders:", err instanceof Error ? err.message : err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [session, statusFilter]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchOrders();
    }, [fetchOrders])
  );

  return { orders, loading, error, refresh: fetchOrders };
}