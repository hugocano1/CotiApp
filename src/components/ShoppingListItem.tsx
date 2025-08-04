// Ruta: src/components/ShoppingListItem.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '@rneui/themed';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

type ShoppingList = {
  id: string;
  title: string;
  min_budget?: number;
  max_budget?: number;
  items: any[];
  status: string;
  created_at: string;
  offers: { count: number }[];
};

type Props = {
  list: ShoppingList;
};

const InfoRow = ({ iconName, text }: { iconName: any; text: string | number }) => (
  <View style={styles.infoRow}>
    <MaterialCommunityIcons name={iconName} size={16} color={COLORS.secondary} />
    <Text style={styles.infoText}>{text}</Text>
  </View>
);

export function ShoppingListItem({ list }: Props) {
  const creationDate = new Date(list.created_at).toLocaleDateString('es-ES', {
    day: 'numeric', month: 'short'
  });

  const offerCount = list.offers[0]?.count || 0;
  const capitalizedStatus = list.status.charAt(0).toUpperCase() + list.status.slice(1);

  return (
    <Card containerStyle={styles.card}>
      {/* Contenedor principal que usa flexbox para alinear horizontalmente */}
      <View style={styles.contentContainer}>
        {/* Columna Izquierda: Imagen */}
        <View style={styles.imagePlaceholder}>
          <MaterialCommunityIcons name="file-document-outline" size={30} color={COLORS.secondary} />
        </View>

        {/* Columna Derecha: Información */}
        <View style={styles.infoContainer}>
          {/* Fila superior: Título y Estado */}
          <View style={styles.headerRow}>
            <Text style={styles.title} numberOfLines={2}>{list.title}</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{capitalizedStatus}</Text>
            </View>
          </View>

          {/* Fila inferior: Metadata */}
          <View style={styles.metadataContainer}>
            <InfoRow iconName="cash" text={`$${list.min_budget || 0} - $${list.max_budget || 'N/A'}`} />
            <InfoRow iconName="format-list-numbered" text={`${list.items?.length || 0} artículos`} />
            <InfoRow iconName="tag-multiple-outline" text={`${offerCount} ofertas`} />
            <InfoRow iconName="calendar-month-outline" text={creationDate} />
          </View>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 12,
    marginHorizontal: 15,
    marginBottom: 15,
    backgroundColor: COLORS.white,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  contentContainer: {
    flexDirection: 'row', // ✅ Organiza imagen e info horizontalmente
    alignItems: 'center',
  },
  imagePlaceholder: {
    width: 75,
    height: 75,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
    borderRadius: 12,
    marginRight: 12,
  },
  infoContainer: {
    flex: 1, // ✅ Ocupa el resto del espacio
  },
  headerRow: {
    flexDirection: 'row', // ✅ Pone el título y el estado en la misma línea
    justifyContent: 'space-between', // ✅ Empuja el título a la izquierda y el estado a la derecha
    alignItems: 'flex-start', // Alinea los elementos en la parte superior
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1, // Permite que el título ocupe el espacio disponible y haga wrap
    marginRight: 8, // Espacio para que no se pegue al badge
  },
  statusBadge: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  metadataContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap', // Permite que los elementos se ajusten si no caben
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 5,
  },
  infoText: {
    marginLeft: 5,
    fontSize: 12,
    color: COLORS.text,
  },
});