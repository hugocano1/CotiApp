// app/(buyer)/(mis-pedidos)/order-details/[id].tsx
import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Card, Button, Icon } from '@rneui/themed';
import { useListOffers } from '../../../../src/hooks/useListOffers';
import { ShoppingListService } from '../../../../src/services/shoppingList.service';
import { COLORS } from '../../../../src/constants/colors';
import { scaleFont } from '../../../../src/utils/responsive';

// This component renders the new, detailed view for an offer
const DetailedOfferView = ({ offer }: { offer: any }) => (
  <View>
    <FlatList
      data={offer.offer_items}
      keyExtractor={(offerItem) => offerItem.id}
      renderItem={({ item }) => (
        <View style={styles.itemRow}>
          <View style={styles.itemDetailsContainer}>
            <Text style={styles.itemName}>{item.quantity}x {item.item_name}</Text>
            {(item.brand || item.unit) && (
                <Text style={styles.itemSubDetails}>
                    {item.brand ? `Marca: ${item.brand}` : ''}
                    {(item.brand && item.unit) ? ' · ' : ''}
                    {item.unit ? `Unidad: ${item.unit}` : ''}
                </Text>
            )}
          </View>
          <Text style={styles.itemPrice}>${(item.unit_price * item.quantity).toFixed(2)}</Text>
        </View>
      )}
    />
    <Card.Divider style={{ marginTop: 15 }}/>
    <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total de la Oferta:</Text>
        <Text style={styles.totalPrice}>${offer.price.toFixed(2)}</Text>
    </View>
  </View>
);

// This component renders the old, simple view for legacy offers
const SimpleOfferView = ({ offer }: { offer: any }) => (
    <View style={styles.simpleOfferContainer}>
        <Text style={styles.simplePrice}>${offer.price.toFixed(2)}</Text>
    </View>
);

export default function ListOffersScreen() {
  const { id: listId } = useLocalSearchParams();
  const router = useRouter();
  const { offers, loading } = useListOffers(listId as string);

  const handleAcceptOffer = async (offerId: string) => {
    Alert.alert(
      "Aceptar Oferta",
      "¿Estás seguro de que quieres aceptar esta oferta? Las demás serán rechazadas y la lista se cerrará.",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Sí, Aceptar", onPress: async () => {
          try {
            await ShoppingListService.acceptOffer(offerId, listId as string);
            Alert.alert("¡Éxito!", "Has aceptado la oferta y se ha creado un nuevo pedido.");
            router.replace({ pathname: '/(buyer)/(mis-pedidos)' });
          } catch (error: any) {
            Alert.alert("Error", error.message);
          }
        }}
      ]
    );
  };

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={offers}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={<Text style={styles.header}>Ofertas Recibidas</Text>}
        ListEmptyComponent={<View style={styles.centered}><Text style={styles.emptyText}>Aún no has recibido ofertas.</Text></View>}
        renderItem={({ item }) => (
          <Card containerStyle={styles.card}>
            <Card.Title>{item.sellers?.stores?.name || 'Vendedor Desconocido'}</Card.Title>
            <Card.Divider />

            {/* Conditional Rendering: Check if offer_items exist */}
            {item.offer_items && item.offer_items.length > 0 ? (
              <DetailedOfferView offer={item} />
            ) : (
              <SimpleOfferView offer={item} />
            )}

            <Text style={styles.notes}>{item.notes || 'Sin notas adicionales.'}</Text>
            
            <Button 
              title="Aceptar Oferta"
              onPress={() => handleAcceptOffer(item.id)}
              buttonStyle={styles.acceptButton}
              icon={<Icon name="check-circle-outline" type="material-community" color="white"/>}
            />
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { fontSize: scaleFont(24), fontWeight: 'bold', textAlign: 'center', paddingVertical: 20, color: COLORS.primary },
  emptyText: { textAlign: 'center', color: COLORS.gray },
  card: { borderRadius: 12, marginBottom: 15 },
  notes: { fontStyle: 'italic', color: COLORS.gray, textAlign: 'center', marginTop: 10, fontSize: scaleFont(12) },
  acceptButton: { backgroundColor: COLORS.secondary, marginTop: 15, borderRadius: 8 },
  // Styles for Detailed View
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayLight,
  },
  itemDetailsContainer: { flex: 1, paddingRight: 5 },
  itemName: {
    fontSize: scaleFont(15),
    fontWeight: '500',
    color: COLORS.text,
  },
  itemSubDetails: {
      fontSize: scaleFont(12),
      color: COLORS.gray,
      marginTop: 3,
  },
  itemPrice: {
    fontSize: scaleFont(15),
    fontWeight: 'bold',
    color: COLORS.text,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingHorizontal: 5,
  },
  totalLabel: {
    fontSize: scaleFont(18),
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  totalPrice: {
    fontSize: scaleFont(18),
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  // Styles for Simple (Legacy) View
  simpleOfferContainer: {
      paddingVertical: 20,
  },
  simplePrice: {
      fontSize: scaleFont(28),
      fontWeight: 'bold',
      textAlign: 'center',
      color: COLORS.primary,
  }
});