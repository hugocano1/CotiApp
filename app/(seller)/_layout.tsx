// Ruta: app/(seller)/_layout.tsx
import React from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Icon } from '@rneui/themed';
import { TouchableOpacity, StyleSheet } from 'react-native';

import { useColorScheme } from '../../components/useColorScheme';
import Colors from '../../constants/Colors';
import { useUnreadNotifications } from '../../src/hooks/useUnreadNotifications';
import { useUnreadMessages } from '../../src/hooks/useUnreadMessages';

type ThemeColors = typeof Colors.light;

// Componente para el ícono de la campana
const NotificationIcon = ({ color }: { color: string }) => {
  const router = useRouter();
  const { unreadCount } = useUnreadNotifications();

  return (
    <TouchableOpacity
      onPress={() => router.push('/(seller)/notifications')}
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

export default function SellerTabLayout() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];
  const { unreadCount } = useUnreadMessages();

  const styles = createStyles(themeColors);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: themeColors.tint,
        tabBarInactiveTintColor: Colors.light.tabIconDefault,
        tabBarStyle: {
          backgroundColor: themeColors.card,
          borderTopColor: themeColors.border,
        },
        // ==================================================
        // Aplicación del Nuevo Sistema de Diseño al Header
        // ==================================================
        headerStyle: {
          backgroundColor: Colors.dark.background, // <- LiziDark
          borderBottomWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTitleStyle: {
          color: Colors.dark.text, // Blanco
          fontWeight: 'bold',
        },
        headerTintColor: Colors.dark.text, // Blanco para botón de atrás y título
        headerShown: false, // Ocultar por defecto, mostrar en cada screen que lo necesite
      }}
    >
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'Resumen', 
          headerShown: true, 
          tabBarIcon: ({ color }) => <Icon name="home-variant-outline" type="material-community" color={color} />,
          headerRight: () => <NotificationIcon color={Colors.dark.text} />,
        }} 
      />
      <Tabs.Screen 
        name="(listas)" 
        options={{ 
          title: 'Listas', 
          headerShown: false,
          tabBarIcon: ({ focused }) => ( <Icon name="view-list-outline" type="material-community" color={focused ? Colors.dark.text : Colors.light.tabIconDefault} /> ), 
          tabBarButton: (props) => ( <TouchableOpacity {...props} style={styles.mainButtonTab} /> ), 
          tabBarLabelStyle: { color: Colors.dark.text, fontWeight: 'bold' }, 
        }} 
      />
      <Tabs.Screen 
        name="(offers)" 
        options={{ 
          title: 'Mis Ofertas', 
          headerShown: false,
          tabBarIcon: ({ color }) => <Icon name="tag-multiple-outline" type="material-community" color={color} /> 
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
        name="(pedidos)" 
        options={{ 
          title: 'Mis Pedidos', 
          headerShown: false,
          tabBarIcon: ({ color }) => <Icon name="receipt" type="material-community" color={color} /> 
        }} 
      />
      <Tabs.Screen
        name="notifications"
        options={{
          href: null,
          headerShown: true,
          headerTitle: 'Notificaciones',
        }}
      />
      <Tabs.Screen 
        name="wallet" 
        options={{ 
          href: null, // Ocultar del menú inferior
          headerShown: false, // El header lo maneja la propia pantalla con Stack.Screen
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

const createStyles = (themeColors: ThemeColors) => StyleSheet.create({
  mainButtonTab: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: themeColors.tint, 
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