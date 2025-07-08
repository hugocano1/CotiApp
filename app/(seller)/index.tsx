// src/screens/seller/HomeScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Card, Button, Icon } from '@rneui/themed'; // Importa Card, Button, Icon
import { SafeAreaView } from 'react-native-safe-area-context'; // Para manejar áreas seguras

// navigateToSellerTabScreen ya NO se importa aquí porque la eliminamos de index.tsx temporalmente

const SellerHomeScreen = () => {
  // Función placeholder para el botón por ahora (no navega)
  const handleViewAvailableLists = () => {
    console.log('Botón "Ver listas de compras" presionado (navegación deshabilitada en versión mínima)');
    // La lógica para navegar a listas se añadirá cuando decidamos cómo manejar la navegación sin helpers globales
  };

  return (
    // Usar SafeAreaView para evitar que el contenido se oculte detrás de la barra de estado, notch, etc.
    <SafeAreaView style={styles.safeArea}>
      {/* Usar ScrollView para permitir el desplazamiento si el contenido es largo */}
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.container}>
          {/* Título de bienvenida, envuelto en Text */}
          <Text style={styles.title}>Panel de Vendedor</Text>

          {/* Primer Card: Información general o estadísticas */}
          <Card containerStyle={styles.cardContainer}>
            <Card.Title>
              <Text>Bienvenido</Text> {/* Texto dentro de Card.Title envuelto en Text */}
            </Card.Title>
            <Card.Divider /> {/* Divisor */}
            {/* Contenido del Card envuelto en Text */}
            <Text style={styles.cardText}>
              Aquí verás un resumen de tus actividades como vendedor.
            </Text>
            {/* Puedes añadir más contenido aquí, envuelto en Text o usando otros componentes */}
          </Card>

          {/* Segundo Card: Acceso rápido a Listas Disponibles */}
          <Card containerStyle={styles.cardContainer}>
            <Card.Title>
              <Text>Listas de Compras</Text> {/* Texto dentro de Card.Title envuelto en Text */}
            </Card.Title>
            <Card.Divider /> {/* Divisor */}
            {/* Contenido del Card envuelto en Text */}
            <Text style={styles.cardText}>
              Explora las listas de compras publicadas por los compradores.
            </Text>
            {/* Botón para ver listas disponibles */}
            <Button
              icon={<Icon name='list' color='#ffffff' />} // Icono para el botón
              buttonStyle={styles.buttonStyle} // Estilo del botón
              containerStyle={styles.buttonContainer} // Estilo del contenedor del botón
              title=" Ver listas de compras" // Título del botón (Text es automático en Button title)
              onPress={handleViewAvailableLists} // Llama a la función placeholder
            />
          </Card>

          {/* Puedes añadir más Cards o contenido aquí */}

        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa', // Fondo general del vendedor
  },
  scrollViewContent: {
    flexGrow: 1, // Permite que el ScrollView crezca
    paddingVertical: 20, // Espacio vertical alrededor del contenido
  },
  container: {
    flex: 1,
    alignItems: 'center', // Centra horizontalmente el contenido
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#212529',
  },
  cardContainer: {
    borderRadius: 8,
    marginHorizontal: 15, // Espacio a los lados
    marginBottom: 20, // Espacio debajo de cada tarjeta
    padding: 15,
    shadowColor: "#000", // Sombra para elevación visual
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
    marginBottom: 10, // Espacio debajo del texto en el card
    color: '#495057',
  },
  buttonStyle: {
    backgroundColor: '#2089dc', // Color del botón
    borderRadius: 5,
  },
  buttonContainer: {
    marginHorizontal: 0, // Asegura que el botón ocupe el ancho del Card si es necesario
    marginTop: 10, // Espacio encima del botón
  },
});

export default SellerHomeScreen;