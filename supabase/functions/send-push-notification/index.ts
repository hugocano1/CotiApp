// File: supabase/functions/send-push-notification/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

// Interfaz para el cuerpo de la petición
interface NotificationPayload {
  push_token: string;
  title: string;
  message: string;
  data?: Record<string, any>; // Optional data field
}

// URL de la API de notificaciones de Expo
const EXPO_API_URL = 'https://api.expo.dev/v2/push/send';

serve(async (req: Request) => {
  // 1. Validar que la petición sea POST
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    // 2. Extraer y validar el payload (SIN la envoltura "record")
    const payload: NotificationPayload = await req.json();
    const { push_token, title, message, data } = payload;

    if (!push_token || !title || !message) {
      return new Response(JSON.stringify({ error: 'Missing push_token, title, or message' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 3. Enviar la notificación a través de la API de Expo
    const res = await fetch(EXPO_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate',
      },
      body: JSON.stringify({
        to: push_token,
        sound: 'default',
        title: title,
        body: message,
        data: data, // Include the custom data field
      }),
    });

    // 4. Devolver una respuesta exitosa
    const responseBody = await res.json();
    return new Response(JSON.stringify({ success: true, expo_response: responseBody }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    // 5. Manejar errores
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});