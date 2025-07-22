// app/(seller)/(listas)/index.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Icon } from '@rneui/themed';
import { ShoppingListService } from '../../../src/services/shoppingList.service'; // Asegúrate que la ruta sea correcta
import { Link } from 'expo-router';
import { COLORS } from '../../../src/constants/colors'; // Asegúrate que la ruta sea correcta
import { useFocusEffect } from '@react-navigation/native';

// Hook para cargar las listas
function useAvailableLists() {
  const [lists, setLists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLists = useCallback(async () => {
    setLoading(true);
    try {
      const activeLists = await ShoppingListService.getActiveLists();
      setLists(activeLists);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchLists();
    }, [fetchLists])
  );

  return { lists, loading };
}

// Componente de la pantalla
export default function AvailableListsScreen() {
  const { lists, loading } = useAvailableLists();
  
  if (loading) {
    return <ActivityIndicator size="large" style={styles.centered} />;
  }

  // Componente para renderizar cada item de la lista
  const renderItem = ({ item }: { item: any }) => (
    // ✅ 1. Usamos Link para manejar toda la navegación.
    <Link 
      href={{
        pathname: "/(seller)/(listas)/list-details/[id]",
        params: { id: item.id }
      } as any} // Usamos 'as any' para evitar el error de tipado que ya conocemos
      asChild
    >
      {/* ✅ 2. El TouchableOpacity ahora solo se encarga de la parte visual.
             No necesita su propio onPress. */}
      <TouchableOpacity style={styles.itemContainer}>
        <Card containerStyle={styles.card}>
            <Card.Title>{item.title || `Lista de Compras`}</Card.Title>
            <Text>Presupuesto: ${item.min_budget || 0} - ${item.max_budget || 0}</Text>
            <Text>Fecha de Despacho: {item.expires_at ? new Date(item.expires_at).toLocaleDateString() : 'No especificada'}</Text>
        </Card>
      </TouchableOpacity>
    </Link>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={lists}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.emptyText}>No hay listas de compras activas.</Text>}
      />
    </View>
  );
}

// Estilos
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { textAlign: 'center', marginTop: 50 },
  card: { borderRadius: 10, width: '100%', margin: 0 },
  itemContainer: { paddingHorizontal: 15, paddingVertical: 5 },
  itemTitle: { fontSize: 18, fontWeight: 'bold' },
});