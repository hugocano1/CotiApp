// Ruta: src/components/OrderListItem.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card, Avatar, Icon } from '@rneui/themed';
import { COLORS } from '../constants/colors';
import { scaleFont } from '../utils/responsive';

type Props = {
  order: any;
  userRole: 'buyer' | 'seller';
};

const statusConfig = {
  completed: { text: 'Completado', color: COLORS.secondary },
  confirmed: { text: 'Confirmado', color: COLORS.primary },
  enviado: { text: 'Enviado', color: COLORS.accent },
  default: { text: 'Pendiente', color: COLORS.gray },
};

export function OrderListItem({ order, userRole }: Props) {
  const isBuyer = userRole === 'buyer';
  const profile = isBuyer ? order.seller_profiles : order.buyer_profiles;
  const storeName = order.seller_profiles?.stores?.name;
  
  const displayName = profile?.nombre ? `${profile.nombre} ${profile.apellido || ''}`.trim() : (storeName || 'Usuario');
  const displayAvatar = profile?.foto_perfil || profile?.store_logo_url;
  const rating = isBuyer ? profile?.calificacion_vendedor : profile?.calificacion_comprador;

  const dispatchDate = order.shopping_lists?.delivery_date
    ? new Date(order.shopping_lists.delivery_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
    : 'No especificada';

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
            <Text style={styles.price}>${order.total_price}</Text>
            {rating && (
              <View style={styles.ratingContainer}>
                <Icon name="star" type="material-community" color={COLORS.accent} size={16} />
                <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
              </View>
            )}
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
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  contentContainer: { 
    flexDirection: 'row', 
    alignItems: 'center',
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 12,
    backgroundColor: COLORS.primary,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: { 
    flex: 1, 
    justifyContent: 'center',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 2,
  },
  titleContainer: {
    flex: 1,
  },
  titlePrefix: { 
    fontSize: scaleFont(13),
    color: COLORS.gray,
  },
  title: {
    fontSize: scaleFont(16),
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subtitle: { 
    fontSize: scaleFont(13), 
    color: COLORS.text,
    marginTop: 4,
    marginBottom: 8,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  price: { 
    fontSize: scaleFont(16), 
    fontWeight: 'bold', 
    color: COLORS.secondary,
  },
  ratingContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 8 
  },
  ratingText: { 
    marginLeft: 4, 
    fontSize: scaleFont(12), 
    fontWeight: 'bold' 
  },
  statusBadge: { 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 8,
    marginLeft: 8,
  },
  statusText: { 
    color: COLORS.white, 
    fontSize: scaleFont(10), 
    fontWeight: 'bold', 
    textTransform: 'uppercase' 
  },
});