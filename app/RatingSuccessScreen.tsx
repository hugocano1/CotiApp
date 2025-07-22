// app/RatingSuccessScreen.tsx
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Icon } from '@rneui/themed';
import { useRouter } from 'expo-router';
import { COLORS } from '../src/constants/colors'; // Asegúrate que la ruta sea correcta

export default function RatingSuccessScreen() {
  const router = useRouter();

  useEffect(() => {
    // Creamos un temporizador que se ejecutará después de 2.5 segundos
    const timer = setTimeout(() => {
      router.back(); // Vuelve a la pantalla anterior (Detalles del Pedido)
    }, 2500);

    // Es una buena práctica limpiar el temporizador si el usuario sale de la pantalla antes
    return () => clearTimeout(timer); 
  }, [router]);

  return (
    <View style={styles.container}>
      <Icon name="party-popper" type="material-community" color={COLORS.accent} size={80} />
      <Text style={styles.header}>¡Gracias por tu Calificación!</Text>
      <Text style={styles.subtitle}>Tu opinión ayuda a la comunidad.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary, // Usamos el color primario de fondo
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.white,
    marginTop: 20,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: 18,
    color: COLORS.white,
    opacity: 0.9,
    marginTop: 10,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});