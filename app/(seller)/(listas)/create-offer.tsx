// app/(seller)/(listas)/create-offer.tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, Modal, Image, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, Card, Icon } from '@rneui/themed';

import { useColorScheme } from '../../../components/useColorScheme';
import Colors from '../../../constants/Colors';
import { ShoppingListService } from '../../../src/services/shoppingList.service';
import { scaleFont } from '../../../src/utils/responsive';
import { ShoppingList, ShoppingListItem, OfferItem } from '../../../src/types/entities';
import { formatCurrency } from '../../../src/utils/formatters';

type ThemeColors = typeof Colors.light;

// Modal para mostrar la imagen en grande
const ImageZoomModal = ({ visible, imageUrl, onClose }: { visible: boolean; imageUrl: string | null; onClose: () => void; }) => {
    const styles = createStyles(Colors.dark); // Forzar tema oscuro para el overlay
    return(
        <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
            <View style={styles.imageModalOverlay}>
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                    <Icon name="close" type="material-community" color={Colors.dark.text} size={32} />
                </TouchableOpacity>
                {imageUrl && imageUrl !== 'null' && <Image source={{ uri: imageUrl }} style={styles.enlargedImage} resizeMode="contain" />}
            </View>
        </Modal>
    );
};

const OfferItemCard = React.memo(({ item, onPriceChange, price, onImagePress, themeColors }: { item: ShoppingListItem; onPriceChange: (itemId: string, price: string) => void; price: string; onImagePress: (uri: string) => void; themeColors: ThemeColors}) => {
    const styles = createStyles(themeColors);
    const handleTextChange = useCallback((newPrice: string) => {
        onPriceChange(item.id, newPrice);
    }, [onPriceChange, item.id]);

    return (
        <Card containerStyle={styles.itemCard}>
            <View style={styles.cardRow}>
                {item.image_url && item.image_url !== 'null' ? (
                    <TouchableOpacity onPress={() => onImagePress(item.image_url!)}>
                        <Image source={{ uri: item.image_url }} style={styles.itemImage} />
                    </TouchableOpacity>
                ) : (
                    <View style={styles.itemImage} />
                )}
                <View style={styles.itemDetailsColumn}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <View style={styles.metaContainer}>
                        <View style={styles.metaItem}>
                            <Icon name="beaker-outline" type="material-community" color={Colors.light.tabIconDefault} size={14} />
                            <Text style={styles.itemMetaText}>{item.quantity} {item.unit || 'unidades'}</Text>
                        </View>
                        {item.brand && (
                            <View style={styles.metaItem}>
                                <Icon name="tag-outline" type="material-community" color={Colors.light.tabIconDefault} size={14} />
                                <Text style={styles.itemMetaText}>{item.brand}</Text>
                            </View>
                        )}
                    </View>
                    {item.notes && (
                        <View style={styles.notesContainer}>
                            <Icon name="information-outline" type="material-community" color={themeColors.text} size={14} />
                            <Text style={styles.itemNotes}>{item.notes}</Text>
                        </View>
                    )}
                </View>
                <View style={styles.priceInputColumn}>
                    <TextInput
                        style={styles.priceInput}
                        placeholder={formatCurrency(0)}
                        placeholderTextColor={Colors.light.tabIconDefault}
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

    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme ?? 'light'];
    const styles = createStyles(themeColors);

    const [list, setList] = useState<ShoppingList | null>(null);
    const [itemPrices, setItemPrices] = useState<Record<string, string>>({});
    const [shippingCost, setShippingCost] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [isSubmitModalVisible, setSubmitModalVisible] = useState(false);
    
    const [isImageModalVisible, setImageModalVisible] = useState(false);
    const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);

    const handleImagePress = (uri: string) => {
        setSelectedImageUri(uri);
        setImageModalVisible(true);
    };

    useEffect(() => {
        const fetchListDetails = async () => {
            if (!listId) return;
            try {
                setLoading(true);
                const listDetails = await ShoppingListService.getListDetails(listId);
                if (listDetails) setList(listDetails);
                else Alert.alert("Error", "No se pudieron cargar los artículos de la lista.");
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
        const allPricesSet = list?.items.every(item => parseFloat(itemPrices[item.id] || '0') > 0);
        if (!allPricesSet) {
            Alert.alert("Precios incompletos", "Por favor, ingresa un precio válido mayor a cero para todos los artículos.");
            return;
        }
        setSubmitModalVisible(true);
    };

    const handleSubmitOffer = useCallback(async () => {
        if (!list) return;
        setSubmitting(true);
        try {
            const itemsWithPrices: OfferItem[] = list.items.map(item => ({
                item_name: `${item.name}__ID__${item.id}${item.image_url ? `__IMG__${item.image_url}` : ''}`,
                quantity: item.quantity, unit: item.unit, brand: item.brand,
                unit_price: parseFloat(itemPrices[item.id] || '0'),
            }));
            
            await ShoppingListService.createDetailedOffer({
                shopping_list_id: listId!, total_price: finalTotal, notes: notes,
                items: itemsWithPrices, shipping_cost: parseFloat(shippingCost) || 0,
            });

            setSubmitModalVisible(false);
            Alert.alert("¡Éxito!", "Tu oferta ha sido enviada correctamente.");
            router.back();
        } catch (error: any) {
            Alert.alert("Error al enviar", `No se pudo enviar la oferta: ${error.message}`);
        } finally {
            setSubmitting(false);
        }
    }, [list, itemPrices, finalTotal, shippingCost, notes, router]);

    const renderItem = useCallback(({ item }: { item: ShoppingListItem }) => (
        <OfferItemCard item={item} price={itemPrices[item.id] || ''} onPriceChange={handlePriceChange} onImagePress={handleImagePress} themeColors={themeColors} />
    ), [handlePriceChange, itemPrices, themeColors]);
    
    const renderFooter = () => (
        <View style={styles.summaryContainer}>
            <Text style={styles.totalText}>Subtotal: {formatCurrency(totalItemsPrice)}</Text>
            <Button
                title="Continuar y finalizar"
                onPress={handleOpenSubmitModal}
                buttonStyle={styles.button}
                titleStyle={styles.buttonTitle}
                icon={<Icon name="arrow-right-circle-outline" type="material-community" color={Colors.dark.text} size={18}/>}
            />
        </View>
    );

    const renderSubmitModal = () => (
        <Modal animationType="slide" transparent={true} visible={isSubmitModalVisible} onRequestClose={() => setSubmitModalVisible(false)}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Finalizar oferta</Text>
                    <Text style={styles.modalTotalText}>Subtotal artículos: {formatCurrency(totalItemsPrice)}</Text>
                    
                    {list?.delivery_type === 'delivery' && (
                        <View style={styles.modalInputContainer}>
                            <Text style={styles.modalLabel}>Costo de envío:</Text>
                            <TextInput style={styles.modalInput} placeholder={formatCurrency(0)} placeholderTextColor={Colors.light.tabIconDefault} value={shippingCost} onChangeText={setShippingCost} keyboardType="numeric" />
                        </View>
                    )}

                    <View style={styles.modalInputContainer}>
                        <Text style={styles.modalLabel}>Notas adicionales (Opcional):</Text>
                        <TextInput style={[styles.modalInput, styles.notesInput]} placeholder="Ej: Puedo reemplazar la marca X por la Y..." placeholderTextColor={Colors.light.tabIconDefault} value={notes} onChangeText={setNotes} multiline />
                    </View>
                    
                    <Text style={styles.modalFinalTotal}>Total oferta: {formatCurrency(finalTotal)}</Text>

                    <View style={styles.modalButtonContainer}>
                        <View style={styles.modalButtonWrapper}>
                            <Button title="Cancelar" onPress={() => setSubmitModalVisible(false)} type="outline" buttonStyle={styles.cancelButton} titleStyle={styles.cancelButtonTitle}/>
                        </View>
                        <View style={styles.modalButtonWrapper}>
                            <Button title="Confirmar" onPress={handleSubmitOffer} loading={submitting} buttonStyle={styles.confirmButton} titleStyle={styles.modalButtonTitle}/>
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );

    if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color={themeColors.tint} /></View>;
    if (!list) return <View style={styles.centered}><Text style={{color: themeColors.text}}>No se encontró la lista.</Text></View>;

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
             <View style={styles.header}>
                <Text style={styles.title}>Crear oferta</Text>
                <Text style={styles.listTitle}>Para la lista: {list.title}</Text>
                {list.buyer_profiles && <Text style={styles.buyerName}>Comprador: {list.buyer_profiles.nombre} {list.buyer_profiles.apellido}</Text>}
            </View>
            <View style={styles.infoBox}>
                <Icon name="information-outline" type="material-community" color={themeColors.tint} size={18} />
                <Text style={styles.infoText}>Ingresa el precio por unidad. Si el producto tiene impuestos incluyelos en el valor.</Text>
            </View>
            <FlatList
                data={list.items} renderItem={renderItem} keyExtractor={(item) => item.id}
                extraData={itemPrices} ListFooterComponent={renderFooter}
                contentContainerStyle={{ paddingBottom: 20 }}
            />
            {renderSubmitModal()}
            <ImageZoomModal visible={isImageModalVisible} imageUrl={selectedImageUri} onClose={() => setImageModalVisible(false)} />
        </KeyboardAvoidingView>
    );
}

const createStyles = (themeColors: ThemeColors) => StyleSheet.create({
    container: { flex: 1, backgroundColor: themeColors.background },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: themeColors.background },
    header: { paddingHorizontal: 15, paddingTop: 10, paddingBottom: 8, backgroundColor: themeColors.card, borderBottomWidth: 1, borderBottomColor: themeColors.border },
    title: { fontSize: scaleFont(20), fontWeight: 'bold', textAlign: 'center', color: themeColors.text },
    listTitle: { fontSize: scaleFont(14), textAlign: 'center', color: themeColors.text, marginTop: 4 },
    buyerName: { fontSize: scaleFont(12), textAlign: 'center', color: Colors.light.tabIconDefault, marginTop: 2 },
    infoBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: `${themeColors.tint}20`, paddingVertical: 10, paddingHorizontal: 15 },
    infoText: { fontSize: scaleFont(12), color: themeColors.text, marginLeft: 8, flex: 1 },
    itemCard: { borderRadius: 12, marginHorizontal: 10, marginTop: 0, marginBottom: 10, padding: 0, backgroundColor: themeColors.card, borderWidth: 1, borderColor: themeColors.border },
    cardRow: { flexDirection: 'row', padding: 12, alignItems: 'center' },
    itemImage: { width: 50, height: 50, borderRadius: 8, marginRight: 12, backgroundColor: themeColors.background },
    itemDetailsColumn: { flex: 1, paddingRight: 10 },
    priceInputColumn: { alignItems: 'flex-end', justifyContent: 'center' },
    itemName: { fontSize: scaleFont(16), fontWeight: '600', color: themeColors.text, marginBottom: 8 },
    metaContainer: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', marginBottom: 8 },
    metaItem: { flexDirection: 'row', alignItems: 'center', marginRight: 10, marginBottom: 4 },
    itemMetaText: { fontSize: scaleFont(12), color: Colors.light.tabIconDefault, marginLeft: 4 },
    notesContainer: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: `${themeColors.accent}15`, borderRadius: 6, padding: 8, marginTop: 5 },
    itemNotes: { fontStyle: 'italic', color: themeColors.text, marginLeft: 6, fontSize: scaleFont(12), flex: 1 },
    priceInput: { height: 44, width: 100, borderColor: themeColors.border, borderWidth: 1, paddingHorizontal: 8, borderRadius: 8, backgroundColor: themeColors.background, textAlign: 'right', fontSize: scaleFont(16), fontWeight: 'bold', color: themeColors.text },
    priceLabel: { fontSize: scaleFont(11), color: Colors.light.tabIconDefault, marginTop: 3 },
    summaryContainer: { padding: 15, borderTopWidth: 1, borderTopColor: themeColors.border, backgroundColor: themeColors.card },
    totalText: { fontSize: scaleFont(18), fontWeight: 'bold', textAlign: 'right', marginBottom: 12, color: themeColors.text },
    button: { backgroundColor: themeColors.tint, borderRadius: 10, paddingVertical: 12 },
    buttonTitle: { fontSize: scaleFont(16), fontWeight: 'bold' },
    modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
    modalContent: { backgroundColor: themeColors.card, padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.1, shadowRadius: 4 },
    modalTitle: { fontSize: scaleFont(20), fontWeight: 'bold', color: themeColors.text, marginBottom: 20, textAlign: 'center' },
    modalTotalText: { fontSize: scaleFont(16), color: Colors.light.tabIconDefault, textAlign: 'right', marginBottom: 15 },
    modalInputContainer: { marginBottom: 15 },
    modalLabel: { fontSize: scaleFont(14), color: themeColors.text, marginBottom: 8, fontWeight: '500' },
    modalInput: { borderWidth: 1, borderColor: themeColors.border, borderRadius: 8, padding: 12, fontSize: scaleFont(15), backgroundColor: themeColors.background, color: themeColors.text },
    notesInput: { height: 80, textAlignVertical: 'top' },
    modalFinalTotal: { fontSize: scaleFont(22), fontWeight: 'bold', color: themeColors.tint, textAlign: 'right', marginTop: 10, marginBottom: 20 },
    modalButtonContainer: { flexDirection: 'row', justifyContent: 'space-between' },
    modalButtonWrapper: { flex: 1, marginHorizontal: 5 },
    modalButton: { borderRadius: 10, paddingVertical: 12 },
    modalButtonTitle: { fontSize: scaleFont(16), fontWeight: 'bold' },
    cancelButton: { backgroundColor: 'transparent', borderColor: themeColors.accent, borderWidth: 2 },
    cancelButtonTitle: { color: themeColors.accent },
    confirmButton: { backgroundColor: themeColors.tint, borderWidth: 0 },
    imageModalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.9)', justifyContent: 'center', alignItems: 'center' },
    enlargedImage: { width: '95%', height: '80%' },
    closeButton: { position: 'absolute', top: 50, right: 15, zIndex: 1, padding: 10 },
});