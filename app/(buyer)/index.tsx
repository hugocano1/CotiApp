// Ruta: app/(buyer)/index.tsx
import React, { useLayoutEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import { Button, Icon } from '@rneui/themed';
import { Link, useRouter, useNavigation } from 'expo-router';
import { COLORS } from '../../src/constants/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useShoppingLists } from '../../src/hooks/useShoppingLists';
import { useBuyerOrders } from '../../src/hooks/useBuyerOrders';
import { useUserProfile } from '../../src/hooks/useUserProfile'; // ✅ 1. Importamos el hook de perfil
import { ShoppingListItem } from '../../src/components/ShoppingListItem';
import { OrderListItem } from '../../src/components/OrderListItem';

const SectionHeader = ({ title, onPress }: { title: string, onPress: () => void }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <TouchableOpacity onPress={onPress}>
      <Text style={styles.seeAllText}>Ver todo</Text>
    </TouchableOpacity>
  </View>
);

export default function BuyerHomeScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { profile } = useUserProfile(); // ✅ 2. Obtenemos el perfil del comprador
  const { data: activeLists, loading: listsLoading } = useShoppingLists('active', 3);
  const { orders: allOrders, loading: ordersLoading } = useBuyerOrders();
  const onTheWayOrders = allOrders.filter(order => order.status === 'enviado');

  // Mensaje de bienvenida personalizado
  const welcomeMessage = profile?.nombre ? `Hola, ${profile.nombre}!` : 'Bienvenido a Coti';

  // ✅ 3. Usamos useLayoutEffect para cambiar el título del header dinámicamente
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
            source={require('../../assets/images/banner_compradores.png')}
            style={styles.promoImage} 
          />
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.panelTitle}>Panel de comprador</Text>
          <Text style={styles.subtitle}>Crea tu lista de compras y empieza a recibir las mejores ofertas.</Text>
          
          <Link href="/(buyer)/crear-lista" asChild>
            <Button
              title="Crear nueva lista"
              buttonStyle={styles.mainButton}
              titleStyle={styles.mainButtonTitle}
              icon={<Icon name="playlist-plus" type="material-community" color={COLORS.primary} />}
            />
          </Link>
          
          <SectionHeader title="Mis listas activas" onPress={() => router.push('/(buyer)/(mis-listas)')} />
          {listsLoading ? <ActivityIndicator style={{marginTop: 20}}/> :
            activeLists.length > 0 ? (
              activeLists.map(list => (
                <View key={list.id} style={styles.cardSpacing}>
                  <Link href={{ pathname: `/(buyer)/(mis-listas)/list-details/[id]`, params: {id: list.id} }} asChild>
                    <TouchableOpacity>
                      <ShoppingListItem list={list} />
                    </TouchableOpacity>
                  </Link>
                </View>
              ))
            ) : (
              <Text style={styles.emptySectionText}>No tienes listas activas. ¡Crea una para empezar a ahorrar!</Text>
            )
          }

          <SectionHeader title="Pedidos en camino" onPress={() => router.push('/(buyer)/(mis-pedidos)')} />
          {ordersLoading ? <ActivityIndicator style={{marginTop: 20}}/> :
            onTheWayOrders.length > 0 ? (
              onTheWayOrders.map(order => (
                <View key={order.id} style={styles.cardSpacing}>
                  <Link key={order.id} href={{ pathname: `/(buyer)/(mis-pedidos)/pedido-detalle/[id]`, params: {id: order.id} }} asChild>
                    <TouchableOpacity>
                      <OrderListItem order={order} userRole="buyer" />
                    </TouchableOpacity>
                  </Link>
                </View>
              ))
            ) : (
              <Text style={styles.emptySectionText}>No tienes pedidos en camino.</Text>
            )
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
  emptySectionText: { textAlign: 'center', color: COLORS.gray, margin: 20 },
  cardSpacing: { marginTop: -5 },
});