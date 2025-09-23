// src/components/ConfirmReceiptModal.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Overlay, Button, Icon, Card } from '@rneui/themed';
import { COLORS } from '../constants/colors';
import { scaleFont } from '../utils/responsive';
import { ShoppingListItem } from '../types/entities';

interface ConfirmReceiptModalProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  items: ShoppingListItem[];
}

export const ConfirmReceiptModal = ({ isVisible, onClose, onConfirm, items }: ConfirmReceiptModalProps) => {
  return (
    <Overlay isVisible={isVisible} onBackdropPress={onClose} overlayStyle={styles.modalView}>
      <View style={styles.header}>
        <Icon name="clipboard-check-outline" type="material-community" color={COLORS.white} size={30} />
        <Text style={styles.headerModal}>Verifica tu Pedido</Text>
      </View>
      <Text style={styles.subtitle}>Confirma que has recibido los siguientes artículos:</Text>
      
      <ScrollView style={styles.itemList}>
        {items.map((item, index) => (
          <View key={index} style={styles.itemContainer}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemQuantity}>{item.quantity} {item.unit || ''}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Button
          title="Cancelar"
          onPress={onClose}
          type="outline"
          buttonStyle={styles.cancelButton}
          titleStyle={styles.cancelButtonTitle}
        />
        <Button
          title="Confirmar Recepción"
          onPress={onConfirm}
          buttonStyle={styles.confirmButton}
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
  itemList: { width: '100%', marginBottom: 20 },
  itemContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingVertical: 12, 
    borderBottomWidth: 1, 
    borderBottomColor: 'rgba(255, 255, 255, 0.2)' 
  },
  itemName: { color: COLORS.white, fontSize: scaleFont(15) },
  itemQuantity: { color: COLORS.white, fontSize: scaleFont(15), fontWeight: 'bold' },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  cancelButton: { borderColor: COLORS.white, borderWidth: 1.5, paddingHorizontal: 15 },
  cancelButtonTitle: { color: COLORS.white },
  confirmButton: { backgroundColor: COLORS.secondary, paddingHorizontal: 15 },
});
