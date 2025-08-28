// app/(seller)/(listas)/create-offer.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, ActivityIndicator, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ShoppingListService } from '../../../src/services/shoppingList.service';
import { COLORS } from '../../../src/constants/colors';
import { Button, Card, Icon } from '@rneui/themed';

interface ListItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  brand?: string;
  notes?: string;
}

interface Buyer {
    nombre: string;
    apellido: string;
}

interface ShoppingList {
  id: string;
  title: string;
  items: ListItem[];
  buyer: Buyer;
}

export default function CreateOfferScreen() {
  const { listId } = useLocalSearchParams<{ listId: string }>();
  const router = useRouter();

  const [list, setList] = useState<ShoppingList | null>(null);
  const [itemPrices, setItemPrices] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchListDetails = async () => {
      if (!listId) return;
      try {
        setLoading(true);
        const listDetails = await ShoppingListService.getListDetails(listId);
        if (listDetails && listDetails.items) {
          const itemsWithIds = listDetails.items.map((item: any, index: number) => ({ ...item, id: item.id || `item-${index}` }));
          setList({ ...listDetails, items: itemsWithIds });
        } else {
          Alert.alert("Error", "No se pudieron cargar los artículos de la lista.");
        }
      } catch (error: any) {
        Alert.alert("Error", `Error al cargar la lista: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchListDetails();
  }, [listId]);

  const handlePriceChange = (itemId: string, price: string) => {
    setItemPrices(prev => ({ ...prev, [itemId]: price }));
  };

  const total = useMemo(() => {
    if (!list) return 0;
    return list.items.reduce((acc, item) => {
      const price = parseFloat(itemPrices[item.id] || '0');
      return acc + (price * item.quantity);
    }, 0);
  }, [itemPrices, list]);

  const handleSubmitOffer = async () => {
    if (!list) return;

    const itemsWithPrices = list.items.map(item => ({
      ...item,
      price: parseFloat(itemPrices[item.id] || '0'),
    }));

    if (itemsWithPrices.some(item => isNaN(item.price) || item.price <= 0)) {
      Alert.alert("Error de Validación", "Por favor, ingresa un precio válido y mayor a cero para todos los artículos.");
      return;
    }

    setSubmitting(true);
    try {
      await ShoppingListService.createDetailedOffer({
        shopping_list_id: listId!,
        total_price: total,
        notes: notes,
        items: itemsWithPrices,
      });

      Alert.alert("¡Éxito!", "Tu oferta ha sido enviada correctamente.");
      router.back();
    } catch (error: any) {
      Alert.alert("Error al Enviar", `No se pudo enviar la oferta: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  }

  if (!list) {
    return <View style={styles.centered}><Text>No se encontró la lista de compras.</Text></View>;
  }

  const renderItem = ({ item }: { item: ListItem }) => (
    <Card containerStyle={styles.itemCard}>
        <View style={styles.cardRow}>
            {/* Columna Izquierda (Detalles) */}
            <View style={styles.itemDetailsColumn}>
                <Text style={styles.itemName}>{item.name}</Text>
                
                <View style={styles.metaContainer}>
                    <View style={styles.metaItem}>
                        <Icon name="beaker-outline" type="material-community" color={COLORS.gray} size={16} />
                        <Text style={styles.itemMetaText}>{item.quantity} {item.unit || 'unidades'}</Text>
                    </View>
                    {item.brand && (
                        <View style={styles.metaItem}>
                            <Icon name="tag-outline" type="material-community" color={COLORS.gray} size={16} />
                            <Text style={styles.itemMetaText}>{item.brand}</Text>
                        </View>
                    )}
                </View>

                {item.notes && (
                    <View style={styles.notesContainer}>
                        <Icon name="information-outline" type="material-community" color={COLORS.accent} size={16} />
                        <Text style={styles.itemNotes}>{item.notes}</Text>
                    </View>
                )}
            </View>

            {/* Columna Derecha (Precio) */}
            <View style={styles.priceInputColumn}>
                <TextInput
                    style={styles.priceInput}
                    placeholder="$0.00"
                    value={itemPrices[item.id] || ''}
                    onChangeText={(price) => handlePriceChange(item.id, price)}
                    keyboardType="numeric"
                />
                <Text style={styles.priceLabel}>Precio Unit.</Text>
            </View>
        </View>
    </Card>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <View style={styles.header}>
            <Text style={styles.title}>Cotizar para: {list.title}</Text>
            {list.buyer && <Text style={styles.buyerName}>Comprador: {list.buyer.nombre} {list.buyer.apellido}</Text>}
        </View>
      <FlatList
        data={list.items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={{ paddingBottom: 10 }}
      />
      <View style={styles.summaryContainer}>
        <Text style={styles.totalText}>TOTAL DE LA OFERTA: ${total.toFixed(2)}</Text>
        <TextInput
          style={styles.notesInput}
          placeholder="Notas generales de la oferta (opcional)"
          value={notes}
          onChangeText={setNotes}
          multiline
        />
        <Button
          title="Enviar Oferta Detallada"
          onPress={handleSubmitOffer}
          color={COLORS.secondary}
          loading={submitting}
          buttonStyle={styles.button}
          icon={<Icon name="send-outline" type="material-community" color="white"/>}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 10, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.grayLight },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', color: COLORS.primary },
  buyerName: { fontSize: 14, textAlign: 'center', color: COLORS.gray, marginTop: 4 },
  list: { flex: 1 },
  itemCard: { borderRadius: 12, marginHorizontal: 10, marginBottom: 10, padding: 0 },
  cardRow: { flexDirection: 'row', padding: 15 },
  itemDetailsColumn: { flex: 1, paddingRight: 10 },
  priceInputColumn: { alignItems: 'flex-end', justifyContent: 'center' },
  itemName: { fontSize: 18, fontWeight: '600', color: COLORS.text, marginBottom: 12 },
  metaContainer: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', marginBottom: 8 },
  metaItem: { flexDirection: 'row', alignItems: 'center', marginRight: 12, marginBottom: 4 },
  itemMetaText: { fontSize: 14, color: COLORS.gray, marginLeft: 4 },
  notesContainer: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#fffbe6', borderRadius: 8, padding: 10, marginTop: 5 },
  itemNotes: { fontStyle: 'italic', color: '#856404', marginLeft: 8, fontSize: 13, flex: 1 },
  priceInput: { height: 50, width: 110, borderColor: COLORS.gray, borderWidth: 1, paddingHorizontal: 10, borderRadius: 8, backgroundColor: COLORS.white, textAlign: 'right', fontSize: 18, fontWeight: 'bold' },
  priceLabel: { fontSize: 12, color: COLORS.gray, marginTop: 4 },
  summaryContainer: { padding: 15, borderTopWidth: 2, borderTopColor: COLORS.grayLight, backgroundColor: COLORS.white, elevation: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  totalText: { fontSize: 20, fontWeight: 'bold', textAlign: 'right', marginBottom: 10, color: COLORS.primary },
  notesInput: { height: 70, textAlignVertical: 'top', borderColor: COLORS.gray, borderWidth: 1, padding: 10, borderRadius: 8, marginBottom: 10, backgroundColor: '#f8f9fa' },
  button: { borderRadius: 8, paddingVertical: 12 },
});
