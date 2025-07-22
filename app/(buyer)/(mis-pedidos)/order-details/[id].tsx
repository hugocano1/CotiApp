// app/(buyer)/list-offers/[id].tsx
import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Card, Button } from '@rneui/themed';
import { useListOffers } from '../../../../src/hooks/useListOffers'; // Crearemos este hook
import { ShoppingListService } from '../../../../src/services/shoppingList.service';
import { COLORS } from '../../../../src/constants/colors';

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
            router.replace('/(buyer)/mis-pedidos'); // Llevamos al usuario a sus pedidos
          } catch (error: any) {
            Alert.alert("Error", error.message);
          }
        }}
      ]
    );
  };

  if (loading) {
    return <ActivityIndicator size="large" style={styles.centered} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={offers}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={<Text style={styles.header}>Ofertas Recibidas</Text>}
        ListEmptyComponent={<Text style={styles.emptyText}>Aún no has recibido ofertas.</Text>}
        renderItem={({ item }) => (
          <Card containerStyle={styles.card}>
            <Card.Title>Oferta de: {item.sellers?.stores?.name || 'Vendedor'}</Card.Title>
            <Card.Divider />
            <Text style={styles.price}>${item.price}</Text>
            <Text style={styles.notes}>{item.notes || 'Sin notas.'}</Text>
            <Button 
              title="Aceptar Oferta" 
              onPress={() => handleAcceptOffer(item.id)}
              buttonStyle={{backgroundColor: COLORS.secondary, marginTop: 15}}
            />
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', padding: 20 },
  emptyText: { textAlign: 'center', marginTop: 50 },
  card: { borderRadius: 8 },
  price: { fontSize: 24, fontWeight: 'bold', color: COLORS.primary, textAlign: 'center' },
  notes: { fontStyle: 'italic', color: COLORS.gray, textAlign: 'center', marginTop: 5 }
});