// src/screens/common/RatingSuccessScreen.tsx
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Icon } from '@rneui/themed';
import { COLORS } from '../../constants/colors';

export default function RatingSuccessScreen({ navigation }: { navigation: any }) {

  useEffect(() => {
    const timer = setTimeout(() => {
      // Después de 3 segundos, vuelve a la pantalla anterior (Detalles del Pedido)
      navigation.goBack();
    }, 3000);

    return () => clearTimeout(timer); // Limpia el temporizador si el usuario sale antes
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Icon name="party-popper" type="material-community" color={COLORS.accent} size={80} />
      <Text style={styles.header}>¡Felicidades!</Text>
      <Text style={styles.subtitle}>Has comprado de manera inteligente.</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.primary },
  header: { fontSize: 28, fontWeight: 'bold', color: COLORS.white, marginTop: 20 },
  subtitle: { fontSize: 18, color: COLORS.white, opacity: 0.9, marginTop: 5 }
});