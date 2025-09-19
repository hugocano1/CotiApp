// Ruta: app/(buyer)/(mis-pedidos)/index.tsx
import React, { useState } from 'react';
import { FlatList, StyleSheet, RefreshControl, SafeAreaView, TouchableOpacity, View, Text, ActivityIndicator } from 'react-native';
import { useBuyerOrders } from '../../../src/hooks/useBuyerOrders';
import { Link } from 'expo-router';
import { COLORS } from '../../../src/constants/colors';
import { OrderListItem } from '../../../src/components/OrderListItem';
import { ButtonGroup } from '@rneui/themed';
import { scaleFont } from '../../../src/utils/responsive';

export default function BuyerOrdersScreen() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const statusFilter = selectedIndex === 0 ? 'active' : 'history';
  const { data: orders, loading, refresh } = useBuyerOrders(statusFilter as 'active' | 'history');

  if (loading) {
    return <ActivityIndicator size="large" style={styles.centered} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ButtonGroup
        buttons={['Activos', 'Historial']}
        selectedIndex={selectedIndex}
        onPress={(value) => setSelectedIndex(value)}
        containerStyle={styles.buttonGroupContainer}
        selectedButtonStyle={{ backgroundColor: COLORS.primary }}
        textStyle={{ fontSize: scaleFont(14) }}
      />
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
            <View style={styles.centered}>
                <Text style={styles.emptyText}>Aún no tienes pedidos en esta categoría.</Text>
            </View>
        }
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
        renderItem={({ item }) => (
          <Link 
            href={{ 
              pathname: `/(buyer)/(mis-pedidos)/pedido-detalle/[id]`, 
              params: { id: item.id } 
            }} 
            asChild
          >
            <TouchableOpacity>
              <OrderListItem order={item} userRole="buyer" />
            </TouchableOpacity>
          </Link>
        )}
        contentContainerStyle={{ paddingTop: 10 }}
      />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { textAlign: 'center', marginTop: 50, fontSize: scaleFont(16), color: COLORS.gray },
  buttonGroupContainer: {
    marginHorizontal: 'auto',
    width: '80%',
    height: 40,
    marginVertical: 10,
    borderRadius: 8,
  },
});