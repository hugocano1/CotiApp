// Ruta completa: src/services/notification.service.ts

import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
// Asegúrate de que esta ruta a tu cliente de Supabase sea correcta
import { supabase } from './auth/config/supabaseClient';

// Esta configuración le dice a la app que muestre la notificación incluso si la app está abierta
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true, // Cambiado a true para que suene por defecto
    shouldSetBadge: false,
  }),
});

export class NotificationService {

  /**
   * Pide permiso al usuario para notificaciones y obtiene el token.
   */
  static async registerForPushNotificationsAsync(): Promise<string | undefined> {
    // Código de permisos
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Permiso de notificaciones no concedido.');
      return;
    }

    // Obtenemos el token único del dispositivo
    try {
      // Obtenemos el Project ID desde las variables de entorno de Expo
      const projectId = process.env.EXPO_PUBLIC_EAS_PROJECT_ID;
      if (!projectId) {
        throw new Error("Falta el projectId de Expo. Asegúrate de que EXPO_PUBLIC_EAS_PROJECT_ID esté configurado.");
      }
      
      const pushToken = await Notifications.getExpoPushTokenAsync({ projectId });
      const token = pushToken.data;
      console.log("Este es el Expo Push Token del dispositivo:", token);
      return token;

    } catch (e) {
      console.error("No se pudo obtener el Expo Push Token:", e);
      return;
    }
  }

  /**
   * Guarda o actualiza el push token del usuario en su perfil.
   */
  static async savePushToken(token: string, userId: string, role: string): Promise<void> {
    if (!token || !userId || !role) return;

    // Tu lógica para tablas separadas está bien, la mantenemos.
    const profileTable = role === 'buyer' ? 'buyer_profiles' : 'seller_profiles';
    
    // Asegúrate de tener una columna llamada 'push_token' en ambas tablas.
    const { error } = await supabase
      .from(profileTable)
      .update({ push_token: token })
      .eq('user_id', userId);

    if (error) {
      console.error("Error guardando el push token:", error);
    } else {
      console.log("Push token guardado exitosamente en el perfil.");
    }
  }
}