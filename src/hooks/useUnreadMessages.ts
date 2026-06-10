import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/auth/config/supabaseClient';
import { useAuth } from './useAuth';

/**
 * Hook que cuenta los mensajes no leídos (mensajes donde el remitente no es el usuario actual).
 * Se suscribe a cambios en tiempo real en la tabla 'order_messages'.
 */
export const useUnreadMessages = () => {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchCount = useCallback(async () => {
    if (!userId) return;
    try {
      // Contar solo mensajes recibidos y que no han sido leídos
      const { count, error } = await supabase
        .from('order_messages')
        .select('*', { count: 'exact', head: true })
        .neq('sender_id', userId)
        .eq('is_read', false);

      if (error) throw error;
      setUnreadCount(count || 0);
    } catch (error) {
      console.error("Failed to fetch unread messages count:", error);
    }
  }, [userId]);

  useEffect(() => {
    fetchCount();
  }, [fetchCount]);

  useEffect(() => {
    if (!userId) return;

    // Suscribirse a nuevos mensajes
    const channel = supabase.channel('public:order_messages_count');

    channel
      .on(
        'postgres_changes',
        {
          event: '*', // Escuchamos todo para mantener el contador sincronizado
          schema: 'public',
          table: 'order_messages',
        },
        () => {
          // Re-fetech el conteo cuando haya cualquier cambio (inserción, borrado, etc.)
          fetchCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchCount]);

  return { unreadCount };
};
