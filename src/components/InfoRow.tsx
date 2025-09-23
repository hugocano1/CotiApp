import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Icon } from '@rneui/themed';
import { COLORS } from '../constants/colors';
import { scaleFont } from '../utils/responsive';

interface InfoRowProps {
  icon: string;
  label: string;
  value: string | number;
  valueColor?: string;
}

export const InfoRow = ({ icon, label, value, valueColor = COLORS.text }: InfoRowProps) => (
  <View style={styles.infoRow}>
    <Icon name={icon} type="material-community" color={COLORS.secondary} size={20} />
    <Text style={styles.infoTextLabel}>{label}:</Text>
    <Text style={[styles.infoTextValue, { color: valueColor }]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  infoRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginVertical: 6,
  },
  infoTextLabel: { 
    marginLeft: 15, 
    fontSize: scaleFont(14), 
    color: COLORS.gray 
  },
  infoTextValue: { 
    marginLeft: 8, 
    fontSize: scaleFont(14), 
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
});