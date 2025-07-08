// src/hooks/useShoppingLists.ts

import { useState, useCallback } from 'react';
import { supabase } from '../services/auth/config/supabaseClient';
import { useFocusEffect } from '@react-navigation/native'; // ✅ 1. Importa useFocusEffect

// Tu tipo ShoppingList se queda igual
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
};

// El statusFilter ahora puede ser null si queremos todas las listas
export const useShoppingLists = (statusFilter: 'active' | 'completed' | null) => {
  const [data, setData] = useState<ShoppingList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchLists = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Usuario no autenticado');

      // Modificamos la consulta para que sea más flexible
      let query = supabase
        .from('shopping_lists')
        .select('*')
        .eq('buyer_id', user.id);
      
      // Aplicamos el filtro de estado solo si no es nulo
      if (statusFilter) {
        const statuses = statusFilter === 'active' ? ['active', 'pending'] : ['completed'];
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


  // ✅ 2. Reemplazamos useEffect con useFocusEffect
  useFocusEffect(
    useCallback(() => {
      fetchLists();
      // Nota: Las suscripciones en tiempo real dentro de useFocusEffect
      // pueden ser complejas de manejar. Por ahora, nos enfocamos en que
      // la carga de datos funcione cada vez que entras a la pantalla.
      // El "pull-to-refresh" que tienes puede manejar las actualizaciones manuales.
    }, [fetchLists])
  );

  return { data, loading, error, refresh: fetchLists };
};