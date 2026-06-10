// app/(buyer)/(mis-pedidos)/order-details/[id].tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Card, Icon, Button } from '@rneui/themed';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { OrderService } from '../../../../src/services/order.service';
import { COLORS } from '../../../../constants/Colors';
import { InfoRow } from '../../../../src/components/InfoRow';
import { scaleFont } from '../../../../src/utils/responsive';
import { Order } from '../../../../src/types/entities';
import { formatCurrency } from '../../../../src/utils/formatters';
import { StatusDisplay } from '../../../../src/components/OrderComponents';
import { CancelOrderModal } from '../../../../src/components/CancelOrderModal';
import { ConfirmReceiptModal } from '../../../../src/components/ConfirmReceiptModal';
import { RatingModal } from '../../../../src/components/RatingModal';

export default function BuyerOrderDetailsScreen() {
  const { id: orderId } = useLocalSearchParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCancelModalVisible, setCancelModalVisible] = useState(false);
  const [isConfirmReceiptVisible, setConfirmReceiptVisible] = useState(false);
  const [isRatingModalVisible, setRatingModalVisible] = useState(false);

  const fetchDetails = useCallback(() => {
    if (typeof orderId === 'string') {
      setLoading(true);
      OrderService.getOrderDetails(orderId)
        .then(setOrder)
        .catch(err => {
            console.error(err);
            Alert.alert("Error", "No se pudieron cargar los detalles del pedido.");
        })
        .finally(() => setLoading(false));
    }
  }, [orderId]);
  
  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const handleCancelOrder = async (reason: string) => {
    if (typeof orderId !== 'string') return;
    try {
      await OrderService.cancelOrder(orderId, reason);
      setCancelModalVisible(false);
      fetchDetails();
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const handleConfirmReceipt = async () => {
    if (typeof orderId !== 'string') return;
    try {
      await OrderService.confirmReceipt(orderId);
      setConfirmReceiptVisible(false);
      fetchDetails();
    } catch (error: any) {
      Alert.alert("Error", error.message);
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

  // Validación de chat más permisiva para asegurar visibilidad durante la vida del pedido
  const showChat = order.status !== 'cancelled';

  return (
    <ScrollView style={styles.container}>
      <Card containerStyle={styles.card}>
        <View style={styles.headerContainer}>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>Pedido de: {listInfo?.title}</Text>
              <StatusDisplay status={order.status} />
            </View>
            {showChat && (
              <TouchableOpacity 
                style={styles.chatButton} 
                onPress={() => router.push({ pathname: "/chat/[orderId]", params: { orderId: order.id } })}
              >
                <Icon name="message-text" type="material-community" color={COLORS.primary} size={28} />
                <Text style={styles.chatButtonText}>Chat</Text>
              </TouchableOpacity>
            )}
        </View>
        <Card.Divider style={{ marginVertical: 15 }}/>
        
        <InfoRow icon="store" label="Vendedor" value={order.seller_profiles?.nombre || 'Tienda'} />
        <InfoRow icon="cash" label="Valor Total" value={formatCurrency(order.total_price)} />
        <InfoRow icon="calendar-clock" label="Fecha de Despacho" value={deliveryDate} />
        <InfoRow icon="truck" label="Método de Entrega" value={deliveryType} />
        {listInfo?.delivery_type === 'pickup' && order.pickup_code && (
            <InfoRow icon="key-variant" label="Código de Recogida" value={order.pickup_code} />
        )}
      </Card>

      <View style={styles.buttonSection}>
        {order.status === 'confirmed' && (
           <Button title="Cancelar Pedido" type="outline" buttonStyle={{borderColor: COLORS.danger}} titleStyle={{color: COLORS.danger}} onPress={() => setCancelModalVisible(true)} />
        )}
        
        {(order.status === 'in_transit' || order.status === 'ready_for_pickup') && (
           <Button title="Confirmar Recepción ✅" buttonStyle={{backgroundColor: COLORS.success}} onPress={() => setConfirmReceiptVisible(true)} />
        )}

        {order.status === 'completed' && !order.rating_for_seller && (
           <Button title="Calificar Vendedor" buttonStyle={{backgroundColor: COLORS.secondary}} onPress={() => setRatingModalVisible(true)} />
        )}
      </View>

      <CancelOrderModal 
        isVisible={isCancelModalVisible}
        onClose={() => setCancelModalVisible(false)}
        onConfirm={handleCancelOrder}
      />

      <ConfirmReceiptModal 
        isVisible={isConfirmReceiptVisible}
        onClose={() => setConfirmReceiptVisible(false)}
        onConfirm={handleConfirmReceipt}
        items={order.items}
      />

      <RatingModal 
        isVisible={isRatingModalVisible}
        onClose={(submitted) => {
            setRatingModalVisible(false);
            if (submitted) fetchDetails();
        }}
        orderId={order.id}
        ratedUserId={order.seller_id}
        userType="buyer"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { borderRadius: 12, marginHorizontal: 15, marginBottom: 15 },
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: scaleFont(18), fontWeight: 'bold', color: COLORS.primary, marginBottom: 5 },
  buttonSection: { paddingHorizontal: 20, marginTop: 10 },
  chatButton: { alignItems: 'center', justifyContent: 'center', padding: 10, backgroundColor: '#F0F9F8', borderRadius: 12, borderWidth: 1, borderColor: COLORS.primary },
  chatButtonText: { fontSize: scaleFont(12), fontWeight: 'bold', color: COLORS.primary, marginTop: 2 }
});
