// Ruta: app/(seller)/(pedidos)/index.tsx
import React, { useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, RefreshControl, SafeAreaView, TouchableOpacity } from 'react-native';
import { useSellerOrders } from '../../../src/hooks/useSellerOrders';
import { Link } from 'expo-router';
import { COLORS } from '../../../src/constants/colors';
import { OrderListItem } from '../../../src/components/OrderListItem';
import { ButtonGroup } from '@rneui/themed';

const FILTERS = {
  'En Curso': ['confirmed', 'enviado'],
  'Completados': ['completed'],
};
const TABS = Object.keys(FILTERS);

export default function SellerOrdersScreen() {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const statusFilter = FILTERS[TABS[selectedIndex] as keyof typeof FILTERS];
    const { orders, loading, refresh } = useSellerOrders(statusFilter);

    return (
        <SafeAreaView style={styles.container}>
            {/* Añadimos el componente de pestañas (tabs) */}
            <ButtonGroup
                buttons={TABS}
                selectedIndex={selectedIndex}
                onPress={(value) => setSelectedIndex(value)}
                containerStyle={styles.buttonGroupContainer}
                selectedButtonStyle={{ backgroundColor: COLORS.primary }}
            />

            {loading && orders.length === 0 ? (
                <ActivityIndicator size="large" style={styles.centered} />
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={(item) => item.id}
                    ListEmptyComponent={
                        <View style={styles.centered}>
                            <Text style={styles.emptyText}>No tienes pedidos en esta categoría.</Text>
                        </View>
                    }
                    refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
                    renderItem={({ item }) => (
                        <Link
                            href={{
                                pathname: "/(seller)/(pedidos)/order-details/[id]",
                                params: { id: item.id }
                            }}
                            asChild
                        >
                            <TouchableOpacity>
                                <OrderListItem order={item} userRole="seller" />
                            </TouchableOpacity>
                        </Link>
                    )}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16 },
    buttonGroupContainer: {
        marginHorizontal: 15,
        marginTop: 10, // Damos un poco de espacio arriba
        borderRadius: 8,
    },
});