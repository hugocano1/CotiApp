// src/screens/common/RatingScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Icon } from '@rneui/themed';
import { COLORS } from '../../constants/colors';
import { OrderService } from '../../services/order.service'; // Asumimos que la función de calificar estará aquí

export default function RatingScreen({ route, navigation }: { route: any, navigation: any }) {
  const { orderId, ratedUserId } = route.params;
  const [rating, setRating] = useState(0); // Para guardar la calificación seleccionada
  const [hoverRating, setHoverRating] = useState(0); // Para el efecto visual al pasar el dedo
  const [loading, setLoading] = useState(false);

  const handleRatingSubmit = async (selectedRating: number) => {
    setRating(selectedRating); // Para que la estrella se "pinte" al instante
    setLoading(true);
    try {
     // Llamamos a la nueva función del servicio
        await OrderService.submitRating(orderId, selectedRating);

    // Navegamos a la pantalla de éxito
    navigation.replace('RatingSuccess');

  } catch (error: any) {
        Alert.alert("Error", "No se pudo enviar la calificación.");
        setLoading(false); // Detenemos la carga solo si hay error
    }
  };

  if (loading) {
    return <View style={styles.container}><ActivityIndicator size="large" color={COLORS.accent} /></View>
  }

  return (
    // Hacemos el fondo semi-transparente para que parezca un modal
    <View style={styles.container}>
      <View style={styles.modalView}>
        <Text style={styles.header}>¿Cómo fue tu experiencia?</Text>
        <View style={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => handleRatingSubmit(star)}>
              <Icon
                name="star"
                type="material-community"
                color={star <= rating || star <= hoverRating ? COLORS.accent : COLORS.gray}
                size={40}
              />
            </TouchableOpacity>
          ))}
        </View>
        <Button title="Cerrar" onPress={() => navigation.goBack()} />
      </View>
    </View>
  );
}

// Componente de botón simple para no importar todo RNEUI
const Button = ({ title, onPress }: { title: string, onPress: () => void }) => (
  <TouchableOpacity style={styles.button} onPress={onPress}>
    <Text style={styles.buttonText}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end', // Posiciona el modal abajo
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fondo oscuro semi-transparente
  },
  modalView: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 20,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 30,
  },
  button: {
    marginTop: 15,
  },
  buttonText: {
    fontSize: 16,
    color: COLORS.gray,
  },
});