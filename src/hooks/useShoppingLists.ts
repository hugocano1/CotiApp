// Ruta: src/hooks/useShoppingLists.ts
import { useState, useCallback } from 'react';
import { supabase } from '../services/auth/config/supabaseClient';
import { useFocusEffect } from '@react-navigation/native';

export type OfferSummary = {
  id: string;
  price: number;
  shopping_list_id: string;
  seller_profiles: {
    stores: {
      name: string;
    }
  }
};

export type ShoppingList = {
  id: string;
  title: string;
  status: 'active' | 'pending' | 'completed' | 'closed'; // Añadimos 'closed'
  created_at: string;
  min_budget?: number;
  max_budget?: number;
  items: Array<{ name: string; quantity: number; unit: string }>;
  offers: OfferSummary[];
};

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
        .select(`*, offers (id, price, shopping_list_id, seller_profiles (stores (name)))`)
        .eq('buyer_id', user.id);

      // ✅ CORRECCIÓN DE LÓGICA DE FILTRADO
      if (statusFilter) {
        // 'Activas' son las que están en estado 'active'.
        // 'Historial' son las 'closed' o 'completed'.
        const statuses = statusFilter === 'active' ? ['active'] : ['closed', 'completed'];
        query = query.in('status', statuses);
      }

      const { data: lists, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setData(lists as ShoppingList[] || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useFocusEffect(useCallback(() => { fetchLists(); }, [fetchLists]));

  return { data, loading, error, refresh: fetchLists };
};