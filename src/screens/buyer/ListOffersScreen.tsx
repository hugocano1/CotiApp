// src/screens/buyer/ListOffersScreen.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, Button, Alert } from 'react-native';
import { Card, Badge } from '@rneui/themed';
import { ShoppingListService } from '../../services/shoppingList.service'; // Ajusta la ruta

// Hook para cargar las ofertas de una lista
function useListOffers(listId: string) {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!listId) {
      setLoading(false);
      return;
    }

    async function loadOffers() {
      try {
        const listOffers = await ShoppingListService.getOffersForList(listId);
        setOffers(listOffers);
      } catch (error: any) {
        Alert.alert("Error", `No se pudieron cargar las ofertas: ${error.message}`);
      } finally {
        setLoading(false);
      }
    }
    loadOffers();
  }, [listId]);

  return { offers, loading };
}

// Componente de la pantalla
export default function ListOffersScreen({ route, navigation }: { route: any, navigation: any }) {
  const { listId } = route.params;
  const { offers, loading } = useListOffers(listId);

  const handleAcceptOffer = async (offerId: string) => {
    try {
      // Llamamos a nuestro nuevo servicio
      await ShoppingListService.acceptOffer(offerId, listId);

      Alert.alert("¡Oferta Aceptada!", "Se ha creado un nuevo pedido. Puedes verlo en tu sección de 'Mis Pedidos'.");

      // Regresamos a la pantalla anterior (la lista de "Mis Listas")
      navigation.goBack();

    } catch (error: any) {
      Alert.alert("Error", `No se pudo aceptar la oferta: ${error.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={offers}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={<Text style={styles.header}>Ofertas Recibidas</Text>}
        ListEmptyComponent={<Text style={styles.emptyText}>Aún no has recibido ofertas para esta lista.</Text>}
        renderItem={({ item }) => (
          <Card containerStyle={styles.card}>
            <Card.Title>Oferta de: {item.sellers?.stores?.name || 'Vendedor'}</Card.Title>
            <Card.Divider />
            <Text style={styles.price}>${item.price}</Text>
            <Text style={styles.notes}>{item.notes || 'Sin notas adicionales.'}</Text>
            <Badge value={item.status} status="primary" containerStyle={{ marginTop: 10 }} />
            <Button 
              title="Aceptar Oferta" 
              onPress={() => handleAcceptOffer(item.id)} 
              containerStyle={{ marginTop: 15 }}
            />
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, backgroundColor: '#f4f4f4' },
  header: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', padding: 20 },
  emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: 'gray' },
  card: { borderRadius: 8 },
  price: { fontSize: 24, fontWeight: 'bold', color: '#2089dc', textAlign: 'center', marginVertical: 10 },
  notes: { fontStyle: 'italic', color: '#666', textAlign: 'center' }
});