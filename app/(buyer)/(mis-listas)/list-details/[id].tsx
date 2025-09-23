// app/(buyer)/(mis-listas)/list-details/[id].tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity, LayoutAnimation, UIManager, Platform, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Card, Button, Icon } from '@rneui/themed';
import { ShoppingListService } from '../../../../src/services/shoppingList.service';
import { COLORS } from '../../../../src/constants/colors';
import { scaleFont } from '../../../../src/utils/responsive';
import { ShoppingList, ShoppingListItem, Offer, OfferItem } from '../../../../src/types/entities';
import { translateDeliveryType } from '../../../../src/utils/translations';
import { formatCurrency } from '../../../../src/utils/formatters';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const InfoRow = ({ icon, text, value }: { icon: string; text: string; value: string | number; }) => (
  <View style={styles.infoRow}>
    <Icon name={icon} type="material-community" color={COLORS.secondary} size={18} />
    <Text style={styles.infoTextLabel}>{text}:</Text>
    <Text style={styles.infoTextValue}>{value}</Text>
  </View>
);

const OfferAccordionCard = ({ offer, isExpanded, onToggle, onAccept }: { offer: Offer; isExpanded: boolean; onToggle: () => void; onAccept: (offerId: string) => void; }) => {
  
  const renderOfferItems = () => (
    <View style={styles.offerItemsContainer}>
      {offer.offer_items.map((item: OfferItem, index: number) => (
        <View key={item.id} style={[styles.offerItemRow, index % 2 === 1 && styles.offerItemRowAlt]}>
          <Text style={styles.offerItemName}>{item.quantity}x {item.item_name}</Text>
          <Text style={styles.offerItemPrice}>{formatCurrency(item.unit_price * item.quantity)}</Text>
        </View>
      ))}
      {/* ✅ MOSTRAR COSTO DE ENVÍO */}
      {/* {offer.shipping_cost && offer.shipping_cost > 0 && (
        <View style={[styles.offerItemRow, styles.shippingCostRow]}>
          <Text style={styles.offerItemName}>Costo de envío</Text>
          <Text style={styles.offerItemPrice}>{formatCurrency(offer.shipping_cost)}</Text>
        </View>
      )} */}
      <Card.Divider style={{marginTop: 10}}/>
      {offer.notes && <Text style={styles.notes}>Notas del vendedor: {offer.notes}</Text>}
      <Button
        title="Aceptar esta Oferta"
        onPress={() => onAccept(offer.id)}
        buttonStyle={styles.acceptButton}
        titleStyle={styles.acceptButtonTitle}
        icon={<Icon name="check-circle-outline" type="material-community" color="white" size={16} containerStyle={{marginRight: 8}}/>}
      />
    </View>
  );

  return (
    <Card containerStyle={styles.offerCard}>
      <TouchableOpacity onPress={onToggle} activeOpacity={0.8}>
        <View style={styles.summaryRow}>
            <View style={styles.summaryStore}>
                <Icon name="storefront-outline" type="material-community" color={COLORS.primary} size={22} />
                <Text style={styles.storeName}>{offer.seller_profiles?.stores?.name || 'Vendedor'}</Text>
            </View>
            <View style={styles.summaryPriceContainer}>
                <Text style={styles.summaryPrice}>{formatCurrency(offer.price)}</Text>
                <Icon name={isExpanded ? 'chevron-up' : 'chevron-down'} type="material-community" color={COLORS.gray} size={22}/>
            </View>
        </View>
      </TouchableOpacity>
      {isExpanded && renderOfferItems()}
    </Card>
  );
};


export default function BuyerListDetailsScreen() {
  const { id } = useLocalSearchParams();
  const listId = Array.isArray(id) ? id[0] : id;
  const router = useRouter();

  const [listDetails, setListDetails] = useState<ShoppingList | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOfferId, setExpandedOfferId] = useState<string | null>(null);
  const [isAccepting, setIsAccepting] = useState(false);

  useEffect(() => {
    if (listId) {
      setLoading(true);
      Promise.all([
        ShoppingListService.getListDetails(listId),
        ShoppingListService.getOffersForList(listId),
      ]).then(([listData, offersData]) => {
        setListDetails(listData);
        setOffers(offersData);
      }).catch(err => {
        console.error("Error fetching data:", err);
        Alert.alert("Error", "No se pudieron cargar los datos de la lista y las ofertas.");
      }).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [listId]);

  const handleToggleOffer = (offerId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedOfferId(currentId => (currentId === offerId ? null : offerId));
  };

  const handleAcceptOffer = async (offerId: string) => {
    Alert.alert(
      "Aceptar Oferta",
      "¿Estás seguro de que quieres aceptar esta oferta? Las demás serán rechazadas y la lista se cerrará.",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Sí, Aceptar", onPress: async () => {
          setIsAccepting(true);
          try {
            await ShoppingListService.acceptOffer(offerId, listId as string);
            Alert.alert("¡Éxito!", "Has aceptado la oferta y se ha creado un nuevo pedido.");
            router.replace({ pathname: '/(buyer)/(mis-pedidos)' });
          } catch (error: any) {
            Alert.alert("Error", error.message);
          } finally {
            setIsAccepting(false);
          }
        }}
      ]
    );
  };

  const handleDeleteList = async () => {
    Alert.alert(
      "Eliminar Lista",
      "¿Estás seguro de que quieres eliminar esta lista de compras? Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Sí, Eliminar", onPress: async () => {
          setLoading(true);
          try {
            await ShoppingListService.deleteShoppingList(listId as string);
            Alert.alert("¡Éxito!", "La lista de compras ha sido eliminada.");
            router.replace({ pathname: '/(buyer)/(mis-listas)' });
          } catch (error: any) {
            Alert.alert("Error", error.message);
          } finally {
            setLoading(false);
          }
        }}
      ]
    );
  };

  if (loading || isAccepting) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        {isAccepting && <Text style={{marginTop: 10, color: COLORS.gray}}>Finalizando la lista...</Text>}
      </View>
    );
  }

  if (!listDetails) {
    return <View style={styles.centered}><Text>No se encontraron los detalles de la lista.</Text></View>;
  }

  const canDelete = listDetails.status === 'active' && offers.length === 0;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>{listDetails.title || 'Detalles de la Lista'}</Text>
      
      <Card containerStyle={styles.card}>
        <Card.Title style={styles.cardTitle}>Resumen de tu Lista</Card.Title>
        <Card.Divider/>
        <InfoRow icon="information-outline" text="Estado" value={listDetails.status} />
        <InfoRow icon="cash" text="Presupuesto" value={`${formatCurrency(listDetails.min_budget)} - ${formatCurrency(listDetails.max_budget)}`} />
        <InfoRow icon="truck-delivery-outline" text="Tipo de Entrega" value={translateDeliveryType(listDetails.delivery_type)} />
      </Card>

      <Card containerStyle={styles.card}>
        <Card.Title style={styles.cardTitle}>Artículos que Solicitaste</Card.Title>
        <Card.Divider/>
        {(listDetails.items || []).map((item: ShoppingListItem, index: number) => (
          <View key={index} style={styles.itemContainer}>
            <Text style={styles.itemName}>{item.name}</Text>
            <View style={styles.itemDetailsRow}>
                <Text style={styles.itemDetailText}>Cantidad: {item.quantity} {item.unit || ''}</Text>
                {item.brand && <Text style={styles.itemDetailText}>· Marca: {item.brand}</Text>}
            </View>
            {item.notes && <Text style={styles.itemNotes}>Notas: {item.notes}</Text>}
          </View>
        ))}
      </Card>
      
      <View style={styles.offersSection}>
        <Text style={styles.offersHeader}>Ofertas Recibidas</Text>
        {offers.length > 0 ? (
          offers.map(offer => (
            <OfferAccordionCard
              key={offer.id}
              offer={offer}
              isExpanded={expandedOfferId === offer.id}
              onToggle={() => handleToggleOffer(offer.id)}
              onAccept={handleAcceptOffer}
            />
          ))
        ) : (
          <Text style={styles.noOffersText}>Aún no has recibido ofertas para esta lista.</Text>
        )}
      </View>

      {canDelete && (
        <Button 
          title="Borrar Lista"
          onPress={handleDeleteList}
          buttonStyle={styles.deleteButton}
          icon={<Icon name="delete-outline" type="material-community" color="white" containerStyle={{marginRight: 10}} />}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9f9f9' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { fontSize: scaleFont(22), fontWeight: 'bold', textAlign: 'center', paddingVertical: 15, color: COLORS.primary },
    card: { borderRadius: 10, marginHorizontal: 15, marginBottom: 15, paddingBottom: 10 },
    cardTitle: { textAlign: 'left', fontSize: scaleFont(16), color: COLORS.text, marginBottom: 5 },
    infoRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
    infoTextLabel: { marginLeft: 10, fontSize: scaleFont(14), color: COLORS.gray },
    infoTextValue: { marginLeft: 5, fontSize: scaleFont(14), color: COLORS.text, fontWeight: '500' },
    itemContainer: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    itemName: { fontSize: scaleFont(15), fontWeight: '500', color: COLORS.text, marginBottom: 4 },
    itemDetailsRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
    itemDetailText: { fontSize: scaleFont(13), color: COLORS.gray, marginRight: 10 },
    itemNotes: { fontSize: scaleFont(13), color: COLORS.accent, fontStyle: 'italic', marginTop: 4, marginLeft: 5 },
    
    offersSection: { paddingHorizontal: 5, paddingBottom: 30 },
    offersHeader: { fontSize: scaleFont(19), fontWeight: 'bold', color: COLORS.primary, marginLeft: 15, marginBottom: 10 },
    noOffersText: { textAlign: 'center', color: COLORS.gray, marginTop: 20, fontSize: scaleFont(14) },

    offerCard: { borderRadius: 10, marginHorizontal: 10, marginBottom: 10, padding: 0, backgroundColor: '#fff', elevation: 2 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 12 },
    summaryStore: { flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 10 },
    storeName: { fontSize: scaleFont(16), fontWeight: 'bold', color: COLORS.primary, marginLeft: 10, flexShrink: 1 },
    summaryPriceContainer: { flexDirection: 'row', alignItems: 'center' },
    summaryPrice: { fontSize: scaleFont(17), fontWeight: 'bold', color: COLORS.text, marginRight: 8 },
    
    offerItemsContainer: { paddingTop: 0, paddingBottom: 10 },
    offerItemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 15 },
    offerItemRowAlt: { backgroundColor: '#f8f9fa' },
    shippingCostRow: { borderTopWidth: 1, borderTopColor: '#eee', marginTop: 5, paddingTop: 10 },
    offerItemName: { fontSize: scaleFont(13), color: COLORS.text, flex: 1 },
    offerItemPrice: { fontSize: scaleFont(13), fontWeight: '500', color: COLORS.text },
    notes: { fontStyle: 'italic', color: COLORS.gray, marginTop: 10, marginBottom: 15, fontSize: scaleFont(12), paddingHorizontal: 15 },
    acceptButton: { backgroundColor: COLORS.secondary, borderRadius: 8, marginHorizontal: 15 },
    acceptButtonTitle: { fontSize: scaleFont(14) },
    deleteButton: { backgroundColor: COLORS.danger, borderRadius: 8, marginHorizontal: 15, marginTop: 20 },
});