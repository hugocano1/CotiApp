// supabase/functions/send-push-notification/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

async function sendNotification(pushToken: string, title: string, body: string) {
  if (!pushToken) {
    console.log("No se proporcionó un push token.");
    return;
  }

  const message = {
    to: pushToken,
    sound: 'default',
    title: title,
    body: body,
  };

  try {
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
    console.log(`Notificación enviada a ${pushToken}`);
  } catch (error) {
    console.error("Error al enviar la notificación:", error);
  }
}

serve(async (req) => {
  try {
    const { record } = await req.json();
    const pushToken = record.push_token;
    const title = record.notification_title;
    const body = record.notification_body;

    await sendNotification(pushToken, title, body);

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});