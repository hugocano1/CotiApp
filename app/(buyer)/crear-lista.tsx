// Ruta: app/(buyer)/crear-lista.tsx
import React, { useState, useLayoutEffect, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ScrollView, Platform, Image } from 'react-native';
import { useRouter, useNavigation, useFocusEffect } from 'expo-router';
import { Input, Button, Icon, BottomSheet, ListItem, ButtonGroup } from '@rneui/themed';
import DateTimePicker from '@react-native-community/datetimepicker';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

import { COLORS } from '../../src/constants/colors';
import { ShoppingListService } from '../../src/services/shoppingList.service';
import { scaleFont } from '../../src/utils/responsive';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

type Item = { id: string; name: string; quantity: number; unit: string; brand?: string; notes?: string; };
type DeliveryType = 'delivery' | 'pickup';
const UNITS = ['ud', 'kg', 'g', 'L', 'ml', 'paquete', 'lata', 'botella', 'caja'];

export default function CreateListScreen() {
  const router = useRouter();
  const navigation = useNavigation();

  const [listTitle, setListTitle] = useState('');
  const [minBudget, setMinBudget] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [deliveryDate, setDeliveryDate] = useState<Date | undefined>(new Date());
  const [deliveryTypeIndex, setDeliveryTypeIndex] = useState(0);
  const [items, setItems] = useState<Item[]>([]);
  
  // Location state
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [locationErrorMsg, setLocationErrorMsg] = useState<string | null>(null);
  
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState(1);
  const [newItemUnit, setNewItemUnit] = useState('ud');
  const [newItemBrand, setNewItemBrand] = useState('');
  const [newItemNotes, setNewItemNotes] = useState('');

  const [isUnitPickerVisible, setIsUnitPickerVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationErrorMsg('El permiso para acceder a la ubicación fue denegado. Por favor, actívalo desde la configuración de tu dispositivo si deseas despacho a domicilio.');
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
    })();
  }, []);

  useFocusEffect(
    useCallback(() => {
      setListTitle('');
      setMinBudget('');
      setMaxBudget('');
      setDeliveryDate(new Date());
      setDeliveryTypeIndex(0);
      setItems([]);
      setNewItemName('');
      setNewItemQty(1);
      setNewItemUnit('ud');
      setNewItemBrand('');
      setNewItemNotes('');
      setLoading(false);
    }, [])
  );

  useLayoutEffect(() => {
    navigation.setOptions({
        headerTitle: 'Crear nueva lista',
    });
  }, [navigation]);

  const handleAddItem = () => {
    if (!newItemName.trim()) { Alert.alert('Error', 'Por favor, ingresa el nombre del producto.'); return; }
    setItems([...items, { id: uuidv4(), name: newItemName.trim(), quantity: newItemQty, unit: newItemUnit, brand: newItemBrand.trim(), notes: newItemNotes.trim() }]);
    setNewItemName(''); setNewItemQty(1); setNewItemUnit('ud'); setNewItemBrand(''); setNewItemNotes('');
  };

  const handleRemoveItem = (id: string) => { setItems(items.filter(item => item.id !== id)); };

  const handleSaveList = async () => {
    if (!listTitle.trim()) { Alert.alert('Error', 'Por favor, dale un nombre a tu lista.'); return; }
    if (items.length === 0) { Alert.alert('Error', 'Añade al menos un artículo a tu lista.'); return; }
    if (deliveryTypeIndex === 0 && !location) { Alert.alert('Error', 'No hemos podido obtener tu ubicación para el despacho. Asegúrate de tener los permisos activados.'); return; }

    setLoading(true);
    try {
      const deliveryType: DeliveryType = deliveryTypeIndex === 0 ? 'delivery' : 'pickup';
      await ShoppingListService.createShoppingList({ 
        title: listTitle, 
        items, 
        delivery_date: deliveryDate, 
        delivery_type: deliveryType,
        min_budget: parseFloat(minBudget) || undefined,
        max_budget: parseFloat(maxBudget) || undefined,
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
            <Text style={styles.sectionTitle}>Datos de tu Lista</Text>
            <Input
                placeholder="Ej: Compras del mes"
                value={listTitle}
                onChangeText={setListTitle}
                containerStyle={styles.inputOuterContainer}
                inputContainerStyle={styles.inputContainer}
                inputStyle={styles.inputText}
                leftIcon={<Icon name="format-title" type="material-community" color={COLORS.gray}/>}
            />
            <View style={styles.row}>
                <Input
                    containerStyle={[styles.inputOuterContainer, {flex: 1, marginRight: 5}]}
                    placeholder="Mínimo"
                    label="Presupuesto"
                    labelStyle={styles.label}
                    value={minBudget}
                    onChangeText={setMinBudget}
                    keyboardType="numeric"
                    inputContainerStyle={styles.inputContainer}
                    inputStyle={styles.inputText}
                    leftIcon={<Icon name="cash-minus" type="material-community" color={COLORS.gray}/>}
                />
                <Input
                    containerStyle={[styles.inputOuterContainer, {flex: 1, marginLeft: 5}]}
                    placeholder="Máximo"
                    label=" "
                    value={maxBudget}
                    onChangeText={setMaxBudget}
                    keyboardType="numeric"
                    inputContainerStyle={styles.inputContainer}
                    inputStyle={styles.inputText}
                    leftIcon={<Icon name="cash-plus" type="material-community" color={COLORS.gray}/>}
                />
            </View>

            <Text style={styles.label}>¿Cuándo quieres recibir tu pedido?</Text>
            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
                <Icon name="calendar" type="material-community" color={COLORS.secondary} />
                <Text style={styles.dateButtonText}>{deliveryDate ? deliveryDate.toLocaleDateString('es-ES', {weekday: 'long', day: 'numeric', month: 'long'}) : 'Seleccionar Fecha'}</Text>
            </TouchableOpacity>
            {showDatePicker && (
                <DateTimePicker value={deliveryDate || new Date()} mode="date" display="default" onChange={(event, date) => { setShowDatePicker(Platform.OS === 'ios'); if(date) setDeliveryDate(date); }} />
            )}
            
            <ButtonGroup
                buttons={['Enviar a Domicilio', 'Recoger en Tienda']}
                selectedIndex={deliveryTypeIndex}
                onPress={(value) => setDeliveryTypeIndex(value)}
                containerStyle={styles.buttonGroupContainer}
                selectedButtonStyle={{ backgroundColor: COLORS.accent }}
                selectedTextStyle={{ color: COLORS.primary }}
            />
            
            {deliveryTypeIndex === 0 && (
                <View>
                  <Text style={styles.label}>Ubicación para el Despacho</Text>
                  {locationErrorMsg && <Text style={styles.errorText}>{locationErrorMsg}</Text>}
                  <View style={styles.mapContainer}>
                    {location ? (
                      <MapView
                        style={styles.map}
                        initialRegion={{
                          latitude: location.coords.latitude,
                          longitude: location.coords.longitude,
                          latitudeDelta: 0.01,
                          longitudeDelta: 0.01,
                        }}
                      >
                        <Marker
                          coordinate={{ latitude: location.coords.latitude, longitude: location.coords.longitude }}
                          title="Tu ubicación"
                          description="Aquí se entregará tu pedido"
                        />
                      </MapView>
                    ) : (
                      <Text style={styles.loadingText}>Obteniendo tu ubicación...</Text>
                    )}
                  </View>
                </View>
            )}

            <View style={styles.addItemContainer}>
                <Text style={styles.subHeader}>Añadir Artículo</Text>
                <Input placeholder="Nombre del producto" value={newItemName} onChangeText={setNewItemName} inputContainerStyle={styles.inputContainer} inputStyle={styles.inputText} />
                <Input placeholder="Marca (Opcional)" value={newItemBrand} onChangeText={setNewItemBrand} inputContainerStyle={styles.inputContainer} inputStyle={styles.inputText} />
                <Input placeholder="Notas sobre el producto (Opcional)" value={newItemNotes} onChangeText={setNewItemNotes} inputContainerStyle={styles.inputContainer} inputStyle={styles.inputText} />

                <View style={styles.quantityContainer}>
                    <Text style={styles.quantityLabel}>Cantidad:</Text>
                    <View style={styles.counter}>
                        <TouchableOpacity onPress={() => setNewItemQty(q => Math.max(1, q - 1))}><Icon name="minus-circle" type="material-community" color={COLORS.secondary} size={28} /></TouchableOpacity>
                        <Text style={styles.quantityText}>{newItemQty}</Text>
                        <TouchableOpacity onPress={() => setNewItemQty(q => q + 1)}><Icon name="plus-circle" type="material-community" color={COLORS.secondary} size={28} /></TouchableOpacity>
                    </View>
                    <TouchableOpacity style={styles.unitSelector} onPress={() => setIsUnitPickerVisible(true)}>
                        <Text style={styles.unitText}>{newItemUnit}</Text><Icon name="chevron-down" type="material-community" color={COLORS.gray} />
                    </TouchableOpacity>
                </View>
                <Button title="+ Añadir a la lista" onPress={handleAddItem} buttonStyle={{backgroundColor: COLORS.secondary, borderRadius: 8}} />
            </View>

            {items.length > 0 && <Text style={styles.sectionTitle}>Artículos en tu lista ({items.length})</Text>}
            {items.map((item, index) => (
                <View key={item.id} style={styles.itemRow}>
                    <View style={{flex: 1}}>
                      <Text style={styles.itemTextMain}>{item.quantity} {item.unit} - {item.name}</Text>
                      {!!item.brand && <Text style={styles.itemTextSub}>Marca: {item.brand}</Text>}
                      {!!item.notes && <Text style={styles.itemTextSub}>Notas: {item.notes}</Text>}
                    </View>
                    <TouchableOpacity onPress={() => handleRemoveItem(item.id)}><Icon name="close-circle-outline" type="material-community" color={COLORS.danger} /></TouchableOpacity>
                </View>
            ))}
            
            <Button
                title="Guardar y Publicar Lista"
                onPress={handleSaveList}
                buttonStyle={styles.saveButton}
                loading={loading}
                disabled={items.length === 0}
                icon={<Icon name="check" type="material-community" color="white" />}
                iconRight
            />
        </View>

        <BottomSheet isVisible={isUnitPickerVisible} onBackdropPress={() => setIsUnitPickerVisible(false)}>
            {UNITS.map((unit, i) => ( <ListItem key={i} onPress={() => { setNewItemUnit(unit); setIsUnitPickerVisible(false); }}><ListItem.Content><ListItem.Title>{unit}</ListItem.Title></ListItem.Content></ListItem> ))}
        </BottomSheet>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    promoBanner: { height: 120, backgroundColor: COLORS.primary },
    promoImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    formContainer: { padding: 15, borderTopLeftRadius: 20, borderTopRightRadius: 20, marginTop: -20, backgroundColor: COLORS.background },
    sectionTitle: { fontSize: scaleFont(18), fontWeight: 'bold', color: COLORS.primary, marginBottom: 15 },
    subHeader: { fontSize: scaleFont(16), fontWeight: '500', color: COLORS.text, marginBottom: 10 },
    label: { color: COLORS.text, fontWeight: '500', fontSize: scaleFont(14), marginBottom: 5, paddingHorizontal: 10 },
    row: { flexDirection: 'row', alignItems: 'center' },
    inputOuterContainer: {
      paddingHorizontal: 0,
      marginBottom: -5,
    },
    inputContainer: { borderWidth: 1, borderColor: '#ddd', borderRadius: 12, backgroundColor: COLORS.white, height: 48 },
    inputText: { fontSize: scaleFont(14), paddingLeft: 10 },
    dateButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 14, marginBottom: 15 },
    dateButtonText: { marginLeft: 10, fontSize: scaleFont(14), color: COLORS.text },
    buttonGroupContainer: { height: 45, marginHorizontal: 0, marginBottom: 20, borderRadius: 12 },
    mapContainer: {
      height: 200,
      borderRadius: 12,
      overflow: 'hidden',
      marginBottom: 20,
      backgroundColor: '#f0f0f0',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#ddd'
    },
    map: {
      ...StyleSheet.absoluteFillObject,
    },
    loadingText: { color: COLORS.gray, fontStyle: 'italic' },
    errorText: { color: COLORS.danger, marginBottom: 10, textAlign: 'center' },
    addItemContainer: { backgroundColor: COLORS.white, padding: 15, borderRadius: 12, marginVertical: 20, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
    quantityContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    quantityLabel: { fontSize: scaleFont(14), color: COLORS.text, marginRight: 'auto' },
    counter: { flexDirection: 'row', alignItems: 'center' },
    quantityText: { fontSize: scaleFont(18), fontWeight: 'bold', marginHorizontal: 12 },
    unitSelector: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingVertical: 6, paddingHorizontal: 10 },
    unitText: { fontSize: scaleFont(14), marginRight: 5 },
    itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#eee', borderRadius: 8, marginBottom: 8 },
    itemTextMain: { fontSize: scaleFont(14), fontWeight: '500' },
    itemTextSub: { fontSize: scaleFont(12), color: COLORS.gray, marginTop: 2 },
    saveButton: { backgroundColor: COLORS.primary, borderRadius: 10, paddingVertical: 12, marginTop: 20 },
});