import React, { useLayoutEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Pressable } from 'react-native';
import { COLORS } from '../../constants/Colors';
import { scaleFont } from '../../src/utils/responsive';
import { useNotificationsList } from '../../src/hooks/useNotificationsList';
import { Icon, ListItem } from '@rneui/themed';
import { useRouter, useNavigation } from 'expo-router';
import { Notification } from '../../src/types/entities';

export default function BuyerNotificationsScreen() {
  const { notifications, loading, error, markAsRead } = useNotificationsList();
  const router = useRouter();
  const navigation = useNavigation();

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

    const navigate = (path: string) => {
      router.back(); 
      setTimeout(() => {
        router.push(path as any);
      }, 100);
    };

    if (notification.data?.orderId) {
      navigate(`/(buyer)/(mis-pedidos)/order-details/${notification.data.orderId}`);
    } else if (notification.type === 'new_offer' && notification.data?.listId) {
      navigate(`/(buyer)/(mis-listas)/list-details/${notification.data.listId}`);
    }
  };
  
  const getIconName = (item: Notification) => {
    if (item.data?.orderId) return 'receipt-text-check-outline';
    if (item.type === 'new_offer') return 'tag-outline';
    return 'bell-outline';
  };

  const renderNotificationItem = ({ item }: { item: Notification }) => {
    const isNavigable = item.data?.orderId || (item.type === 'new_offer' && item.data?.listId);

    return (
    <ListItem
      bottomDivider
      onPress={() => handleNotificationPress(item)}
      containerStyle={!item.is_read ? styles.unreadItem : styles.readItem}
    >
      <Icon 
        name={getIconName(item)} 
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
      {isNavigable && <ListItem.Chevron />}
    </ListItem>
    )
  };

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
