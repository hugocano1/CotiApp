// app/(seller)/_layout.tsx
import React from 'react';
import { Tabs } from 'expo-router';
import { Icon } from '@rneui/themed';
import { COLORS } from '../../src/constants/colors';

export default function SellerTabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        headerShown: false, // Ocultamos el header aquí, cada sección lo gestionará
      }}
    >
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'Resumen', 
          headerShown: true, // Mostramos el header para esta pantalla simple
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: COLORS.white,
          tabBarIcon: ({ color }) => <Icon name="home" type="material-community" color={color} /> 
        }} 
      />
      <Tabs.Screen 
        name="(listas)" 
        options={{ 
          title: 'Listas', 
          tabBarIcon: ({ color }) => <Icon name="view-list" type="material-community" color={color} /> 
        }} 
      />
      <Tabs.Screen 
        name="(offers)" 
        options={{ 
          title: 'Mis Ofertas', 
          tabBarIcon: ({ color }) => <Icon name="tag" type="material-community" color={color} /> 
        }} 
      />
      <Tabs.Screen 
        name="(pedidos)" 
        options={{ 
          title: 'Mis Pedidos', 
          tabBarIcon: ({ color }) => <Icon name="receipt" type="material-community" color={color} /> 
        }} 
      />
      <Tabs.Screen 
        name="perfil" 
        options={{ 
          title: 'Perfil', 
          headerShown: true,
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: COLORS.white,
          tabBarIcon: ({ color }) => <Icon name="account" type="material-community" color={color} /> 
        }} 
      />
    </Tabs>
  );
}