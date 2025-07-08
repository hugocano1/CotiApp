// app/_layout.tsx
import React, { useEffect } from 'react';
import { useAuth } from '../src/hooks/useAuth'; // Ajusta la ruta si es necesario
import { useRouter, useSegments, Slot } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';

export default function RootLayout() {
  const { session, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
  // No hacer nada hasta que sepamos si hay o no una sesión.
  if (loading) return;

  const inAuthGroup = segments[0] === '(auth)';

  if (session && !inAuthGroup) {
      router.replace('/(main)');

  } else if (!session) {
    router.replace('/(main)');
   
  }
}, [session, loading, segments, router]);

  if (loading) {
    return <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator /></View>;
  }

   return <Slot />;
}