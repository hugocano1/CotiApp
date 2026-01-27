// src/components/CancelOrderModal.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert } from 'react-native';
import { Overlay, Button, Icon } from '@rneui/themed';
import Colors from '@/constants/Colors'; // Import centralizado
import { useColorScheme } from '@/components/useColorScheme'; // Hook de tema
import { scaleFont } from '../utils/responsive';

interface CancelOrderModalProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isLoading: boolean;
}

export const CancelOrderModal = ({ isVisible, onClose, onConfirm, isLoading }: CancelOrderModalProps) => {
  const [reason, setReason] = useState('');
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];

  const handleConfirm = () => {
    if (reason.trim() === '') {
      Alert.alert('Error', 'Por favor, ingresa un motivo para la cancelación.');
      return;
    }
    onConfirm(reason);
  };

  // Los estilos ahora se crean dentro para acceder a themeColors
  const styles = StyleSheet.create({
    modalView: { 
      backgroundColor: Colors.dark.background, // <- LiziDark
      borderRadius: 20, 
      padding: 20, 
      width: '90%', 
      maxHeight: '80%' 
    },
    header: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      justifyContent: 'center', 
      marginBottom: 10 
    },
    headerModal: { 
      fontSize: scaleFont(22), 
      fontWeight: 'bold', 
      color: Colors.dark.text, // <- White
      marginLeft: 10 
    },
    subtitle: { 
      fontSize: scaleFont(14), 
      color: Colors.dark.text, // <- White
      textAlign: 'center', 
      marginBottom: 15 
    },
    reasonInput: {
      backgroundColor: Colors.light.card, // <- White
      borderRadius: 10,
      padding: 10,
      fontSize: scaleFont(14),
      color: Colors.light.text, // <- LiziDark
      height: 100,
      textAlignVertical: 'top',
      marginBottom: 20,
      width: '100%',
    },
    buttonContainer: { 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      width: '100%' 
    },
    cancelButton: { // Botón "Volver"
      borderColor: Colors.dark.text, // <- White
      borderWidth: 1.5, 
      paddingHorizontal: 15,
      backgroundColor: 'transparent'
    },
    cancelButtonTitle: { 
      color: Colors.dark.text // <- White
    },
    confirmButton: { // Botón "Confirmar Cancelación"
      backgroundColor: themeColors.accent, // <- LiziAlert
      paddingHorizontal: 15,
      borderWidth: 0,
    },
  });

  return (
    <Overlay isVisible={isVisible} onBackdropPress={onClose} overlayStyle={styles.modalView}>
      <View style={styles.header}>
        <Icon name="cancel" type="material-community" color={Colors.dark.text} size={30} />
        <Text style={styles.headerModal}>Cancelar Pedido</Text>
      </View>
      <Text style={styles.subtitle}>Por favor, indícanos el motivo de la cancelación:</Text>
      
      <TextInput
        style={styles.reasonInput}
        placeholder="Motivo de la cancelación..."
        placeholderTextColor={Colors.light.tabIconDefault}
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

