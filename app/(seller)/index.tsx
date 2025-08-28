// Ruta: app/(seller)/index.tsx
import React, { useLayoutEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { Button, Icon } from '@rneui/themed';
import { Link, useRouter, useNavigation } from 'expo-router';
import { COLORS } from '../../src/constants/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSellerOrders } from '../../src/hooks/useSellerOrders';
import { useSellerOffers } from '../../src/hooks/useSellerOffers';
import { useUserProfile } from '../../src/hooks/useUserProfile';
import { OrderListItem } from '../../src/components/OrderListItem';
import { OfferListItem } from '../../src/components/OfferListItem';

const SectionHeader = ({ title, onPress }: { title: string, onPress: () => void }) => (
    <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <TouchableOpacity onPress={onPress}>
            <Text style={styles.seeAllText}>Ver todo</Text>
        </TouchableOpacity>
    </View>
);

export default function SellerHomeScreen() {
    const router = useRouter();
    const navigation = useNavigation();
    const { profile } = useUserProfile();
    
    // ✅ CORRECCIÓN: Usamos el filtro correcto. "Por despachar" solo es 'confirmed'.
    const { orders: pendingOrders, loading: ordersLoading } = useSellerOrders(['confirmed']);
    
    const { offers: recentOffers, loading: offersLoading } = useSellerOffers(3);

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
                    <Text style={styles.subtitle}>Gestiona tus pedidos y aumenta tus ventas descubriendo clientes nuevos.</Text>
                    
                    <Link href="/(seller)/(listas)" asChild>
                        <Button
                            title="Descubre listas de compra"
                            buttonStyle={styles.mainButton}
                            titleStyle={styles.mainButtonTitle}
                            icon={<Icon name="magnify" type="material-community" color={COLORS.primary} />}
                        />
                    </Link>

                    <SectionHeader title="Pedidos por Despachar" onPress={() => router.push('/(seller)/(pedidos)')} />
                    {ordersLoading ? (
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
    panelTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.primary, textAlign: 'center' },
    subtitle: { fontSize: 14, color: COLORS.gray, marginTop: 4, textAlign: 'center', marginBottom: 15, paddingHorizontal: 10 },
    mainButton: { backgroundColor: COLORS.accent, borderRadius: 12, marginHorizontal: 20, paddingVertical: 15 },
    mainButtonTitle: { color: COLORS.primary, fontWeight: 'bold' },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginTop: 20, marginBottom: 10 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },
    seeAllText: { color: COLORS.secondary, fontWeight: '500' },
    emptyText: { textAlign: 'center', color: COLORS.gray, margin: 20 },
    cardSpacing: { marginTop: -3 },
});