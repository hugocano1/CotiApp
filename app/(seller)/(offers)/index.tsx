// Ruta: app/(seller)/(offers)/index.tsx
import React from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { Link } from 'expo-router';
import { COLORS } from '../../../src/constants/colors';
import { useSellerOffers } from '../../../src/hooks/useSellerOffers'; // ✅ Usamos el nuevo hook
import { OfferListItem } from '../../../src/components/OfferListItem'; // ✅ Usamos el nuevo componente

export default function MisOfertasScreen() {
  const { offers, loading, refresh } = useSellerOffers();

  if (loading) {
    return <ActivityIndicator size="large" style={styles.centered} color={COLORS.primary} />;
  }

  return (
    <FlatList
      style={styles.container}
      data={offers}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <Link 
          href={{
            pathname: "/(seller)/(offers)/offer-details/[id]",
            params: { id: item.id }
          }}
          asChild
        >
          <TouchableOpacity>
            <OfferListItem offer={item} />
          </TouchableOpacity>
        </Link>
      )}
      ListHeaderComponent={<Text style={styles.header}>Mis ofertas enviadas</Text>}
      ListEmptyComponent={<Text style={styles.emptyText}>No has enviado ninguna oferta.</Text>}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
      contentContainerStyle={{paddingTop: 10}}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', padding: 20, color: COLORS.primary },
  emptyText: { textAlign: 'center', marginTop: 50, color: COLORS.gray },
});