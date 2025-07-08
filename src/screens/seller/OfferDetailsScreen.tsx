// src/screens/seller/OfferDetailsScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { ShoppingListService } from '../../services/shoppingList.service'; // Ajusta la ruta si es necesario

// Hook para cargar los detalles
function useOfferDetails(offerId: string) {
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!offerId) {
      setLoading(false);
      return;
    }

    async function loadDetails() {
      try {
        const offerDetails = await ShoppingListService.getOfferDetails(offerId);
        setDetails(offerDetails);
      } catch (error: any) {
        Alert.alert("Error", `No se pudieron cargar los detalles: ${error.message}`);
      } finally {
        setLoading(false);
      }
    }
    loadDetails();
  }, [offerId]);

  return { details, loading };
}


// Componente de la pantalla
export default function OfferDetailsScreen({ route }: { route: any }) {
  const { offerId } = route.params;
  const { details, loading } = useOfferDetails(offerId);

  if (loading) {
    return <ActivityIndicator size="large" style={styles.centered} />;
  }

  if (!details) {
    return (
      <View style={styles.centered}>
        <Text>No se encontraron los detalles de la oferta.</Text>
      </View>
    );
  }

  const buyerName = details.shopping_lists?.buyer?.nombre || 'Comprador';

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Resumen de tu Oferta</Text>
        <Text style={styles.price}>${details.price}</Text>
        <Text style={styles.status}>Estado: {details.status}</Text>
        {details.notes && <Text style={styles.notes}>Notas: {details.notes}</Text>}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Detalles de la Lista de Compras</Text>
        <Text style={styles.listTitle}>"{details.shopping_lists?.title}"</Text>
        <Text>Hecha por: {buyerName}</Text>
        <Text>Fecha de Despacho: {new Date(details.shopping_lists?.expires_at).toLocaleDateString()}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Artículos Solicitados</Text>
        {(details.shopping_lists?.items || []).map((item: any, index: number) => (
          <View key={index} style={styles.item}>
            <Text style={styles.itemName}>{item.name}</Text>
            {/* Más adelante aquí mostraremos cantidad y unidad de medida */}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, padding: 10, backgroundColor: '#f4f4f4' },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
  },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 5 },
  price: { fontSize: 28, fontWeight: 'bold', color: '#2089dc', textAlign: 'center', marginBottom: 5 },
  status: { fontSize: 16, fontStyle: 'italic', color: 'gray', textAlign: 'center', marginBottom: 10 },
  notes: { fontSize: 14, color: '#333' },
  listTitle: { fontSize: 16, fontWeight: '500', marginBottom: 5 },
  item: { paddingVertical: 8 },
  itemName: { fontSize: 16 }
});