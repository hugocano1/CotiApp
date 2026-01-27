// src/components/ConfirmReceiptModal.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Overlay, Button, Icon } from '@rneui/themed';
import Colors from '@/constants/Colors'; // Import centralizado
import { useColorScheme } from '@/components/useColorScheme'; // Hook de tema
import { scaleFont } from '../utils/responsive';
import { ShoppingListItem } from '../types/entities';

interface ConfirmReceiptModalProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  items: ShoppingListItem[];
}

export const ConfirmReceiptModal = ({ isVisible, onClose, onConfirm, items }: ConfirmReceiptModalProps) => {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];

  // Los estilos se definen aquí para usar los colores del tema
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
    itemList: { 
      width: '100%', 
      marginBottom: 20 
    },
    itemContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255, 255, 255, 0.2)',
    },
    itemName: { 
      color: Colors.dark.text, // <- White
      fontSize: scaleFont(15) 
    },
    itemQuantity: { 
      color: Colors.dark.text, // <- White
      fontSize: scaleFont(15), 
      fontWeight: 'bold' 
    },
    buttonContainer: { 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      width: '100%' 
    },
    cancelButton: { // Botón "Cancelar" (secundario)
      borderColor: Colors.dark.text, // <- White
      borderWidth: 1.5,
      backgroundColor: 'transparent',
    },
    cancelButtonTitle: { 
      color: Colors.dark.text // <- White
    },
    confirmButton: { // Botón "Confirmar" (primario/éxito)
      backgroundColor: themeColors.tint, // <- LiziBrand
      borderWidth: 0,
    },
  });

  return (
    <Overlay isVisible={isVisible} onBackdropPress={onClose} overlayStyle={styles.modalView}>
      <View style={styles.header}>
        <Icon name="clipboard-check-outline" type="material-community" color={Colors.dark.text} size={30} />
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

