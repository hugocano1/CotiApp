import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/auth/config/supabaseClient';
import { NotificationListService } from '../services/notificationList.service';
import { useAuth } from './useAuth';

export const useUnreadNotifications = () => {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchCount = useCallback(async () => {
    if (!userId) return;
    try {
      const count = await NotificationListService.getUnreadCount(userId);
      setUnreadCount(count);
    } catch (error) {
      console.error("Failed to fetch unread notifications count:", error);
    }
  }, [userId]);

  useEffect(() => {
    fetchCount();
  }, [fetchCount]);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase.channel('public:notifications');

    channel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('Realtime notification change received!', payload);
          // Re-fetch the count whenever a change occurs
          fetchCount();
        }
      )
      .subscribe();

    // Cleanup function to remove the subscription
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchCount]);

  return { unreadCount };
};