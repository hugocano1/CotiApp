// Ruta: app/(seller)/(listas)/list-details/[id].tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Image } from 'react-native';
import { useLocalSearchParams, Link } from 'expo-router';
import { Card, Icon } from '@rneui/themed';
import MapView, { Marker } from 'react-native-maps';

import ForwardedButton from '../../../../src/components/ForwardedButton';
import { useColorScheme } from '../../../../components/useColorScheme';
import Colors from '../../../../constants/Colors';
import { ShoppingListService } from '../../../../src/services/shoppingList.service';
import { scaleFont } from '../../../../src/utils/responsive';
import { ShoppingList, ShoppingListItem } from '../../../../src/types/entities';
import { translateDeliveryType } from '../../../../src/utils/translations';

type ThemeColors = typeof Colors.light;

interface InfoRowProps {
  icon: string;
  text: string;
  value: string | number;
  themeColors: ThemeColors;
}

export default function SellerListDetailsScreen() {
  const { id } = useLocalSearchParams();
  const listId = Array.isArray(id) ? id[0] : id;
  
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];
  const styles = createStyles(themeColors);

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

  const showMap = listDetails?.delivery_type === 'delivery' && listDetails.latitude && listDetails.longitude;

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color={themeColors.tint} /></View>;
  }
  if (!listDetails) {
    return <View style={styles.centered}><Text style={styles.infoTextValue}>No se encontraron los detalles de la lista.</Text></View>;
  }

  return (
    <View style={{flex: 1, backgroundColor: themeColors.background}}>
        <ScrollView style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.header}>{listDetails.title || 'Detalles de la Lista'}</Text>
                {listDetails.buyer_profiles && <Text style={styles.buyerName}>De: {listDetails.buyer_profiles.nombre} {listDetails.buyer_profiles.apellido}</Text>}
            </View>
            
            <Card containerStyle={styles.card}>
                <Card.Title style={styles.cardTitle}>Información general</Card.Title>
                <Card.Divider color={themeColors.border} />
                <InfoRow icon="calendar-outline" text="Fecha Despacho:" value={dispatchDate} themeColors={themeColors}/>
                <InfoRow icon="cash" text="Presupuesto:" value={`$${listDetails.min_budget || 'N/A'} - $${listDetails.max_budget || 'N/A'}`} themeColors={themeColors} />
                <InfoRow icon="truck-delivery-outline" text="Entrega:" value={translateDeliveryType(listDetails.delivery_type)} themeColors={themeColors} />
            </Card>

            {showMap && (
              <Card containerStyle={styles.card}>
                <Card.Title style={styles.cardTitle}>Ubicación de entrega</Card.Title>
                <Card.Divider color={themeColors.border}/>
                <View style={styles.mapContainer}>
                  <MapView
                    style={styles.map}
                    initialRegion={{
                      latitude: listDetails.latitude!,
                      longitude: listDetails.longitude!,
                      latitudeDelta: 0.01,
                      longitudeDelta: 0.01,
                    }}
                  >
                    <Marker
                      coordinate={{ latitude: listDetails.latitude!, longitude: listDetails.longitude! }}
                      title="Ubicación de entrega"
                    />
                  </MapView>
                </View>
              </Card>
            )}
            
            <Text style={styles.sectionHeader}>Artículos Solicitados</Text>
            {(listDetails.items || []).map((item: ShoppingListItem, index: number) => (
                <Card key={index} containerStyle={styles.itemCard}>
                    <View style={styles.itemCardRow}>
                        {item.image_url && (
                            <Image source={{ uri: item.image_url }} style={styles.itemImage} />
                        )}
                        <View style={styles.itemDetailsColumn}>
                            <Text style={styles.itemName}>{item.name}</Text>
                            {item.brand && 
                                <View style={styles.metaItem}>
                                    <Icon name="tag-outline" type="material-community" color={Colors.light.tabIconDefault} size={14} />
                                    <Text style={styles.itemMetaText}>{item.brand}</Text>
                                </View>
                            }
                            {item.notes && 
                                <View style={styles.metaItem}>
                                    <Icon name="information-outline" type="material-community" color={Colors.light.tabIconDefault} size={14} />
                                    <Text style={styles.itemNotes}>{item.notes}</Text>
                                </View>
                            }
                        </View>
                        <View style={[styles.itemQuantityColumn, { borderLeftColor: themeColors.border }]}>
                            <Text style={[styles.itemQuantityText, { color: themeColors.tint }]}>{item.quantity}</Text>
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
                    <ForwardedButton 
                        title="Hacer una oferta" 
                        buttonStyle={styles.actionButton}
                        icon={<Icon name="tag-plus-outline" type="material-community" color={Colors.dark.text} containerStyle={{marginRight: 10}} />}
                    />
                </Link>
            ) : (
                <Text style={styles.closedText}>Esta lista ya no acepta ofertas.</Text>
            )}
        </View>
    </View>
  );
}

const InfoRow = ({ icon, text, value, themeColors }: InfoRowProps) => {
    const styles = createStyles(themeColors);
    return (
        <View style={styles.infoRow}>
            <Icon name={icon} type="material-community" color={themeColors.text} size={18} />
            <Text style={styles.infoTextLabel}>{text}</Text>
            <Text style={styles.infoTextValue}>{value}</Text>
        </View> 
    );
};

const createStyles = (themeColors: ThemeColors) => StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: themeColors.background },
  headerContainer: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 10, backgroundColor: themeColors.card, borderBottomWidth: 1, borderBottomColor: themeColors.border },
  header: { fontSize: scaleFont(20), fontWeight: 'bold', textAlign: 'center', color: themeColors.text, flexShrink: 1 },
  buyerName: { fontSize: scaleFont(13), textAlign: 'center', color: Colors.light.tabIconDefault, marginTop: 4 },
  card: { borderRadius: 12, marginHorizontal: 15, marginTop: 15, paddingBottom: 10, backgroundColor: themeColors.card, borderWidth: 1, borderColor: themeColors.border },
  cardTitle: { fontSize: scaleFont(16), color: themeColors.text, fontWeight: '600' },
  sectionHeader: { fontSize: scaleFont(16), fontWeight: '600', color: themeColors.text, marginHorizontal: 20, marginTop: 20, marginBottom: 5 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  infoTextLabel: { marginLeft: 10, fontSize: scaleFont(14), color: Colors.light.tabIconDefault },
  infoTextValue: { marginLeft: 5, fontSize: scaleFont(14), color: themeColors.text, fontWeight: '500' },
  mapContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 10,
    backgroundColor: themeColors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: themeColors.border
  },
  map: { ...StyleSheet.absoluteFillObject },
  itemCard: { borderRadius: 10, marginHorizontal: 15, marginBottom: 10, padding: 12, backgroundColor: themeColors.card, borderWidth: 1, borderColor: themeColors.border },
  itemCardRow: { flexDirection: 'row', alignItems: 'center' },
  itemImage: { width: 45, height: 45, borderRadius: 8, marginRight: 12, backgroundColor: themeColors.background },
  itemDetailsColumn: { flex: 1, paddingRight: 10 },
  itemQuantityColumn: { alignItems: 'center', justifyContent: 'center', paddingLeft: 10, borderLeftWidth: 1 },
  itemName: { fontSize: scaleFont(15), fontWeight: '600', color: themeColors.text, marginBottom: 6 },
  metaItem: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  itemMetaText: { fontSize: scaleFont(12), color: Colors.light.tabIconDefault, marginLeft: 5 },
  itemNotes: { fontSize: scaleFont(12), color: themeColors.text, fontStyle: 'italic', marginLeft: 5 },
  itemQuantityText: { fontSize: scaleFont(18), fontWeight: 'bold' },
  itemUnitText: { fontSize: scaleFont(12), color: Colors.light.tabIconDefault },
  footer: { padding: 15, backgroundColor: themeColors.card, borderTopWidth: 1, borderTopColor: themeColors.border },
  actionButton: { backgroundColor: themeColors.tint, borderRadius: 10, paddingVertical: 10 },
  closedText: { textAlign: 'center', fontStyle: 'italic', color: Colors.light.tabIconDefault, fontSize: scaleFont(14) },
});