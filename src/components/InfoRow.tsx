import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Icon } from '@rneui/themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { scaleFont } from '../utils/responsive';

interface InfoRowProps {
  icon: string;
  label: string;
  value: string | number;
  valueColor?: string;
}

export const InfoRow = ({ icon, label, value, valueColor }: InfoRowProps) => {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];
  
  // Asignamos el color por defecto usando el tema
  const finalValueColor = valueColor || themeColors.text;

  const styles = StyleSheet.create({
    infoRow: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      marginVertical: 6,
    },
    infoTextLabel: { 
      marginLeft: 15, 
      fontSize: scaleFont(14), 
      color: Colors.light.tabIconDefault, // <- Gris Neutro
    },
    infoTextValue: { 
      marginLeft: 8, 
      fontSize: scaleFont(14), 
      fontWeight: '500',
      flex: 1,
      textAlign: 'right',
    },
  });

  return (
    <View style={styles.infoRow}>
      <Icon name={icon} type="material-community" color={themeColors.text} size={20} />
      <Text style={styles.infoTextLabel}>{label}:</Text>
      <Text style={[styles.infoTextValue, { color: finalValueColor }]}>{value}</Text>
    </View>
  );
};