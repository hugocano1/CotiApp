// app/(buyer)/(mis-pedidos)/index.tsx
import React from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, RefreshControl, SafeAreaView, TouchableOpacity } from 'react-native';
import { ListItem, Badge } from '@rneui/themed';
import { useBuyerOrders } from '../../../src/hooks/useBuyerOrders';
import { Link } from 'expo-router';
import { COLORS } from '../../../src/constants/colors';

export default function BuyerOrdersScreen() {
  const { orders, loading, refresh } = useBuyerOrders();
  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.emptyText}>Aún no tienes pedidos.</Text>}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
        renderItem={({ item }) => (
          <Link href={{ pathname: `/(buyer)/(mis-pedidos)/pedido-detalle/${item.id}`, }} asChild>
            <TouchableOpacity>
              <ListItem bottomDivider containerStyle={styles.listItem}>
                <ListItem.Content>
                  <ListItem.Title>Pedido a: {item.seller_profiles?.stores?.name || 'Vendedor'}</ListItem.Title>
                  <ListItem.Subtitle>Total: ${item.total_price}</ListItem.Subtitle>
                  <Badge value={item.status} status={item.status === 'completed' ? 'success' : 'primary'} />
                </ListItem.Content>
                <ListItem.Chevron />
              </ListItem>
            </TouchableOpacity>
          </Link>
        )}
      />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16 },
  listItem: { marginHorizontal: 10, marginVertical: 5, borderRadius: 10, backgroundColor: '#fff', elevation: 2 }
});