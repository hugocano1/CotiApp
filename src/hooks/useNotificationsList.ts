import { useState, useEffect, useCallback } from 'react';
import { NotificationListService } from '@/src/services/notificationList.service.ts';
import { Notification } from '../types/entities';
import { useAuth } from './useAuth';
import { supabase } from '@/src/services/auth/config/supabaseClient';

export const useNotificationsList = () => {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!userId) {
      setNotifications([]);
      setLoading(false);
      return;
    }
    // No establecer loading a true aquí para evitar parpadeo en las actualizaciones de realtime
    setError(null);
    try {
      const fetchedNotifications = await NotificationListService.getNotifications(userId);
      setNotifications(fetchedNotifications);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false); // Solo se establece a false después de la carga inicial
    }
  }, [userId]);

  // Efecto para la carga inicial de notificaciones
  useEffect(() => {
    setLoading(true);
    fetchNotifications();
  }, [fetchNotifications]);

  // Efecto para la suscripción a eventos de tiempo real
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`public:notifications:user_id=eq.${userId}`)
      .on<Notification>(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          // Añade la nueva notificación al principio de la lista
          setNotifications((prevNotifications) => [payload.new, ...prevNotifications]);
        }
      )
      .subscribe();

    // Función de limpieza para desuscribirse del canal
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const markAsRead = useCallback(async (notificationId: number) => {
    try {
      // Optimistic update
      setNotifications(prevNotifications =>
        prevNotifications.map(notif =>
          notif.id === notificationId ? { ...notif, is_read: true } : notif
        )
      );
      // Actualiza en la base de datos en segundo plano
      await NotificationListService.markNotificationAsRead(notificationId);
    } catch (err: any) {
      console.error('Error marking notification as read:', err);
      // Si falla, revierte el estado haciendo un fetch
      fetchNotifications();
    }
  }, [fetchNotifications]);

  return { notifications, loading, error, fetchNotifications, markAsRead };
};