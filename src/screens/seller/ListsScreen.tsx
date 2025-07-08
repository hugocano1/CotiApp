import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { ListItem, Text, Card } from '@rneui/themed';
import { supabase } from '../../services/auth/config/supabaseClient';
import { NavigationProp } from '@react-navigation/native';

interface ShoppingList {
  id: string;
  title: string;
  // Add other relevant fields as needed
}

interface SellerListsScreenProps {
  navigation: NavigationProp<any>;
}

const ListsScreen = ({ navigation }: SellerListsScreenProps) => {
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchShoppingLists = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('shopping_lists')
        .select('*')
        .eq('status', 'active'); // Assuming only active lists are relevant

      if (error) throw error;
      setLists(data || []);
    } catch (error) {
      console.error('Error fetching lists:', error);
      // Handle error appropriately (e.g., show an alert)
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShoppingLists();
  }, [fetchShoppingLists]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2089dc" />
      </View>
    );
  }

  if (lists.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text>No hay listas disponibles.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={lists}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <Card containerStyle={styles.card}>
          <ListItem onPress={() => navigation.navigate('ListDetails', { listId: item.id })}>
            <ListItem.Content>
              <ListItem.Title>{item.title}</ListItem.Title>
            </ListItem.Content>
          </ListItem>
        </Card>
      )}
    />
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    borderRadius: 10,
    marginHorizontal: 10,
    marginVertical: 5,
  },
});

export default ListsScreen;
