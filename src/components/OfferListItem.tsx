// Ruta: src/components/OfferListItem.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card, Avatar } from '@rneui/themed';
import { COLORS } from '../constants/colors';
import { scaleFont } from '../utils/responsive';

const statusConfig = {
  accepted: { text: 'Aceptada', color: COLORS.secondary },
  rejected: { text: 'Rechazada', color: COLORS.danger },
  enviada: { text: 'Enviada', color: COLORS.accent },
  default: { text: 'Enviada', color: COLORS.accent },
};

export function OfferListItem({ offer }: { offer: any }) {
  const buyerProfile = offer.shopping_lists?.buyer_profiles;
  const displayName = buyerProfile ? `${buyerProfile.nombre} ${buyerProfile.apellido || ''}`.trim() : 'Comprador';
  const displayAvatar = buyerProfile?.foto_perfil;
  const currentStatus = statusConfig[offer.status as keyof typeof statusConfig] || statusConfig.default;

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
            <View>
              <Text style={styles.titlePrefix}>Oferta para:</Text>
              <Text style={styles.title} numberOfLines={1}>{displayName}</Text>
            </View>
            <Text style={styles.subtitle} numberOfLines={1}>{offer.shopping_lists?.title || 'Lista no disponible'}</Text>
            <Text style={styles.price}>${offer.price}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: currentStatus.color }]}>
          <Text style={styles.statusText}>{currentStatus.text}</Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, padding: 12, marginHorizontal: 15, marginBottom: 15, backgroundColor: COLORS.white, elevation: 2 },
  contentContainer: { flexDirection: 'row', alignItems: 'center' },
  avatarContainer: { width: 64, height: 64, borderRadius: 32, marginRight: 12, backgroundColor: COLORS.primary, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  infoContainer: { flex: 1, justifyContent: 'center' },
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
    color: COLORS.gray, 
    marginTop: 4, 
    marginBottom: 6 
  },
  price: { fontSize: scaleFont(16), fontWeight: 'bold', color: COLORS.secondary },
  statusBadge: { position: 'absolute', top: -12, right: -12, paddingHorizontal: 10, paddingVertical: 4, borderTopRightRadius: 16, borderBottomLeftRadius: 12 },
  statusText: { color: COLORS.white, fontSize: scaleFont(10), fontWeight: 'bold', textTransform: 'uppercase' },
});