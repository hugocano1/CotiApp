// src/screens/buyer/ListsScreen.tsx
import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Button } from 'react-native';
import { useShoppingLists } from '../../hooks/useShoppingLists'; // Asumo que usas este hook
import { Card, Icon, Badge } from '@rneui/themed';
import { useFocusEffect } from '@react-navigation/native';

// ✅ 1. El componente DEBE recibir 'navigation' como prop para poder navegar.
export default function ListsScreen({ navigation }: { navigation: any }) {
  
  // Usamos 'null' para traer todas las listas, activas y completadas.
  // Luego, filtraremos en el componente.
  const { data: allLists, loading, refresh } = useShoppingLists(null); 
  const [activeTab, setActiveTab] = React.useState('Activas');

  const filteredLists = allLists.filter(list => {
    if (activeTab === 'Activas') {
      return list.status === 'active';
    } else {
      return list.status === 'completed'; // O el estado que uses para completadas
    }
  });

  if (loading) {
    return <ActivityIndicator size="large" style={styles.centered} />;
  }

  const renderItem = ({ item }: { item: any }) => (
    <Card containerStyle={styles.card}>
      <Card.Title>{item.title || 'Lista de Compras'}</Card.Title>
      <Badge value={item.status} status={item.status === 'active' ? 'success' : 'primary'} />
      <Card.Divider style={{ marginTop: 10 }}/>
      <View style={styles.infoRow}>
        <Icon name="calendar" type="material-community" color="#517fa4" size={16} />
        <Text> Creada: {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}</Text>
      </View>
      <View style={styles.infoRow}>
        <Icon name="cart-outline" type="material-community" color="#517fa4" size={16} />
        <Text> {item.items?.length || 0} productos</Text>
      </View>
      <View style={styles.infoRow}>
        <Icon name="cash" type="material-community" color="#517fa4" size={16} />
        <Text> Presupuesto: ${item.min_budget || 0} - ${item.max_budget || 0}</Text>
      </View>
      
      {/* ✅ 2. El botón debe tener la función onPress que llama a navigation.navigate */}
      <Button
        title="Ver detalles"
        type="clear"
        containerStyle={{ marginTop: 10 }}
        onPress={() => navigation.navigate('ListOffers', { listId: item.id })}
      />
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity onPress={() => setActiveTab('Activas')} style={[styles.tab, activeTab === 'Activas' && styles.activeTab]}>
          <Text style={[styles.tabText, activeTab === 'Activas' && styles.activeTabText]}>Activas</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('Completadas')} style={[styles.tab, activeTab === 'Completadas' && styles.activeTab]}>
          <Text style={[styles.tabText, activeTab === 'Completadas' && styles.activeTabText]}>Completadas</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredLists}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.emptyText}>No hay listas en esta categoría.</Text>}
        onRefresh={refresh}
        refreshing={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, backgroundColor: '#f4f4f4' },
  emptyText: { textAlign: 'center', marginTop: 50 },
  card: { borderRadius: 10 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    backgroundColor: 'white',
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: '#e0f7ff',
  },
  tabText: {
    color: '#007aff',
    fontWeight: '500'
  },
  activeTabText: {
    color: '#005ecb',
    fontWeight: 'bold',
  }
});