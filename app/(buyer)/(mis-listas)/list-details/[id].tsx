// app/(buyer)/(mis-listas)/list-details/[id].tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams, Link } from 'expo-router';
import { Card, Button, Icon } from '@rneui/themed';
import { ShoppingListService } from '../../../../src/services/shoppingList.service'; // Asegúrate que la ruta sea correcta
import { COLORS } from '../../../../src/constants/colors'; // Asegúrate que la ruta sea correcta

export default function BuyerListDetailsScreen() {
  const { id } = useLocalSearchParams();
  const listId = Array.isArray(id) ? id[0] : id; // Nos aseguramos de que sea un string

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
        <Card.Title>Resumen</Card.Title>
        <Card.Divider/>
        <InfoRow icon="information-outline" text="Estado" value={listDetails.status} />
        <InfoRow icon="cash" text="Presupuesto" value={`$${listDetails.min_budget || 0} - $${listDetails.max_budget || 0}`} />
      </Card>

      <Card containerStyle={styles.card}>
        <Card.Title>Artículos Solicitados</Card.Title>
        <Card.Divider/>
        {(listDetails.items || []).map((item: any, index: number) => (
          <View key={index} style={styles.itemContainer}>
            <Text style={styles.itemName}>- {item.name}</Text>
            <Text style={styles.itemDetails}>Cantidad: {item.quantity || 'N/A'}</Text>
            <Text style={styles.itemDetails}>Detalles: {item.details || 'Ninguno'}</Text>
          </View>
        ))}
      </Card>
      
      <Link 
        href={{
          // Aquí especificamos la ruta base sin el parámetro
          pathname: "/(buyer)/(mis-pedidos)/order-details/[id]", 
          // Y aquí pasamos el valor del parámetro en el objeto 'params'
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
    header: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', padding: 20, color: COLORS.primary },
    card: { borderRadius: 12, marginHorizontal: 15, marginBottom: 15 },
    viewOffersButton: { backgroundColor: COLORS.secondary, margin: 20, borderRadius: 10, paddingVertical: 12 },
    infoRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 5 },
    infoTextLabel: { marginLeft: 10, fontSize: 16, color: COLORS.gray },
    infoTextValue: { marginLeft: 5, fontSize: 16, color: COLORS.text, fontWeight: '500' },
    itemContainer: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    itemName: { fontSize: 16, fontWeight: 'bold' },
    itemDetails: { fontSize: 14, color: COLORS.gray, marginLeft: 15 }
});