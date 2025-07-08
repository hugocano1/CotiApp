// src/screens/common/OrderDetailsScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { Card, Icon, Badge, Button } from '@rneui/themed';
import { OrderService } from '../../src/services/order.service';
import { COLORS } from '../../src/constants/colors';
import { useAuth } from '../../src/hooks/useAuth';

export default function OrderDetailsScreen({ route, navigation }: { route: any, navigation: any }) {
  const { orderId } = route.params;
  const { session } = useAuth();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDetails = () => {
    if (orderId) {
      setLoading(true);
      OrderService.getOrderDetails(orderId)
        .then(setOrder)
        .catch(err => console.error("Error en el servicio al obtener detalles:", err))
        .finally(() => setLoading(false));
    }
  };
  
  useEffect(() => {
    fetchDetails();
  }, [orderId]);

  const handleUpdateStatus = async (newStatus: string) => {
    Alert.alert("Confirmar Acción", `¿Estás seguro de que quieres cambiar el estado a "${newStatus}"?`, [
      { text: "Cancelar", style: "cancel" },
      { text: "Confirmar", onPress: async () => {
        try {
          setLoading(true);
          await OrderService.updateOrderStatus(orderId, newStatus);
          fetchDetails();
        } catch (error: any) { Alert.alert("Error", error.message); setLoading(false); }
      }}
    ]);
  };
  
  const handleConfirmDelivery = async (orderIdToConfirm: string) => {
    Alert.alert("Confirmar Entrega", "¿Confirmas que has recibido tu pedido correctamente?", [
      { text: "Aún no", style: "cancel" },
      { text: "Sí, lo recibí", onPress: async () => {
        try {
          setLoading(true);
          await OrderService.confirmDelivery(orderIdToConfirm);
          fetchDetails();
        } catch (error: any) { Alert.alert("Error", error.message); setLoading(false); }
      }}
    ]);
  };

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  }

  if (!order) {
    return <View style={styles.centered}><Text>No se encontraron los detalles del pedido.</Text></View>;
  }
  
  const isSellerOfThisOrder = session?.user?.id === order.seller_id;
  const isBuyerOfThisOrder = session?.user?.id === order.buyer_id;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Resumen del Pedido</Text>
      <Text style={styles.orderId}>ID: {order.id.substring(0, 8)}</Text>
      
      <Card containerStyle={styles.card}>
        <Card.Title>Estado del Pedido</Card.Title>
        <Card.Divider />
        <View style={{alignItems: 'center'}}>
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
        <Card.Title>Productos Solicitados</Card.Title>
        <Card.Divider />
        {(order.shopping_lists?.items || []).map((item: any, index: number) => (
          <View key={index} style={styles.itemContainer}>
            <Text style={styles.itemName}>- {item.name}</Text>
            <Text style={styles.itemDetails}>Cantidad: {item.quantity || 'No especificada'}</Text>
            <Text style={styles.itemDetails}>Detalles: {item.details || 'Ninguno'}</Text>
          </View>
        ))}
      </Card>

      {isSellerOfThisOrder && (
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
        </Card>
      )}

      {isBuyerOfThisOrder && (
        <Card containerStyle={styles.card}>
          <Card.Title>Mi Pedido</Card.Title>
          <Card.Divider />
          {order.status === 'enviado' && (
             <Button 
                title="Confirmar Pedido Recibido" 
                onPress={() => handleConfirmDelivery(order.id)}
                buttonStyle={{backgroundColor: COLORS.secondary}}
                icon={<Icon name="check-circle" type="material-community" color="white" containerStyle={{marginRight: 10}} />}
             />
          )}
          {order.status === 'completed' && (
             <Text style={styles.infoText}>¡Este pedido ha sido completado!</Text>
          )}
        </Card>
      )}

      {order.status === 'completed' && (
        <Card containerStyle={styles.card}>
        <Card.Title>Transacción Finalizada</Card.Title>
        <Card.Divider />
          <Text style={styles.infoText}>Este pedido ha sido completado. ¡Califica tu experiencia para ayudar a la comunidad!</Text>
          <Button
          title={`Calificar a ${isBuyerOfThisOrder ? 'Vendedor' : 'Comprador'}`}
          onPress={() => { 
          // Obtenemos el ID del usuario a calificar
            const ratedUserId = isBuyerOfThisOrder ? order.seller_id : order.buyer_id;
            navigation.navigate('Rating', { orderId: order.id, ratedUserId: ratedUserId });
          }}
          buttonStyle={{backgroundColor: COLORS.accent, marginTop: 10}}
          titleStyle={{color: COLORS.primary, fontWeight: 'bold'}}
          icon={<Icon name="star" type="material-community" color={COLORS.primary} containerStyle={{marginRight: 10}} />}
          />
        </Card>
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', padding: 20, color: COLORS.primary },
  orderId: { fontSize: 12, color: COLORS.gray, textAlign: 'center', marginBottom: 10 },
  card: { borderRadius: 10 },
  price: { fontSize: 20, fontWeight: 'bold', marginVertical: 10 },
  itemContainer: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  itemName: { fontSize: 16, fontWeight: 'bold', color: COLORS.text },
  itemDetails: { fontSize: 14, color: COLORS.gray, marginLeft: 15, marginTop: 2 },
  infoText: { textAlign: 'center', color: COLORS.gray, fontStyle: 'italic', padding: 10}
});