// Ruta: src/components/OfferListItem.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card, Avatar } from '@rneui/themed';

import themes, { COLORS } from '../../constants/Colors'; // Importamos themes por defecto y COLORS
import { scaleFont } from '../utils/responsive';
import { Offer } from '../types/entities';
import { formatCurrency } from '../utils/formatters';

type ThemeColors = typeof themes.light;

export function OfferListItem({ offer, themeColors }: { offer: Offer, themeColors: ThemeColors }) {
  const styles = createStyles(themeColors);

  const statusConfig = {
    pending: { text: 'Enviada', color: themeColors.tabIconDefault }, // Gris para estado neutro
    accepted: { text: 'Aceptada', color: themeColors.tint }, // Verde para éxito
    rejected: { text: 'Rechazada', color: themeColors.accent }, // Rojo para atención/falla
    default: { text: 'Enviada', color: themeColors.tabIconDefault },
  };

  const buyerProfile = offer.shopping_lists?.buyer_profiles;
  const displayName =
    buyerProfile?.nombre
      ? `${buyerProfile.nombre} ${buyerProfile.apellido || ''}`.trim()
      : 'Comprador';
  const displayAvatar = buyerProfile?.foto_perfil;
  const currentStatus =
    statusConfig[offer.status as keyof typeof statusConfig] || statusConfig.default;

  return (
    <Card containerStyle={styles.card}>
      <View style={styles.contentContainer}>
        <View style={styles.avatarContainer}>
          <Avatar
            size={64}
            rounded
            source={displayAvatar ? { uri: displayAvatar } : undefined}
            title={!displayAvatar ? displayName.substring(0, 2).toUpperCase() : undefined}
            imageProps={{ style: { resizeMode: 'cover' } }}
            containerStyle={{ backgroundColor: themeColors.tint }} // Fondo del avatar
          />
        </View>
        <View style={styles.infoContainer}>
          <View>
            <Text style={styles.titlePrefix}>Oferta para:</Text>
            <Text style={styles.title} numberOfLines={1}>
              {displayName}
            </Text>
          </View>
          <Text style={styles.subtitle} numberOfLines={1}>
            {offer.shopping_lists?.title || 'Lista no disponible'}
          </Text>
          <Text style={styles.price}>{formatCurrency(offer.price)}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: currentStatus.color },
          ]}
        >
          <Text style={styles.statusText}>{currentStatus.text}</Text>
        </View>
      </View>
    </Card>
  );
}

const createStyles = (themeColors: ThemeColors) => StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 12,
    marginHorizontal: 0,
    marginTop: 0,
    marginBottom: 15,
    backgroundColor: themeColors.card,
    borderWidth: 1,
    borderColor: themeColors.border,
    elevation: 0,
    shadowOpacity: 0,
  },
  contentContainer: { flexDirection: 'row', alignItems: 'center' },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 12,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: { flex: 1, justifyContent: 'center' },
  titlePrefix: {
    fontSize: scaleFont(13),
    color: themeColors.tabIconDefault,
  },
  title: {
    fontSize: scaleFont(16),
    fontWeight: 'bold',
    color: themeColors.text,
  },
  subtitle: {
    fontSize: scaleFont(13),
    color: themeColors.tabIconDefault,
    marginTop: 4,
    marginBottom: 6,
  },
  price: { 
    fontSize: scaleFont(16), 
    fontWeight: 'bold', 
    color: themeColors.tint 
  },
  statusBadge: {
    position: 'absolute',
    top: -13, // Ajuste para que quede sobre el borde
    right: -13, // Ajuste para que quede sobre el borde
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 12,
  },
  statusText: {
    color: themes.dark.text, // Texto blanco para contraste con badge
    fontSize: scaleFont(10),
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});