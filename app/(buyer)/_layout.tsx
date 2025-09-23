// Ruta: app/(buyer)/_layout.tsx
import React from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Icon } from '@rneui/themed';
import { COLORS } from '../../src/constants/colors';
// ✅ CORRECCIÓN: Importaciones movidas al principio del archivo
import { TouchableOpacity, StyleSheet } from 'react-native';

import { useUnreadNotifications } from '../../src/hooks/useUnreadNotifications';

// ✅ CORRECCIÓN: Definición de estilos movida antes de ser usada
const styles = StyleSheet.create({
  createButtonTab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.secondary, // Usamos el color de acción
    borderRadius: 30,
    marginHorizontal: 5,
    marginVertical: 5,
    height: 40,
    elevation: 3,
  },
});

// Componente para el ícono de la campana que se actualiza
const NotificationIcon = () => {
  const router = useRouter();
  const { unreadCount } = useUnreadNotifications();

  return (
    <TouchableOpacity
      onPress={() => router.push('/(buyer)/notifications')}
      style={{ marginRight: 15 }}
    >
      <Icon 
        name={unreadCount > 0 ? 'bell' : 'bell-outline'} 
        type="material-community" 
        color={COLORS.primary} 
      />
    </TouchableOpacity>
  );
};

export default function BuyerTabLayout() {
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        headerShown: false, // Ocultamos todos los headers por defecto
      }}
    >
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'Resumen', 
          headerShown: true, // Mostramos explícitamente el header para esta pantalla
          tabBarIcon: ({ color }) => <Icon name="home" type="material-community" color={color} />, 
          headerRight: () => <NotificationIcon />,
        }} 
      />
      
      {/* ✅ CORRECCIÓN CLAVE: Nos aseguramos de que el header de la pestaña esté oculto */}
      <Tabs.Screen 
        name="(mis-listas)" 
        options={{ 
          title: 'Mis Listas', 
          headerShown: false, 
          unmountOnBlur: true, // This will reset the stack on tab press
          tabBarIcon: ({ color }) => <Icon name="format-list-bulleted" type="material-community" color={color} /> 
        }} 
      />
      
      <Tabs.Screen 
        name="crear-lista" 
        options={{ 
          title: 'Crear Lista', 
          headerShown: true, 
          tabBarIcon: ({ color, focused }) => (
            <Icon 
              name="playlist-plus" 
              type="material-community" 
              color={focused ? COLORS.white : color}
            />
          ),
          tabBarButton: (props) => (
            <TouchableOpacity {...props} style={styles.createButtonTab} />
          ),
          tabBarLabelStyle: { color: COLORS.white, fontWeight: 'bold' },
        }} 
      />

      <Tabs.Screen 
        name="(mis-pedidos)" 
        options={{ 
          title: 'Mis Pedidos', 
          headerShown: false, 
          unmountOnBlur: true, // This will reset the stack on tab press
          tabBarIcon: ({ color }) => <Icon name="receipt" type="material-community" color={color} /> 
        }} 
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('(mis-pedidos)');
          },
        })}
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