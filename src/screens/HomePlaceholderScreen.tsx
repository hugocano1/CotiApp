// src/screens/HomePlaceholderScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Card, Button, Icon } from '@rneui/themed'; // Importa Card, Button, Icon
import { SafeAreaView } from 'react-native-safe-area-context'; // Para manejar áreas seguras

const HomePlaceholderScreen = () => {
  // Función placeholder para un botón si decides añadir uno más tarde
  const handleSomething = () => {
    console.log('Botón presionado en pantalla Placeholder');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.container}>
          {/* Título principal, envuelto en Text */}
          <Text style={styles.title}>Pantalla de Inicio (Placeholder)</Text>

          {/* Card de bienvenida */}
          <Card containerStyle={styles.cardContainer}>
            <Card.Title>
              <Text>¡Bienvenido!</Text> {/* Texto dentro de Card.Title envuelto en Text */}
            </Card.Title>
            <Card.Divider /> {/* Divisor */}
            {/* Contenido del Card envuelto en Text */}
            <Text style={styles.cardText}>
              Has iniciado sesión correctamente.
            </Text>
          </Card>

          {/* Puedes añadir más contenido aquí si lo necesitas */}

        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f0f0', // Un fondo claro para diferenciar
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingVertical: 20,
  },
  container: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  cardContainer: {
    borderRadius: 8,
    marginHorizontal: 15,
    marginBottom: 20,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardText: {
    fontSize: 16,
    marginBottom: 10,
    color: '#555',
  },
});

export default HomePlaceholderScreen;