// app/(seller)/(offers)/offer-details/[id].tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Card, Icon } from '@rneui/themed';
import { ShoppingListService } from '../../../../src/services/shoppingList.service';
import { COLORS } from '../../../../src/constants/colors';
import { InfoRow } from '../../../../src/components/InfoRow';
import { scaleFont } from '../../../../src/utils/responsive';

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
  const [details, setDetails] = useState<any>(null);
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
  const buyerName = listInfo?.buyer?.nombre || 'Comprador';
  const deliveryDate = listInfo?.delivery_date
    ? new Date(listInfo.delivery_date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'No especificada';
  const deliveryType = listInfo?.delivery_type === 'delivery' ? 'Domicilio' : 'Recogida en tienda';

  return (
    <ScrollView style={styles.container}>
      <Card containerStyle={styles.card}>
        <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>Oferta para: {buyerName}</Text>
            <StatusDisplay status={details.status} />
        </View>
        <Card.Divider style={{ marginVertical: 15 }}/>
        
        <InfoRow icon="cash" label="Valor total" value={formatCurrency(details.price)} />
        <InfoRow icon="clock-outline" label="Tiempo de entrega" value={details.deliveryTime || 'No especificado'} />
        {details.notes && <InfoRow icon="note-text-outline" label="Notas" value={details.notes} />}

        <Card.Divider style={{ marginVertical: 15 }}/>

        <Text style={styles.sectionSubtitle}>Detalles de la Lista Original:</Text>
        <InfoRow icon="format-title" label="Título" value={listInfo?.title || 'N/A'} />
        <InfoRow icon="calendar-clock" label="Fecha Solicitada" value={deliveryDate} />
        <InfoRow icon="truck" label="Tipo de Entrega" value={deliveryType} />
        <InfoRow icon="cash-multiple" label="Presupuesto" value={`$${listInfo?.min_budget || 'N/A'} - $${listInfo?.max_budget || 'N/A'}`} />
      </Card>
      
      <Card containerStyle={styles.card}>
        <CardTitle title="Artículos de tu Oferta" iconName="basket" />
        <Card.Divider />
        {(details.offer_items || []).map((item: any, index: number) => (
          <View key={index} style={styles.itemContainer}>
            <View style={styles.itemRow}>
                <Text style={styles.itemName}>{item.item_name}</Text>
                <Text style={styles.itemQuantity}>{item.quantity} {item.unit || ''}</Text>
            </View>
            {item.brand && <Text style={styles.itemDetails}>Marca: {item.brand}</Text>}
            {item.unit_price && <Text style={styles.itemDetails}>Precio Unitario: {formatCurrency(item.unit_price)}</Text>}
          </View>
        ))}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingVertical: 10 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { borderRadius: 16, marginHorizontal: 15, marginBottom: 10, paddingBottom: 15 },
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: scaleFont(18), fontWeight: 'bold', color: COLORS.primary, flex: 1 }, 
  statusDisplay: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 20 }, 
  statusDisplayText: { color: COLORS.white, fontSize: scaleFont(10), fontWeight: 'bold', marginLeft: 6 }, 
  cardTitleContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  cardTitle: { fontSize: scaleFont(16), fontWeight: 'bold', color: COLORS.primary }, 
  sectionSubtitle: { fontSize: scaleFont(14), fontWeight: '500', color: COLORS.text, marginBottom: 10, marginTop: 5 }, 
  itemContainer: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' }, 
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemName: { fontSize: scaleFont(15), fontWeight: '500', color: COLORS.text, flex: 1 }, 
  itemQuantity: { fontSize: scaleFont(15), fontWeight: 'bold', color: COLORS.primary }, 
  itemDetails: { fontSize: scaleFont(13), color: COLORS.gray, marginTop: 4 }, 
});