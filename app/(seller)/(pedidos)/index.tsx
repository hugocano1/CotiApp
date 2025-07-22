// app/(seller)/(pedidos)/index.tsx

import React from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, RefreshControl, SafeAreaView, TouchableOpacity } from 'react-native';
import { ListItem, Badge } from '@rneui/themed';
import { useSellerOrders } from '../../../src/hooks/useSellerOrders'; // Asegúrate que esta ruta es correcta
import { Link } from 'expo-router'; // ✅ 1. Importamos Link
import { COLORS } from '../../../src/constants/colors'; // Asegúrate que esta ruta es correcta

export default function SellerOrdersScreen() {
    const { orders, loading, refresh } = useSellerOrders();

    if (loading) {
        return <ActivityIndicator size="large" style={styles.centered} />;
    }

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={orders}
                keyExtractor={(item) => item.id}
                ListHeaderComponent={<Text style={styles.header}>Mis Pedidos</Text>}
                ListEmptyComponent={<Text style={styles.emptyText}>No tienes pedidos asignados.</Text>}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
                renderItem={({ item }) => (
                    // ✅ 2. Envolvemos cada ítem en un componente Link
                    <Link
                        href={{
                            pathname: "/(seller)/order-details/[id]",
                            params: { id: item.id }
                        } as any}
                        asChild
                    >
                        <TouchableOpacity>
                            <ListItem
                                bottomDivider
                                containerStyle={styles.listItem}
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
    header: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', padding: 20, color: COLORS.primary },
    emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: COLORS.gray },
    listItem: {
        marginHorizontal: 15,
        marginVertical: 5,
        borderRadius: 12,
        backgroundColor: COLORS.white,
        elevation: 2,
    }
});