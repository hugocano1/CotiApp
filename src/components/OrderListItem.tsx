// Ruta: src/components/OrderListItem.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card, Avatar, Icon } from '@rneui/themed';

import { COLORS } from '../../constants/Colors';
import { scaleFont } from '../utils/responsive';
import { Order } from '../types/entities';
import { formatCurrency } from '../utils/formatters';

type Props = {
  order: Order;
  userRole: 'buyer' | 'seller';
};

export function OrderListItem({ order, userRole }: Props) {
  const styles = createStyles(COLORS);

  const statusConfig = {
    completed: { text: 'Completado', color: COLORS.primary },
    confirmed: { text: 'Confirmado', color: COLORS.primary },
    enviado: { text: 'Enviado', color: COLORS.primary },
    default: { text: 'Pendiente', color: COLORS.gray },
  };

  const isBuyer = userRole === 'buyer';
  const sellerProfile = order.seller_profiles;
  const buyerProfile = order.buyer_profiles;

  const displayName = isBuyer
    ? sellerProfile?.stores?.name || sellerProfile?.nombre || 'Vendedor'
    : `${buyerProfile?.nombre || ''} ${buyerProfile?.apellido || ''}`.trim() || 'Comprador';

  const displayAvatar = isBuyer ? sellerProfile?.foto_perfil : buyerProfile?.foto_perfil;
  const rating = isBuyer ? sellerProfile?.calificacion_vendedor : buyerProfile?.calificacion_comprador;
  
  const currentStatus = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.default;

  return (
    <Card containerStyle={styles.card}>
      <View style={styles.contentContainer}>
        <View style={styles.avatarContainer}>
          <Avatar
            size={64}
            rounded
            source={displayAvatar ? { uri: displayAvatar } : undefined}
            title={!displayAvatar ? displayName.substring(0, 2).toUpperCase() : undefined}
            containerStyle={{ backgroundColor: COLORS.primary }}
            imageProps={{ style: { resizeMode: 'cover' } }}
          />
        </View>
        <View style={styles.infoContainer}>
          <View style={styles.topRow}>
            <View style={styles.titleContainer}>
              <Text style={styles.titlePrefix}>
                {isBuyer ? `Pedido a:` : `Pedido de:`}
              </Text>
              <Text style={styles.title} numberOfLines={1}>
                {displayName}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: currentStatus.color }]}>
              <Text style={styles.statusText}>{currentStatus.text}</Text>
            </View>
          </View>

          <Text style={styles.subtitle} numberOfLines={1}>
            {order.shopping_lists?.title}
          </Text>

          <View style={styles.bottomRow}>
            <Text style={styles.price}>{formatCurrency(order.total_price)}</Text>
            {rating != null && (
              <View style={styles.ratingContainer}>
                <Icon name="star" type="material-community" color={COLORS.primary} size={16}/>
                <Text style={[styles.ratingText, { color: COLORS.primary }]}>{rating.toFixed(1)}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </Card>
  );
}

const createStyles = (colors: typeof COLORS) => StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 12,
    marginHorizontal: 0,
    marginTop: 0,
    marginBottom: 15,
    backgroundColor: colors.card,
    borderWidth: 0,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.00,
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
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 2 },
  titleContainer: { flex: 1 },
  titlePrefix: {
    fontSize: scaleFont(13),
    color: colors.gray,
  },
  title: {
    fontSize: scaleFont(16),
    fontWeight: 'bold',
    color: colors.text,
  },
  subtitle: {
    fontSize: scaleFont(13),
    color: colors.gray,
    marginTop: 4,
    marginBottom: 8,
  },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  price: {
    fontSize: scaleFont(16),
    fontWeight: 'bold',
    color: colors.primary,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.primary}20`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: scaleFont(12),
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  statusText: {
    color: colors.white,
    fontSize: scaleFont(10),
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});
