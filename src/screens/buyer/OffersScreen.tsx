// src/screens/buyer/OffersScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Text, Card, Badge, Button, Icon } from '@rneui/themed';
import { NavigationProp, useFocusEffect } from '@react-navigation/native';
import { supabase } from '../../services/auth/config/supabaseClient';

type OfferStatus = 'pending' | 'accepted' | 'rejected';

interface Offer {
  id: string;
  list_id: string;
  seller_id: string;
  price: number;
  status: OfferStatus;
  created_at: string;
  seller_name?: string;
  list_title?: string;
}

interface BuyerOffersScreenProps {
  navigation: NavigationProp<any>;
}

const PAGE_SIZE = 10;

const OffersScreen = ({ navigation }: BuyerOffersScreenProps) => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<OfferStatus>('pending');
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOffers = useCallback(
    async (loadMore = false) => {
      try {
        if (!loadMore) {
          setLoading(true);
          setError(null);
        }

        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setError('Usuario no autenticado');
          return;
        }

        const statusFilter = [activeTab];

        const page = loadMore ? currentPage + 1 : 0;
        const from = page * PAGE_SIZE;
        const to = (page + 1) * PAGE_SIZE - 1;

        const { data, error: queryError, count } = await supabase
          .from('offers')
          .select(`
            *,
            seller:seller_id (name),
            list:list_id (title)
          `)
          .eq('buyer_id', user.id)
          .in('status', statusFilter)
          .order('created_at', { ascending: false })
          .range(from, to);

        if (queryError) throw queryError;

        setHasMore((data?.length || 0) >= PAGE_SIZE);
        setCurrentPage(page);

        const formattedOffers = (data || []).map((offer) => ({
          ...offer,
          id: offer.id.toString(),
          created_at: offer.created_at,
          seller_name: offer.seller?.name,
          list_title: offer.list?.title,
        })) as Offer[];

        setOffers((prev) =>
          loadMore ? [...prev, ...formattedOffers] : formattedOffers
        );
      } catch (err) {
        setError((err as Error).message || 'Error al cargar las ofertas');
        console.error('Error loading offers:', err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [activeTab, currentPage]
  );

  useFocusEffect(
    useCallback(() => {
      loadOffers();
    }, [loadOffers])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadOffers();
  };

  const loadMore = () => {
    if (!loading && hasMore && !error) {
      loadOffers(true);
    }
  };

  const renderListItem = ({ item }: { item: Offer }) => {
    const statusConfig: Record<OfferStatus, { color: 'success' | 'warning' | 'primary' | 'error'; text: string }> = {
      pending: { color: 'warning', text: 'Pendiente' },
      accepted: { color: 'success', text: 'Aceptada' },
      rejected: { color: 'error', text: 'Rechazada' },
    };

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('OfferDetails', { offerId: item.id })}
        activeOpacity={0.8}
      >
        {/* Uso de Card sin children */}
        <Card containerStyle={styles.card}>
          <Card.Title>{item.list_title}</Card.Title>
          <Card.Divider />
          <View style={styles.cardHeader}>
            <Text h4 style={styles.cardTitle}>
              {item.seller_name}
            </Text>
            <Badge
              value={statusConfig[item.status].text}
              status={statusConfig[item.status].color}
              containerStyle={styles.badge}
            />
          </View>

          <View style={styles.infoRow}>
            {/* Corrección: Props separados */}
            <Icon name="person" type="material" size={16} color="#888" />
            <Text style={styles.infoText}>
              Vendedor: {item.seller_name}
            </Text>
          </View>

          <View style={styles.infoRow}>
            {/* Corrección: Props separados */}
            <Icon name="attach-money" type="material" size={16} color="#888" />
            <Text style={styles.infoText}>
              Precio: ${item.price.toLocaleString()}
            </Text>
          </View>

          <View style={styles.divider} />

          <Button
            title="Ver detalles"
            type="outline"
            buttonStyle={styles.detailsButton}
            titleStyle={styles.detailsButtonText}
          />
        </Card>
      </TouchableOpacity>
    );
  };

  const renderContent = () => {
    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Icon name="error-outline" type="material" size={40} color="#ff4444" />
          <Text style={styles.errorText}>{error}</Text>
          <Button
            title="Reintentar"
            onPress={() => loadOffers()}
            buttonStyle={styles.retryButton}
          />
        </View>
      );
    }

    if (loading && !refreshing) {
      return (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#2089dc" />
        </View>
      );
    }

    if (offers.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Icon name="inbox" type="material" size={70} color="#ccc" />
          <Text style={styles.emptyText}>
            No tienes ofertas {activeTab === 'pending' ? 'pendientes' : activeTab === 'accepted' ? 'aceptadas' : 'rechazadas'}
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={offers}
        keyExtractor={(item) => item.id}
        renderItem={renderListItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2089dc']}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          hasMore && !loading ? (
            <View style={styles.loadingMore}>
              <ActivityIndicator size="small" color="#2089dc" />
            </View>
          ) : null
        }
        initialNumToRender={10}
        maxToRenderPerBatch={5}
        windowSize={5}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'pending' && styles.activeTab,
          ]}
          onPress={() => setActiveTab('pending')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'pending' && styles.activeTabText,
            ]}
          >
            Pendientes
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'accepted' && styles.activeTab,
          ]}
          onPress={() => setActiveTab('accepted')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'accepted' && styles.activeTabText,
            ]}
          >
            Aceptadas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'rejected' && styles.activeTab,
          ]}
          onPress={() => setActiveTab('rejected')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'rejected' && styles.activeTabText,
            ]}
          >
            Rechazadas
          </Text>
        </TouchableOpacity>
      </View>
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  listContent: {
    padding: 15,
  },
  card: {
    borderRadius: 12,
    marginBottom: 15,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    color: '#212529',
    fontSize: 18,
    fontWeight: '600',
  },
  badge: {
    alignSelf: 'flex-start',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  infoText: {
    color: '#495057',
    fontSize: 14,
    marginLeft: 5,
  },
  divider: {
    marginVertical: 10,
    backgroundColor: '#e9ecef',
  },
  detailsButton: {
    borderColor: '#2089dc',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  detailsButtonText: {
    color: '#2089dc',
    fontSize: 14,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 16,
    marginVertical: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#2089dc',
    borderRadius: 8,
    paddingHorizontal: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#6c757d',
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
  },
  loadingMore: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#e9f5ff',
  },
  tabText: {
    fontSize: 16,
    color: '#495057',
  },
  activeTabText: {
    color: '#2089dc',
    fontWeight: 'bold',
  },
});

export default OffersScreen;
