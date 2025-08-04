// Ruta: app/(buyer)/_layout.tsx
import React from 'react';
import { Tabs } from 'expo-router';
import { Icon } from '@rneui/themed';
import { COLORS } from '../../src/constants/colors';

export default function BuyerTabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        headerShown: false, 
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Resumen', headerShown: true, tabBarIcon: ({ color }) => <Icon name="home" type="material-community" color={color} /> }} />
      <Tabs.Screen name="(mis-listas)" options={{ title: 'Mis Listas', tabBarIcon: ({ color }) => <Icon name="format-list-bulleted" type="material-community" color={color} /> }} />
      {/* ✅ CORRECCIÓN: Añadimos el tipo de ícono correcto */}
      <Tabs.Screen name="crear-lista" options={{ title: 'Crear Lista', headerShown: true, tabBarIcon: ({ color }) => <Icon name="playlist-plus" type="material-community" color={color} /> }} />
      <Tabs.Screen name="(mis-pedidos)" options={{ title: 'Mis Pedidos', tabBarIcon: ({ color }) => <Icon name="receipt" type="material-community" color={color} /> }} />
      {/* ✅ CORRECCIÓN: Añadimos el tipo de ícono correcto */}
      <Tabs.Screen name="perfil" options={{ title: 'Perfil', headerShown: true, tabBarIcon: ({ color }) => <Icon name="account" type="material-community" color={color} /> }} />
    </Tabs>
  );
}