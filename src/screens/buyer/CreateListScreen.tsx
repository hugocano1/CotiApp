// src/screens/buyer/CreateListScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Platform, ActivityIndicator } from 'react-native'; // Importa ScrollView y Platform
import { supabase } from '../../services/auth/config/supabaseClient';
import { useAuth } from '../../hooks/useAuth';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Alert } from 'react-native'; // Importa Alert

// Define el tipo para un artículo de la lista
interface Item {
  nombre: string;
  unidad: string;
  marca: string;
  notas: string;
  // Podrías necesitar añadir un campo para la cantidad si es relevante para el comprador
  // cantidad: number;
}

const CreateListScreen = ({ navigation }: { navigation: any }) => { // Agrega navigation aquí para poder navegar
  const [title, setTitle] = useState('');
  const [minBudget, setMinBudget] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [items, setItems] = useState<Item[]>([{ nombre: '', unidad: '', marca: '', notas: '' }]);
  const [loading, setLoading] = useState(false); // Agrega estado de carga
  const { session } = useAuth();

  const handleDateChange = (event: any, selectedDate: Date | undefined) => {
    // Para iOS, el picker se cierra después de seleccionar la fecha, para Android, no siempre.
    // Puedes necesitar ajustar el manejo de visibilidad del picker según la plataforma.
    if (Platform.OS === 'android') {
        setShowDatePicker(false);
    }
    if (selectedDate) {
      setExpiresAt(selectedDate);
    }
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  const handleAddItem = () => {
    setItems([...items, { nombre: '', unidad: '', marca: '', notas: '' }]);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleItemChange = (index: number, field: keyof Item, value: string) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleSaveList = async () => { // Haz la función asíncrona
    if (!session?.user) {
      Alert.alert('Error', 'Debes iniciar sesión para crear una lista.');
      return;
    }

    if (!title.trim() || items.length === 0 || items.some(item => !item.nombre.trim())) {
        Alert.alert('Error', 'El título de la lista y al menos un artículo con nombre son obligatorios.');
        return;
    }

    setLoading(true);

    try {
      // Prepara los datos para insertar en la tabla shopping_lists
      const newList = {
        title: title.trim(),
        min_budget: minBudget ? parseFloat(minBudget) : null, // Convierte a número o null
        max_budget: maxBudget ? parseFloat(maxBudget) : null, // Convierte a número o null
        expires_at: expiresAt ? expiresAt.toISOString() : null, // Convierte la fecha a formato ISO 8601
        buyer_id: session.user.id,
        status: 'active', // O el estado por defecto que uses
        items: items.filter(item => item.nombre.trim()).map(item => ({ // Filtra items vacíos y mapea a la estructura esperada por tu base de datos
            name: item.nombre.trim(),
            unit: item.unidad.trim(),
            brand: item.marca.trim(), // Asumo que la columna se llama 'brand'
            notes: item.notas.trim(), // Asumo que la columna se llama 'notes'
            // Añade otras propiedades del item si tu tabla las espera
        })),
      };

      // Inserta la nueva lista en la tabla shopping_lists
      const { data, error } = await supabase
        .from('shopping_lists') // Asegúrate de que 'shopping_lists' es el nombre correcto de tu tabla
        .insert([newList]);

      if (error) {
        throw error;
      }

      Alert.alert('Éxito', 'Lista guardada correctamente.');
      // Limpia el formulario después de guardar si es necesario
      setTitle('');
      setMinBudget('');
      setMaxBudget('');
      setExpiresAt(null);
      setItems([{ nombre: '', unidad: '', marca: '', notas: '' }]);
      // Navega de regreso a la lista de compras o a otra pantalla
      navigation.navigate('MyLists'); // Navega a la pestaña "Mis listas"

    } catch (error) {
      Alert.alert('Error', (error as Error).message || 'Error al guardar la lista.');
      console.error('Error saving shopping list:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    // Envuelve el contenido en un ScrollView
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Text style={styles.title}>Crear Nueva Lista de Compras</Text>

      <TextInput
        style={[styles.input, styles.textInputCommon]} // Aplica estilos comunes
        placeholder="Título de la Lista"
        value={title}
        onChangeText={setTitle}
        // Agrega placeholderTextColor si el placeholder no se ve
        placeholderTextColor="#888" // Color de placeholder visible
      />

      <TextInput
        style={[styles.input, styles.textInputCommon]} // Aplica estilos comunes
        placeholder="Presupuesto Mínimo"
        value={minBudget}
        onChangeText={setMinBudget}
        keyboardType="numeric"
         placeholderTextColor="#888" // Color de placeholder visible
      />

      <TextInput
        style={[styles.input, styles.textInputCommon]} // Aplica estilos comunes
        placeholder="Presupuesto Máximo"
        value={maxBudget}
        onChangeText={setMaxBudget}
        keyboardType="numeric"
         placeholderTextColor="#888" // Color de placeholder visible
      />

      <View style={styles.datePickerContainer}>
        <Text>Fecha de Despacho:</Text>
        {/* Considera usar TouchableOpacity con Text dentro para mejor estilo del botón de fecha */}
        <Button onPress={showDatepicker} title={expiresAt ? expiresAt.toLocaleDateString() : 'Seleccionar Fecha'} />
        {showDatePicker && (
          <DateTimePicker
            testID="dateTimePicker"
            value={expiresAt || new Date()}
            mode="date"
            is24Hour={true}
            display="default"
            onChange={handleDateChange}
          />
        )}
      </View>

      <Text style={styles.subtitle}>Artículos de la Lista:</Text>
      {items.map((item, index) => (
        <View key={index} style={styles.itemContainer}>
           {/* Considera añadir un Text label encima de cada input o usar View/Wrapper para más control */}
          <TextInput
            style={[styles.itemInput, styles.textInputCommon]} // Aplica estilos comunes
            placeholder="Nombre del Producto"
            value={item.nombre}
            onChangeText={(text) => handleItemChange(index, 'nombre', text)}
             placeholderTextColor="#888" // Color de placeholder visible
          />
          <TextInput
            style={[styles.itemInput, styles.textInputCommon]} // Aplica estilos comunes
            placeholder="Unidad (ej: kg, unidad)"
            value={item.unidad}
            onChangeText={(text) => handleItemChange(index, 'unidad', text)}
             placeholderTextColor="#888" // Color de placeholder visible
          />
          <TextInput
            style={[styles.itemInput, styles.textInputCommon]} // Aplica estilos comunes
            placeholder="Marca Preferida (opcional)"
            value={item.marca}
            onChangeText={(text) => handleItemChange(index, 'marca', text)}
             placeholderTextColor="#888" // Color de placeholder visible
          />
          <TextInput
            style={[styles.itemInput, styles.textInputCommon]} // Aplica estilos comunes
            placeholder="Notas (opcional)"
            value={item.notas}
            onChangeText={(text) => handleItemChange(index, 'notas', text)}
             placeholderTextColor="#888" // Color de placeholder visible
          />
          {items.length > 1 && (
            <Button title="Eliminar" onPress={() => handleRemoveItem(index)} color="red" /> // Añade color al botón de eliminar
          )}
        </View>
      ))}

      <Button title="Agregar Artículo" onPress={handleAddItem} />
      {/* Muestra ActivityIndicator si está cargando, deshabilita el botón */}
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 20 }} />
      ) : (
        <Button title="Guardar Lista" onPress={handleSaveList} disabled={loading} style={{ marginTop: 20 }} />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  // Estilo para el contentContainerStyle del ScrollView
  scrollContainer: {
    flexGrow: 1, // Permite que el contenido crezca y habilita el desplazamiento
    padding: 20,
  },
  container: {
    // flex: 1, // Eliminado flex: 1 ya que ScrollView lo maneja
    // padding: 20, // Eliminado padding ya que scrollContainer lo maneja
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    marginTop: 20,
    marginBottom: 10,
  },
   // Estilo común para TextInput para probar placeholderColor
   textInputCommon: {
     color: 'black', // Asegura que el texto escrito sea visible
   },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  datePickerContainer: {
    marginBottom: 20,
  },
  itemContainer: {
    marginBottom: 15,
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
  },
  itemInput: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 5,
    paddingHorizontal: 10,
    borderRadius: 3,
  },
});

export default CreateListScreen;