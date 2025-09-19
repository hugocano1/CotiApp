// app/(seller)/(listas)/create-offer.tsx
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, ActivityIndicator, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ShoppingListService } from '../../../src/services/shoppingList.service';
import { COLORS } from '../../../src/constants/colors';
import { Button, Card, Icon } from '@rneui/themed';
import { scaleFont } from '../../../src/utils/responsive';
import { ShoppingList, ShoppingListItem, OfferItem } from '../../../src/types/entities';

interface OfferItemCardProps {
    item: ShoppingListItem;
    price: string;
    onPriceChange: (itemId: string, price: string) => void;
}

const OfferItemCard = React.memo(({ item, price, onPriceChange }: OfferItemCardProps) => {
    const handleTextChange = useCallback((newPrice: string) => {
        onPriceChange(item.id, newPrice);
    }, [onPriceChange, item.id]);

    return (
        <Card containerStyle={styles.itemCard}>
            <View style={styles.cardRow}>
                <View style={styles.itemDetailsColumn}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <View style={styles.metaContainer}>
                        <View style={styles.metaItem}>
                            <Icon name="beaker-outline" type="material-community" color={COLORS.gray} size={14} />
                            <Text style={styles.itemMetaText}>{item.quantity} {item.unit || 'unidades'}</Text>
                        </View>
                        {item.brand && (
                            <View style={styles.metaItem}>
                                <Icon name="tag-outline" type="material-community" color={COLORS.gray} size={14} />
                                <Text style={styles.itemMetaText}>{item.brand}</Text>
                            </View>
                        )}
                    </View>
                    {item.notes && (
                        <View style={styles.notesContainer}>
                            <Icon name="information-outline" type="material-community" color={COLORS.accent} size={14} />
                            <Text style={styles.itemNotes}>{item.notes}</Text>
                        </View>
                    )}
                </View>
                <View style={styles.priceInputColumn}>
                    <TextInput
                        style={styles.priceInput}
                        placeholder="$0.00"
                        value={price}
                        onChangeText={handleTextChange}
                        keyboardType="numeric"
                    />
                    <Text style={styles.priceLabel}>Precio Unit.</Text>
                </View>
            </View>
        </Card>
    );
});


export default function CreateOfferScreen() {
    const { listId } = useLocalSearchParams<{ listId: string }>();
    const router = useRouter();

    const [list, setList] = useState<ShoppingList | null>(null);
    const [itemPrices, setItemPrices] = useState<Record<string, string>>({});
    const notesRef = useRef('');
    const flatListRef = useRef<FlatList<ShoppingListItem>>(null);
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

    const handlePriceChange = useCallback((itemId: string, price: string) => {
        setItemPrices(prev => ({ ...prev, [itemId]: price }));
    }, []);

    const total = useMemo(() => {
        if (!list) return 0;
        return list.items.reduce((acc, item) => {
            const price = parseFloat(itemPrices[item.id] || '0');
            return acc + (price * item.quantity);
        }, 0);
    }, [itemPrices, list]);

    const handleNotesFocus = () => {
        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 300);
    };

    const handleSubmitOffer = useCallback(async () => {
        if (!list) return;

        const itemsWithPrices: OfferItem[] = list.items.map(item => ({
            id: item.id,
            item_name: item.name,
            quantity: item.quantity,
            unit: item.unit,
            brand: item.brand,
            unit_price: parseFloat(itemPrices[item.id] || '0'),
        }));

        if (itemsWithPrices.some(item => isNaN(item.unit_price) || item.unit_price <= 0)) {
            Alert.alert("Error de Validación", "Por favor, ingresa un precio válido y mayor a cero para todos los artículos.");
            return;
        }

        setSubmitting(true);
        try {
            await ShoppingListService.createDetailedOffer({
                shopping_list_id: listId!,
                total_price: total,
                notes: notesRef.current,
                items: itemsWithPrices,
            });

            Alert.alert("¡Éxito!", "Tu oferta ha sido enviada correctamente.");
            router.back();
        } catch (error: any) {
            Alert.alert("Error al Enviar", `No se pudo enviar la oferta: ${error.message}`);
        } finally {
            setSubmitting(false);
        }
    }, [list, itemPrices, total, router]);

    const renderItem = useCallback(({ item }: { item: ShoppingListItem }) => (
        <OfferItemCard
            item={item}
            price={itemPrices[item.id] || ''}
            onPriceChange={handlePriceChange}
        />
    ), [handlePriceChange, itemPrices]);

    const renderFooter = useCallback(() => (
        <View style={styles.summaryContainer}>
            <Text style={styles.totalText}>TOTAL: ${total.toFixed(2)}</Text>
            <TextInput
                style={styles.notesInput}
                placeholder="Notas generales de la oferta (opcional)"
                onChangeText={(text) => notesRef.current = text}
                onFocus={handleNotesFocus}
                multiline
            />
            <Button
                title="Enviar Oferta"
                onPress={handleSubmitOffer}
                color={COLORS.secondary}
                loading={submitting}
                buttonStyle={styles.button}
                titleStyle={styles.buttonTitle}
                icon={<Icon name="send-outline" type="material-community" color="white" size={18}/>}
            />
        </View>
    ), [total, submitting, handleSubmitOffer]);


    if (loading) {
        return <View style={styles.centered}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
    }

    if (!list) {
        return <View style={styles.centered}><Text>No se encontró la lista de compras.</Text></View>;
    }

    return (
        <KeyboardAvoidingView 
            style={styles.container} 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={100}
        >
            <View style={styles.header}>
                <Text style={styles.title}>Crear Oferta</Text>
                <Text style={styles.listTitle}>Para la lista: {list.title}</Text>
                {list.buyer_profiles && <Text style={styles.buyerName}>Comprador: {list.buyer_profiles.nombre} {list.buyer_profiles.apellido}</Text>}
            </View>
            <View style={styles.infoBox}>
                <Icon name="information-outline" type="material-community" color={COLORS.primary} size={18} />
                <Text style={styles.infoText}>
                    Consejo: Ingresa el precio por unidad. Si aplica, incluye los impuestos en el valor.
                </Text>
            </View>
            <FlatList
                ref={flatListRef}
                data={list.items}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                extraData={itemPrices}
                style={styles.list}
                contentContainerStyle={{ paddingBottom: 10 }}
                ListFooterComponent={renderFooter}
            />
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f9fa' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { paddingHorizontal: 15, paddingTop: 10, paddingBottom: 8, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
    title: { fontSize: scaleFont(20), fontWeight: 'bold', textAlign: 'center', color: COLORS.primary },
    listTitle: { fontSize: scaleFont(14), textAlign: 'center', color: COLORS.text, marginTop: 4 },
    buyerName: { fontSize: scaleFont(12), textAlign: 'center', color: COLORS.gray, marginTop: 2 },
    infoBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e7f3ff', paddingVertical: 8, paddingHorizontal: 15, },
    infoText: { fontSize: scaleFont(12), color: '#014a88', marginLeft: 8, flex: 1 },
    list: { flex: 1 },
    itemCard: { borderRadius: 10, marginHorizontal: 10, marginTop: 0, marginBottom: 8, padding: 0, elevation: 1 },
    cardRow: { flexDirection: 'row', padding: 12 },
    itemDetailsColumn: { flex: 1, paddingRight: 10 },
    priceInputColumn: { alignItems: 'flex-end', justifyContent: 'center' },
    itemName: { fontSize: scaleFont(16), fontWeight: '600', color: COLORS.text, marginBottom: 8 },
    metaContainer: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', marginBottom: 8 },
    metaItem: { flexDirection: 'row', alignItems: 'center', marginRight: 10, marginBottom: 4 },
    itemMetaText: { fontSize: scaleFont(12), color: COLORS.gray, marginLeft: 4 },
    notesContainer: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#fffbe6', borderRadius: 6, padding: 8, marginTop: 5 },
    itemNotes: { fontStyle: 'italic', color: '#856404', marginLeft: 6, fontSize: scaleFont(12), flex: 1 },
    priceInput: { height: 40, width: 90, borderColor: COLORS.gray, borderWidth: 1, paddingHorizontal: 8, borderRadius: 6, backgroundColor: COLORS.white, textAlign: 'right', fontSize: scaleFont(16), fontWeight: 'bold' },
    priceLabel: { fontSize: scaleFont(11), color: COLORS.gray, marginTop: 3 },
    summaryContainer: { padding: 15, borderTopWidth: 1, borderTopColor: '#e0e0e0', backgroundColor: 'rgba(255, 255, 255, 0.95)' },
    totalText: { fontSize: scaleFont(18), fontWeight: 'bold', textAlign: 'right', marginBottom: 12, color: COLORS.primary },
    notesInput: { height: 60, textAlignVertical: 'top', borderColor: COLORS.gray, borderWidth: 1, padding: 10, borderRadius: 8, marginBottom: 12, backgroundColor: '#f8f9fa', fontSize: scaleFont(13) },
    button: { borderRadius: 8, paddingVertical: 10 },
    buttonTitle: { fontSize: scaleFont(15) },
});