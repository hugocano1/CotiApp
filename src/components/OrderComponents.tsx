// src/components/OrderComponents.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/Colors';
import { scaleFont } from '../utils/responsive';
import { Icon } from '@rneui/themed';

export const StatusDisplay = ({ status }: { status: string }) => {
  let label = status;
  let color = COLORS.info; // Azul por defecto (Aceptado/Confirmado)

  switch (status) {
    case 'confirmed':
      label = 'Confirmado';
      color = COLORS.info; // Azul
      break;
    case 'ready_for_pickup':
      label = 'Listo para recoger';
      color = COLORS.processing; // Violeta
      break;
    case 'in_transit':
      label = 'En camino';
      color = COLORS.processing; // Violeta
      break;
    case 'delivered_pending_confirmation':
      label = 'Entregado';
      color = COLORS.processing; // Violeta
      break;
    case 'completed':
      label = 'Completado';
      color = COLORS.success; // Verde
      break;
    case 'cancelled':
      label = 'Cancelado';
      color = COLORS.danger; // Rojo
      break;
  }

  return (
    <View style={[styles.statusBadge, { backgroundColor: `${color}15`, borderColor: color }]}>
      <Text style={[styles.statusText, { color: color }]}>{label}</Text>
    </View>
  );
};

export const CardTitle = ({ title, iconName }: { title: string, iconName?: string }) => (
  <View style={styles.cardTitleContainer}>
    {iconName && <Icon name={iconName} type="material-community" size={20} color={COLORS.secondary} style={{ marginRight: 8 }} />}
    <Text style={styles.cardTitle}>{title}</Text>
  </View>
);

const styles = StyleSheet.create({
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: scaleFont(12),
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: scaleFont(16),
    fontWeight: 'bold',
    color: COLORS.secondary, // Slate Dark para elegancia
  },
});