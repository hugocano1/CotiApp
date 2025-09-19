// Ruta: app/(buyer)/index.tsx
import React, { useLayoutEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import { Button, Icon } from '@rneui/themed';
import { useRouter, useNavigation } from 'expo-router';
import { COLORS } from '../../src/constants/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useShoppingLists } from '../../src/hooks/useShoppingLists';
import { useBuyerOrders } from '../../src/hooks/useBuyerOrders';
import { useUserProfile } from '../../src/hooks/useUserProfile';
import { ShoppingListItem } from '../../src/components/ShoppingListItem';
import { OrderListItem } from '../../src/components/OrderListItem';
import { scaleFont } from '../../src/utils/responsive';

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
  const { profile } = useUserProfile();
  const { data: activeLists, loading: listsLoading } = useShoppingLists('active');
  const { data: onTheWayOrders, loading: ordersLoading } = useBuyerOrders('enviado');

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
            source={require('../../assets/images/banner_compradores.png')}
            style={styles.promoImage} 
          />
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.panelTitle}>Panel de comprador</Text>
          <Text style={styles.subtitle}>Crea tu lista de compras y empieza a recibir las mejores ofertas.</Text>
          
          <Button
            title="Crear nueva lista"
            onPress={() => router.push('/(buyer)/crear-lista')}
            buttonStyle={styles.mainButton}
            titleStyle={styles.mainButtonTitle}
            icon={<Icon name="playlist-plus" type="material-community" color={COLORS.primary} />}
          />
          
          <SectionHeader title="Mis listas activas" onPress={() => router.push('/(buyer)/(mis-listas)')} />
          {listsLoading ? <ActivityIndicator style={{marginTop: 20}}/> :
            activeLists.length > 0 ? (
              activeLists.slice(0, 3).map(list => (
                <View key={list.id} style={styles.cardSpacing}>
                  <TouchableOpacity onPress={() => router.push({ pathname: `/(buyer)/(mis-listas)/list-details/[id]`, params: {id: list.id} })}>
                    <ShoppingListItem list={list} />
                  </TouchableOpacity>
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
                  <TouchableOpacity onPress={() => router.push({ pathname: `/(buyer)/(mis-pedidos)/pedido-detalle/[id]`, params: {id: order.id} })}>
                    <OrderListItem order={order} userRole="buyer" />
                  </TouchableOpacity>
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
  panelTitle: { fontSize: scaleFont(22), fontWeight: 'bold', color: COLORS.primary, textAlign: 'center' },
  subtitle: { fontSize: scaleFont(14), color: COLORS.gray, marginTop: 4, textAlign: 'center', marginBottom: 15, paddingHorizontal: 10 },
  mainButton: { backgroundColor: COLORS.accent, borderRadius: 12, marginHorizontal: 20, paddingVertical: 15 },
  mainButtonTitle: { color: COLORS.primary, fontWeight: 'bold' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginTop: 20, marginBottom: 10 },
  sectionTitle: { fontSize: scaleFont(18), fontWeight: 'bold', color: COLORS.text },
  seeAllText: { color: COLORS.secondary, fontWeight: '500' },
  emptySectionText: { textAlign: 'center', color: COLORS.gray, margin: 20 },
  cardSpacing: { marginTop: -5 },
});