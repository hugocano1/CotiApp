// En tu archivo de la pantalla de calificación
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Icon } from '@rneui/themed';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS } from '../src/constants/colors'; // Ajusta la ruta
import { OrderService } from '../src/services/order.service'; // Ajusta la ruta

export default function RatingScreen() {
  const { orderId, ratedUserId } = useLocalSearchParams();
  const router = useRouter();

  const [view, setView] = useState<'success' | 'rating'>('success');
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);

  // Efecto para cambiar de la vista de "éxito" a la de "calificación"
  useEffect(() => {
    const timer = setTimeout(() => {
      setView('rating');
    }, 2500); // 2.5 segundos para mostrar el mensaje de felicitación

    return () => clearTimeout(timer);
  }, []);

  const handleRatingSubmit = async (selectedRating: number) => {
    setRating(selectedRating);
    setLoading(true);
    try {
      await OrderService.submitRating(orderId as string, selectedRating);
      // No mostramos alerta, simplemente cerramos el modal
      router.back(); 
    } catch (error: any) {
      Alert.alert("Error", `No se pudo enviar la calificación: ${error.message}`);
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backdrop} onPress={() => router.back()} />
      <View style={styles.modalView}>
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.accent} />
        ) : view === 'success' ? (
          // --- VISTA DE FELICITACIÓN ---
          <View style={styles.content}>
            <Icon name="party-popper" type="material-community" color={COLORS.accent} size={60} />
            <Text style={styles.header}>¡Felicidades!</Text>
            <Text style={styles.subtitle}>Has realizado una compra inteligente.</Text>
          </View>
        ) : (
          // --- VISTA DE CALIFICACIÓN ---
          <View style={styles.content}>
            <Text style={styles.header}>¿Cómo fue tu experiencia?</Text>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => handleRatingSubmit(star)}>
                  <Icon
                    name={star <= rating ? "star" : "star-outline"}
                    type="material-community"
                    color={COLORS.accent}
                    size={40}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.6)' },
  backdrop: { ...StyleSheet.absoluteFillObject },
  modalView: { backgroundColor: COLORS.primary, borderRadius: 20, padding: 35, alignItems: 'center', width: '90%' },
  content: { alignItems: 'center' },
  header: { fontSize: 22, fontWeight: 'bold', color: COLORS.white, marginBottom: 10, textAlign: 'center' },
  subtitle: { fontSize: 16, color: COLORS.white, opacity: 0.9 },
  starsContainer: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginVertical: 20 },
});