// Ruta completa: src/hooks/useNotifications.ts

import { useEffect } from 'react';
import { useAuth } from './useAuth';
import { useUserProfile } from './useUserProfile';
import { NotificationService } from '@/src/services/notification.service';

export const useNotifications = () => {
  const { session } = useAuth();
  // 🔽 Obtenemos tanto 'profile' como 'role' por separado, tal como los devuelve tu hook 🔽
  const { profile, role } = useUserProfile();

  const user = session?.user;

  useEffect(() => {
    const setupNotifications = async () => {
      // 🔽 La condición ahora usa 'role' directamente 🔽
      if (!user || !role) {
        return;
      }

      const token = await NotificationService.registerForPushNotificationsAsync();
      
      if (token) {
        // 🔽 Pasamos 'role' directamente a la función del servicio 🔽
        await NotificationService.savePushToken(token, user.id, role);
      }
    };

    setupNotifications();
  }, [user, profile, role]); // Añadimos 'role' a las dependencias para mayor seguridad
};