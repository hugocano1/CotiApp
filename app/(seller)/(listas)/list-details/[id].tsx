// Ruta: app/(seller)/(listas)/list-details/[id].tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams, Link } from 'expo-router';
import { Card, Button, Icon } from '@rneui/themed';
import { ShoppingListService } from '../../../../src/services/shoppingList.service';
import { COLORS } from '../../../../src/constants/colors';
import { scaleFont } from '../../../../src/utils/responsive';
import { ShoppingList, ShoppingListItem } from '../../../../src/types/entities';
import { translateDeliveryType } from '../../../../src/utils/translations';

interface InfoRowProps {
  icon: string;
  text: string;
  value: string | number;
}

export default function SellerListDetailsScreen() {
  const { id } = useLocalSearchParams();
  const listId = Array.isArray(id) ? id[0] : id;

  const [listDetails, setListDetails] = useState<ShoppingList | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (listId) {
      setLoading(true);
      ShoppingListService.getListDetails(listId)
        .then(setListDetails)
        .catch(err => console.error("Error fetching list details:", err))
        .finally(() => setLoading(false));
    }
  }, [listId]);

  const dispatchDate = listDetails?.delivery_date 
    ? new Date(listDetails.delivery_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' }) 
    : 'No especificada';

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  }
  if (!listDetails) {
    return <View style={styles.centered}><Text>No se encontraron los detalles de la lista.</Text></View>;
  }

  return (
    <View style={{flex: 1}}>
        <ScrollView style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.header}>{listDetails.title || 'Detalles de la Lista'}</Text>
                {listDetails.buyer_profiles && <Text style={styles.buyerName}>De: {listDetails.buyer_profiles.nombre} {listDetails.buyer_profiles.apellido}</Text>}
            </View>
            
            <Card containerStyle={styles.card}>
                <Card.Title style={styles.cardTitle}>Información General</Card.Title>
                <Card.Divider/>
                <InfoRow icon="calendar-outline" text="Fecha Despacho:" value={dispatchDate} />
                <InfoRow icon="cash" text="Presupuesto:" value={`$${listDetails.min_budget || 'N/A'} - $${listDetails.max_budget || 'N/A'}`} />
                <InfoRow icon="truck-delivery-outline" text="Entrega:" value={translateDeliveryType(listDetails.delivery_type)} />
            </Card>
            
            <Text style={styles.sectionHeader}>Artículos Solicitados</Text>
            {(listDetails.items || []).map((item: ShoppingListItem, index: number) => (
                <Card key={index} containerStyle={styles.itemCard}>
                    <View style={styles.itemCardRow}>
                        <View style={styles.itemDetailsColumn}>
                            <Text style={styles.itemName}>{item.name}</Text>
                            {item.brand && 
                                <View style={styles.metaItem}>
                                    <Icon name="tag-outline" type="material-community" color={COLORS.gray} size={14} />
                                    <Text style={styles.itemMetaText}>{item.brand}</Text>
                                </View>
                            }
                            {item.notes && 
                                <View style={styles.metaItem}>
                                    <Icon name="information-outline" type="material-community" color={COLORS.gray} size={14} />
                                    <Text style={styles.itemNotes}>{item.notes}</Text>
                                </View>
                            }
                        </View>
                        <View style={styles.itemQuantityColumn}>
                            <Text style={styles.itemQuantityText}>{item.quantity}</Text>
                            <Text style={styles.itemUnitText}>{item.unit || 'unid.'}</Text>
                        </View>
                    </View>
                </Card>
            ))}
        </ScrollView>
        <View style={styles.footer}>
            {listDetails.status === 'active' ? (
                <Link 
                    href={{
                    pathname: "/(seller)/(listas)/create-offer",
                    params: { listId: listId }
                    }} 
                    asChild
                >
                    <Button 
                        title="Hacer una Oferta" 
                        buttonStyle={styles.actionButton}
                        icon={<Icon name="tag-plus-outline" type="material-community" color="white" containerStyle={{marginRight: 10}} />}
                    />
                </Link>
            ) : (
                <Text style={styles.closedText}>Esta lista ya no acepta ofertas.</Text>
            )}
        </View>
    </View>
  );
}

const InfoRow = ({ icon, text, value }: InfoRowProps) => ( 
    <View style={styles.infoRow}>
        <Icon name={icon} type="material-community" color={COLORS.secondary} size={18} />
        <Text style={styles.infoTextLabel}>{text}</Text>
        <Text style={styles.infoTextValue}>{value}</Text>
    </View> 
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerContainer: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 10, backgroundColor: COLORS.white },
  header: { fontSize: scaleFont(20), fontWeight: 'bold', textAlign: 'center', color: COLORS.primary, flexShrink: 1 },
  buyerName: { fontSize: scaleFont(13), textAlign: 'center', color: COLORS.gray, marginTop: 4 },
  card: { borderRadius: 12, marginHorizontal: 15, marginTop: 15, paddingBottom: 10 },
  cardTitle: { fontSize: scaleFont(16), color: COLORS.primary },
  sectionHeader: { fontSize: scaleFont(16), fontWeight: '600', color: COLORS.text, marginHorizontal: 20, marginTop: 20, marginBottom: 5 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  infoTextLabel: { marginLeft: 10, fontSize: scaleFont(14), color: COLORS.gray },
  infoTextValue: { marginLeft: 5, fontSize: scaleFont(14), color: COLORS.text, fontWeight: '500' },
  itemCard: { borderRadius: 10, marginHorizontal: 30, marginBottom: 4, padding: 12 },
  itemCardRow: { flexDirection: 'row', alignItems: 'center' },
  itemDetailsColumn: { flex: 1, paddingRight: 10 },
  itemQuantityColumn: { alignItems: 'center', justifyContent: 'center', paddingLeft: 10, borderLeftWidth: 1, borderLeftColor: COLORS.gray },
  itemName: { fontSize: scaleFont(15), fontWeight: '600', color: COLORS.text, marginBottom: 6 },
  metaItem: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  itemMetaText: { fontSize: scaleFont(12), color: COLORS.gray, marginLeft: 5 },
  itemNotes: { fontSize: scaleFont(12), color: COLORS.accent, fontStyle: 'italic', marginLeft: 5 },
  itemQuantityText: { fontSize: scaleFont(18), fontWeight: 'bold', color: COLORS.primary },
  itemUnitText: { fontSize: scaleFont(12), color: COLORS.gray },
  footer: { padding: 15, backgroundColor: '#ffffff' },
  actionButton: { backgroundColor: COLORS.secondary, borderRadius: 10, paddingVertical: 10 },
  closedText: { textAlign: 'center', fontStyle: 'italic', color: COLORS.gray, fontSize: scaleFont(14) },
});