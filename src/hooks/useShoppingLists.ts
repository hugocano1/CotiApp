// Ruta: src/hooks/useShoppingLists.ts
import { useState, useCallback } from 'react';
import { supabase } from '../services/auth/config/supabaseClient';
import { useFocusEffect } from '@react-navigation/native';

export type ShoppingList = {
  id: string;
  title: string;
  status: 'active' | 'pending' | 'completed';
  created_at: string;
  expires_at: string;
  buyer_id: string;
  min_budget?: number;
  max_budget?: number;
  items: Array<{ product_name: string; quantity: number; brand?: string }>;
  // ✅ AÑADIDO: Tipo para el conteo de ofertas
  offers: { count: number }[]; 
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

      // ✅ CORRECCIÓN: Modificamos la consulta para incluir el conteo de ofertas
      let query = supabase
        .from('shopping_lists')
        .select(`
          *,
          offers (count)
        `)
        .eq('buyer_id', user.id);
      
      if (statusFilter) {
        const statuses = statusFilter === 'active' ? ['active', 'pending'] : ['completed'];
        query = query.in('status', statuses);
      }

      const { data: lists, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setData(lists as ShoppingList[] || []); // Hacemos un cast al tipo correcto
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useFocusEffect(
    useCallback(() => {
      fetchLists();
    }, [fetchLists])
  );

  return { data, loading, error, refresh: fetchLists };
};