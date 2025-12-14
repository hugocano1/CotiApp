// Ruta: app/(seller)/index.tsx
import React, { useLayoutEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Icon } from '@rneui/themed';
import { Link, useRouter, useNavigation, useFocusEffect } from 'expo-router';
import MapView, { Marker } from 'react-native-maps';
import { COLORS } from '../../src/constants/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSellerOrders } from '../../src/hooks/useSellerOrders';
import { useSellerOffers } from '../../src/hooks/useSellerOffers';
import { useUserProfile } from '../../src/hooks/useUserProfile';
import { OrderListItem } from '../../src/components/OrderListItem';
import { OfferListItem } from '../../src/components/OfferListItem';
import { scaleFont } from '../../src/utils/responsive';
import { ShoppingList } from '../../src/types/entities';
import { supabase } from '../../src/services/auth/config/supabaseClient';

// Define a specific type for the list preview used in the map
type ShoppingListPreview = {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  delivery_type: 'delivery';
  min_budget?: number;
  max_budget?: number;
};

const SectionHeader = ({ title, onPress }: { title: string, onPress: () => void }) => (
    <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <TouchableOpacity onPress={onPress}>
            <Text style={styles.seeAllText}>Ver todo</Text>
        </TouchableOpacity>
    </View>
);

// Hook to fetch active shopping lists with location data
function useActiveShoppingLists() {
    const [lists, setLists] = useState<ShoppingListPreview[]>([]);
    const [loading, setLoading] = useState(true);
  
    const fetchLists = useCallback(async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('shopping_lists')
          .select<string, ShoppingListPreview>(
            `id, title, latitude, longitude, delivery_type, min_budget, max_budget`
          )
          .eq('status', 'active')
          .eq('delivery_type', 'delivery')
          .not('latitude', 'is', null);
  
        if (error) throw error;
        setLists(data || []);
      } catch (error: unknown) {
        console.error("Error fetching active lists:", error instanceof Error ? error.message : error);
      } finally {
        setLoading(false);
      }
    }, []);
  
    useFocusEffect(useCallback(() => { fetchLists(); }, [fetchLists]));
  
    return { lists, loading };
}

const MapPreviewCard = ({ lists, loading, onPress }: { lists: ShoppingListPreview[], loading: boolean, onPress: () => void }) => {
    const initialRegion = useMemo(() => {
        if (lists.length > 0) {
          return {
            latitude: lists[0].latitude,
            longitude: lists[0].longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          };
        }
        return { latitude: -33.45694, longitude: -70.64827, latitudeDelta: 0.5, longitudeDelta: 0.5 };
    }, [lists]);
    
    return (
        <TouchableOpacity onPress={onPress} style={styles.mapCard}>
            <View style={styles.mapCardHeader}>
                <Icon name="map-marker-multiple" type="material-community" color={COLORS.primary} />
                <Text style={styles.mapCardTitle}>Nuevos pedidos cercanos</Text>
            </View>
            <Text style={styles.mapCardSubtitle}>Hay {lists.length} listas con entrega a domicilio disponibles cerca de ti.</Text>
            <View style={styles.mapPreviewContainer}>
                {loading ? (
                    <ActivityIndicator />
                ) : (
                    <MapView style={styles.map} initialRegion={initialRegion} scrollEnabled={false} zoomEnabled={false}>
                        {lists.map(list => <Marker key={list.id} coordinate={{ latitude: list.latitude, longitude: list.longitude }} />)}
                    </MapView>
                )}
            </View>
            <View style={styles.mapCardFooter}>
                <Text style={styles.mapCardFooterText}>Toca para explorar el mapa</Text>
                <Icon name="arrow-right" type="material-community" color={COLORS.secondary} />
            </View>
        </TouchableOpacity>
    );
};


export default function SellerHomeScreen() {
    const router = useRouter();
    const navigation = useNavigation();
    const { profile } = useUserProfile();
    
    const { orders: allOrders, loading: ordersLoading, error: ordersError } = useSellerOrders();
    const pendingOrders = allOrders.filter(order => order.status === 'confirmed');
    
    const { offers: recentOffers, loading: offersLoading } = useSellerOffers(3);
    const { lists: activeLists, loading: listsLoading } = useActiveShoppingLists();

    const welcomeMessage = profile?.nombre ? `Hola, ${profile.nombre}!` : 'Bienvenido a Coti';

    useLayoutEffect(() => {
        navigation.setOptions({
            title: welcomeMessage,
        });
    }, [navigation, welcomeMessage]);

    return (
        <SafeAreaView style={styles.container} edges={['right', 'left', 'bottom']}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.promoImageContainer}>
                    <Image 
                        source={require('../../assets/images/banner_vendedores.png')}
                        style={styles.promoImage} 
                    />
                </View>

                <View style={styles.contentContainer}>
                    <Text style={styles.panelTitle}>Panel de vendedor</Text>
                    <Text style={styles.subtitle}>Aumenta tus ventas descubriendo clientes nuevos.</Text>
                    
                    <MapPreviewCard 
                        lists={activeLists} 
                        loading={listsLoading} 
                        onPress={() => router.push('/(seller)/(listas)')} 
                    />

                    <SectionHeader title="Pedidos por despachar" onPress={() => router.push('/(seller)/(pedidos)')} />
                    {ordersError && <Text style={{ color: 'red', textAlign: 'center', margin: 10 }}>Error al cargar pedidos: {ordersError.message}</Text>}
                    {ordersLoading && allOrders.length === 0 ? (
                        <ActivityIndicator style={{ marginTop: 20 }} /> 
                    ) : pendingOrders.length > 0 ? (
                        pendingOrders.map(order => (
                            <View key={order.id} style={styles.cardSpacing}>
                                <Link href={{ pathname: `/(seller)/(pedidos)/order-details/[id]`, params: {id: order.id} }} asChild>
                                    <TouchableOpacity>
                                        <OrderListItem order={order} userRole="seller" />
                                    </TouchableOpacity>
                                </Link>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.emptyText}>No tienes pedidos por despachar. ¡Busca nuevas listas para aumentar tus ventas!</Text>
                    )}

                    <SectionHeader title="Últimas ofertas enviadas" onPress={() => router.push('/(seller)/(offers)')} />
                    {offersLoading ? <ActivityIndicator /> :
                        recentOffers.length > 0 ? (
                            recentOffers.map(offer => (
                                <View key={offer.id} style={styles.cardSpacing}>
                                    <Link key={offer.id} href={{ pathname: `/(seller)/(offers)/offer-details/[id]`, params: {id: offer.id} }} asChild>
                                        <TouchableOpacity>
                                            <OfferListItem offer={offer} />
                                        </TouchableOpacity>
                                    </Link>
                                </View>
                            ))
                        ) : <Text style={styles.emptyText}>No has enviado ofertas recientemente.</Text>
                    }
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    scrollContent: { paddingBottom: 20 },
    promoImageContainer: { height: 180, backgroundColor: COLORS.primary },
    promoImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    contentContainer: { paddingTop: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20, marginTop: -20, backgroundColor: COLORS.background },
    panelTitle: { fontSize: scaleFont(22), fontWeight: 'bold', color: COLORS.primary, textAlign: 'center' },
    subtitle: { fontSize: scaleFont(14), color: COLORS.gray, marginTop: 4, textAlign: 'center', marginBottom: 15, paddingHorizontal: 10 },
    
    mapCard: {
        marginHorizontal: 20,
        marginBottom: 20,
    },
    mapCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    mapCardTitle: {
        fontSize: scaleFont(16),
        fontWeight: 'bold',
        color: COLORS.primary,
        marginLeft: 8,
    },
    mapCardSubtitle: {
        fontSize: scaleFont(13),
        color: COLORS.gray,
        marginTop: 4,
        marginBottom: 12,
    },
    mapPreviewContainer: {
        height: 250, // Increased height for a larger map view
        // borderRadius: 12, // Removed for no card frame
        overflow: 'hidden',
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: -20, // To span full width visually
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    mapCardFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginTop: 12,
    },
    mapCardFooterText: {
        fontSize: scaleFont(13),
        color: COLORS.secondary,
        fontWeight: '500',
        marginRight: 4,
    },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginTop: 20, marginBottom: 10 },
    sectionTitle: { fontSize: scaleFont(18), fontWeight: 'bold', color: COLORS.text },
    seeAllText: { color: COLORS.secondary, fontWeight: '500' },
    emptyText: { textAlign: 'center', color: COLORS.gray, margin: 20 },
    cardSpacing: { marginTop: -3 },
});