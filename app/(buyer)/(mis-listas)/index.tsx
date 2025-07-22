// app/(buyer)/(mis-listas)/index.tsx
import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useShoppingLists } from '../../../src/hooks/useShoppingLists';
import { Card, Badge } from '@rneui/themed';
import { Link } from 'expo-router';
import { COLORS } from '../../../src/constants/colors';

export default function MisListasScreen() {
  const { data: lists, loading, refresh } = useShoppingLists('active'); // o el filtro que necesites

  if (loading) {
    return <ActivityIndicator size="large" style={styles.centered} />;
  }
  return (
    <FlatList
      style={styles.container}
      data={lists}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <Link href={{ pathname: `/(buyer)/(mis-listas)/list-details/${item.id}` }} asChild>
          <TouchableOpacity>
            <Card containerStyle={styles.card}>
              <Card.Title>{item.title}</Card.Title>
              <Badge value={item.status} status={item.status === 'active' ? 'success' : 'primary'} />
            </Card>
          </TouchableOpacity>
        </Link>
      )}
    />
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { borderRadius: 10 },
});