// Ruta: app/(seller)/_layout.tsx
import React from 'react';
import { Tabs } from 'expo-router';
import { Icon } from '@rneui/themed';
import { COLORS } from '../../src/constants/colors';
import { TouchableOpacity, StyleSheet } from 'react-native';

export default function SellerTabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        headerShown: false,
      }}
    >
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'Resumen', 
          // ✅ CORRECCIÓN: Mostramos el header aquí
          headerShown: true, 
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: COLORS.white,
          tabBarIcon: ({ color }) => <Icon name="home" type="material-community" color={color} /> 
        }} 
      />
      {/* ... El resto de tus Tabs.Screen se mantienen igual ... */}
      <Tabs.Screen name="(listas)" options={{ title: 'Listas', tabBarIcon: ({ color, focused }) => ( <Icon name="view-list" type="material-community" color={focused ? COLORS.white : color} /> ), tabBarButton: (props) => ( <TouchableOpacity {...props} style={styles.mainButtonTab} /> ), tabBarLabelStyle: { color: COLORS.white, fontWeight: 'bold' }, }} />
      <Tabs.Screen name="(offers)" options={{ title: 'Mis Ofertas', tabBarIcon: ({ color }) => <Icon name="tag" type="material-community" color={color} /> }} />
      <Tabs.Screen name="(pedidos)" options={{ title: 'Mis Pedidos', tabBarIcon: ({ color }) => <Icon name="receipt" type="material-community" color={color} /> }} />
      <Tabs.Screen name="perfil" options={{ title: 'Perfil', headerShown: true, headerStyle: { backgroundColor: COLORS.primary }, headerTintColor: COLORS.white, tabBarIcon: ({ color }) => <Icon name="account" type="material-community" color={color} /> }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  mainButtonTab: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.secondary, borderRadius: 30, marginHorizontal: 5, marginVertical: 5, height: 40, elevation: 3 },
});