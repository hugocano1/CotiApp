// src/hooks/useBuyerOrders.ts
import { useState, useCallback } from 'react';
import { supabase } from '../services/auth/config/supabaseClient';
import { useFocusEffect } from '@react-navigation/native';

export function useBuyerOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuario no autenticado.");

      // --- ✅ CONSULTA FINAL Y CORREGIDA ---
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          seller_profiles:seller_id ( nombre ),
          shopping_lists:shopping_list_id ( title )
        `)
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }
      setOrders(data || []);
    } catch (error) {
      console.error("Error fetching buyer orders:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchOrders(); }, [fetchOrders]));

  return { orders, loading, refresh: fetchOrders };
}