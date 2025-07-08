// src/hooks/useSellerOrders.ts
import { useState, useCallback } from 'react';
import { supabase } from '../services/auth/config/supabaseClient';
import { useFocusEffect } from '@react-navigation/native';

export function useSellerOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuario no autenticado.");

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          shopping_lists ( title, expires_at )
        `)
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error("Error fetching seller orders:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchOrders(); }, [fetchOrders]));

  return { orders, loading, refresh: fetchOrders };
}