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
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const orderId = response.notification.request.content.data?.orderId;
      if (orderId) {
        const userRole = session?.user?.user_metadata?.user_type;
        if (userRole === 'buyer') {
          router.push(`/(buyer)/mis-pedidos/pedido-detalle/${orderId}`);
        } else if (userRole === 'seller') {
          router.push(`/(seller)/pedidos/order-details/${orderId}`);
        }
      }
    });

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