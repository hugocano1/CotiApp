// src/components/CancelOrderModal.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert } from 'react-native';
import { Overlay, Button, Icon } from '@rneui/themed';
import { COLORS } from '../constants/colors';
import { scaleFont } from '../utils/responsive';

interface CancelOrderModalProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isLoading: boolean;
}

export const CancelOrderModal = ({ isVisible, onClose, onConfirm, isLoading }: CancelOrderModalProps) => {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    if (reason.trim() === '') {
      Alert.alert('Error', 'Por favor, ingresa un motivo para la cancelación.');
      return;
    }
    onConfirm(reason);
  };

  return (
    <Overlay isVisible={isVisible} onBackdropPress={onClose} overlayStyle={styles.modalView}>
      <View style={styles.header}>
        <Icon name="cancel" type="material-community" color={COLORS.white} size={30} />
        <Text style={styles.headerModal}>Cancelar Pedido</Text>
      </View>
      <Text style={styles.subtitle}>Por favor, indícanos el motivo de la cancelación:</Text>
      
      <TextInput
        style={styles.reasonInput}
        placeholder="Motivo de la cancelación..."
        placeholderTextColor={COLORS.gray}
        multiline
        numberOfLines={4}
        value={reason}
        onChangeText={setReason}
        editable={!isLoading}
      />

      <View style={styles.buttonContainer}>
        <Button
          title="Volver"
          onPress={onClose}
          type="outline"
          buttonStyle={styles.cancelButton}
          titleStyle={styles.cancelButtonTitle}
          disabled={isLoading}
        />
        <Button
          title="Confirmar Cancelación"
          onPress={handleConfirm}
          buttonStyle={styles.confirmButton}
          loading={isLoading}
        />
      </View>
    </Overlay>
  );
};

const styles = StyleSheet.create({
  modalView: { backgroundColor: COLORS.primary, borderRadius: 20, padding: 20, width: '90%', maxHeight: '80%' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  headerModal: { fontSize: scaleFont(22), fontWeight: 'bold', color: COLORS.white, marginLeft: 10 },
  subtitle: { fontSize: scaleFont(14), color: COLORS.white, textAlign: 'center', marginBottom: 15 },
  reasonInput: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 10,
    fontSize: scaleFont(14),
    color: COLORS.text,
    height: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
    width: '100%',
  },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  cancelButton: { borderColor: COLORS.white, borderWidth: 1.5, paddingHorizontal: 15 },
  cancelButtonTitle: { color: COLORS.white },
  confirmButton: { backgroundColor: COLORS.secondary, paddingHorizontal: 15 },
});
