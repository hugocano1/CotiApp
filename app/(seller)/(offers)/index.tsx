// app/(seller)/mis-ofertas.tsx
import React, { useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { Card, Badge } from '@rneui/themed';
import { useAuth } from '../../../src/hooks/useAuth'; // Asegúrate que la ruta sea correcta
import { supabase } from '../../../src/services/auth/config/supabaseClient'; // Asegúrate que la ruta sea correcta
import { Link } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../../../src/constants/colors'; // Asegúrate que la ruta sea correcta

// Hook personalizado para obtener las ofertas del vendedor
const useSellerOffers = () => {
  const { session } = useAuth();
  const [offers, setOffers] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchOffers = useCallback(async () => {
    if (!session?.user) {
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('offers')
        .select(`
          *,
          shopping_lists ( title )
        `)
        .eq('seller_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOffers(data || []);
    } catch (error) {
      console.error("Error fetching seller offers:", error);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useFocusEffect(
    useCallback(() => {
      fetchOffers();
    }, [fetchOffers])
  );

  return { offers, loading, refresh: fetchOffers };
};


export default function MisOfertasScreen() {
  const { offers, loading, refresh } = useSellerOffers();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    refresh().then(() => setRefreshing(false));
  }, [refresh]);

  if (loading && !refreshing) {
    return <ActivityIndicator size="large" style={styles.centered} color={COLORS.primary} />;
  }

  return (
    <FlatList
      style={styles.container}
      data={offers}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <Link 
          href={{
            pathname: "/(seller)/offer-details/[id]",
            params: { id: item.id }
          }}
          asChild
        >
          <TouchableOpacity>
            <Card containerStyle={styles.card}>
              <Text style={styles.cardTitle}>{item.shopping_lists?.title || 'Lista de Compras'}</Text>
              <Text style={styles.price}>${item.price}</Text>
              <View style={styles.statusContainer}>
                <Badge 
                  value={item.status} 
                  status={
                    item.status === 'accepted' ? 'success' :
                    item.status === 'pending' ? 'warning' : 'error'
                  } 
                />
              </View>
            </Card>
          </TouchableOpacity>
        </Link>
      )}
      ListHeaderComponent={<Text style={styles.header}>Mis Ofertas Enviadas</Text>}
      ListEmptyComponent={<Text style={styles.emptyText}>No has enviado ninguna oferta.</Text>}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', padding: 20, color: COLORS.primary },
  emptyText: { textAlign: 'center', marginTop: 50, color: COLORS.gray },
  card: {
    borderRadius: 12,
    marginHorizontal: 15,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginTop: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
});