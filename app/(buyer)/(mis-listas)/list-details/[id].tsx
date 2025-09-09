// app/(buyer)/(mis-listas)/list-details/[id].tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams, Link } from 'expo-router';
import { Card, Button, Icon } from '@rneui/themed';
import { ShoppingListService } from '../../../../src/services/shoppingList.service';
import { COLORS } from '../../../../src/constants/colors';
import { scaleFont } from '../../../../src/utils/responsive';

export default function BuyerListDetailsScreen() {
  const { id } = useLocalSearchParams();
  const listId = Array.isArray(id) ? id[0] : id;

  const [listDetails, setListDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (listId) {
      setLoading(true);
      ShoppingListService.getListDetails(listId)
        .then(setListDetails)
        .catch(err => console.error("Error fetching list details:", err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [listId]);

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  }

  if (!listDetails) {
    return <View style={styles.centered}><Text>No se encontraron los detalles de la lista.</Text></View>;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>{listDetails.title || 'Detalles de la Lista'}</Text>
      
      <Card containerStyle={styles.card}>
        <Card.Title>Resumen de la Lista</Card.Title>
        <Card.Divider/>
        <InfoRow icon="information-outline" text="Estado" value={listDetails.status} />
        <InfoRow icon="cash" text="Presupuesto" value={`$${listDetails.min_budget || 'N/A'} - $${listDetails.max_budget || 'N/A'}`} />
        <InfoRow icon="truck-delivery-outline" text="Tipo de Entrega" value={listDetails.delivery_type || 'No especificado'} />
      </Card>

      <Card containerStyle={styles.card}>
        <Card.Title>Artículos Solicitados</Card.Title>
        <Card.Divider/>
        {(listDetails.items || []).map((item: any, index: number) => (
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
      
      <Link 
        href={{
          pathname: `/(buyer)/(mis-pedidos)/order-details/[id]`,
          params: { id: listId } 
        }}
        asChild
        >
        <Button 
         title="Ver Ofertas Recibidas" 
          buttonStyle={styles.viewOffersButton}
          icon={<Icon name="tag-multiple" type="material-community" color="white" containerStyle={{marginRight: 10}}/>}
        />
      </Link>
    </ScrollView>
  );
}

const InfoRow = ({ icon, text, value }: any) => (
  <View style={styles.infoRow}>
    <Icon name={icon} type="material-community" color={COLORS.secondary} size={20} />
    <Text style={styles.infoTextLabel}>{text}:</Text>
    <Text style={styles.infoTextValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { fontSize: scaleFont(24), fontWeight: 'bold', textAlign: 'center', padding: 20, color: COLORS.primary },
    card: { borderRadius: 12, marginHorizontal: 15, marginBottom: 15 },
    viewOffersButton: { backgroundColor: COLORS.secondary, margin: 20, borderRadius: 10, paddingVertical: 12 },
    infoRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 5 },
    infoTextLabel: { marginLeft: 10, fontSize: scaleFont(16), color: COLORS.gray },
    infoTextValue: { marginLeft: 5, fontSize: scaleFont(16), color: COLORS.text, fontWeight: '500' },
    itemContainer: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    itemName: { fontSize: scaleFont(16), fontWeight: 'bold', color: COLORS.text, marginBottom: 5 },
    itemDetailsRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
    itemDetailText: { fontSize: scaleFont(14), color: COLORS.gray, marginRight: 10 },
    itemNotes: { fontSize: scaleFont(14), color: COLORS.accent, fontStyle: 'italic', marginTop: 5, marginLeft: 5 }
});