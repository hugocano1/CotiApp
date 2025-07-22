// app/(seller)/(offers)/offer-details/[id].tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Card } from '@rneui/themed';
import { ShoppingListService } from '../../../../src/services/shoppingList.service';
import { COLORS } from '../../../../src/constants/colors';

export default function OfferDetailsScreen() {
  const { id: offerId } = useLocalSearchParams();
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof offerId === 'string') {
      ShoppingListService.getOfferDetails(offerId)
        .then(setDetails)
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [offerId]);

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  }

  if (!details) {
    return <View style={styles.centered}><Text>No se encontraron los detalles.</Text></View>;
  }

  const buyerName = details.shopping_lists?.buyer?.nombre || 'Comprador';

  return (
    // ✅ Ya no necesitamos SafeAreaView ni el Text del header aquí
    <ScrollView style={styles.container}>
      <Card containerStyle={styles.card}>
        <Card.Title>Resumen de tu Oferta</Card.Title>
        <Card.Divider />
        <Text style={styles.price}>${details.price}</Text>
        <Text style={styles.notes}>Estado: {details.status}</Text>
      </Card>

      <Card containerStyle={styles.card}>
        <Card.Title>Para la Lista de Compras:</Card.Title>
        <Card.Divider />
        <Text style={styles.listTitle}>"{details.shopping_lists?.title}"</Text>
        <Text>De: {buyerName}</Text>
      </Card>

      <Card containerStyle={styles.card}>
        <Card.Title>Artículos Solicitados</Card.Title>
        <Card.Divider />
        {(details.shopping_lists?.items || []).map((item: any, index: number) => (
          <View key={index} style={styles.itemContainer}>
            <Text style={styles.itemName}>- {item.name}</Text>
            <Text style={styles.itemDetails}>Cantidad: {item.quantity || 'N/A'}</Text>
            <Text style={styles.itemDetails}>Detalles: {item.details || 'Ninguno'}</Text>
          </View>
        ))}
      </Card>
    </ScrollView>
  );
}

// Hoja de estilos (sin cambios, pero asegúrate de tenerla)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { borderRadius: 12, marginHorizontal: 15, marginBottom: 15 },
  price: { fontSize: 28, fontWeight: 'bold', color: COLORS.secondary, textAlign: 'center', marginVertical: 10 },
  notes: { fontStyle: 'italic', color: COLORS.gray, textAlign: 'center' },
  listTitle: { fontSize: 18, fontWeight: '500', marginBottom: 5 },
  itemContainer: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  itemName: { fontSize: 16, fontWeight: 'bold' },
  itemDetails: { fontSize: 14, color: COLORS.gray, marginLeft: 15 }
});