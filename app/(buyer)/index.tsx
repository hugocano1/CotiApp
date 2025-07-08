// src/screens/buyer/HomeScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Text, Button, Card, Icon } from '@rneui/themed';
import { NavigationProp } from '@react-navigation/native';
import { supabase } from '../../src/services/auth/config/supabaseClient';
import type { User } from '@supabase/supabase-js';

interface BuyerHomeScreenProps {
  navigation: NavigationProp<any>;
}

const BuyerHomeScreen = ({ navigation }: BuyerHomeScreenProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState({
    activeLists: 0,
    receivedOffers: 0,
    completedOrders: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      // Obtener usuario autenticado (ya se verifica la sesión en el useEffect)
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      setUser(user);

      // Obtener estadísticas
      if (user) {
        const { count: activeLists } = await supabase
          .from('shopping_lists')
          .select('*', { count: 'exact' })
          .eq('buyer_id', user.id)
          .in('status', ['active', 'pending']);

        const { count: receivedOffers } = await supabase
          .from('offers')
          .select('*', { count: 'exact' })
          .eq('buyer_id', user.id);

        const { count: completedOrders } = await supabase
          .from('orders')
          .select('*', { count: 'exact' })
          .eq('buyer_id', user.id)
          .eq('status', 'entregado');

        setStats({
          activeLists: activeLists || 0,
          receivedOffers: receivedOffers || 0,
          completedOrders: completedOrders || 0,
        });
      }
    } catch (err) {
      setError((err as Error).message || 'Error cargando datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        fetchData();
      } else {
        setError('Usuario no autenticado');
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#2089dc" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="error-outline" type="material" size={40} color="#ff4444" />
        <Text style={styles.errorText}>{error}</Text>
        <Button
          title="Reintentar"
          onPress={() => {
            setLoading(true);
            setError(null);
            const checkSession = async () => {
              const { data: { session } } = await supabase.auth.getSession();
              if (session?.user) {
                fetchData();
              } else {
                setError('Usuario no autenticado');
                setLoading(false);
              }
            };
            checkSession();
          }}
          buttonStyle={styles.retryButton}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text h4 style={styles.title}>
          ¡Hola, {user?.email?.split('@')[0] || 'Usuario'}!
        </Text>
        <Text style={styles.subtitle}>
          Crea tu lista de compras y recibe ofertas de vendedores cercanos
        </Text>
      </View>

      <Button
        title="Crear nueva lista de compras"
        onPress={() => navigation.navigate('CreateList')}
        buttonStyle={styles.createButton}
        iconRight={true}
        icon={
          <Icon
            name="add-shopping-cart"
            type="material"
            color="white"
            size={24}
            style={styles.buttonIcon}
          />
        }
      />

      <Card containerStyle={styles.statsCard}>
         <Card.Title style={styles.cardTitle}>Tus estadísticas</Card.Title>
          <Card.Divider />
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.activeLists}</Text>
              <Text style={styles.statLabel}>Listas activas</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.receivedOffers}</Text>
              <Text style={styles.statLabel}>Ofertas recibidas</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.completedOrders}</Text>
              <Text style={styles.statLabel}>Pedidos completados</Text>
            </View>
          </View>
    </Card>

      <Card containerStyle={styles.tipsCard}>
        <Card.Title style={styles.cardTitle}>Consejos para ahorrar</Card.Title>
          <Card.Divider />
          <View>
            <Text style={styles.tipText}>
              • Compara ofertas de diferentes vendedores para encontrar los mejores
              precios
            </Text>
            <Text style={styles.tipText}>
              • Programa tus compras con frecuencias semanales o mensuales
            </Text>
            <Text style={styles.tipText}>
              • Define un presupuesto máximo para mantener el control de tus gastos
            </Text>
          </View>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
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
  header: {
    padding: 20,
    backgroundColor: '#ffffff',
    marginBottom: 15,
  },
  title: {
    color: '#212529',
    marginBottom: 5,
  },
  subtitle: {
    color: '#6c757d',
    fontSize: 14,
  },
  createButton: {
    backgroundColor: '#2089dc',
    borderRadius: 8,
    marginHorizontal: 15,
    marginVertical: 10,
    paddingVertical: 12,
  },
  buttonIcon: {
    marginLeft: 10,
  },
  statsCard: {
    borderRadius: 12,
    marginHorizontal: 15,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    color: '#212529',
    fontSize: 18,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
  },
  statItem: {
    alignItems: 'center',
    padding: 10,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2089dc',
  },
  statLabel: {
    color: '#6c757d',
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
  },
  tipsCard: {
    borderRadius: 12,
    margin: 15,
    padding: 16,
  },
  tipText: {
    color: '#495057',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
});

export default BuyerHomeScreen;