// src/screens/common/ListDetailsScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, Button } from 'react-native';
import { ShoppingListService } from '../../services/shoppingList.service'; // Ajusta la ruta si es necesario

// Hook para cargar los detalles de la lista
function useListDetails(listId: string) {
  const [listDetails, setListDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!listId) {
      setLoading(false);
      setError("No se proporcionó un ID de lista.");
      return;
    }

    async function loadDetails() {
      try {
        const details = await ShoppingListService.getListDetails(listId);
        setListDetails(details);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadDetails();
  }, [listId]); // El efecto se ejecuta si el listId cambia

  return { listDetails, loading, error };
}


// Componente de la pantalla
export default function ListDetailsScreen({ route, navigation }: { route: any, navigation: any }) {
  const { listId } = route.params;
  const { listDetails, loading, error } = useListDetails(listId);

  const handleMakeOffer = () => {
    // Esta línea navegará a la nueva pantalla
    console.log("Estado del navegador actual:", JSON.stringify(navigation.getState(), null, 2));
    navigation.navigate('CreateOffer', { listId: listId });
  };

  if (loading) {
    return <ActivityIndicator size="large" style={styles.centered} />;
  }

  if (error || !listDetails) {
    return (
      <View style={styles.centered}>
        <Text>Error al cargar los detalles de la lista.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{listDetails.title || 'Detalles de la Lista'}</Text>
      <View style={styles.infoContainer}>
        <Text>Presupuesto: ${listDetails.min_budget || 0} - ${listDetails.max_budget || 0}</Text>
        <Text>Fecha de Despacho: {new Date(listDetails.expires_at).toLocaleDateString()}</Text>
      </View>

      <Text style={styles.subtitle}>Artículos de la Lista:</Text>
      <FlatList
        data={listDetails.items || []} // Asumimos que los items están en una propiedad 'items'
        keyExtractor={(item, index) => `${item.name}-${index}`}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text>Cantidad: {item.quantity}</Text>
            <Text>Detalles: {item.details}</Text>
          </View>
        )}
        ListEmptyComponent={<Text>Esta lista no tiene artículos.</Text>}
      />
      {/* Aquí irá el botón para "Hacer una Oferta" en el siguiente paso */}
      <Button
        title="Hacer una Oferta"
        onPress={handleMakeOffer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, padding: 20 },
  infoContainer: { marginVertical: 15, padding: 10, backgroundColor: '#f0f0f0', borderRadius: 8 },
  title: { fontSize: 24, fontWeight: 'bold' },
  subtitle: { fontSize: 20, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
  item: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
  itemName: { fontSize: 16, fontWeight: '500' }
});