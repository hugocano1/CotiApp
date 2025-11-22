import React, { useLayoutEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Pressable } from 'react-native';
import { COLORS } from '../../src/constants/colors';
import { scaleFont } from '../../src/utils/responsive';
import { useNotificationsList } from '../../src/hooks/useNotificationsList';
import { Icon, ListItem } from '@rneui/themed';
import { useRouter, useNavigation } from 'expo-router';
import { Notification } from '../../src/types/entities';

export default function BuyerNotificationsScreen() {
  const { notifications, loading, error, markAsRead } = useNotificationsList();
  const router = useRouter();
  const navigation = useNavigation();

  // Hook para configurar opciones de la pantalla modal
  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Pressable onPress={() => router.back()} style={{ marginLeft: 15 }}>
          <Icon name="close" type="material-community" color={COLORS.gray} />
        </Pressable>
      ),
    });
  }, [navigation, router]);

  const handleNotificationPress = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    // Navega a la pantalla de detalle del pedido si existe el orderId
    if (notification.data?.orderId) {
      // Cierra el modal antes de navegar
      router.back(); 
      // Pequeño delay para asegurar que el modal se cierre antes de la navegación
      setTimeout(() => {
        router.push(`/(buyer)/(mis-pedidos)/order-details/${notification.data.orderId}`);
      }, 100);
    }
  };

  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <ListItem
      bottomDivider
      onPress={() => handleNotificationPress(item)}
      containerStyle={!item.is_read ? styles.unreadItem : styles.readItem}
    >
      <Icon 
        name={item.data?.orderId ? 'receipt-text-check-outline' : 'bell-outline'} 
        type="material-community" 
        color={!item.is_read ? COLORS.primary : COLORS.gray}
        size={28}
      />
      <ListItem.Content>
        <ListItem.Title style={styles.notificationTitle} numberOfLines={1}>
          {item.title}
        </ListItem.Title>
        <ListItem.Subtitle style={styles.notificationBody} numberOfLines={2}>
          {item.body}
        </ListItem.Subtitle>
        <Text style={styles.notificationTime}>
          {new Date(item.created_at).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' })}
        </Text>
      </ListItem.Content>
      {!item.is_read && <View style={styles.unreadDot} />}
      {item.data?.orderId && <ListItem.Chevron />}
    </ListItem>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error al cargar notificaciones.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {notifications.length === 0 ? (
        <View style={styles.centered}>
            <Icon name="bell-off-outline" type="material-community" color={COLORS.lightGray} size={60} />
            <Text style={styles.emptyText}>No tienes notificaciones.</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderNotificationItem}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA', // Un fondo ligeramente gris
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.gray,
    marginTop: 20,
    fontSize: scaleFont(16),
  },
  errorText: {
    textAlign: 'center',
    color: COLORS.danger,
    fontSize: scaleFont(16),
  },
  unreadItem: {
    backgroundColor: COLORS.white,
  },
  readItem: {
    backgroundColor: '#F8F9FA', // Mismo color que el fondo para que se integre
  },
  notificationTitle: {
    fontWeight: 'bold',
    fontSize: scaleFont(15),
    color: COLORS.text,
  },
  notificationBody: {
    fontSize: scaleFont(13),
    color: COLORS.gray,
    paddingTop: 4,
  },
  notificationTime: {
    fontSize: scaleFont(11),
    color: COLORS.lightGray,
    marginTop: 8,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.secondary,
    alignSelf: 'center',
    marginRight: 10,
  },
});
