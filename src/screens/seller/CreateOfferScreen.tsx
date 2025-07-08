// C:\MercaYa\src\screens\seller\CreateOfferScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { ShoppingListService } from '../../services/shoppingList.service'; // Ajusta la ruta

export default function CreateOfferScreen({ route, navigation }: { route: any, navigation: any }) {
  const { listId } = route.params; // Obtenemos el ID de la lista desde la navegación

  const [price, setPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmitOffer = async () => {
    const numericPrice = parseFloat(price);
    if (!price || isNaN(numericPrice) || numericPrice <= 0) {
      Alert.alert("Error", "Por favor, ingresa un precio total válido.");
      return;
    }

    setLoading(true);
    try {
      await ShoppingListService.createOffer({
        shopping_list_id: listId,
        total_price: numericPrice,
        notes: notes
      });

      Alert.alert("¡Éxito!", "Tu oferta ha sido enviada correctamente.");
      navigation.goBack(); // Regresa a la pantalla de detalles

    } catch (error: any) {
      Alert.alert("Error", `No se pudo enviar la oferta: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Crear Nueva Oferta</Text>
      <Text style={styles.label}>ID de la Lista: {listId.substring(0, 8)}...</Text>
      
      <Text style={styles.label}>Precio Total de tu Oferta ($)</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: 150.00"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Notas u Observaciones (Opcional)</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Ej: Algunos productos fueron reemplazados por similares en promoción."
        value={notes}
        onChangeText={setNotes}
        multiline
      />

      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <Button title="Enviar Oferta" onPress={handleSubmitOffer} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 16, marginTop: 15, marginBottom: 5 },
  input: { height: 40, borderColor: 'gray', borderWidth: 1, paddingHorizontal: 10, borderRadius: 5 },
  textArea: { height: 100, textAlignVertical: 'top', paddingTop: 10 }
});