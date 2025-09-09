// Ruta: src/components/SellerListItem.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card, Avatar, Icon } from '@rneui/themed';
import { COLORS } from '../constants/colors';
import { scaleFont } from '../utils/responsive';

const InfoRow = ({ iconName, text }: { iconName: any; text: string | number }) => (
  <View style={styles.infoRow}>
    <Icon name={iconName} type="material-community" color={COLORS.secondary} size={16} />
    <Text style={styles.infoText}>{text}</Text>
  </View>
);

export function SellerListItem({ list }: { list: any }) {
  const buyerProfile = list.buyer_profiles;
  const displayName = buyerProfile?.nombre ? `${buyerProfile.nombre} ${buyerProfile.apellido || ''}`.trim() : 'Comprador';
  const displayAvatar = buyerProfile?.foto_perfil;
  const dispatchDate = list.delivery_date 
    ? new Date(list.delivery_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) 
    : 'No especificada';

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
          <Text style={styles.title} numberOfLines={1}>{list.title}</Text>
          <Text style={styles.subtitle}>de: {displayName}</Text>
          <View style={styles.metadataContainer}>
            <InfoRow iconName="cash" text={`$${list.min_budget || 0} - $${list.max_budget || 'N/A'}`} />
            <InfoRow iconName="format-list-numbered" text={`${list.items?.length || 0} artículos`} />
            <InfoRow iconName="calendar-month-outline" text={dispatchDate} />
          </View>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, padding: 12, marginHorizontal: 15, marginBottom: 15, backgroundColor: COLORS.white, elevation: 3 },
  contentContainer: { flexDirection: 'row', alignItems: 'center' },
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
  infoContainer: { flex: 1 },
  title: { fontSize: scaleFont(16), fontWeight: 'bold', color: COLORS.text, marginBottom: 2 },
  subtitle: { fontSize: scaleFont(13), color: COLORS.gray, marginBottom: 8 },
  metadataContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginRight: 12, marginBottom: 4 },
  infoText: { marginLeft: 5, fontSize: scaleFont(12), color: COLORS.text },
});