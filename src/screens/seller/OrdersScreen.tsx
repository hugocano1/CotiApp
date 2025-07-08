// src/screens/seller/OrdersScreen.tsx
import React from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, RefreshControl } from 'react-native';
import { ListItem, Badge } from '@rneui/themed';
import { useSellerOrders } from '../../hooks/useSellerOrders'; // <-- Importa el nuevo hook

export default function SellerOrdersScreen({ navigation }: { navigation: any }) {
  const { orders, loading, refresh } = useSellerOrders();

  if (loading) {
    return <ActivityIndicator size="large" style={styles.centered} />;
  }

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.emptyText}>No tienes pedidos asignados.</Text>}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
        renderItem={({ item }) => (
          <ListItem 
            bottomDivider 
            onPress={() => navigation.navigate('OrderDetails', { orderId: item.id })}
          >
            <ListItem.Content>
              <ListItem.Title>{item.shopping_lists?.title || 'Título no disponible'}</ListItem.Title>
              <ListItem.Subtitle>
                Total: ${item.total_price} - Fecha: {item.shopping_lists?.expires_at ? new Date(item.shopping_lists.expires_at).toLocaleDateString() : 'N/A'}
              </ListItem.Subtitle>
              <Badge value={item.status} status={item.status === 'confirmed' ? 'success' : 'primary'} />
            </ListItem.Content>
            <ListItem.Chevron />
          </ListItem>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16 }
});