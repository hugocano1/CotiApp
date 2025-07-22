// app/(seller)/order-details/[id].tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { Card, Icon, Badge, Button } from '@rneui/themed';
import { useLocalSearchParams } from 'expo-router'; // ✅ Hook de Expo Router para obtener el ID
import { OrderService } from '../../../../src/services/order.service'; // Asegúrate de que la ruta sea correcta
import { COLORS } from '../../../../src/constants/colors'; // Asegúrate de que la ruta sea correcta

export default function SellerOrderDetailsScreen() {
  const { id: orderId } = useLocalSearchParams(); // Obtenemos el ID de la URL
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDetails = useCallback(() => {
    if (typeof orderId === 'string') {
      setLoading(true);
      OrderService.getOrderDetails(orderId)
        .then(setOrder)
        .catch(err => console.error(err))
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
              fetchDetails(); // Recargamos los datos para ver el estado actualizado
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

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Detalles del Pedido</Text>
      
      <Card containerStyle={styles.card}>
        <Card.Title>Estado del Pedido</Card.Title>
        <Card.Divider />
        <View style={styles.statusContainer}>
          <Badge value={order.status} status={order.status === 'confirmed' ? 'success' : order.status === 'enviado' ? 'warning' : 'primary'} />
          <Text style={styles.price}>Total: ${order.total_price}</Text>
        </View>
      </Card>
      
      <Card containerStyle={styles.card}>
        <Card.Title>Información del Comprador</Card.Title>
        <Card.Divider />
        <Text>Nombre: {order.buyer_profiles?.nombre} {order.buyer_profiles?.apellido || ''}</Text>
        {/* Aquí podrías añadir más info del comprador si la pides en el servicio */}
      </Card>
      
      <Card containerStyle={styles.card}>
        <Card.Title>Productos Solicitados</Card.Title>
        <Card.Divider />
        {(order.shopping_lists?.items || []).map((item: any, index: number) => (
          <View key={index} style={styles.itemContainer}>
            <Text style={styles.itemName}>- {item.name}</Text>
            <Text style={styles.itemDetails}>Cantidad: {item.quantity || 'N/A'}</Text>
            <Text style={styles.itemDetails}>Detalles: {item.details || 'Ninguno'}</Text>
          </View>
        ))}
      </Card>

      <Card containerStyle={styles.card}>
        <Card.Title>Gestionar Pedido</Card.Title>
        <Card.Divider />
        {order.status === 'confirmed' && (
           <Button 
              title="Marcar como Enviado" 
              onPress={() => handleUpdateStatus('enviado')} 
              buttonStyle={{backgroundColor: COLORS.secondary}}
              icon={<Icon name="send" type="material-community" color="white" containerStyle={{marginRight: 10}} />}
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
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', padding: 20, color: COLORS.primary },
  card: { borderRadius: 12, marginHorizontal: 15, marginBottom: 15 },
  statusContainer: { alignItems: 'center', paddingVertical: 10 },
  price: { fontSize: 22, fontWeight: 'bold', marginVertical: 10, color: COLORS.text },
  itemContainer: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  itemName: { fontSize: 16, fontWeight: 'bold' },
  itemDetails: { fontSize: 14, color: COLORS.gray, marginLeft: 10 },
  infoText: { textAlign: 'center', color: COLORS.gray, fontStyle: 'italic', padding: 10}
});