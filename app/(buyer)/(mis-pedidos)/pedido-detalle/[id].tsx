// app/(buyer)/(mis-pedidos)/pedido-detalle/[id].tsx
import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { Card, Icon, Badge, Button } from '@rneui/themed';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useOrderDetails } from '../../../../src/hooks/useOrderDetails'; // Asegúrate que la ruta sea correcta
import { OrderService } from '../../../../src/services/order.service'; // Asegúrate que la ruta sea correcta
import { COLORS } from '../../../../src/constants/colors'; // Asegúrate que la ruta sea correcta

export default function BuyerOrderDetailsScreen() {
  const { id: orderId } = useLocalSearchParams();
  const router = useRouter();
  const { order, loading, refreshOrder } = useOrderDetails(orderId as string);

  const handleConfirmDelivery = async () => {
    Alert.alert(
      "Confirmar Entrega",
      "¿Confirmas que has recibido tu pedido correctamente?",
      [
        { text: "Aún no", style: "cancel" },
        { 
          text: "Sí, lo recibí", 
          onPress: async () => {
            try {
              await OrderService.confirmDelivery(orderId as string);
              if(refreshOrder) refreshOrder(); // Recargamos para ver el estado 'completed'
            } catch (error: any) {
              Alert.alert("Error", error.message);
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

  return (
    <ScrollView style={styles.container}>
      <Card containerStyle={styles.card}>
        <Card.Title>Estado del Pedido</Card.Title>
        <Card.Divider />
        <View style={styles.statusContainer}>
          <Badge value={order.status} status={order.status === 'completed' ? 'success' : order.status === 'enviado' ? 'warning' : 'primary'} />
          <Text style={styles.price}>Total: ${order.total_price}</Text>
        </View>
      </Card>

      <Card containerStyle={styles.card}>
        <Card.Title>Información del Vendedor</Card.Title>
        <Card.Divider />
        <Text>{order.seller_profiles?.stores?.name || 'Tienda'}</Text>
        <Text>{order.seller_profiles?.nombre || 'Vendedor'}</Text>
      </Card>

      <Card containerStyle={styles.card}>
        <Card.Title>Gestionar mi Pedido</Card.Title>
        <Card.Divider />
        {order.status === 'enviado' && (
           <Button 
              title="Confirmar Pedido Recibido" 
              onPress={handleConfirmDelivery}
              buttonStyle={{backgroundColor: COLORS.secondary}}
              icon={<Icon name="check-circle" type="material-community" color="white" containerStyle={{marginRight: 10}} />}
           />
        )}
        {order.status === 'completed' && (
           <Button
              title="Calificar a Vendedor"
              onPress={() => router.push({ pathname: '/RatingScreen', params: { orderId: order.id, ratedUserId: order.seller_id }})}
              buttonStyle={{backgroundColor: COLORS.accent}}
              titleStyle={{color: COLORS.primary, fontWeight: 'bold'}}
           />
        )}
         {order.status === 'confirmed' && (
           <Text style={styles.infoText}>El vendedor ha confirmado tu pedido y lo está preparando.</Text>
        )}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, backgroundColor: COLORS.background },
  card: { borderRadius: 12, marginHorizontal: 15, marginBottom: 15 },
  statusContainer: { alignItems: 'center', paddingVertical: 10 },
  price: { fontSize: 22, fontWeight: 'bold', marginVertical: 10 },
  infoText: { textAlign: 'center', color: COLORS.gray, fontStyle: 'italic', padding: 10}
});