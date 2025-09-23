// src/components/RatingModal.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { Overlay, Icon } from '@rneui/themed';
import { OrderService } from '../services/order.service';
import { COLORS } from '../constants/colors';
import { scaleFont } from '../utils/responsive';

interface RatingModalProps {
  isVisible: boolean;
  onClose: (submitted: boolean) => void;
  orderId: string;
  ratedUserId: string;
  userType: 'buyer' | 'seller';
}

export const RatingModal = ({ isVisible, onClose, orderId, ratedUserId, userType }: RatingModalProps) => {
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

  const modalTitle = userType === 'buyer' ? '¿Cómo fue tu experiencia?' : '¿Cómo fue la experiencia con el comprador?';

  return (
    <Overlay isVisible={isVisible} onBackdropPress={() => onClose(false)} overlayStyle={styles.modalView}>
      {loading ? ( <ActivityIndicator size="large" color={COLORS.accent} /> ) : 
      view === 'rating' ? (
        <>
          <Text style={styles.headerModal}>{modalTitle}</Text>
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

const styles = StyleSheet.create({
  modalView: { backgroundColor: COLORS.primary, borderRadius: 20, padding: 35, alignItems: 'center', width: '90%' },
  headerModal: { fontSize: scaleFont(22), fontWeight: 'bold', color: COLORS.white, marginBottom: 10, textAlign: 'center' },
  starsContainer: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginVertical: 20 },
});
