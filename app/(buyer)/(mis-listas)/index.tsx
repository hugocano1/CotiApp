// Ruta: app/(buyer)/(mis-listas)/index.tsx
import React from 'react';
import { FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, View } from 'react-native';
import { useShoppingLists } from '../../../src/hooks/useShoppingLists';
import { Link } from 'expo-router';
import { COLORS } from '../../../src/constants/colors';
import { ShoppingListItem } from '../../../src/components/ShoppingListItem';

export default function MisListasScreen() {
  const { data: lists, loading, refresh } = useShoppingLists('active');

  if (loading) {
    return <ActivityIndicator size="large" style={styles.centered} />;
  }
  
  return (
    <View style={styles.container}>
      <FlatList
        data={lists}
        keyExtractor={(item) => item.id}
        onRefresh={refresh}
        refreshing={loading}
        renderItem={({ item }) => (
          // ✅ Cambiado: Usamos la sintaxis de objeto para el enlace
          <Link 
            href={{ 
              pathname: "/(buyer)/(mis-listas)/list-details/[id]",
              params: { id: item.id }
            }} 
            asChild
          >
            <TouchableOpacity>
              <ShoppingListItem list={item} />
            </TouchableOpacity>
          </Link>
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});