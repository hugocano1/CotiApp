// src/services/notification.service.ts
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { supabase } from './auth/config/supabaseClient'; // Ajusta la ruta si es necesario

// Esta configuración le dice a la app que muestre la notificación incluso si la app está abierta
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export class NotificationService {

  /**
   * Pide permiso al usuario para notificaciones y obtiene el token.
   */
  static async registerForPushNotificationsAsync(): Promise<string | undefined> {
    let token;

    // Preguntamos por los permisos
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
      const pushToken = await Notifications.getExpoPushTokenAsync();
      token = pushToken.data;
      console.log("Este es el Expo Push Token del dispositivo:", token);
    } catch (e) {
      console.error("No se pudo obtener el Expo Push Token:", e);
      return;
    }

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    return token;
  }

  /**
   * Guarda o actualiza el push token del usuario en su perfil.
   */
  static async savePushToken(token: string, userId: string, role: string): Promise<void> {
    if (!token || !userId || !role) return;

    const profileTable = role === 'buyer' ? 'buyer_profiles' : 'seller_profiles';
    const { error } = await supabase
      .from(profileTable)
      .update({ push_token: token }) // Asumimos que la columna se llamará 'push_token'
      .eq('user_id', userId);

    if (error) {
      console.error("Error guardando el push token:", error);
    } else {
      console.log("Push token guardado exitosamente en el perfil.");
    }
  }
}