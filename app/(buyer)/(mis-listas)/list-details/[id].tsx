import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity, LayoutAnimation, UIManager, Platform, Alert, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Card, Button, Icon, BottomSheet, ListItem } from '@rneui/themed';
import { ShoppingListService } from '../../../../src/services/shoppingList.service';
import { COLORS } from '../../../../constants/Colors';
import { scaleFont } from '../../../../src/utils/responsive';
import { ShoppingList, ShoppingListItem, Offer, OfferItem } from '../../../../src/types/entities';
import { translateDeliveryType } from '../../../../src/utils/translations';
import { formatCurrency } from '../../../../src/utils/formatters';
import { RecentReviews } from '../../../../src/components/RecentReviews';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Helper para parsear el item_name (Formato extendido: Nombre__ID__uuid__IMG__UrlComprador__SELLERIMG__UrlVendedor)
const parseItemName = (itemName: string) => {
  const sellerParts = itemName.split('__SELLERIMG__');
  const imgParts = sellerParts[0].split('__IMG__');
  const nameAndIdParts = imgParts[0].split('__ID__');
  
  let buyerImageUrl = imgParts.length > 1 ? imgParts[1] : null;
  let sellerImageUrl = sellerParts.length > 1 ? sellerParts[1] : null;
  
  if (buyerImageUrl === 'null') buyerImageUrl = null;
  if (sellerImageUrl === 'null') sellerImageUrl = null;

  return {
    displayName: nameAndIdParts[0],
    buyerImageUrl: buyerImageUrl,
    sellerImageUrl: sellerImageUrl,
  };
};

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
      <Card.Divider style={{ marginBottom: 10 }} />
      <Text style={styles.expandedStoreName}>{offer.seller_profiles?.nombre || 'Vendedor'}</Text>
      <View style={styles.ratingRow}>
          <Icon name="star" type="material-community" size={14} color={COLORS.star} />
          <Text style={styles.ratingText}>{offer.seller_profiles?.calificacion_vendedor?.toFixed(1) || 'N/A'}</Text>
      </View>
      <RecentReviews userId={offer.seller_id} role="seller" />
      <Card.Divider style={{ marginVertical: 10 }} />
      {offer.offer_items.map((item: OfferItem, index: number) => {
        const { displayName, buyerImageUrl, sellerImageUrl } = parseItemName(item.item_name);
        return (
          <View key={item.id} style={[styles.offerItemRow, index % 2 === 1 && styles.offerItemRowAlt]}>
            <View style={styles.imageComparisonWrapper}>
                {buyerImageUrl && <Image source={{ uri: buyerImageUrl }} style={styles.offerItemImage} />}
                {sellerImageUrl && (
                    <View style={styles.sellerImageBadgeContainer}>
                        <Image source={{ uri: sellerImageUrl }} style={[styles.offerItemImage, styles.sellerImageOverlay]} />
                        <View style={styles.proposeBadge}>
                            <Icon name="star" type="material-community" size={8} color="white" />
                        </View>
                    </View>
                )}
            </View>
            <View style={styles.offerItemTextContainer}>
              <Text style={styles.offerItemName}>{item.quantity}x {displayName}</Text>
              {sellerImageUrl && <Text style={styles.proposeText}>Vendedor propone este producto</Text>}
            </View>
            <Text style={styles.offerItemPrice}>{formatCurrency(item.unit_price * item.quantity)}</Text>
          </View>
        );
      })}
      <Card.Divider style={{marginTop: 10}}/>
      {offer.notes && <Text style={styles.notes}>Notas del vendedor: {offer.notes}</Text>}
      <Button
        title="Aceptar esta oferta"
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
  
  // Payment Method Modal State
  const [isPaymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedOfferIdForPayment, setSelectedOfferIdForPayment] = useState<string | null>(null);

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

  const handleOpenPaymentModal = (offerId: string) => {
    setSelectedOfferIdForPayment(offerId);
    setPaymentModalVisible(true);
  };

  const handleConfirmAccept = async (paymentMethod: string) => {
    if (!selectedOfferIdForPayment) return;
    
    setPaymentModalVisible(false);
    setIsAccepting(true);
    
    try {
      await ShoppingListService.acceptOffer(selectedOfferIdForPayment, listId as string, paymentMethod);
      Alert.alert("¡Éxito!", "Has aceptado la oferta y se ha creado un nuevo pedido.");
      router.replace({ pathname: '/(buyer)/(mis-pedidos)' });
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setIsAccepting(false);
      setSelectedOfferIdForPayment(null);
    }
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

  const paymentOptions = [
    { title: 'Transferencia Anticipada (Nequi, Daviplata, etc.)', value: 'transferencia_anticipada', icon: 'bank-transfer' },
    { title: 'Efectivo Contra Entrega', value: 'efectivo_contra_entrega', icon: 'cash' },
    { title: 'Transferencia Contra Entrega', value: 'transferencia_contra_entrega', icon: 'cellphone-check' },
  ];

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
    <View style={{flex: 1}}>
      <ScrollView style={styles.container}>
        <Text style={styles.header}>{listDetails.title || 'Detalles de la Lista'}</Text>
        
        <Card containerStyle={styles.card}>
          <Card.Title style={styles.cardTitle}>Resumen de tu lista</Card.Title>
          <Card.Divider/>
          <InfoRow icon="information-outline" text="Estado" value={listDetails.status} />
          <InfoRow icon="cash" text="Presupuesto" value={`${formatCurrency(listDetails.min_budget)} - ${formatCurrency(listDetails.max_budget)}`} />
          <InfoRow icon="truck-delivery-outline" text="Tipo de Entrega" value={translateDeliveryType(listDetails.delivery_type)} />
        </Card>

        <Card containerStyle={styles.card}>
          <Card.Title style={styles.cardTitle}>Artículos que solicitaste</Card.Title>
          <Card.Divider/>
          {(listDetails.items || []).map((item: ShoppingListItem, index: number) => (
            <View key={index} style={styles.itemContainer}>
              {item.image_url && item.image_url !== 'null' && (
                <Image source={{ uri: item.image_url }} style={styles.itemImage} />
              )}
              <View style={styles.itemTextContainer}>
                <Text style={styles.itemName}>{item.name}</Text>
                <View style={styles.itemDetailsRow}>
                    <Text style={styles.itemDetailText}>Cantidad: {item.quantity} {item.unit || ''}</Text>
                    {item.brand && <Text style={styles.itemDetailText}>· Marca: {item.brand}</Text>}
                </View>
                {item.notes && <Text style={styles.itemNotes}>Notas: {item.notes}</Text>}
              </View>
            </View>
          ))}
        </Card>
        
        <View style={styles.offersSection}>
          <Text style={styles.offersHeader}>Ofertas recibidas</Text>
          {offers.length > 0 ? (
            offers.map(offer => (
              <OfferAccordionCard
                key={offer.id}
                offer={offer}
                isExpanded={expandedOfferId === offer.id}
                onToggle={() => handleToggleOffer(offer.id)}
                onAccept={handleOpenPaymentModal}
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

      <BottomSheet isVisible={isPaymentModalVisible} onBackdropPress={() => setPaymentModalVisible(false)}>
        <View style={styles.bottomSheetContainer}>
            <Text style={styles.bottomSheetHeader}>Selecciona el método de pago</Text>
            <Text style={styles.bottomSheetSubHeader}>Acordarás el pago directamente con el vendedor.</Text>
            {paymentOptions.map((l, i) => (
            <ListItem key={i} onPress={() => handleConfirmAccept(l.value)} containerStyle={styles.listItem}>
                <Icon name={l.icon} type="material-community" color={COLORS.primary} />
                <ListItem.Content>
                <ListItem.Title style={styles.listItemTitle}>{l.title}</ListItem.Title>
                </ListItem.Content>
                <ListItem.Chevron />
            </ListItem>
            ))}
            <Button 
                title="Cancelar" 
                type="outline" 
                onPress={() => setPaymentModalVisible(false)} 
                buttonStyle={styles.cancelSheetButton}
                titleStyle={{color: COLORS.danger}}
            />
        </View>
      </BottomSheet>
    </View>
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
    
    itemContainer: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    itemImage: { width: 50, height: 50, borderRadius: 8, marginRight: 15, backgroundColor: '#e9e9e9' },
    itemTextContainer: { flex: 1 },
    itemName: { fontSize: scaleFont(15), fontWeight: '500', color: COLORS.text, marginBottom: 4 },
    itemDetailsRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
    itemDetailText: { fontSize: scaleFont(13), color: COLORS.gray, marginRight: 10 },
    itemNotes: { fontSize: scaleFont(13), color: COLORS.accent, fontStyle: 'italic', marginTop: 4, marginLeft: 5 },
    
    offersSection: { paddingHorizontal: 5, paddingBottom: 30 },
    offersHeader: { fontSize: scaleFont(19), fontWeight: 'bold', color: COLORS.primary, marginLeft: 15, marginBottom: 10 },
    noOffersText: { textAlign: 'center', color: COLORS.gray, marginTop: 20, fontSize: scaleFont(14) },

    offerCard: { 
      borderRadius: 10, 
      marginHorizontal: 10, 
      marginBottom: 10, 
      padding: 0, 
      backgroundColor: '#FFFDE7', // Amarillo muy suave
      elevation: 3,
      borderWidth: 1.5,
      borderColor: '#FBC02D' // Dorado
    },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 12 },
    summaryStore: { flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 10 },
    storeName: { fontSize: scaleFont(16), fontWeight: 'bold', color: COLORS.primary, marginLeft: 10, flexShrink: 1 },
    summaryPriceContainer: { flexDirection: 'row', alignItems: 'center' },
    summaryPrice: { fontSize: scaleFont(17), fontWeight: 'bold', color: COLORS.text, marginRight: 8 },
    
    offerItemsContainer: { paddingTop: 0, paddingBottom: 10 },
    expandedStoreName: { fontSize: scaleFont(15), fontWeight: 'bold', color: COLORS.text, marginLeft: 15 },
    ratingRow: { flexDirection: 'row', alignItems: 'center', marginLeft: 15, marginBottom: 5 },
    ratingText: { fontSize: scaleFont(13), color: COLORS.star, fontWeight: 'bold', marginLeft: 4 },
    offerItemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 15 },
    offerItemImage: { width: 40, height: 40, borderRadius: 6, marginRight: 10, backgroundColor: '#eee' },
    imageComparisonWrapper: { flexDirection: 'row', alignItems: 'center', marginRight: 10 },
    sellerImageBadgeContainer: { marginLeft: -15, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 2 },
    sellerImageOverlay: { borderWidth: 2, borderColor: 'white' },
    proposeBadge: { position: 'absolute', top: -5, right: 5, backgroundColor: COLORS.secondary, borderRadius: 10, padding: 2 },
    proposeText: { fontSize: scaleFont(10), color: COLORS.secondary, fontWeight: 'bold' },
    offerItemTextContainer: { flex: 1 },
    offerItemRowAlt: { backgroundColor: '#f8f9fa' },
    offerItemName: { fontSize: scaleFont(13), color: COLORS.text },
    offerItemPrice: { fontSize: scaleFont(13), fontWeight: '500', color: COLORS.text, marginLeft: 10 },
    notes: { fontStyle: 'italic', color: COLORS.gray, marginTop: 10, marginBottom: 15, fontSize: scaleFont(12), paddingHorizontal: 15 },
    acceptButton: { backgroundColor: COLORS.secondary, borderRadius: 8, marginHorizontal: 15 },
    acceptButtonTitle: { fontSize: scaleFont(14) },
    deleteButton: { backgroundColor: COLORS.danger, borderRadius: 8, marginHorizontal: 15, marginTop: 20 },
    
    bottomSheetContainer: { backgroundColor: 'white', padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
    bottomSheetHeader: { fontSize: scaleFont(18), fontWeight: 'bold', color: COLORS.text, textAlign: 'center', marginBottom: 5 },
    bottomSheetSubHeader: { fontSize: scaleFont(14), color: COLORS.gray, textAlign: 'center', marginBottom: 20 },
    listItem: { borderRadius: 10, marginVertical: 5, backgroundColor: '#f8f9fa' },
    listItemTitle: { fontSize: scaleFont(14), fontWeight: '500', color: COLORS.text },
    cancelSheetButton: { marginTop: 15, borderColor: COLORS.danger, borderWidth: 1, borderRadius: 10 },
});