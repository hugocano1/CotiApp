// Ruta: app/(buyer)/(mis-pedidos)/pedido-detalle/[id].tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { Card, Icon, Button } from '@rneui/themed';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useOrderDetails } from '../../../../src/hooks/useOrderDetails';
import { OrderService } from '../../../../src/services/order.service';
import { COLORS } from '../../../../src/constants/colors';
import { scaleFont } from '../../../../src/utils/responsive';
import { InfoRow } from '../../../../src/components/InfoRow';
import { StatusDisplay, CardTitle } from '../../../../src/components/OrderComponents';
import { formatCurrency } from '../../../../src/utils/formatters';
import { ShoppingListItem } from '../../../../src/types/entities';
import { RatingModal } from '../../../../src/components/RatingModal';
import { ConfirmReceiptModal } from '../../../../src/components/ConfirmReceiptModal';
import { CancelOrderModal } from '../../../../src/components/CancelOrderModal';

export default function BuyerOrderDetailsScreen() {
  const { id: orderId } = useLocalSearchParams();
  const router = useRouter();
  const { order, loading, refreshOrder } = useOrderDetails(orderId as string);
  const [isRatingModalVisible, setRatingModalVisible] = useState(false);
  const [isConfirmModalVisible, setConfirmModalVisible] = useState(false);
  const [isCancelModalVisible, setCancelModalVisible] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const handleCloseRatingModal = (submitted: boolean) => {
    setRatingModalVisible(false);
    if (submitted && refreshOrder) {
      refreshOrder();
    }
  };

  const handleConfirmDelivery = async () => { 
    try { 
      await OrderService.confirmDelivery(orderId as string); 
      if(refreshOrder) refreshOrder(); 
    } catch (error: any) { 
      Alert.alert("Error", error.message); 
    } finally {
      setConfirmModalVisible(false);
    }
  };

  const handleCancelOrder = async (reason: string) => {
    setIsCancelling(true);
    try {
      await OrderService.cancelOrder(orderId as string, reason);
      Alert.alert("Éxito", "El pedido ha sido cancelado correctamente.");
      router.replace({ pathname: '/(buyer)/(mis-pedidos)' });
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setIsCancelling(false);
      setCancelModalVisible(false);
    }
  };

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  }
  if (!order) {
    return <View style={styles.centered}><Text>No se encontraron los detalles del pedido.</Text></View>;
  }

  const listInfo = order.shopping_lists;
  const deliveryDate = listInfo?.delivery_date
    ? new Date(listInfo.delivery_date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'No especificada';
  const deliveryType = listInfo?.delivery_type === 'delivery' ? 'Domicilio' : 'Recogida en tienda';
  const deliveryAddress = listInfo?.delivery_address_text;

  return (
    <ScrollView style={styles.container}>
      <Card containerStyle={styles.card}>
        <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>Pedido a: {order.seller_profiles?.stores?.name || 'Vendedor'}</Text>
            <StatusDisplay status={order.status} />
        </View>
        <Card.Divider style={{ marginVertical: 15 }}/>
        <InfoRow icon="cash" label="Valor Total" value={formatCurrency(order.total_price)} />
        <InfoRow icon="calendar-clock" label="Fecha de Entrega" value={deliveryDate} />
        <InfoRow icon="truck" label="Método de Entrega" value={deliveryType} />
        {/* ✅ MOSTRAR CÓDIGO DE RECOGIDA */}
        {listInfo?.delivery_type === 'pickup' && order.pickup_code && (
            <InfoRow icon="key-variant" label="Código de Recogida" value={order.pickup_code} />
        )}
        {listInfo?.delivery_type === 'delivery' && deliveryAddress && (
            <InfoRow icon="map-marker" label="Dirección" value={deliveryAddress} />
        )}
      </Card>
      
      <Card containerStyle={styles.card}>
        <CardTitle title="Productos del Pedido" iconName="basket" />
        <Card.Divider />
        {(listInfo?.items || []).map((item: ShoppingListItem, index: number) => (
          <View key={index} style={styles.itemContainer}>
            <View style={styles.itemRow}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemQuantity}>{item.quantity} {item.unit || ''}</Text>
            </View>
            {item.brand && <Text style={styles.itemDetails}>Marca: {item.brand}</Text>}
            {item.notes && <Text style={styles.itemDetails}>Notas: {item.notes}</Text>}
          </View>
        ))}
      </Card>

      <Card containerStyle={styles.card}>
        <CardTitle title="Gestionar mi Pedido" />
        <Card.Divider />
        {order.status === 'enviado' && (
           <Button title="Confirmar Pedido Recibido" onPress={() => setConfirmModalVisible(true)} buttonStyle={{backgroundColor: COLORS.secondary}} icon={<Icon name="check-circle" type="material-community" color="white" containerStyle={{marginRight: 10}} />} />
        )}
        {order.status === 'completed' && !order.rating_for_seller && (
           <Button title="Calificar a Vendedor" onPress={() => setRatingModalVisible(true)} buttonStyle={{backgroundColor: COLORS.accent}} titleStyle={{color: COLORS.primary, fontWeight: 'bold'}} />
        )}
        {order.status === 'completed' && order.rating_for_seller && (
           <Text style={styles.infoText}>Ya has calificado a este vendedor. ¡Gracias!</Text>
        )}
         {order.status === 'confirmed' && (
           <Button title="Cancelar Pedido" onPress={() => setCancelModalVisible(true)} buttonStyle={{backgroundColor: COLORS.danger}} icon={<Icon name="cancel" type="material-community" color="white" containerStyle={{marginRight: 10}} />} />
        )}
      </Card>

      <RatingModal 
        isVisible={isRatingModalVisible}
        onClose={handleCloseRatingModal}
        orderId={order.id}
        ratedUserId={order.seller_id}
        userType="buyer"
      />

      <ConfirmReceiptModal 
        isVisible={isConfirmModalVisible}
        onClose={() => setConfirmModalVisible(false)}
        onConfirm={handleConfirmDelivery}
        items={listInfo?.items || []}
      />

      <CancelOrderModal
        isVisible={isCancelModalVisible}
        onClose={() => setCancelModalVisible(false)}
        onConfirm={handleCancelOrder}
        isLoading={isCancelling}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingVertical: 8 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { borderRadius: 12, marginHorizontal: 12, marginBottom: 8, paddingBottom: 10 },
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  headerTitle: { fontSize: scaleFont(16), fontWeight: 'bold', color: COLORS.primary, flex: 1 },
  itemContainer: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemName: { fontSize: scaleFont(14), fontWeight: '500', color: COLORS.text, flex: 1 },
  itemQuantity: { fontSize: scaleFont(14), fontWeight: 'bold', color: COLORS.primary },
  itemDetails: { fontSize: scaleFont(12), color: COLORS.gray, marginTop: 4 },
  infoText: { textAlign: 'center', color: COLORS.gray, fontStyle: 'italic', padding: 10},
  modalView: { backgroundColor: COLORS.primary, borderRadius: 20, padding: 35, alignItems: 'center', width: '90%' },
  headerModal: { fontSize: scaleFont(22), fontWeight: 'bold', color: COLORS.white, marginBottom: 10, textAlign: 'center' },
  starsContainer: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginVertical: 20 },
});
