// Ruta: src/hooks/useSellerOrders.ts
import { useState, useCallback } from 'react';
import { supabase } from '../services/auth/config/supabaseClient';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from './useAuth';

export function useSellerOrders(statusFilter: string[]) {
  const { session } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    if (!session?.user) {
      setOrders([]);
      setLoading(false); // Detenemos la carga si no hay sesión
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`*, shopping_lists ( title, delivery_date ), buyer_profiles:buyer_id ( nombre, apellido, foto_perfil, calificacion_comprador )`)
        .eq('seller_id', session.user.id)
        .in('status', statusFilter)
        .order('delivery_date', { foreignTable: 'shopping_lists', ascending: true });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error("Error fetching seller orders:", error);
      setOrders([]); // En caso de error, la lista queda vacía
    } finally {
      // ✅ ESTA ES LA LÍNEA MÁS IMPORTANTE:
      // Se asegura de que, pase lo que pase, el estado de carga siempre termine.
      setLoading(false);
    }
  }, [session, statusFilter]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true); // Siempre activamos la carga al entrar a la pantalla
      fetchOrders();
    }, [fetchOrders])
  );

  return { orders, loading, refresh: fetchOrders };
}