// app/(seller)/(offers)/create-offer.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ShoppingListService } from '../../../src/services/shoppingList.service'; // Asegúrate que la ruta sea correcta
import { COLORS } from '../../../src/constants/colors'; // Asegúrate que la ruta sea correcta

export default function CreateOfferScreen() {
  const { listId } = useLocalSearchParams();
  const router = useRouter();

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
      // ✅ CORRECCIÓN: Ahora pasamos 'total_price' para que coincida con el servicio
      await ShoppingListService.createOffer({
        shopping_list_id: listId as string,
        total_price: numericPrice, 
        notes: notes
      });

      Alert.alert("¡Éxito!", "Tu oferta ha sido enviada correctamente.");
      router.back();

    } catch (error: any) {
      Alert.alert("Error", `No se pudo enviar la oferta: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>ID de la Lista: {typeof listId === 'string' ? listId.substring(0, 8) : '...'}</Text>
      
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
        <ActivityIndicator size="large" color={COLORS.primary} />
      ) : (
        <Button title="Enviar Oferta" onPress={handleSubmitOffer} color={COLORS.secondary} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: COLORS.background },
  label: { fontSize: 16, marginTop: 15, marginBottom: 5, color: COLORS.text, fontWeight: '500' },
  input: { height: 50, borderColor: COLORS.gray, borderWidth: 1, paddingHorizontal: 10, borderRadius: 8, backgroundColor: COLORS.white },
  textArea: { height: 100, textAlignVertical: 'top', paddingTop: 10 }
});