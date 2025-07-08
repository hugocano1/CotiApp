import { View, FlatList, ActivityIndicator, StyleSheet, Alert, RefreshControl } from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import { ListItem, Text, Card, Badge } from '@rneui/themed';
import { supabase } from '../../src/services/auth/config/supabaseClient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

// ✅ 1. Renombramos la interfaz a 'Offer' para más claridad.
interface Offer {
  id: string;
  shopping_list_id: string;
  seller_id: string;
  price: number; // ✅ El nombre de la columna en tu DB es 'price'
  status: string;
  created_at: string;
  shopping_lists?: { // Objeto anidado que traeremos
    title: string;
    geolocation: string; // Asegúrate de que este sea el nombre de la columna en tu tabla 'shopping_lists'
  };
}

export default function OffersScreen() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<any>(); // Hook para la navegación

  const fetchSellerOffers = useCallback(async () => {
    // No ponemos setLoading(true) aquí para que el refresco sea más suave
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuario no autenticado");

      // ✅ 2. Corregimos la consulta para que pida 'delivery_address'
      const { data, error } = await supabase
        .from('offers')
        .select(`
          *,
          shopping_lists:shopping_list_id (
            title,
            geolocation 
          )
        `)
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }
      setOffers(data || []);
    } catch (error: any) {
      console.error('Error fetching offers:', error);
      Alert.alert('Error', `No se pudieron cargar las ofertas: ${error.message}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Usamos useFocusEffect para que la lista se actualice cada vez que se entra a la pantalla
  useFocusEffect(
    useCallback(() => {
      setLoading(true); // El indicador de carga solo se activa la primera vez
      fetchSellerOffers();
    }, [fetchSellerOffers])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchSellerOffers();
  }, [fetchSellerOffers]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2089dc" />
      </View>
    );
  }

  return (
    <FlatList
      data={offers}
      keyExtractor={(item) => item.id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      ListEmptyComponent={
        <View style={styles.loadingContainer}>
          <Text>No has hecho ninguna oferta todavía.</Text>
        </View>
      }
      renderItem={({ item }) => (
        // El componente Card de RNE puede ser "tocable" directamente
        // o puedes usar ListItem con onPress como lo hiciste, lo cual está perfecto.
        <ListItem
          bottomDivider
          containerStyle={styles.listItem}
          onPress={() =>
            navigation.navigate('OfferDetails', {
              offerId: item.id,
              listId: item.shopping_list_id,
            })
          }
        >
          <ListItem.Content>
            {/* ✅ 3. Usamos 'item.price' en lugar de 'item.total_price' */}
            <ListItem.Title style={styles.title}>${item.price}</ListItem.Title>
            <ListItem.Subtitle style={styles.subtitle}>{item.shopping_lists?.title || 'Lista eliminada'}</ListItem.Subtitle>
            <View style={styles.statusContainer}>
              <Badge
                value={item.status}
                status={item.status === 'accepted' ? 'success' : item.status === 'pending' ? 'warning' : 'error'}
              />
              <Text style={styles.address}>{item.shopping_lists?.geolocation}</Text>
            </View>
          </ListItem.Content>
          <ListItem.Chevron />
        </ListItem>
      )}
    />
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listItem: { marginHorizontal: 10, marginVertical: 5, borderRadius: 10, backgroundColor: '#fff', elevation: 2 },
  title: { fontWeight: 'bold', fontSize: 16, marginBottom: 4 },
  subtitle: { color: 'gray', marginBottom: 8 },
  statusContainer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  address: { color: '#666', fontSize: 12, flexShrink: 1 },
});