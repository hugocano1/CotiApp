// Ruta: src/hooks/useSellerOffers.ts
import { useState, useCallback } from 'react';
import { supabase } from '../services/auth/config/supabaseClient';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from './useAuth';

export function useSellerOffers(limit?: number) {
  const { session } = useAuth();
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOffers = useCallback(async () => {
    if (!session?.user) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      let query = supabase
        .from('offers')
        .select(`
          *,
          shopping_lists ( 
            title,
            buyer_profiles (
              nombre,
              apellido,
              foto_perfil
            )
          )
        `)
        .eq('seller_id', session.user.id)
        .order('created_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      setOffers(data || []);
    } catch (error) {
      console.error("Error fetching seller offers:", error);
    } finally {
      setLoading(false);
    }
  }, [session, limit]);

  useFocusEffect(useCallback(() => { fetchOffers(); }, [fetchOffers]));

  return { offers, loading, refresh: fetchOffers };
}