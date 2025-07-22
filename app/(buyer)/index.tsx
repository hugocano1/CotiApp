// app/(buyer)/index.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Button, Card, Icon } from '@rneui/themed';
import { Link } from 'expo-router';
import { COLORS } from '../../src/constants/colors';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BuyerHomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>¡Bienvenido a Coti!</Text>
          <Text style={styles.subtitle}>Crea tu lista y empieza a ahorrar.</Text>
        </View>
        <Link href="/(buyer)/crear-lista" asChild>
          <Button
            title="Crear Nueva Lista"
            buttonStyle={styles.createButton}
            icon={<Icon name="playlist-plus" type="material-community" color="white" />}
          />
        </Link>
        {/* Aquí irían las estadísticas y tarjetas de consejos como las teníamos antes */}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: 20, alignItems: 'center' },
  title: { color: COLORS.primary, fontWeight: 'bold', fontSize: 24, marginBottom: 5 },
  subtitle: { color: COLORS.gray, fontSize: 16 },
  createButton: { backgroundColor: COLORS.secondary, borderRadius: 10, marginHorizontal: 20, paddingVertical: 12 },
});