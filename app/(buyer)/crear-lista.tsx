// Ruta: app/(buyer)/crear-lista.tsx
import React, { useState, useLayoutEffect, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Platform, Image, ActivityIndicator } from 'react-native';
import { useRouter, useNavigation, useFocusEffect } from 'expo-router';
import { Input, Button, Icon, BottomSheet, ListItem, ButtonGroup } from '@rneui/themed';
import DateTimePicker from '@react-native-community/datetimepicker';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

import { COLORS } from '../../constants/Colors';
import { ShoppingListService } from '../../src/services/shoppingList.service';
import { scaleFont } from '../../src/utils/responsive';
import { useProductImage } from '@/src/hooks/useProductImage';

type Item = { id: string; name: string; quantity: number; unit: string; brand?: string; notes?: string; image_url?: string };
type DeliveryType = 'delivery' | 'pickup';
const UNITS = ['Und', 'kg', 'grms', 'Lbr', 'Ltr', 'ml', 'paqte', 'lata', 'botella', 'caja', 'bolsa'];

export default function CreateListScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  
  const styles = createStyles(COLORS);
  
  const { handlePickAndUploadImage, uploading: isUploadingImage } = useProductImage();
  const [uploadingItemId, setUploadingItemId] = useState<string | null>(null);

  const [listTitle, setListTitle] = useState('');
  const [minBudget, setMinBudget] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [deliveryDate, setDeliveryDate] = useState<Date | undefined>(new Date());
  const [deliveryTypeIndex, setDeliveryTypeIndex] = useState(0);
  const [items, setItems] = useState<Item[]>([]);
  
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [locationErrorMsg, setLocationErrorMsg] = useState<string | null>(null);
  
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState(1);
  const [newItemUnit, setNewItemUnit] = useState('Und');
  const [newItemBrand, setNewItemBrand] = useState('');
  const [newItemNotes, setNewItemNotes] = useState('');

  const [isUnitPickerVisible, setIsUnitPickerVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationErrorMsg('El permiso para acceder a la ubicación fue denegado.');
        return;
      }
      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
    })();
  }, []);

  useFocusEffect(
    useCallback(() => {
      setListTitle(''); setMinBudget(''); setMaxBudget(''); setDeliveryDate(new Date());
      setDeliveryTypeIndex(0); setItems([]); setNewItemName(''); setNewItemQty(1);
      setNewItemUnit('Und'); setNewItemBrand(''); setNewItemNotes(''); setLoading(false);
    }, [])
  );

  useLayoutEffect(() => {
    navigation.setOptions({
        headerTitle: 'Crear nueva lista',
        headerStyle: { backgroundColor: COLORS.card },
        headerTitleStyle: { color: COLORS.text },
        headerTintColor: COLORS.text, // For the back button
    });
  }, [navigation]);

  const handleItemImage = async (itemId: string) => {
    setUploadingItemId(itemId);
    const imageUrl = await handlePickAndUploadImage();
    if (imageUrl) {
      setItems(currentItems => currentItems.map(item => item.id === itemId ? { ...item, image_url: imageUrl } : item));
    }
    setUploadingItemId(null);
  };

  const handleAddItem = () => {
    if (!newItemName.trim()) { Alert.alert('Error', 'Por favor, ingresa el nombre del producto.'); return; }
    setItems([...items, { id: uuidv4(), name: newItemName.trim(), quantity: newItemQty, unit: newItemUnit, brand: newItemBrand.trim(), notes: newItemNotes.trim() }]);
    setNewItemName(''); setNewItemQty(1); setNewItemUnit('Und'); setNewItemBrand(''); setNewItemNotes('');
  };

  const handleRemoveItem = (id: string) => { setItems(items.filter(item => item.id !== id)); };

  const handleSaveList = async () => {
    if (!listTitle.trim()) { Alert.alert('Error', 'Por favor, dale un nombre a tu lista.'); return; }
    if (items.length === 0) { Alert.alert('Error', 'Añade al menos un artículo a tu lista.'); return; }
    if (deliveryTypeIndex === 0 && !location) { Alert.alert('Error', 'No hemos podido obtener tu ubicación para el despacho.'); return; }

    setLoading(true);
    try {
      const deliveryType: DeliveryType = deliveryTypeIndex === 0 ? 'delivery' : 'pickup';
      await ShoppingListService.createShoppingList({ 
        title: listTitle, items, delivery_date: deliveryDate, delivery_type: deliveryType,
        min_budget: parseFloat(minBudget) || undefined, max_budget: parseFloat(maxBudget) || undefined,
        latitude: deliveryType === 'delivery' ? location?.coords.latitude : undefined,
        longitude: deliveryType === 'delivery' ? location?.coords.longitude : undefined,
      });
      Alert.alert('¡Éxito!', 'Tu lista de compras ha sido creada y publicada.');
      router.back();
    } catch (error: any) {
      Alert.alert('Error', `No se pudo guardar la lista: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
        <View style={styles.promoBanner}>
          <Image source={require('../../assets/images/banner_compradores.png')} style={styles.promoImage} />
        </View>

        <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Crea tu lista</Text>
            <Input
                placeholder="Ej: Compras de la semana"
                value={listTitle}
                onChangeText={setListTitle}
                inputContainerStyle={styles.inputContainer}
                inputStyle={styles.inputText}
                leftIcon={<Icon name="format-title" type="material-community" color={COLORS.text}/>}
            />
            <View style={styles.row}>
                <Input
                    containerStyle={{flex: 1, marginRight: 5}} placeholder="Mínimo" label="Presupuesto"
                    labelStyle={styles.label} value={minBudget} onChangeText={setMinBudget} keyboardType="numeric"
                    inputContainerStyle={styles.inputContainer} inputStyle={styles.inputText}
                    leftIcon={<Icon name="cash-minus" type="material-community" color={COLORS.text}/>}
                />
                <Input
                    containerStyle={{flex: 1, marginLeft: 5}} placeholder="Máximo" label=" "
                    value={maxBudget} onChangeText={setMaxBudget} keyboardType="numeric"
                    inputContainerStyle={styles.inputContainer} inputStyle={styles.inputText}
                    leftIcon={<Icon name="cash-plus" type="material-community" color={COLORS.text}/>}
                />
            </View>

            <Text style={styles.label}>¿Cuándo quieres recibir tu pedido?</Text>
            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
                <Icon name="calendar" type="material-community" color={COLORS.primary} />
                <Text style={styles.dateButtonText}>{deliveryDate ? deliveryDate.toLocaleDateString('es-ES', {weekday: 'long', day: 'numeric', month: 'long'}) : 'Seleccionar Fecha'}</Text>
            </TouchableOpacity>
            {showDatePicker && (
                <DateTimePicker value={deliveryDate || new Date()} mode="date" display="default" onChange={(event, date) => { setShowDatePicker(Platform.OS === 'ios'); if(date) setDeliveryDate(date); }} />
            )}
            
            <ButtonGroup
                buttons={['Enviar a domicilio', 'Recoger en tienda']}
                selectedIndex={deliveryTypeIndex}
                onPress={(value) => setDeliveryTypeIndex(value)}
                containerStyle={styles.buttonGroupContainer}
                selectedButtonStyle={{ backgroundColor: COLORS.primary }}
                selectedTextStyle={{ color: COLORS.white, fontWeight: 'bold' }}
                textStyle={{ color: COLORS.text, fontWeight: 'bold' }}
                innerBorderStyle={{ color: COLORS.border }}
                buttonContainerStyle={{backgroundColor: COLORS.card}}
            />
            
            {deliveryTypeIndex === 0 && (
                <View>
                  <Text style={styles.label}>Ubicación para el despacho</Text>
                  {locationErrorMsg && <Text style={styles.errorText}>{locationErrorMsg}</Text>}
                  <View style={styles.mapContainer}>
                    {location ? (
                      <MapView style={styles.map} initialRegion={{ latitude: location.coords.latitude, longitude: location.coords.longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 }}>
                        <Marker coordinate={{ latitude: location.coords.latitude, longitude: location.coords.longitude }} title="Tu ubicación" description="Aquí se entregará tu pedido" />
                      </MapView>
                    ) : ( <ActivityIndicator color={COLORS.primary} /> )}
                  </View>
                </View>
            )}

            {items.length > 0 && <Text style={styles.sectionTitle}>Artículos en tu lista ({items.length})</Text>}
            
            {items.map((item) => (
                <View key={item.id} style={styles.itemRow}>
                    <View style={styles.itemImageContainer}>
                      {item.image_url ? (
                        <Image source={{ uri: item.image_url }} style={styles.itemImage} />
                      ) : (
                        <TouchableOpacity style={styles.cameraButton} onPress={() => handleItemImage(item.id)} disabled={isUploadingImage}>
                          <Icon name="camera-plus-outline" type="material-community" color={COLORS.text} size={24} />
                        </TouchableOpacity>
                      )}
                    </View>
                    
                    <View style={styles.itemContent}>
                      <Text style={styles.itemTextMain}>{item.quantity} {item.unit} - {item.name}</Text>
                      {!!item.brand && <Text style={styles.itemTextSub}>Marca: {item.brand}</Text>}
                      {!!item.notes && <Text style={styles.itemTextSub}>Notas: {item.notes}</Text>}
                    </View>
                    
                    <TouchableOpacity onPress={() => handleRemoveItem(item.id)} style={{ marginLeft: 'auto' }}>
                      <Icon name="close-circle-outline" type="material-community" color={COLORS.accent} />
                    </TouchableOpacity>

                    {uploadingItemId === item.id && (
                      <View style={styles.uploadingOverlay}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                      </View>
                    )}
                </View>
            ))}

            <View style={styles.addItemContainer}>
                <Text style={styles.subHeader}>Añadir Producto</Text>
                <Input placeholder="Nombre del producto" value={newItemName} onChangeText={setNewItemName} inputContainerStyle={styles.inputContainer} inputStyle={styles.inputText} />
                <Input placeholder="Marca (Opcional)" value={newItemBrand} onChangeText={setNewItemBrand} inputContainerStyle={styles.inputContainer} inputStyle={styles.inputText} />
                <Input placeholder="Más detalles (Opcional)" value={newItemNotes} onChangeText={setNewItemNotes} inputContainerStyle={styles.inputContainer} inputStyle={styles.inputText} />

                <View style={styles.quantityContainer}>
                    <Text style={styles.quantityLabel}>Cantidad:</Text>
                    <View style={styles.counter}>
                        <TouchableOpacity onPress={() => setNewItemQty(q => Math.max(1, q - 1))}><Icon name="minus-circle-outline" type="material-community" color={COLORS.primary} size={32} /></TouchableOpacity>
                        <Text style={styles.quantityText}>{newItemQty}</Text>
                        <TouchableOpacity onPress={() => setNewItemQty(q => q + 1)}><Icon name="plus-circle-outline" type="material-community" color={COLORS.primary} size={32} /></TouchableOpacity>
                    </View>
                    <TouchableOpacity style={styles.unitSelector} onPress={() => setIsUnitPickerVisible(true)}>
                        <Text style={styles.unitText}>{newItemUnit}</Text><Icon name="chevron-down" type="material-community" color={COLORS.text} />
                    </TouchableOpacity>
                </View>
                <Button title="+ Añadir a la lista" onPress={handleAddItem} type="outline" buttonStyle={styles.addButton} titleStyle={{color: COLORS.primary, fontWeight: 'bold'}} />
            </View>
            
            <Button
                title="Guardar y Publicar Lista"
                onPress={handleSaveList}
                buttonStyle={styles.saveButton}
                titleStyle={{fontWeight: 'bold', color: COLORS.white}}
                loading={loading}
                disabled={items.length === 0 || isUploadingImage}
                icon={<Icon name="check-circle-outline" type="material-community" color={COLORS.white} />}
                iconRight
            />
        </View>

        <BottomSheet isVisible={isUnitPickerVisible} onBackdropPress={() => setIsUnitPickerVisible(false)} containerStyle={{backgroundColor: COLORS.card}}>
            {UNITS.map((unit, i) => ( <ListItem key={i} onPress={() => { setNewItemUnit(unit); setIsUnitPickerVisible(false); }} containerStyle={{backgroundColor: COLORS.card}}><ListItem.Content><ListItem.Title style={{color: COLORS.text}}>{unit}</ListItem.Title></ListItem.Content></ListItem> ))}
        </BottomSheet>
    </ScrollView>
  );
}

const createStyles = (colors: typeof COLORS) => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    promoBanner: { height: 120, backgroundColor: colors.primary },
    promoImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    formContainer: { padding: 15, borderTopLeftRadius: 20, borderTopRightRadius: 20, marginTop: -20, backgroundColor: colors.background },
    sectionTitle: { fontSize: scaleFont(20), fontWeight: 'bold', color: colors.text, marginBottom: 15 },
    subHeader: { fontSize: scaleFont(16), fontWeight: '600', color: colors.text, marginBottom: 10 },
    label: { color: colors.text, fontWeight: '500', fontSize: scaleFont(14), marginBottom: 5, paddingHorizontal: 5 },
    row: { flexDirection: 'row', alignItems: 'center' },
    inputContainer: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, backgroundColor: colors.card, height: 50 },
    inputText: { fontSize: scaleFont(14), paddingLeft: 10, color: colors.text },
    dateButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 14, marginBottom: 15 },
    dateButtonText: { marginLeft: 10, fontSize: scaleFont(14), color: colors.text },
    buttonGroupContainer: { height: 45, marginHorizontal: 0, marginBottom: 20, borderRadius: 12, borderWidth: 1, borderColor: colors.border },
    mapContainer: { height: 200, borderRadius: 12, overflow: 'hidden', marginBottom: 20, backgroundColor: colors.card, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.border },
    map: { ...StyleSheet.absoluteFillObject },
    errorText: { color: colors.accent, marginBottom: 10, textAlign: 'center' },
    addItemContainer: { backgroundColor: colors.card, padding: 15, borderRadius: 12, marginVertical: 20, borderWidth: 1, borderColor: colors.border },
    quantityContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 15 },
    quantityLabel: { fontSize: scaleFont(14), color: colors.text, fontWeight: '500', marginRight: 'auto' },
    counter: { flexDirection: 'row', alignItems: 'center' },
    quantityText: { fontSize: scaleFont(20), fontWeight: 'bold', marginHorizontal: 15, color: colors.text },
    unitSelector: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12 },
    unitText: { fontSize: scaleFont(14), marginRight: 5, color: colors.text },
    itemRow: { flexDirection: 'row', alignItems: 'center', padding: 10, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 12, marginBottom: 10, overflow: 'hidden' },
    itemImageContainer: { width: 50, height: 50, borderRadius: 8, backgroundColor: colors.background, marginRight: 12, justifyContent: 'center', alignItems: 'center' },
    itemImage: { width: '100%', height: '100%', borderRadius: 8 },
    cameraButton: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
    itemContent: { flex: 1 },
    itemTextMain: { fontSize: scaleFont(14), fontWeight: '500', color: colors.text },
    itemTextSub: { fontSize: scaleFont(12), color: colors.gray, marginTop: 2 },
    uploadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: `${colors.card}CC`, justifyContent: 'center', alignItems: 'center' },
    addButton: { borderColor: colors.primary, borderWidth: 2, backgroundColor: 'transparent', borderRadius: 10 },
    saveButton: { backgroundColor: colors.primary, borderRadius: 10, paddingVertical: 14, marginTop: 20 },
});