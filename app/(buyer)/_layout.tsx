// Ruta: app/(buyer)/_layout.tsx
import React from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Icon } from '@rneui/themed';
import { TouchableOpacity, StyleSheet } from 'react-native';

import { COLORS } from '../../constants/Colors';
import { useUnreadNotifications } from '../../src/hooks/useUnreadNotifications';
import { useUnreadMessages } from '../../src/hooks/useUnreadMessages';

// Componente para el ícono de la campana que se actualiza
const NotificationIcon = ({ color }: { color: string }) => {
  const router = useRouter();
  const { unreadCount } = useUnreadNotifications();

  return (
    <TouchableOpacity
      onPress={() => router.push('/(buyer)/notifications')}
      style={{ marginRight: 15 }}
    >
      <Icon 
        name={unreadCount > 0 ? 'bell-badge' : 'bell-outline'} 
        type="material-community" 
        color={color} 
      />
    </TouchableOpacity>
  );
};

export default function BuyerTabLayout() {
  const router = useRouter();
  const { unreadCount } = useUnreadMessages();
  // Los estilos ahora usan el objeto plano COLORS directamente.
  const styles = createStyles(COLORS);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.border,
        },
        headerStyle: {
          backgroundColor: COLORS.secondary, // Mapeado a liziDark
          borderBottomWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTitleStyle: {
          color: COLORS.white,
        },
        headerTintColor: COLORS.white,
        headerShown: false, 
      }}
    >
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'Resumen', 
          headerShown: true,
          tabBarIcon: ({ color }) => <Icon name="home-variant-outline" type="material-community" color={color} />, 
          headerRight: () => <NotificationIcon color={COLORS.white} />,
        }} 
      />
      
      <Tabs.Screen 
        name="(mis-listas)" 
        options={{ 
          title: 'Mis Listas', 
          headerShown: false, 
          unmountOnBlur: true,
          tabBarIcon: ({ color }) => <Icon name="format-list-bulleted" type="material-community" color={color} /> 
        }} 
      />
      
      <Tabs.Screen 
        name="crear-lista" 
        options={{ 
          title: 'Crear Lista', 
          headerShown: true, 
          tabBarIcon: ({ focused }) => (
            <Icon 
              name="plus" 
              type="material-community" 
              color={COLORS.white} // El ícono es siempre blanco sobre el fondo de acento
            />
          ),
          tabBarButton: (props) => (
            <TouchableOpacity {...props} style={styles.createButtonTab} />
          ),
          tabBarLabelStyle: { display: 'none' }, // Opcional: Ocultar el label para dar más espacio
        }} 
      />

      <Tabs.Screen 
        name="chats/index" 
        options={{ 
          title: 'Mensajes', 
          headerShown: true,
          tabBarIcon: ({ color }) => <Icon name="message-outline" type="material-community" color={color} />,
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
        }} 
      />

      <Tabs.Screen 
        name="(mis-pedidos)" 
        options={{ 
          title: 'Mis Pedidos', 
          headerShown: false, 
          unmountOnBlur: true,
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
        name="notifications"
        options={{
          href: null,
          presentation: 'modal',
          headerShown: true,
          headerTitle: 'Notificaciones',
        }}
      />
      <Tabs.Screen 
        name="perfil" 
        options={{ 
          title: 'Perfil', 
          headerShown: true, 
          tabBarIcon: ({ color }) => <Icon name="account-outline" type="material-community" color={color} /> 
        }} 
      />
    </Tabs>
  );
}

const createStyles = (colors: typeof COLORS) => StyleSheet.create({
  createButtonTab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary, // Usar el color primario (liziBrand)
    borderRadius: 30,
    marginHorizontal: 5,
    marginVertical: 5,
    height: 40,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});