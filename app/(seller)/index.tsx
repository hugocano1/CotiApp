// app/(seller)/index.tsx

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Card, Button, Icon } from '@rneui/themed';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router'; // ✅ 1. Importamos Link para la navegación
import { COLORS } from '../../src/constants/colors'; // Asegúrate de que la ruta sea correcta

const SellerHomeScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.container}>
          <Text style={styles.title}>Panel de Vendedor</Text>
          
          <Card containerStyle={styles.cardContainer}>
            <Card.Title><Text>Bienvenido</Text></Card.Title>
            <Card.Divider />
            <Text style={styles.cardText}>
              Aquí verás un resumen de tus actividades como vendedor.
            </Text>
          </Card>

          <Card containerStyle={styles.cardContainer}>
            <Card.Title><Text>Listas de Compras</Text></Card.Title>
            <Card.Divider />
            <Text style={styles.cardText}>
              Explora las listas de compras publicadas por los compradores.
            </Text>

            {/* ✅ 2. Envolvemos el botón en un Link para que navegue */}
            <Link href="/(seller)/(listas)" asChild>
              <Button
                icon={<Icon name='list' color={COLORS.white} />}
                buttonStyle={styles.buttonStyle}
                containerStyle={styles.buttonContainer}
                title="Ver listas de compras" // ✅ 3. Corregimos el título sin espacio
              />
            </Link>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  scrollViewContent: { flexGrow: 1, paddingVertical: 20 },
  container: { flex: 1, alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: COLORS.primary },
  cardContainer: {
    borderRadius: 12,
    marginHorizontal: 15,
    marginBottom: 20,
    padding: 15,
    width: '90%',
  },
  cardText: { fontSize: 16, marginBottom: 15, color: COLORS.text, lineHeight: 22 },
  buttonStyle: { backgroundColor: COLORS.secondary, borderRadius: 8 },
  buttonContainer: { marginHorizontal: 0, marginTop: 10 },
});

export default SellerHomeScreen;