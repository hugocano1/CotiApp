// src/components/RatingModal.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Icon, Button } from '@rneui/themed';
import { COLORS } from '../../constants/Colors';
import { scaleFont } from '../utils/responsive';
import { supabase } from '../services/auth/config/supabaseClient';

interface RatingModalProps {
  isVisible: boolean;
  onClose: (submitted: boolean) => void;
  orderId: string;
  ratedUserId: string;
  userType: 'buyer' | 'seller';
}

export const RatingModal = ({ isVisible, onClose, orderId, ratedUserId, userType }: RatingModalProps) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert("Atención", "Por favor selecciona una calificación.");
      return;
    }

    setLoading(true);
    try {
      // Determinar qué columna actualizar en la tabla orders
      const updateField = userType === 'buyer' ? 'rating_for_seller' : 'rating_for_buyer';
      const commentField = userType === 'buyer' ? 'comment_for_seller' : 'comment_for_buyer';

      const { error } = await supabase
        .from('orders')
        .update({
          [updateField]: rating,
          [commentField]: comment,
        })
        .eq('id', orderId);

      if (error) throw error;

      Alert.alert("¡Gracias!", "Tu calificación ha sido enviada.");
      onClose(true);
    } catch (error: any) {
      Alert.alert("Error", "No se pudo enviar la calificación: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={isVisible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>Calificar Experiencia</Text>
          <Text style={styles.subtitle}>¿Cómo calificarías el servicio de esta orden?</Text>
          
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setRating(star)}>
                <Icon
                  name={star <= rating ? "star" : "star-outline"}
                  type="material-community"
                  size={40}
                  color={star <= rating ? COLORS.star : COLORS.gray} // ✅ Dorado para estrellas
                />
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={styles.input}
            placeholder="Deja un comentario (opcional)..."
            multiline
            numberOfLines={4}
            value={comment}
            onChangeText={setComment}
          />

          <View style={styles.buttonContainer}>
            <Button
              title="Cancelar"
              type="clear"
              onPress={() => onClose(false)}
              titleStyle={{ color: COLORS.gray }}
            />
            <Button
              title="Enviar"
              onPress={handleSubmit}
              loading={loading}
              buttonStyle={{ backgroundColor: COLORS.primary, borderRadius: 8, paddingHorizontal: 30 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  content: { width: '85%', backgroundColor: 'white', borderRadius: 20, padding: 25, alignItems: 'center' },
  title: { fontSize: scaleFont(20), fontWeight: 'bold', color: COLORS.secondary, marginBottom: 10 },
  subtitle: { fontSize: scaleFont(14), color: COLORS.gray, textAlign: 'center', marginBottom: 20 },
  starsContainer: { flexDirection: 'row', marginBottom: 20 },
  input: { width: '100%', borderWidth: 1, borderColor: '#eee', borderRadius: 12, padding: 15, marginBottom: 20, height: 100, textAlignVertical: 'top' },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center' }
});