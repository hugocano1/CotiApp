// Ruta: app/_layout.tsx
import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { useFonts } from 'expo-font';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SplashScreen, useRouter, useSegments, Stack } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../src/hooks/useAuth';
import { useNotifications } from '@/src/hooks/useNotifications';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { session, loading: authLoading } = useAuth();
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);
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
    const checkOnboarding = async () => {
      try {
        const value = await AsyncStorage.getItem('hasSeenOnboarding');
        setHasSeenOnboarding(value === 'true');
      } catch (e) {
        setHasSeenOnboarding(false);
      }
    };
    checkOnboarding();
  }, []);

  useEffect(() => {
    if (fontError) throw fontError;
    if (!authLoading && fontsLoaded && hasSeenOnboarding !== null) {
      SplashScreen.hideAsync();
    }
  }, [authLoading, fontsLoaded, fontError, hasSeenOnboarding]);

  // 1. Capture notification response (no changes here)
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

  // 2. Process pending notification when session is ready (no changes here)
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
        if (userRole === 'seller') {
             router.push(`/(seller)/(listas)/list-details/${listId}`);
        } else {
             router.push(`/(buyer)/(mis-listas)/list-details/${listId}`);
        }
      }
      
      setPendingNotification(null);
    };

    processNotification();
  }, [session, pendingNotification, router]);

  useEffect(() => {
    if (authLoading || !fontsLoaded || hasSeenOnboarding === null) return;

    const segment = segments[0];
    const userRole = session?.user?.user_metadata?.user_type;

    // Logic:
    // 1. If not seen onboarding -> /onboarding
    // 2. If seen but no session -> /welcome
    // 3. If session but no userRole -> wait/stay
    // 4. If session and userRole -> redirect to role home

    if (!hasSeenOnboarding) {
      if (segment !== 'onboarding' && segment !== 'welcome') {
        router.replace('/onboarding');
      }
      
      // If we land on welcome, re-read status to sync state
      if (segment === 'welcome') {
        AsyncStorage.getItem('hasSeenOnboarding').then(val => {
          if (val === 'true') setHasSeenOnboarding(true);
        });
      }
      return;
    }

    if (!session) {
      const isAuthPath = segment === '(auth)' || segment === 'welcome' || segment === 'onboarding';
      if (!isAuthPath) {
        router.replace('/welcome');
      }
    } else if (userRole) {
      if (userRole === 'buyer' && segment !== '(buyer)') {
        router.replace('/(buyer)/');
      } else if (userRole === 'seller' && segment !== '(seller)') {
        router.replace('/(seller)/');
      }
    }
  }, [session, authLoading, fontsLoaded, hasSeenOnboarding, segments, router]);

  if (authLoading || !fontsLoaded || hasSeenOnboarding === null) {
    return null;
  }
  
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
      <Stack.Screen name="welcome" options={{ gestureEnabled: false }} />
    </Stack>
  );
}