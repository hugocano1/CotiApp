// Ruta: app/_layout.tsx
import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { useFonts } from 'expo-font';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SplashScreen, useRouter, useSegments, Stack } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../src/hooks/useAuth';
import { useNotifications } from '@/src/hooks/useNotifications';
import * as Notifications from 'expo-notifications';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { session, loading: authLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  useNotifications();

  // Queue for notifications received before session is ready
  const [pendingNotification, setPendingNotification] = React.useState<Notifications.NotificationResponse | null>(null);

  const [fontsLoaded, fontError] = useFonts({
    ...Ionicons.font,
    ...MaterialCommunityIcons.font,
  });

  useEffect(() => {
    if (fontError) throw fontError;
    if (!authLoading && fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [authLoading, fontsLoaded, fontError]);

  // 1. Capture notification response
  useEffect(() => {
    const handleNotificationResponse = (response: Notifications.NotificationResponse | null) => {
      if (!response) return;
      console.log('🔔 Notification tapped. Queuing for session...');
      setPendingNotification(response);
    };

    Notifications.getLastNotificationResponseAsync().then(handleNotificationResponse);
    const subscription = Notifications.addNotificationResponseReceivedListener(handleNotificationResponse);

    return () => subscription.remove();
  }, []);

  // 2. Process pending notification when session is ready
  useEffect(() => {
    if (!session || !pendingNotification) return;

    const processNotification = async () => {
      const data = pendingNotification.notification.request.content.data;
      const userRole = session.user?.user_metadata?.user_type;
      
      console.log('🚀 Processing notification navigation for role:', userRole, 'Data:', data);

      if (data?.orderId) {
        const orderId = data.orderId;
        if (userRole === 'buyer') {
          router.push(`/(buyer)/(mis-pedidos)/pedido-detalle/${orderId}`);
        } else if (userRole === 'seller') {
          router.push(`/(seller)/(pedidos)/order-details/${orderId}`);
        }
      } else if (data?.listId) {
        const listId = data.listId;
        // Assuming list offers navigation
        if (userRole === 'seller') {
             router.push(`/(seller)/(listas)/list-details/${listId}`);
        } else {
             // If buyer clicks a list notification (e.g. new offer)
             router.push(`/(buyer)/(mis-listas)/list-details/${listId}`);
        }
      }
      
      // Clear queue
      setPendingNotification(null);
    };

    processNotification();
  }, [session, pendingNotification, router]);

  useEffect(() => {
    if (authLoading || !fontsLoaded) return;

    const inAuthGroup = segments[0] === '(auth)';
    const userRole = session?.user?.user_metadata?.user_type;

    if (session && userRole) {
      if (userRole === 'buyer' && segments[0] !== '(buyer)') {
        router.replace('/(buyer)/');
      } else if (userRole === 'seller' && segments[0] !== '(seller)') {
        router.replace('/(seller)/');
      }
    } else if (!inAuthGroup) {
      router.replace('/(auth)/');
    }
  }, [session, authLoading, fontsLoaded, segments, router]);

  if (authLoading || !fontsLoaded) {
    return null;
  }
  
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* ✅ CAMBIAMOS a 'modal' para una presentación más estable */}
       
    </Stack>
  );
}