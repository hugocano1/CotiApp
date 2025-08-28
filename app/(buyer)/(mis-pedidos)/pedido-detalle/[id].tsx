// Ruta: app/(buyer)/(mis-pedidos)/pedido-detalle/[id].tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Card, Icon, Badge, Button, Overlay } from '@rneui/themed';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useOrderDetails } from '../../../../src/hooks/useOrderDetails';
import { OrderService } from '../../../../src/services/order.service';
import { COLORS } from '../../../../src/constants/colors';

const RatingModal = ({ isVisible, onClose, orderId, ratedUserId }: any) => {
  const [view, setView] = useState<'rating' | 'success'>('rating');
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleRatingSubmit = async (selectedRating: number) => {
    setRating(selectedRating);
    setLoading(true);
    try {
      await OrderService.submitRating(orderId, selectedRating);
      setView('success');
      setLoading(false); 
      setTimeout(() => {
        onClose(true); 
        setTimeout(() => setView('rating'), 500);
      }, 2000);
    } catch (error: any) {
      Alert.alert("Error", `No se pudo enviar la calificación: ${error.message}`);
      setLoading(false);
    }
  };

  return (
    <Overlay isVisible={isVisible} onBackdropPress={() => onClose(false)} overlayStyle={styles.modalView}>
      {loading ? ( <ActivityIndicator size="large" color={COLORS.accent} /> ) : 
      view === 'rating' ? (
        <>
          <Text style={styles.headerModal}>¿Cómo fue tu experiencia?</Text>
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => handleRatingSubmit(star)}>
                <Icon name={star <= rating ? "star" : "star-outline"} type="material-community" color={COLORS.accent} size={40} />
              </TouchableOpacity>
            ))}
          </View>
        </>
      ) : (
        <View style={{alignItems: 'center'}}>
          <Icon name="party-popper" type="material-community" color={COLORS.accent} size={60} />
          <Text style={styles.headerModal}>¡Gracias por tu Calificación!</Text>
          <Text style={{color: COLORS.white}}>Tu opinión ayuda a la comunidad.</Text>
        </View>
      )}
    </Overlay>
  );
};


export default function BuyerOrderDetailsScreen() {
  const { id: orderId } = useLocalSearchParams();
  const router = useRouter();
  const { order, loading, refreshOrder } = useOrderDetails(orderId as string);
  const [isRatingModalVisible, setRatingModalVisible] = useState(false);

  const handleCloseRatingModal = (submitted: boolean) => {
    setRatingModalVisible(false);
    if (submitted && refreshOrder) {
      refreshOrder();
    }
  };

  const handleConfirmDelivery = async () => { Alert.alert( "Confirmar Entrega", "¿Confirmas que has recibido tu pedido correctamente?", [ { text: "Aún no", style: "cancel" }, { text: "Sí, lo recibí", onPress: async () => { try { await OrderService.confirmDelivery(orderId as string); if(refreshOrder) refreshOrder(); } catch (error: any) { Alert.alert("Error", error.message); } } } ] ); };

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
           <Button title="Confirmar Pedido Recibido" onPress={handleConfirmDelivery} buttonStyle={{backgroundColor: COLORS.secondary}} icon={<Icon name="check-circle" type="material-community" color="white" containerStyle={{marginRight: 10}} />} />
        )}
        {order.status === 'completed' && !order.rating_for_seller && (
           <Button title="Calificar a Vendedor" onPress={() => setRatingModalVisible(true)} buttonStyle={{backgroundColor: COLORS.accent}} titleStyle={{color: COLORS.primary, fontWeight: 'bold'}} />
        )}
        {order.status === 'completed' && order.rating_for_seller && (
           <Text style={styles.infoText}>Ya has calificado a este vendedor. ¡Gracias!</Text>
        )}
         {order.status === 'confirmed' && (
           <Text style={styles.infoText}>El vendedor ha confirmado tu pedido y lo está preparando.</Text>
        )}
      </Card>

      <RatingModal 
        isVisible={isRatingModalVisible}
        onClose={handleCloseRatingModal}
        orderId={order.id}
        ratedUserId={order.seller_id}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, backgroundColor: COLORS.background },
  card: { borderRadius: 12, marginHorizontal: 15, marginBottom: 15 },
  statusContainer: { alignItems: 'center', paddingVertical: 10 },
  price: { fontSize: 22, fontWeight: 'bold', marginVertical: 10 },
  infoText: { textAlign: 'center', color: COLORS.gray, fontStyle: 'italic', padding: 10},
  modalView: { backgroundColor: COLORS.primary, borderRadius: 20, padding: 35, alignItems: 'center', width: '90%' },
  headerModal: { fontSize: 22, fontWeight: 'bold', color: COLORS.white, marginBottom: 10, textAlign: 'center' },
  // ✅ CORRECCIÓN: Cambiado 'hundred%' por '100%'
  starsContainer: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginVertical: 20 },
});