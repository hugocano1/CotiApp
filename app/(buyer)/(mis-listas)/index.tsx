// Ruta: app/(buyer)/(mis-listas)/index.tsx
import React, { useState } from 'react';
import { FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, View, Text, ScrollView } from 'react-native';
import { useShoppingLists } from '../../../src/hooks/useShoppingLists';
import { Link } from 'expo-router';
import { COLORS } from '../../../constants/Colors';
import { ShoppingListItem } from '../../../src/components/ShoppingListItem';
import { ButtonGroup, Icon } from '@rneui/themed';
import { scaleFont } from '../../../src/utils/responsive';
import { Offer } from '../../../src/types/entities';
import { formatCurrency } from '../../../src/utils/formatters';

const cardColors = [COLORS.secondary, COLORS.accent, '#e76f51', '#f4a261', '#2a9d8f'];

const OfferSummaryCard = ({ offer, index }: { offer: Partial<Offer>, index: number }) => {
    const storeName = offer.seller_profiles?.stores?.name || 'Vendedor';

    return (
        <Link 
            href={{ 
                pathname: `/(buyer)/(mis-pedidos)/order-details/[id]`,
                params: { id: offer.shopping_list_id }
            } as any}
            asChild
        >
            <TouchableOpacity style={styles.offerCard}>
                <View style={styles.offerCardContent}>
                    <Icon name="store" type="material-community" color={COLORS.white} size={16} />
                    <Text style={styles.offerStore} numberOfLines={1}>{storeName}</Text>
                </View>
                <Text style={styles.offerPrice}>{formatCurrency(offer.price)}</Text>
            </TouchableOpacity>
        </Link>
    );
};

export default function MisListasScreen() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const statusFilter = selectedIndex === 0 ? 'active' : 'completed';
  const { data: lists, loading, refresh } = useShoppingLists(statusFilter);

  if (loading) {
    return <ActivityIndicator size="large" style={styles.centered} />;
  }
  
  return (
    <View style={styles.container}>
      <ButtonGroup
        buttons={['Activas', 'Historial']}
        selectedIndex={selectedIndex}
        onPress={(value) => setSelectedIndex(value)}
        containerStyle={styles.buttonGroupContainer}
        selectedButtonStyle={{ backgroundColor: COLORS.primary }}
        textStyle={{ fontSize: scaleFont(14) }}
      />

      <FlatList
        data={lists}
        keyExtractor={(item) => item.id}
        onRefresh={refresh}
        refreshing={loading}
        ListEmptyComponent={
            <View style={styles.centered}>
                <Text style={styles.emptyText}>No tienes listas en esta categoría.</Text>
            </View>
        }
        renderItem={({ item }) => (
            <View style={styles.listItemContainer}>
                <Link 
                    href={{ 
                        pathname: "/(buyer)/(mis-listas)/list-details/[id]",
                        params: { id: item.id }
                    }} 
                    asChild
                >
                    <TouchableOpacity>
                        <ShoppingListItem list={item} />
                    </TouchableOpacity>
                </Link>

                {item.offers && item.offers.length > 0 && (
                    <ScrollView 
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.offersRow}
                    >
                        {item.offers.map((offer, index) => (
                            <OfferSummaryCard key={offer.id} offer={offer} index={index} />
                        ))}
                    </ScrollView>
                )}
            </View>
        )}
        contentContainerStyle={{ paddingBottom: 20, paddingTop: 10 }}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 50 },
  buttonGroupContainer: {
    marginHorizontal: 'auto',
    width: '80%',
    height: 40,
    marginVertical: 10,
    borderRadius: 8,
  },
  emptyText: { textAlign: 'center', fontSize: scaleFont(16), color: COLORS.gray },
  listItemContainer: {
    marginBottom: 20,
  },
  offersRow: {
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  offerCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginRight: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minWidth: 130,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  offerCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  offerStore: {
    fontSize: scaleFont(12),
    fontWeight: '600',
    color: COLORS.white,
    marginLeft: 5,
    flexShrink: 1,
  },
  offerPrice: {
    fontSize: scaleFont(14),
    fontWeight: 'bold',
    color: COLORS.white,
  },
});