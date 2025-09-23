import { useState, useEffect, useCallback } from 'react';
import { NotificationListService } from '@/src/services/notificationList.service.ts';
import { Notification } from '../types/entities';
import { useAuth } from './useAuth';

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
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching notifications for userId:', userId); // ✅ DEBUG
      const fetchedNotifications = await NotificationListService.getNotifications(userId);
      console.log('Fetched notifications:', fetchedNotifications); // ✅ DEBUG
      setNotifications(fetchedNotifications);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = useCallback(async (notificationId: number) => {
    try {
      await NotificationListService.markNotificationAsRead(notificationId);
      setNotifications(prevNotifications =>
        prevNotifications.map(notif =>
          notif.id === notificationId ? { ...notif, is_read: true } : notif
        )
      );
    } catch (err: any) {
      console.error('Error marking notification as read:', err);
      // Optionally, re-fetch notifications to ensure state consistency
      fetchNotifications();
    }
  }, [fetchNotifications]);

  return { notifications, loading, error, fetchNotifications, markAsRead };
};