import { View, Text, TextInput, Button, Alert } from 'react-native';
import { useState } from 'react';
import { supabase } from '../../services/auth/config/supabaseClient';
import { NavigationProp } from '@react-navigation/native';

interface BidManagementScreenProps {
  navigation: NavigationProp<any>;
  route: any;
}

export default function BidManagementScreen({ route, navigation }: BidManagementScreenProps) {
  const { listId } = route.params; // Recibe el ID de la lista desde el Dashboard
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);
  // Removed duplicate navigation declaration

  // Enviar oferta a Supabase
  const submitBid = async () => {
    if (!price || isNaN(Number(price))) {
      Alert.alert('Error', 'Ingresa un precio válido');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase.from('bids').insert([{
        list_id: listId,
        seller_id: user?.id,
        price: Number(price),
        status: 'pending'
      }]);

      if (error) throw error;
      Alert.alert('Éxito', 'Oferta enviada correctamente');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', 'No se pudo enviar la oferta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20 }}>Crear Oferta</Text>
      
      <TextInput
        placeholder="Precio en $"
        keyboardType="numeric"
        value={price}
        onChangeText={setPrice}
        style={{ borderWidth: 1, padding: 10, marginVertical: 10 }}
      />

      <Button
        title="Enviar Oferta"
        onPress={submitBid}
        disabled={loading}
      />
    </View>
  );
}