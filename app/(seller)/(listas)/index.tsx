// Ruta: app/(seller)/(listas)/index.tsx
import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { ButtonGroup } from '@rneui/themed';
import { Link } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../../../src/services/auth/config/supabaseClient';
import { COLORS } from '../../../src/constants/colors';
import { SellerListItem } from '../../../src/components/SellerListItem'; // ✅ Importamos el nuevo componente

// Hook para cargar las listas con filtro
function useAvailableLists(statusFilter: 'active' | 'closed') {
  const [lists, setLists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLists = useCallback(async () => {
    setLoading(true);
    try {
      // ✅ CONSULTA MEJORADA: Traemos los datos del perfil del comprador
      const { data, error } = await supabase
        .from('shopping_lists')
        .select(`
          *,
          buyer_profiles (
            nombre,
            apellido,
            foto_perfil
          )
        `)
        .eq('status', statusFilter);

      if (error) throw error;
      setLists(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useFocusEffect(useCallback(() => { fetchLists(); }, [fetchLists]));

  return { lists, loading, refresh: fetchLists };
}

export default function AvailableListsScreen() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const statusFilter = selectedIndex === 0 ? 'active' : 'closed';
  const { lists, loading, refresh } = useAvailableLists(statusFilter);
  
  if (loading) {
    return <ActivityIndicator size="large" style={styles.centered} />;
  }

  return (
    <View style={styles.container}>
      <ButtonGroup
        buttons={['Activas', 'Cerradas']}
        selectedIndex={selectedIndex}
        onPress={(value) => setSelectedIndex(value)}
        containerStyle={styles.buttonGroupContainer}
        selectedButtonStyle={{ backgroundColor: COLORS.primary }}
      />
      <FlatList
        data={lists}
        keyExtractor={(item) => item.id}
        onRefresh={refresh}
        refreshing={loading}
        ListEmptyComponent={
            <View style={styles.centered}>
                <Text style={styles.emptyText}>No hay listas en esta categoría.</Text>
            </View>
        }
        renderItem={({ item }) => (
          <Link 
            href={{
              pathname: "/(seller)/(listas)/list-details/[id]",
              params: { id: item.id }
            }}
            asChild
          >
            <TouchableOpacity>
              {/* ✅ Usamos nuestro nuevo componente de tarjeta para vendedor */}
              <SellerListItem list={item} />
            </TouchableOpacity>
          </Link>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 50 },
  buttonGroupContainer: {
    marginHorizontal: 15,
    marginVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: COLORS.gray,
  },
});