// src/screens/seller/SellerStoreScreen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const SellerStoreScreen = () => {
  return (
    <View style={styles.container}>
      <Text>Pantalla de Mi Tienda (Vendedor)</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SellerStoreScreen;