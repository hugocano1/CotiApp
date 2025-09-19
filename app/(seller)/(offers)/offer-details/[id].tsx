// app/(seller)/(offers)/offer-details/[id].tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Card, Icon } from '@rneui/themed';
import { ShoppingListService } from '../../../../src/services/shoppingList.service';
import { COLORS } from '../../../../src/constants/colors';
import { InfoRow } from '../../../../src/components/InfoRow';
import { scaleFont } from '../../../../src/utils/responsive';
import { Offer, OfferItem } from '../../../../src/types/entities';

const formatCurrency = (value: number) => {
    return `$${Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
};

const StatusDisplay = ({ status }: { status: string }) => {
    const statusMap = {
        pending: { text: 'Pendiente', color: COLORS.gray, icon: 'clock-outline' },
        accepted: { text: 'Aceptada', color: COLORS.secondary, icon: 'check-circle' },
        rejected: { text: 'Rechazada', color: COLORS.danger, icon: 'close-circle' },
        default: { text: status, color: COLORS.gray, icon: 'help-circle' },
    };
    const currentStatus = statusMap[status as keyof typeof statusMap] || statusMap.default;

    return (
        <View style={[styles.statusDisplay, { backgroundColor: currentStatus.color }]}>
            <Icon name={currentStatus.icon} type="material-community" color={COLORS.white} size={16} />
            <Text style={styles.statusDisplayText}>{currentStatus.text}</Text>
        </View>
    );
};

const CardTitle = ({ title, iconName }: { title: string, iconName?: string }) => (
    <View style={styles.cardTitleContainer}>
        {iconName && <Icon name={iconName} type="material-community" color={COLORS.primary} size={18} containerStyle={{ marginRight: 8 }} />}
        <Text style={styles.cardTitle}>{title}</Text>
    </View>
);

export default function OfferDetailsScreen() {
  const { id: offerId } = useLocalSearchParams();
  const [details, setDetails] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof offerId === 'string') {
      ShoppingListService.getOfferDetails(offerId)
        .then(setDetails)
        .catch(err => {
            console.error(err);
            Alert.alert("Error", "No se pudieron cargar los detalles de la oferta.");
        })
        .finally(() => setLoading(false));
    }
  }, [offerId]);

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  }

  if (!details) {
    return <View style={styles.centered}><Text>No se encontraron los detalles de la oferta.</Text></View>;
  }

  const listInfo = details.shopping_lists;
  const buyerName = listInfo?.buyer_profiles?.nombre || 'Comprador';

  // 1. Calculate total from items (new system)
  const calculatedTotal = (details.offer_items || []).reduce((sum: number, item: OfferItem) => {
    const itemTotal = (item.unit_price || 0) * (item.quantity || 1);
    return sum + itemTotal;
  }, 0);

  // 2. Determine final price: use calculated if available, otherwise fall back to old 'price' field
  const finalTotalPrice = calculatedTotal > 0 ? calculatedTotal : (details.price || 0);

  const deliveryDate = listInfo?.delivery_date
    ? new Date(listInfo.delivery_date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'No especificada';
  const deliveryType = listInfo?.delivery_type === 'delivery' ? 'Domicilio' : 'Recogida en tienda';

  return (
    <ScrollView style={styles.container}>
      {/* Card 1: MORE Compact Header Info */}
      <Card containerStyle={styles.compactCard}>
        <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>Oferta para: {buyerName}</Text>
            <StatusDisplay status={details.status} />
        </View>
        <Card.Divider style={{ marginVertical: 8 }}/>
        <View style={styles.compactInfoRow}>
          <Icon name="clock-outline" type="material-community" color={COLORS.secondary} size={16} />
          <Text style={styles.compactLabel}>Tiempo de entrega:</Text>
          <Text style={styles.compactValue}>{details.deliveryTime || 'No especificado'}</Text>
        </View>
        {details.notes && (
          <View style={styles.compactInfoRow}>
            <Icon name="note-text-outline" type="material-community" color={COLORS.secondary} size={16} />
            <Text style={styles.compactLabel}>Notas:</Text>
            <Text style={styles.compactValue}>{details.notes}</Text>
          </View>
        )}
      </Card>

      {/* Card 2: Original List Details */}
      {/* Card 2: Original List Details (NOW COMPACT) */}
      <Card containerStyle={styles.compactCard}>
        <CardTitle title="Detalles de la Lista Original" />
        <Card.Divider style={{ marginVertical: 8 }}/>
        <View style={styles.compactInfoRow}>
          <Icon name="format-title" type="material-community" color={COLORS.secondary} size={16} />
          <Text style={styles.compactLabel}>Título:</Text>
          <Text style={styles.compactValue}>{listInfo?.title || 'N/A'}</Text>
        </View>
        <View style={styles.compactInfoRow}>
          <Icon name="calendar-clock" type="material-community" color={COLORS.secondary} size={16} />
          <Text style={styles.compactLabel}>Fecha Solicitada:</Text>
          <Text style={styles.compactValue}>{deliveryDate}</Text>
        </View>
        <View style={styles.compactInfoRow}>
          <Icon name="truck" type="material-community" color={COLORS.secondary} size={16} />
          <Text style={styles.compactLabel}>Tipo de Entrega:</Text>
          <Text style={styles.compactValue}>{deliveryType}</Text>
        </View>
        <View style={styles.compactInfoRow}>
          <Icon name="cash-multiple" type="material-community" color={COLORS.secondary} size={16} />
          <Text style={styles.compactLabel}>Presupuesto:</Text>
          <Text style={styles.compactValue}>{`${listInfo?.min_budget || 'N/A'} - ${listInfo?.max_budget || 'N/A'}`}</Text>
        </View>
      </Card>
      
      {/* Card 3: Itemized Offer (if it exists) */}
      {details.offer_items && details.offer_items.length > 0 && (
        <Card containerStyle={styles.card}>
          <CardTitle title="Artículos de tu Oferta" iconName="basket" />
          <Card.Divider />
          {details.offer_items.map((item: OfferItem, index: number) => (
            <View key={index} style={styles.itemContainer}>
              <View style={styles.itemRowTop}>
                <Text style={styles.itemName}>{item.item_name}</Text>
                {item.unit_price && <Text style={styles.itemPrice}>{formatCurrency(item.unit_price)}</Text>}
              </View>
              <View style={styles.itemRowBottom}>
                <Text style={styles.itemDetails}>Cantidad: {item.quantity} {item.unit || ''}</Text>
                {item.brand && <Text style={styles.itemDetails}>Marca: {item.brand}</Text>}
              </View>
            </View>
          ))}
        </Card>
      )}

      {/* Footer: Final Total Price */}
      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>VALOR TOTAL DE LA OFERTA</Text>
        <Text style={styles.totalValue}>{formatCurrency(finalTotalPrice)}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingVertical: 10 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { borderRadius: 16, marginHorizontal: 15, marginBottom: 10, paddingBottom: 10 },
  compactCard: { borderRadius: 16, marginHorizontal: 15, marginBottom: 10, paddingVertical: 10, paddingHorizontal: 15 },
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: scaleFont(15), fontWeight: 'bold', color: COLORS.primary, flex: 1 }, 
  statusDisplay: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 20 }, 
  statusDisplayText: { color: COLORS.white, fontSize: scaleFont(10), fontWeight: 'bold', marginLeft: 6 }, 
  cardTitleContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  cardTitle: { fontSize: scaleFont(16), fontWeight: 'bold', color: COLORS.primary }, 
  
  // Compact styles for top card
  compactInfoRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  compactLabel: { marginLeft: 10, fontSize: scaleFont(13), color: COLORS.gray },
  compactValue: { marginLeft: 8, fontSize: scaleFont(13), fontWeight: '500', flex: 1, textAlign: 'right' },

  itemContainer: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' }, 
  itemRowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  itemRowBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  itemName: { fontSize: scaleFont(15), fontWeight: '500', color: COLORS.text, flex: 1, marginRight: 10 }, 
  itemPrice: { fontSize: scaleFont(15), fontWeight: 'bold', color: COLORS.primary },
  itemDetails: { fontSize: scaleFont(13), color: COLORS.gray }, 

  totalContainer: {
    margin: 15,
    marginTop: 10,
    padding: 20,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  totalLabel: {
    fontSize: scaleFont(12),
    fontWeight: '600',
    color: COLORS.white,
    opacity: 0.8,
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  totalValue: {
    fontSize: scaleFont(28),
    fontWeight: 'bold',
    color: COLORS.white,
  },
});