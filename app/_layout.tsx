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

  useEffect(() => {
    // Define a function to handle navigation based on notification data.
    const handleNotificationResponse = (response: Notifications.NotificationResponse | null) => {
      if (!response) {
        return;
      }
      
      const data = response.notification.request.content.data;
      console.log('Notification data received (type:', typeof data, 'value:', JSON.stringify(data, null, 2));

      // Wait until the session is loaded to get userRole.
      if (!session) {
        // Optionally, you could save the navigation path and execute it once the session loads.
        // For now, we'll just log and wait for the user to tap again if needed.
        console.log("Session not ready, can't navigate yet.");
        return;
      }
      
      const userRole = session.user?.user_metadata?.user_type;

      if (data?.orderId) {
        const orderId = data.orderId;
        if (userRole === 'buyer') {
          router.push(`/(buyer)/mis-pedidos/pedido-detalle/${orderId}`);
        } else if (userRole === 'seller') {
          router.push(`/(seller)/pedidos/order-details/${orderId}`);
        }
      } else if (data?.listId) {
        const listId = data.listId;
        if (userRole === 'buyer') {
          router.push(`/(buyer)/(mis-listas)/list-details/${listId}`);
        }
      }
    };

    // 1. Handle notification that opened the app
    Notifications.getLastNotificationResponseAsync().then(handleNotificationResponse);

    // 2. Handle notification that is tapped while the app is running
    const subscription = Notifications.addNotificationResponseReceivedListener(handleNotificationResponse);

    return () => subscription.remove();
  }, [session, router]);

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