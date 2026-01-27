// src/components/RatingModal.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { Overlay, Icon } from '@rneui/themed';
import { OrderService } from '../services/order.service';
import Colors from '@/constants/Colors'; // Import centralizado
import { useColorScheme } from '@/components/useColorScheme'; // Hook de tema
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
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];

  const handleRatingSubmit = async (selectedRating: number) => {
    setRating(selectedRating);
    setLoading(true);
    try {
      await OrderService.submitRating(orderId, selectedRating);
      setView('success');
    } catch (error: any) {
      Alert.alert("Error", `No se pudo enviar la calificación: ${error.message}`);
    } finally {
      setLoading(false);
      // Solo cerramos si la vista no es de éxito, o programamos el cierre
      if (view !== 'success') {
        setTimeout(() => {
          onClose(true);
          setTimeout(() => setView('rating'), 500); // Reset view after closing
        }, 2000);
      }
    }
  };

  // Cierre automático después de mostrar el éxito
  React.useEffect(() => {
    if (view === 'success') {
      const timer = setTimeout(() => {
        onClose(true);
        setTimeout(() => setView('rating'), 500); // Reset para la próxima vez
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [view, onClose]);

  const modalTitle = userType === 'buyer' ? '¿Cómo fue tu experiencia?' : '¿Cómo fue la experiencia con el comprador?';
  
  // Estilos que dependen del tema
  const styles = StyleSheet.create({
    modalView: { 
      backgroundColor: Colors.dark.background, // <- LiziDark
      borderRadius: 20, 
      padding: 35, 
      alignItems: 'center', 
      width: '90%' 
    },
    headerModal: { 
      fontSize: scaleFont(22), 
      fontWeight: 'bold', 
      color: Colors.dark.text, // <- White
      marginBottom: 10, 
      textAlign: 'center' 
    },
    starsContainer: { 
      flexDirection: 'row', 
      justifyContent: 'space-around', 
      width: '100%', 
      marginVertical: 20 
    },
    successText: {
      color: Colors.dark.text, // <- White
      marginTop: 8,
      fontSize: scaleFont(14),
    }
  });

  return (
    <Overlay isVisible={isVisible} onBackdropPress={() => onClose(false)} overlayStyle={styles.modalView}>
      {loading ? ( <ActivityIndicator size="large" color={themeColors.tint} /> ) : 
      view === 'rating' ? (
        <>
          <Text style={styles.headerModal}>{modalTitle}</Text>
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => { setRating(star); handleRatingSubmit(star); }}>
                <Icon name={star <= rating ? "star" : "star-outline"} type="material-community" color={themeColors.tint} size={40} />
              </TouchableOpacity>
            ))}
          </View>
        </>
      ) : (
        <View style={{alignItems: 'center'}}>
          <Icon name="party-popper" type="material-community" color={themeColors.tint} size={60} />
          <Text style={styles.headerModal}>¡Gracias por tu Calificación!</Text>
          <Text style={styles.successText}>Tu opinión ayuda a la comunidad.</Text>
        </View>
      )}
    </Overlay>
  );
};
