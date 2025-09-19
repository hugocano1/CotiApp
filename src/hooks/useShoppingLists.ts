// Ruta: src/hooks/useShoppingLists.ts
import { useState, useCallback } from 'react';
import { supabase } from '../services/auth/config/supabaseClient';
import { useFocusEffect } from '@react-navigation/native';
import { ShoppingList } from '../types/entities';

export const useShoppingLists = (statusFilter: 'active' | 'completed' | null) => {
  const [data, setData] = useState<ShoppingList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchLists = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      let query = supabase
        .from('shopping_lists')
        .select<string, ShoppingList>(
          `
          *,
          offers (id, price, shopping_list_id, seller_profiles (stores (name))),
          buyer_profiles (*)
        `
        )
        .eq('buyer_id', user.id);

      if (statusFilter) {
        const statuses = statusFilter === 'active' ? ['active'] : ['closed', 'completed'];
        query = query.in('status', statuses);
      }

      const { data: lists, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setData(lists || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useFocusEffect(useCallback(() => { fetchLists(); }, [fetchLists]));

  return { data, loading, error, refresh: fetchLists };
};