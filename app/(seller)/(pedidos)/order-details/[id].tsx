// app/(seller)/(pedidos)/order-details/[id].tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Alert, Image } from 'react-native';
import { Card, Icon, Button } from '@rneui/themed';
import { useLocalSearchParams } from 'expo-router';
import { OrderService } from '../../../../src/services/order.service';
import { COLORS } from '../../../../src/constants/colors';
import { InfoRow } from '../../../../src/components/InfoRow';
import { scaleFont } from '../../../../src/utils/responsive';
import { Order, OfferItem } from '../../../../src/types/entities';
import { formatCurrency } from '../../../../src/utils/formatters';
import { StatusDisplay, CardTitle } from '../../../../src/components/OrderComponents';
import { RatingModal } from '../../../../src/components/RatingModal';

// Helper para parsear el item_name
const parseItemName = (itemName: string) => {
  const imgParts = itemName.split('__IMG__');
  const nameAndIdParts = imgParts[0].split('__ID__');
  return {
    displayName: nameAndIdParts[0],
    imageUrl: imgParts.length > 1 ? imgParts[1] : null,
  };
};


export default function SellerOrderDetailsScreen() {
  const { id: orderId } = useLocalSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
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

  const handleUpdateStatus = async (newStatus: string) => {
    if (typeof orderId !== 'string') return;
    Alert.alert(
      "Confirmar acción",
      `¿Estás seguro de que quieres cambiar el estado a "${newStatus}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Confirmar", 
          onPress: async () => {
            try {
              setLoading(true);
              await OrderService.updateOrderStatus(orderId, newStatus);
              fetchDetails();
            } catch (error: any) {
              Alert.alert("Error", error.message);
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleCloseRatingModal = (submitted: boolean) => {
    setRatingModalVisible(false);
    if (submitted) {
      fetchDetails();
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
            <Text style={styles.headerTitle}>Pedido de: {order.buyer_profiles?.nombre || 'Comprador'}</Text>
            <StatusDisplay status={order.status} />
        </View>
        <Card.Divider style={{ marginVertical: 15 }}/>
        <InfoRow icon="cash" label="Valor Total" value={formatCurrency(order.total_price)} />
        <InfoRow icon="calendar-clock" label="Fecha de Despacho" value={deliveryDate} />
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
        {(order?.items || []).map((item: OfferItem, index: number) => {
          const { displayName, imageUrl } = parseItemName(item.item_name);
          const totalItemPrice = item.quantity * item.unit_price;

          return (
            <View key={item.id || index} style={styles.itemContainer}>
                <View style={styles.itemRow}>
                    {imageUrl && <Image source={{ uri: imageUrl }} style={styles.itemImage} />}
                    <View style={styles.itemTextContainer}>
                      <Text style={styles.itemName}>{displayName}</Text>
                      <Text style={styles.itemDetails}>
                        {item.quantity} {item.unit || ''} x {formatCurrency(item.unit_price)}
                      </Text>
                    </View>
                    <Text style={styles.itemPrice}>{formatCurrency(totalItemPrice)}</Text>
                </View>
            </View>
          );
        })}
      </Card>

      <Card containerStyle={styles.card}>
        <CardTitle title="Gestionar Pedido" />
        <Card.Divider />
        {order.status === 'confirmed' && (
           <Button 
              title="Enviando a destino"
              onPress={() => handleUpdateStatus('enviado')} 
              buttonStyle={{backgroundColor: COLORS.accent}}
              titleStyle={{color: COLORS.primary, fontWeight: 'bold'}}
              icon={<Icon name="send" type="material-community" color={COLORS.primary} containerStyle={{marginRight: 10}} />}
           />
        )}
        {order.status === 'enviado' && (
           <Text style={styles.infoText}>Pedido en camino. Esperando confirmación del comprador.</Text>
        )}
        {order.status === 'completed' && !order.rating_for_buyer && (
           <Button title="Calificar a Comprador" onPress={() => setRatingModalVisible(true)} buttonStyle={{backgroundColor: COLORS.accent}} titleStyle={{color: COLORS.primary, fontWeight: 'bold'}} />
        )}
        {order.status === 'completed' && order.rating_for_buyer && (
           <Text style={styles.infoText}>Ya has calificado a este comprador. ¡Gracias!</Text>
        )}
      </Card>

      <RatingModal 
        isVisible={isRatingModalVisible}
        onClose={handleCloseRatingModal}
        orderId={order.id}
        ratedUserId={order.buyer_id}
        userType="seller"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingVertical: 8 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { borderRadius: 12, marginHorizontal: 12, marginBottom: 8, paddingBottom: 10 },
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  headerTitle: { fontSize: scaleFont(18), fontWeight: 'bold', color: COLORS.primary, flex: 1 },
  itemContainer: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  itemRow: { flexDirection: 'row', alignItems: 'center' },
  itemImage: { width: 40, height: 40, borderRadius: 6, marginRight: 10, backgroundColor: '#eee' },
  itemTextContainer: { flex: 1 },
  itemName: { fontSize: scaleFont(14), fontWeight: '500', color: COLORS.text, flex: 1, marginBottom: 3 },
  itemPrice: { fontSize: scaleFont(14), fontWeight: 'bold', color: COLORS.primary },
  itemQuantity: { fontSize: scaleFont(14), fontWeight: 'bold', color: COLORS.primary },
  itemDetails: { fontSize: scaleFont(12), color: COLORS.gray, marginTop: 4 },
  infoText: { textAlign: 'center', color: COLORS.gray, fontStyle: 'italic', padding: 10}
});
