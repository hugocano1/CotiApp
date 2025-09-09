// app/(seller)/(pedidos)/order-details/[id].tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { Card, Icon, Button } from '@rneui/themed';
import { useLocalSearchParams } from 'expo-router';
import { OrderService } from '../../../../src/services/order.service';
import { COLORS } from '../../../../src/constants/colors';
import { InfoRow } from '../../../../src/components/InfoRow';
import { scaleFont } from '../../../../src/utils/responsive';

const formatCurrency = (value: number) => {
    return `$${Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
};

const StatusDisplay = ({ status }: { status: string }) => {
    const statusMap = {
        confirmed: { text: 'Por Despachar', color: COLORS.accent, icon: 'package-variant' }, 
        enviado: { text: 'En Camino', color: COLORS.primary, icon: 'truck-delivery' },
        completed: { text: 'Completado', color: COLORS.secondary, icon: 'check-circle' },
        default: { text: status, color: COLORS.gray, icon: 'help-circle' },
    };
    const currentStatus = statusMap[status as keyof typeof statusMap] || statusMap.default;

    return (
        <View style={[styles.statusDisplay, { backgroundColor: currentStatus.color }]}>
            <Icon name={currentStatus.icon} type="material-community" color={COLORS.white} size={18} />
            <Text style={styles.statusDisplayText}>{currentStatus.text}</Text>
        </View>
    );
};

const CardTitle = ({ title, iconName }: { title: string, iconName?: string }) => (
    <View style={styles.cardTitleContainer}>
        {iconName && <Icon name={iconName} type="material-community" color={COLORS.primary} size={20} containerStyle={{ marginRight: 8 }} />}
        <Text style={styles.cardTitle}>{title}</Text>
    </View>
);

export default function SellerOrderDetailsScreen() {
  const { id: orderId } = useLocalSearchParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
      "Confirmar Acción",
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
        {listInfo?.delivery_type === 'delivery' && deliveryAddress && (
            <InfoRow icon="map-marker" label="Dirección" value={deliveryAddress} />
        )}
      </Card>
      
      <Card containerStyle={styles.card}>
        <CardTitle title="Productos del Pedido" iconName="basket" />
        <Card.Divider />
        {(listInfo?.items || []).map((item: any, index: number) => (
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
        <CardTitle title="¿El pedido está listo para despachar?" />
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
        {order.status === 'completed' && (
           <Text style={styles.infoText}>¡Este pedido ha sido completado!</Text>
        )}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingVertical: 10 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { borderRadius: 16, marginHorizontal: 15, marginBottom: 10, paddingBottom: 15 },
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: scaleFont(20), fontWeight: 'bold', color: COLORS.primary, flex: 1 },
  statusDisplay: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 20 },
  statusDisplayText: { color: COLORS.white, fontSize: scaleFont(12), fontWeight: 'bold', marginLeft: 6 },
  cardTitleContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  cardTitle: { fontSize: scaleFont(18), fontWeight: 'bold', color: COLORS.primary },
  itemContainer: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemName: { fontSize: scaleFont(16), fontWeight: '500', color: COLORS.text, flex: 1 },
  itemQuantity: { fontSize: scaleFont(16), fontWeight: 'bold', color: COLORS.primary },
  itemDetails: { fontSize: scaleFont(14), color: COLORS.gray, marginTop: 5 },
  infoText: { textAlign: 'center', color: COLORS.gray, fontStyle: 'italic', padding: 10}
});