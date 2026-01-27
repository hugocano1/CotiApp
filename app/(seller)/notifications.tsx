import React from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { COLORS } from '../../constants/Colors';
import { scaleFont } from '../../src/utils/responsive';
import { useNotificationsList } from '../../src/hooks/useNotificationsList';
import { Icon } from '@rneui/themed';
import { useRouter } from 'expo-router';
import { Notification } from '../../src/types/entities';

export default function SellerNotificationsScreen() {
  const { notifications, loading, error, markAsRead } = useNotificationsList();
  const router = useRouter();

  const handleNotificationPress = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    if (notification.data?.orderId) {
      router.push(`/(seller)/pedidos/order-details/${notification.data.orderId}`);
    }
  };

  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[styles.notificationItem, item.is_read ? styles.read : styles.unread]}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <Text style={styles.notificationBody}>{item.body}</Text>
        <Text style={styles.notificationTime}>{new Date(item.created_at).toLocaleString()}</Text>
      </View>
      {!item.is_read && (
        <Icon name="circle" type="font-awesome" color={COLORS.primary} size={10} containerStyle={styles.unreadIndicator} />
      )}
    </TouchableOpacity>
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
        <Text style={styles.errorText}>Error al cargar notificaciones: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis Notificaciones</Text>
      {notifications.length === 0 ? (
        <Text style={styles.emptyText}>No tienes notificaciones.</Text>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderNotificationItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: scaleFont(24),
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 20,
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
    marginTop: 20,
    fontSize: scaleFont(16),
  },
  listContent: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    marginHorizontal: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  read: {
    opacity: 0.7,
  },
  unread: {
    // No specific style, default is full opacity
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: scaleFont(16),
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 5,
  },
  notificationBody: {
    fontSize: scaleFont(14),
    color: COLORS.gray,
    marginBottom: 5,
  },
  notificationTime: {
    fontSize: scaleFont(12),
    color: COLORS.lightGray,
    textAlign: 'right',
  },
  unreadIndicator: {
    marginLeft: 10,
  },
});