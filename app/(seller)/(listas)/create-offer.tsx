// app/(seller)/(listas)/create-offer.tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ShoppingListService } from '../../../src/services/shoppingList.service';
import { COLORS } from '../../../src/constants/colors';
import { Button, Card, Icon } from '@rneui/themed';
import { scaleFont } from '../../../src/utils/responsive';
import { ShoppingList, ShoppingListItem, OfferItem } from '../../../src/types/entities';
import { formatCurrency } from '../../../src/utils/formatters';

const OfferItemCard = React.memo(({ item, onPriceChange, price }: { item: ShoppingListItem; onPriceChange: (itemId: string, price: string) => void; price: string; }) => {
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
    const [shippingCost, setShippingCost] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [isModalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        const fetchListDetails = async () => {
            if (!listId) return;
            try {
                setLoading(true);
                const listDetails = await ShoppingListService.getListDetails(listId);
                if (listDetails) {
                    setList(listDetails);
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

    const totalItemsPrice = useMemo(() => {
        if (!list) return 0;
        return list.items.reduce((acc, item) => {
            const price = parseFloat(itemPrices[item.id] || '0');
            return acc + (price * item.quantity);
        }, 0);
    }, [itemPrices, list]);
    
    const finalTotal = useMemo(() => {
        const cost = parseFloat(shippingCost) || 0;
        return totalItemsPrice + cost;
    }, [totalItemsPrice, shippingCost]);

    const handleOpenSubmitModal = () => {
        const allPricesSet = list?.items.every(item => {
            const price = parseFloat(itemPrices[item.id] || '0');
            return !isNaN(price) && price > 0;
        });

        if (!allPricesSet) {
            Alert.alert("Precios Incompletos", "Por favor, ingresa un precio válido mayor a cero para todos los artículos antes de continuar.");
            return;
        }
        setModalVisible(true);
    };

    const handleSubmitOffer = useCallback(async () => {
        if (!list) return;

        setSubmitting(true);
        try {
            const itemsWithPrices: OfferItem[] = list.items.map(item => ({
                item_name: `${item.name}__ID__${item.id}`,
                quantity: item.quantity,
                unit: item.unit,
                brand: item.brand,
                unit_price: parseFloat(itemPrices[item.id] || '0'),
            }));
            
            await ShoppingListService.createDetailedOffer({
                shopping_list_id: listId!,
                buyer_id: list.buyer_id,
                list_title: list.title,
                total_price: finalTotal,
                notes: notes,
                items: itemsWithPrices,
                shipping_cost: parseFloat(shippingCost) || 0,
            });

            setModalVisible(false);
            Alert.alert("¡Éxito!", "Tu oferta ha sido enviada correctamente.");
            router.back();
        } catch (error: any) {
            Alert.alert("Error al Enviar", `No se pudo enviar la oferta: ${error.message}`);
        } finally {
            setSubmitting(false);
        }
    }, [list, itemPrices, finalTotal, shippingCost, notes, router]);

    const renderItem = useCallback(({ item }: { item: ShoppingListItem }) => (
        <OfferItemCard
            item={item}
            price={itemPrices[item.id] || ''}
            onPriceChange={handlePriceChange}
        />
    ), [handlePriceChange, itemPrices]);
    
    const renderFooter = () => (
        <View style={styles.summaryContainer}>
            <Text style={styles.totalText}>SUBTOTAL: {formatCurrency(totalItemsPrice)}</Text>
            <Button
                title="Continuar y Finalizar"
                onPress={handleOpenSubmitModal}
                color={COLORS.secondary}
                buttonStyle={styles.button}
                titleStyle={styles.buttonTitle}
                icon={<Icon name="arrow-right-circle-outline" type="material-community" color="white" size={18}/>}
            />
        </View>
    );

    const renderSubmitModal = () => (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isModalVisible}
            onRequestClose={() => setModalVisible(false)}
        >
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Finalizar Oferta</Text>
                    <Text style={styles.modalTotalText}>Subtotal Artículos: {formatCurrency(totalItemsPrice)}</Text>
                    
                    {list?.delivery_type === 'delivery' && (
                        <View style={styles.modalInputContainer}>
                            <Text style={styles.modalLabel}>Costo de Envío:</Text>
                            <TextInput
                                style={styles.modalInput}
                                placeholder="$0.00"
                                value={shippingCost}
                                onChangeText={setShippingCost}
                                keyboardType="numeric"
                            />
                        </View>
                    )}

                    <View style={styles.modalInputContainer}>
                        <Text style={styles.modalLabel}>Notas Adicionales (Opcional):</Text>
                        <TextInput
                            style={[styles.modalInput, styles.notesInput]}
                            placeholder="Ej: Puedo reemplazar la marca X por la Y..."
                            value={notes}
                            onChangeText={setNotes}
                            multiline
                        />
                    </View>
                    
                    <Text style={styles.modalFinalTotal}>TOTAL OFERTA: {formatCurrency(finalTotal)}</Text>

                    <View style={styles.modalButtonContainer}>
                        <View style={styles.modalButtonWrapper}>
                            <Button 
                                title="Cancelar" 
                                onPress={() => setModalVisible(false)} 
                                type="outline" 
                                buttonStyle={[styles.modalButton, styles.cancelButton]} 
                                titleStyle={[styles.modalButtonTitle, styles.cancelButtonTitle]}
                            />
                        </View>
                        <View style={styles.modalButtonWrapper}>
                            <Button 
                                title="Confirmar" 
                                onPress={handleSubmitOffer} 
                                loading={submitting} 
                                buttonStyle={[styles.modalButton, styles.confirmButton]}
                                titleStyle={styles.modalButtonTitle}
                            />
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );

    if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
    if (!list) return <View style={styles.centered}><Text>No se encontró la lista.</Text></View>;

    return (
        <KeyboardAvoidingView style={styles.container} behavior="padding">
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
                data={list.items}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                extraData={itemPrices}
                ListFooterComponent={renderFooter}
                contentContainerStyle={{ paddingBottom: 20 }}
            />
            {renderSubmitModal()}
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
    button: { borderRadius: 8, paddingVertical: 10 },
    buttonTitle: { fontSize: scaleFont(15) },
    modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContent: { backgroundColor: 'white', padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.1, shadowRadius: 4 },
    modalTitle: { fontSize: scaleFont(20), fontWeight: 'bold', color: COLORS.primary, marginBottom: 20, textAlign: 'center' },
    modalTotalText: { fontSize: scaleFont(16), color: COLORS.gray, textAlign: 'right', marginBottom: 15 },
    modalInputContainer: { marginBottom: 15 },
    modalLabel: { fontSize: scaleFont(14), color: COLORS.text, marginBottom: 5, fontWeight: '500' },
    modalInput: { borderWidth: 1, borderColor: COLORS.lightGray, borderRadius: 8, padding: 10, fontSize: scaleFont(15), backgroundColor: '#f8f9fa' },
    notesInput: { height: 80, textAlignVertical: 'top' },
    modalFinalTotal: { fontSize: scaleFont(20), fontWeight: 'bold', color: COLORS.secondary, textAlign: 'right', marginTop: 10, marginBottom: 20 },
    modalButtonContainer: { flexDirection: 'row', justifyContent: 'space-between' },
    modalButtonWrapper: { flex: 1, marginHorizontal: 5 },
    modalButton: { borderRadius: 8, paddingVertical: 10 },
    modalButtonTitle: { fontSize: scaleFont(15), fontWeight: 'bold' },
    cancelButton: { borderColor: COLORS.primary, borderWidth: 1 },
    cancelButtonTitle: { color: COLORS.primary },
    confirmButton: { backgroundColor: COLORS.primary },
});