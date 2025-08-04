// Ruta: app/(buyer)/crear-lista.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Input, Button, Icon, BottomSheet, ListItem } from '@rneui/themed';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS } from '../../src/constants/colors';
import { ShoppingListService } from '../../src/services/shoppingList.service';

// ... (El resto de tus tipos y constantes se mantienen igual)
type Item = { name: string; quantity: number; unit: string; brand?: string; notes?: string; };
type DeliveryType = 'delivery' | 'pickup';
const UNITS = ['ud', 'kg', 'g', 'L', 'ml', 'paquete', 'lata', 'botella', 'caja'];


export default function CreateListScreen() {
  const router = useRouter();
  // Estado de la lista
  const [listTitle, setListTitle] = useState('');
  const [minBudget, setMinBudget] = useState(''); // ✅ AÑADIDO
  const [maxBudget, setMaxBudget] = useState(''); // ✅ AÑADIDO
  const [deliveryDate, setDeliveryDate] = useState<Date | undefined>(new Date());
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('delivery');
  const [items, setItems] = useState<Item[]>([]);
  
  // ... (El resto del estado se mantiene igual)
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState(1);
  const [newItemUnit, setNewItemUnit] = useState('ud');
  const [newItemBrand, setNewItemBrand] = useState('');
  const [newItemNotes, setNewItemNotes] = useState('');
  const [isUnitPickerVisible, setIsUnitPickerVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  // ... (handleAddItem y handleRemoveItem se mantienen igual)
  const handleAddItem = () => {
    if (!newItemName.trim()) { Alert.alert('Error', 'Por favor, ingresa el nombre del producto.'); return; }
    setItems([...items, { name: newItemName.trim(), quantity: newItemQty, unit: newItemUnit, brand: newItemBrand.trim(), notes: newItemNotes.trim() }]);
    setNewItemName(''); setNewItemQty(1); setNewItemUnit('ud'); setNewItemBrand(''); setNewItemNotes('');
  };
  const handleRemoveItem = (index: number) => { setItems(items.filter((_, i) => i !== index)); };


  const handleSaveList = async () => {
    // ... (Validaciones)
    setLoading(true);
    try {
      await ShoppingListService.createShoppingList({ 
        title: listTitle, 
        items, 
        delivery_date: deliveryDate, 
        delivery_type: deliveryType,
        min_budget: parseFloat(minBudget) || undefined, // ✅ AÑADIDO
        max_budget: parseFloat(maxBudget) || undefined, // ✅ AÑADIDO
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
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.header}>Crear Nueva Lista</Text>

      {/* --- DATOS GENERALES DE LA LISTA --- */}
      <Input
        placeholder="Ej: Compras de la semana"
        value={listTitle}
        onChangeText={setListTitle}
        label="Nombre de la Lista"
        // ...
      />

      {/* ✅ CAMPOS DE PRESUPUESTO AÑADIDOS */}
      <View style={styles.row}>
          <Input
            containerStyle={{flex: 1, paddingHorizontal: 0}}
            placeholder="Mínimo"
            label="Presupuesto"
            value={minBudget}
            onChangeText={setMinBudget}
            keyboardType="numeric"
            leftIcon={<Icon name="cash-minus" type="material-community" color={COLORS.gray}/>}
          />
          <Input
            containerStyle={{flex: 1, paddingHorizontal: 0}}
            placeholder="Máximo"
            label=" "
            value={maxBudget}
            onChangeText={setMaxBudget}
            keyboardType="numeric"
            leftIcon={<Icon name="cash-plus" type="material-community" color={COLORS.gray}/>}
          />
      </View>

      <View style={styles.row}>
        {/* ... (Selector de fecha se mantiene igual) */}
        <Button
          title={deliveryDate ? deliveryDate.toLocaleDateString('es-ES') : 'Seleccionar Fecha'}
          onPress={() => setShowDatePicker(true)}
          icon={{ name: 'calendar', type: 'material-community', color: COLORS.secondary }}
          type="outline"
          containerStyle={{ flex: 1, marginRight: 10 }}
        />
        {showDatePicker && (
          <DateTimePicker value={deliveryDate || new Date()} mode="date" display="default" onChange={(event, date) => { setShowDatePicker(Platform.OS === 'ios'); setDeliveryDate(date); }} />
        )}
      </View>
      
      <View style={styles.deliveryTypeContainer}>
         {/* ... (Selector de tipo de despacho se mantiene igual) */}
        <Button title="Enviar a Domicilio" type={deliveryType === 'delivery' ? 'solid' : 'outline'} onPress={() => setDeliveryType('delivery')} containerStyle={{ flex: 1 }} buttonStyle={{backgroundColor: deliveryType === 'delivery' ? COLORS.secondary : 'transparent'}}/>
        <Button title="Recoger en Tienda" type={deliveryType === 'pickup' ? 'solid' : 'outline'} onPress={() => setDeliveryType('pickup')} containerStyle={{ flex: 1, marginLeft: 10 }} buttonStyle={{backgroundColor: deliveryType === 'pickup' ? COLORS.secondary : 'transparent'}}/>
      </View>
      
      {/* --- El resto del JSX se mantiene igual --- */}
      <View style={styles.addItemContainer}>
        {/* ... */}
        <Text style={styles.subHeader}>Añadir Artículo</Text>
        <Input placeholder="Nombre del producto" value={newItemName} onChangeText={setNewItemName} />
        <Input placeholder="Marca (Opcional)" value={newItemBrand} onChangeText={setNewItemBrand} />
        <Input placeholder="Detalles (Opcional)" value={newItemNotes} onChangeText={setNewItemNotes} />

        <View style={styles.quantityContainer}>
          <Text style={styles.quantityLabel}>Cantidad:</Text>
          <TouchableOpacity onPress={() => setNewItemQty(q => Math.max(1, q - 1))}><Icon name="minus-circle" type="material-community" color={COLORS.secondary} size={30} /></TouchableOpacity>
          <Text style={styles.quantityText}>{newItemQty}</Text>
          <TouchableOpacity onPress={() => setNewItemQty(q => q + 1)}><Icon name="plus-circle" type="material-community" color={COLORS.secondary} size={30} /></TouchableOpacity>
          <TouchableOpacity style={styles.unitSelector} onPress={() => setIsUnitPickerVisible(true)}>
            <Text style={styles.unitText}>{newItemUnit}</Text><Icon name="chevron-down" type="material-community" color={COLORS.gray} />
          </TouchableOpacity>
        </View>
        <Button title="+ Añadir a la lista" onPress={handleAddItem} buttonStyle={{backgroundColor: COLORS.secondary}} />
      </View>

      {items.length > 0 && <Text style={styles.subHeader}>Artículos en tu lista ({items.length})</Text>}
      {items.map((item, index) => (
        <View key={index} style={styles.itemRow}>
          <View>
            <Text style={styles.itemTextMain}>{item.quantity} {item.unit} - {item.name}</Text>
            {!!item.brand && <Text style={styles.itemTextSub}>Marca: {item.brand}</Text>}
            {!!item.notes && <Text style={styles.itemTextSub}>Notas: {item.notes}</Text>}
          </View>
          <TouchableOpacity onPress={() => handleRemoveItem(index)}><Icon name="close-circle" type="material-community" color={COLORS.danger} /></TouchableOpacity>
        </View>
      ))}

      <Button title="Guardar y Publicar Lista" onPress={handleSaveList} buttonStyle={styles.saveButton} loading={loading} disabled={items.length === 0} />
      
      <BottomSheet isVisible={isUnitPickerVisible} onBackdropPress={() => setIsUnitPickerVisible(false)}>
        {UNITS.map((unit, i) => (
          <ListItem key={i} onPress={() => { setNewItemUnit(unit); setIsUnitPickerVisible(false); }}><ListItem.Content><ListItem.Title>{unit}</ListItem.Title></ListItem.Content></ListItem>
        ))}
      </BottomSheet>
    </ScrollView>
  );
}

// ... (Los estilos se mantienen igual)
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background, paddingHorizontal: 20 },
    header: { fontSize: 24, fontWeight: 'bold', color: COLORS.primary, marginBottom: 20, paddingTop: 20 },
    subHeader: { fontSize: 18, fontWeight: '500', color: COLORS.text, marginTop: 20, marginBottom: 10 },
    addItemContainer: { backgroundColor: COLORS.white, padding: 15, borderRadius: 12, marginBottom: 20, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
    quantityContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 10 },
    quantityLabel: { fontSize: 16, color: COLORS.text, marginRight: 'auto' },
    quantityText: { fontSize: 20, fontWeight: 'bold', marginHorizontal: 15 },
    unitSelector: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12 },
    unitText: { fontSize: 16, marginRight: 5 },
    itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#eee', borderRadius: 8, marginBottom: 10 },
    itemTextMain: { fontSize: 16, flex: 1, marginRight: 10, fontWeight: '500' },
    itemTextSub: { fontSize: 14, color: COLORS.gray, flex: 1, marginRight: 10 },
    saveButton: { backgroundColor: COLORS.primary, borderRadius: 10, paddingVertical: 15, marginTop: 20 },
    row: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    deliveryTypeContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
});