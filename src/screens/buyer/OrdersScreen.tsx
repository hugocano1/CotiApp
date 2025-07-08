// src/screens/buyer/OrdersScreen.tsx
import React from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, RefreshControl } from 'react-native';
import { ListItem, Badge } from '@rneui/themed';
import { useBuyerOrders } from '../../hooks/useBuyerOrders'; // <-- Importa el nuevo hook

export default function BuyerOrdersScreen({ navigation }: { navigation: any }) {
  const { orders, loading, refresh } = useBuyerOrders();

  if (loading) {
    return <ActivityIndicator size="large" style={styles.centered} />;
  }

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.emptyText}>Aún no tienes pedidos.</Text>}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
        renderItem={({ item }) => (
          <ListItem bottomDivider onPress={() => navigation.navigate('OrderDetails', { orderId: item.id })}>
            <ListItem.Content>
              <ListItem.Title>Pedido a: {item.offers?.sellers?.stores?.name || 'Vendedor'}</ListItem.Title>
              <ListItem.Subtitle>Total: ${item.offers?.price || item.total_price}</ListItem.Subtitle>
              <Badge value={item.status} status={item.status === 'completed' ? 'success' : 'primary'} />
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