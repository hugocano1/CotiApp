// app/_layout.tsx
import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { useAuth } from '../src/hooks/useAuth'; // Asegúrate que la ruta sea correcta
import { useRouter, useSegments, Stack } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';

export default function RootLayout() {
  const { session, loading: authLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (authLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const userRole = session?.user?.user_metadata?.user_type;

    if (session) {
      if (userRole === 'buyer' && !segments.includes('(buyer)')) {
        router.replace('/(buyer)');
      } else if (userRole === 'seller' && !segments.includes('(seller)')) {
        router.replace('/(seller)');
      }
    } else if (!inAuthGroup) {
      router.replace('/(auth)');
    }
  }, [session, authLoading, segments, router]);

  if (authLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }
  
  // ✅ CORRECCIÓN: Simplemente devolvemos el componente Stack.
  // Expo Router se encargará de renderizar los grupos (auth), (buyer), y (seller) adentro.
  return <Stack screenOptions={{ headerShown: false }} />;
}