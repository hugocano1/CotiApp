// En tu archivo src/screens/seller/AvailableListsScreen.tsx (o similar)
import { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { ShoppingListService } from '../../src/services/shoppingList.service'; // Ajusta la ruta

// Hook para cargar las listas
function useAvailableLists() {
  const [lists, setLists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLists() {
      try {
        const activeLists = await ShoppingListService.getActiveLists();
        setLists(activeLists);
      } catch (error) {
        console.error(error);
        // Aquí podrías mostrar una alerta o un mensaje de error
      } finally {
        setLoading(false);
      }
    }

    loadLists();
  }, []);

  return { lists, loading };
}


// Componente de la pantalla
export default function AvailableListsScreen({ navigation }: { navigation: any }) {
  const { lists, loading } = useAvailableLists();
  
  const handleSelectList = (listId: string) => {
    console.log("Lista seleccionada con ID:", listId);
    // Aquí añadiremos la navegación en el siguiente paso
    navigation.navigate('ListDetails', { listId: listId });
  };

  if (loading) {
    return <ActivityIndicator size="large" style={{ flex: 1 }} />;
  }

  // Componente para renderizar cada item de la lista
  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.itemContainer}
      onPress={() => handleSelectList(item.id)}
    >
      <Text style={styles.itemTitle}>{item.title || `Lista de Compras`}</Text>
      {/* Manejo de datos nulos para que no se vea feo */}
      <Text>Presupuesto: ${item.min_budget || 0} - ${item.max_budget || 0}</Text>
      <Text>Fecha de Despacho: {item.expires_at ? new Date(item.expires_at).toLocaleDateString() : 'No especificada'}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={lists}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={<Text style={styles.header}>Listas Disponibles</Text>}
        ListEmptyComponent={<Text style={styles.emptyText}>No hay listas de compras activas en este momento.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  itemContainer: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#ccc' },
  itemTitle: { fontSize: 18, fontWeight: 'bold' },
  emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16 }
});