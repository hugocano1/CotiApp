// Ruta: app/(seller)/(listas)/index.tsx
import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { ButtonGroup, Icon } from '@rneui/themed';
import { Link, useRouter, useFocusEffect } from 'expo-router';
import MapView, { Marker } from 'react-native-maps';
import { supabase } from '../../../src/services/auth/config/supabaseClient';
import { COLORS } from '../../../constants/Colors';
import { SellerListItem } from '../../../src/components/SellerListItem';
import { scaleFont } from '../../../src/utils/responsive';
import { formatCurrency } from '../../../src/utils/formatters';
import { ShoppingList } from '../../../src/types/entities';

const { height } = Dimensions.get('window');

function useAvailableLists(statusFilter: 'active' | 'closed') {
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLists = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('shopping_lists')
        .select<string, ShoppingList>(
          `
          *,
          buyer_profiles (
            nombre,
            apellido,
            foto_perfil
          )
        `
        )
        .eq('status', statusFilter)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLists(data || []);
    } catch (error: unknown) {
      console.error(error instanceof Error ? error.message : error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useFocusEffect(useCallback(() => { fetchLists(); }, [fetchLists]));

  return { lists, loading, refresh: fetchLists };
}

export default function AvailableListsScreen() {
  const router = useRouter();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const statusFilter = selectedIndex === 0 ? 'active' : 'closed';
  const { lists, loading, refresh } = useAvailableLists(statusFilter);

  const listsWithLocation = useMemo(() => 
    lists.filter(list => list.latitude && list.longitude && list.delivery_type === 'delivery'),
    [lists]
  );
  
  const initialRegion = useMemo(() => {
    if (listsWithLocation.length > 0) {
      return {
        latitude: listsWithLocation[0].latitude!,
        longitude: listsWithLocation[0].longitude!,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
    }
    // Fallback region if no lists have location (e.g., center of a default city)
    return {
      latitude: -33.45694,
      longitude: -70.64827,
      latitudeDelta: 0.5,
      longitudeDelta: 0.5,
    };
  }, [listsWithLocation]);

  const handleMarkerPress = (listId: string) => {
    router.push(`/(seller)/(listas)/list-details/${listId}`);
  };

  return (
    <View style={styles.container}>
      {statusFilter === 'active' && (
        <View style={styles.mapContainer}>
          {loading ? (
            <ActivityIndicator size="large" style={styles.centered} />
          ) : (
            <MapView style={styles.map} initialRegion={initialRegion}>
              {listsWithLocation.map(list => (
                <Marker
                  key={list.id}
                  coordinate={{ latitude: list.latitude!, longitude: list.longitude! }}
                  onPress={() => handleMarkerPress(list.id)}
                >
                    <View style={styles.markerContainer}>
                        {list.min_budget && (
                            <View style={styles.markerBadge}>
                                <Text style={styles.markerText}>
                                    {formatCurrency(list.min_budget)}
                                </Text>
                            </View>
                        )}
                        <Icon name="map-marker" type="material-community" color={COLORS.danger} size={36} />
                    </View>
                </Marker>
              ))}
            </MapView>
          )}
        </View>
      )}

      <View style={statusFilter === 'active' ? styles.listContainer : styles.fullListContainer}>
        <ButtonGroup
          buttons={['Activas', 'Cerradas']}
          selectedIndex={selectedIndex}
          onPress={(value) => setSelectedIndex(value)}
          containerStyle={styles.buttonGroupContainer}
          selectedButtonStyle={{ backgroundColor: COLORS.primary }}
        />
        {loading && lists.length === 0 ? (
          <ActivityIndicator size="large" style={styles.centered} />
        ) : (
          <FlatList
            data={lists}
            keyExtractor={(item) => item.id}
            onRefresh={refresh}
            refreshing={loading}
            ListEmptyComponent={
                <View style={styles.emptyView}>
                    <Text style={styles.emptyText}>No hay listas en esta categoría.</Text>
                </View>
            }
            renderItem={({ item }) => (
              <Link 
                href={{
                  pathname: "/(seller)/(listas)/list-details/[id]",
                  params: { id: item.id }
                }}
                asChild
              >
                <TouchableOpacity>
                  <SellerListItem list={item} />
                </TouchableOpacity>
              </Link>
            )}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  mapContainer: {
    height: height * 0.4,
    backgroundColor: '#f0f0f0',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  listContainer: {
    height: height * 0.6,
  },
  fullListContainer: {
    flex: 1,
  },
  buttonGroupContainer: {
    marginHorizontal: 15,
    marginVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  emptyView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: scaleFont(16),
    color: COLORS.gray,
  },
  markerContainer: { alignItems: 'center', justifyContent: 'center' },
  markerBadge: {
    backgroundColor: 'white',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.danger,
    marginBottom: 2,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  markerText: { fontSize: scaleFont(10), fontWeight: 'bold', color: COLORS.text },
});