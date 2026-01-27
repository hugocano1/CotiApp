// Ruta: src/components/ShoppingListItem.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '@rneui/themed';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/Colors'; // CORREGIDO: Importación nombrada
import { ShoppingList } from '../types/entities';
import { scaleFont } from '../utils/responsive';

type Props = {
  list: ShoppingList;
};

// InfoRow local refactorizado para usar el objeto COLORS
const InfoRow = ({ iconName, text }: { iconName: string; text: string | number }) => {
  const styles = StyleSheet.create({
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 10,
      marginBottom: 5,
    },
    infoText: { 
      marginLeft: 6, 
      fontSize: scaleFont(13), 
      color: COLORS.gray 
    },
  });

  return (
    <View style={styles.infoRow}>
      <MaterialCommunityIcons name={iconName} size={16} color={COLORS.gray} />
      <Text style={styles.infoText}>{text}</Text>
    </View>
  );
};

export function ShoppingListItem({ list }: Props) {
  const creationDate = new Date(list.created_at).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
  });
  const offerCount = list.offers?.length || 0;
  const capitalizedStatus = list.status.charAt(0).toUpperCase() + list.status.slice(1);

  const styles = StyleSheet.create({
    card: {
      borderRadius: 16,
      padding: 12,
      marginHorizontal: 15,
      backgroundColor: COLORS.card,
      elevation: 2,
      borderWidth: 0,
    },
    contentContainer: { flexDirection: 'row', alignItems: 'center' },
    imagePlaceholder: {
      width: 80,
      height: 80,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: COLORS.background,
      borderRadius: 12,
      marginRight: 12,
    },
    infoContainer: { flex: 1, height: 80, justifyContent: 'space-between' },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    title: {
      fontSize: scaleFont(16),
      fontWeight: 'bold',
      color: COLORS.text,
      flex: 1,
      marginRight: 4,
    },
    statusBadge: {
      backgroundColor: list.status === 'activa' ? COLORS.primary : COLORS.gray,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
    },
    statusText: { 
      color: COLORS.white,
      fontSize: scaleFont(10), 
      fontWeight: 'bold' 
    },
    metadataContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  });

  return (
    <Card containerStyle={styles.card}>
      <View style={styles.contentContainer}>
        <View style={styles.imagePlaceholder}>
          <MaterialCommunityIcons
            name="receipt"
            size={40}
            color={COLORS.primary}
          />
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.title} numberOfLines={1}>
              {list.title}
            </Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{capitalizedStatus}</Text>
            </View>
          </View>
          <View style={styles.metadataContainer}>
            <InfoRow
              iconName="cash"
              text={`${list.min_budget || 0} - ${list.max_budget || 'N/A'}`}
            />
            <InfoRow
              iconName="format-list-numbered"
              text={`${list.items?.length || 0} artículos`}
            />
            <InfoRow
              iconName="tag-multiple-outline"
              text={`${offerCount} ofertas`}
            />
            <InfoRow iconName="calendar-month-outline" text={creationDate} />
          </View>
        </View>
      </View>
    </Card>
  );
}