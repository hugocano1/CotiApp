// app/(seller)/(listas)/list-details/[id].tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, TouchableOpacity, Image } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { ShoppingListService } from '../../../../src/services/shoppingList.service';
import { COLORS } from '../../../../constants/Colors';
import { Icon, Button, Card, ListItem } from '@rneui/themed';
import { scaleFont } from '../../../../src/utils/responsive';
import { ShoppingList, ShoppingListItem } from '../../../../src/types/entities';
import { formatCurrency } from '../../../../src/utils/formatters';
import { RecentReviews } from '../../../../src/components/RecentReviews';

export default function ListDetailsScreen() {
  const { id: listId } = useLocalSearchParams();
  const router = useRouter();
  const [list, setList] = useState<ShoppingList | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof listId === 'string') {
      ShoppingListService.getListDetails(listId)
        .then(setList)
        .catch(err => {
            console.error(err);
            Alert.alert("Error", "No se pudo cargar el detalle de la lista.");
        })
        .finally(() => setLoading(false));
    }
  }, [listId]);

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  if (!list) return <View style={styles.centered}><Text>No se encontró la lista.</Text></View>;

  const buyerProfile = list.buyer_profiles;
  const deliveryType = list.delivery_type === 'delivery' ? 'Domicilio' : 'Recogida en tienda';
  const deliveryDate = list?.delivery_date 
    ? new Date(list.delivery_date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'No especificada';

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: 'Detalle de la Lista' }} />
      
      {/* Perfil del Comprador */}
      <Card containerStyle={styles.card}>
        <View style={styles.buyerHeader}>
            <Icon name="account-circle" type="material-community" size={50} color={COLORS.secondary} />
            <View style={styles.buyerInfo}>
                <Text style={styles.buyerName}>{buyerProfile?.nombre} {buyerProfile?.apellido}</Text>
                <View style={styles.ratingRow}>
                    <Icon name="star" type="material-community" size={16} color={COLORS.star} />
                    <Text style={styles.ratingText}>{buyerProfile?.calificacion_comprador?.toFixed(1) || 'N/A'}</Text>
                </View>
            </View>
        </View>
        <Card.Divider style={{ marginTop: 15 }} />
        <RecentReviews userId={list.buyer_id} role="buyer" />
      </Card>

      {/* Info de la Lista */}
      <Card containerStyle={styles.card}>
        <Card.Title style={styles.listTitle}>{list.title}</Card.Title>
        <Card.Divider />
        <View style={styles.infoRow}>
            <Icon name="truck-delivery" type="material-community" size={20} color={COLORS.secondary} />
            <Text style={styles.infoText}>{deliveryType}</Text>
        </View>
        <View style={styles.infoRow}>
            <Icon name="calendar" type="material-community" size={20} color={COLORS.secondary} />
            <Text style={styles.infoText}>{deliveryDate}</Text>
        </View>
        {(list.min_budget || list.max_budget) && (
            <View style={styles.infoRow}>
                <Icon name="cash" type="material-community" size={20} color={COLORS.secondary} />
                <Text style={styles.infoText}>
                    Presupuesto: {list.min_budget ? formatCurrency(list.min_budget) : '?'} - {list.max_budget ? formatCurrency(list.max_budget) : '?'}
                </Text>
            </View>
        )}
      </Card>

      {/* Artículos */}
      <Card containerStyle={styles.card}>
        <Card.Title style={{ color: COLORS.secondary }}>Artículos solicitados</Card.Title>
        <Card.Divider />
        {(list.items as ShoppingListItem[] || []).map((item, index) => (
            <ListItem key={item.id || index} bottomDivider>
                {item.image_url && <Image source={{ uri: item.image_url }} style={styles.itemImage} />}
                <ListItem.Content>
                    <ListItem.Title style={styles.itemName}>{item.name}</ListItem.Title>
                    <ListItem.Subtitle style={styles.itemSub}>{item.quantity} {item.unit} {item.brand ? `• ${item.brand}` : ''}</ListItem.Subtitle>
                </ListItem.Content>
            </ListItem>
        ))}
      </Card>

      <View style={styles.buttonPadding}>
          <Button 
            title="Hacer una Oferta" 
            onPress={() => router.push({ pathname: "/(seller)/(listas)/create-offer", params: { listId: list.id } })}
            buttonStyle={{ backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 12 }}
            titleStyle={{ fontWeight: 'bold' }}
          />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { borderRadius: 12, marginHorizontal: 15, marginBottom: 15, padding: 15 },
  buyerHeader: { flexDirection: 'row', alignItems: 'center' },
  buyerInfo: { marginLeft: 15, flex: 1 },
  buyerName: { fontSize: scaleFont(18), fontWeight: 'bold', color: COLORS.secondary },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  ratingText: { marginLeft: 5, color: COLORS.gray, fontWeight: 'bold' },
  listTitle: { textAlign: 'left', fontSize: scaleFont(20), color: COLORS.secondary },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  infoText: { marginLeft: 10, fontSize: scaleFont(14), color: COLORS.text },
  itemName: { fontWeight: 'bold', color: COLORS.text },
  itemSub: { color: COLORS.gray, fontSize: scaleFont(12) },
  itemImage: { width: 50, height: 50, borderRadius: 8, marginRight: 10 },
  buttonPadding: { padding: 20, paddingBottom: 40 }
});