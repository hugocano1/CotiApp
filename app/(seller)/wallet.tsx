import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Alert, Linking, ActivityIndicator } from 'react-native';
import { Card, Button, Icon, Divider } from '@rneui/themed';
import { useRouter, Stack } from 'expo-router'; // ✅ Importamos Stack
import { SellerService } from '../../src/services/seller.service';
import { useUserProfile } from '../../src/hooks/useUserProfile';
import { SellerWallet, WalletTransaction } from '../../src/types/entities';
import { COLORS } from '../../constants/Colors';
import { formatCurrency } from '../../src/utils/formatters';
import { scaleFont } from '../../src/utils/responsive';

// Número de soporte para recargas (Reemplazar con el real en producción)
const SUPPORT_WHATSAPP = '573000000000'; 

export default function WalletScreen() {
  const router = useRouter();
  const { userProfile } = useUserProfile();
  const [wallet, setWallet] = useState<SellerWallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ... (resto del código igual hasta el return)

  const fetchData = useCallback(async () => {
    try {
      const walletData = await SellerService.getMyWallet();
      setWallet(walletData);
      
      if (walletData) {
        const txData = await SellerService.getTransactions(walletData.id, 0, 50); // Traemos las últimas 50
        setTransactions(txData);
      }
    } catch (error: any) {
      console.error(error);
      Alert.alert('Error', 'No se pudo cargar la información de la billetera.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleRecharge = () => {
    const sellerName = userProfile?.nombre || 'Vendedor';
    const message = `Hola Lizi, soy la tienda *${sellerName}* (ID: ${userProfile?.user_id?.substring(0,8)}). Deseo realizar una recarga de saldo a mi Billetera.`;
    const url = `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(message)}`;
    
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'No se pudo abrir WhatsApp. Por favor contáctanos al ' + SUPPORT_WHATSAPP);
    });
  };

  const showFrozenBalanceInfo = () => {
    Alert.alert(
      "Saldo Retenido",
      "Este dinero está temporalmente en garantía por tus pedidos en curso. \n\nSe liberará y descontará la comisión automáticamente cuando completes la entrega y confirmes el pago."
    );
  };

  const getTransactionIcon = (type: string) => {
    switch(type) {
      case 'top_up': return { name: 'arrow-up-circle', color: COLORS.success };
      case 'commission': return { name: 'arrow-down-circle', color: COLORS.danger };
      case 'refund': return { name: 'refresh-circle', color: COLORS.success };
      default: return { name: 'circle-outline', color: COLORS.gray };
    }
  };

  const getTransactionTitle = (type: string) => {
    switch(type) {
      case 'top_up': return 'Recarga de Saldo';
      case 'commission': return 'Comisión de Venta';
      case 'refund': return 'Reembolso / Ajuste';
      default: return 'Transacción';
    }
  };

  if (loading && !refreshing) {
    return <View style={styles.centered}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  }

  return (
    <>
      <Stack.Screen 
        options={{
          headerShown: true,
          title: 'Mi Billetera Lizi',
          headerStyle: { backgroundColor: COLORS.liziDark },
          headerTintColor: 'white',
          headerTitleStyle: { fontWeight: 'bold' },
        }} 
      />
      <ScrollView 
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
      >
        {/* --- Componente A: Tarjeta de Saldo --- */}
        <View style={styles.headerCard}>
          <View style={styles.iconCircle}>
            <Icon name="wallet" type="material-community" color={COLORS.primary} size={40} />
          </View>
          <Text style={styles.balanceLabel}>Saldo Disponible</Text>
          <Text style={styles.balanceValue}>
            {wallet ? formatCurrency(wallet.balance - wallet.frozen_balance) : '$ --'}
          </Text>
          
          <View style={styles.frozenContainer}>
            <Text style={styles.frozenLabel}>En Garantía / Retenido: </Text>
            <Text style={styles.frozenValue}>
              {wallet ? formatCurrency(wallet.frozen_balance) : '$ --'}
            </Text>
            <Icon 
              name="information-outline" 
              type="material-community" 
              size={18} 
              color={COLORS.gray} 
              onPress={showFrozenBalanceInfo}
              containerStyle={{ marginLeft: 5 }}
            />
          </View>
        </View>

        {/* --- Componente B: Botón de Recarga --- */}
        <View style={styles.actionContainer}>
          <Button
            title="Recargar Saldo"
            icon={<Icon name="whatsapp" type="material-community" color="white" size={20} style={{ marginRight: 10 }} />}
            buttonStyle={styles.rechargeButton}
            titleStyle={{ fontWeight: 'bold', fontSize: 16 }}
            onPress={handleRecharge}
          />
          <Text style={styles.rechargeNote}>
            Te redirigirá a WhatsApp para gestionar tu recarga.
          </Text>
        </View>

        {/* --- Componente C: Historial de Transacciones --- */}
        <View style={styles.historyContainer}>
          <Text style={styles.historyTitle}>Historial de Movimientos</Text>
          
          {transactions.length === 0 ? (
            <Text style={styles.emptyText}>No hay movimientos recientes.</Text>
          ) : (
            transactions.map((tx) => {
              const iconConfig = getTransactionIcon(tx.transaction_type);
              const isNegative = tx.amount < 0;
              
              return (
                <View key={tx.id} style={styles.txItem}>
                  <Icon name={iconConfig.name} type="material-community" color={iconConfig.color} size={32} containerStyle={{ marginRight: 12 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.txTitle}>{getTransactionTitle(tx.transaction_type)}</Text>
                    <Text style={styles.txDate}>{new Date(tx.created_at).toLocaleDateString()} • {new Date(tx.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
                    {tx.description && <Text style={styles.txDesc} numberOfLines={1}>{tx.description}</Text>}
                  </View>
                  <Text style={[styles.txAmount, { color: isNegative ? COLORS.danger : COLORS.success }]}>
                    {isNegative ? '' : '+'}{formatCurrency(tx.amount)}
                  </Text>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerCard: {
    backgroundColor: 'white',
    margin: 16,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: `${COLORS.primary}15`, // Fondo muy suave con el color primario
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  balanceLabel: { fontSize: scaleFont(14), color: COLORS.gray, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  balanceValue: { fontSize: scaleFont(36), fontWeight: 'bold', color: COLORS.success, marginBottom: 16 },
  frozenContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  frozenLabel: { fontSize: scaleFont(12), color: COLORS.gray },
  frozenValue: { fontSize: scaleFont(12), fontWeight: 'bold', color: '#FF9800' },
  
  actionContainer: { paddingHorizontal: 16, marginBottom: 24 },
  rechargeButton: { backgroundColor: '#25D366', borderRadius: 12, paddingVertical: 14, elevation: 2 },
  rechargeNote: { textAlign: 'center', color: COLORS.gray, fontSize: scaleFont(11), marginTop: 8 },

  historyContainer: { backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, flex: 1, elevation: 10 },
  historyTitle: { fontSize: scaleFont(18), fontWeight: 'bold', color: COLORS.text, marginBottom: 16 },
  emptyText: { textAlign: 'center', color: COLORS.gray, marginTop: 20, fontStyle: 'italic' },
  
  txItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  txTitle: { fontSize: scaleFont(14), fontWeight: '600', color: COLORS.text },
  txDate: { fontSize: scaleFont(11), color: COLORS.gray, marginTop: 2 },
  txDesc: { fontSize: scaleFont(11), color: COLORS.gray, fontStyle: 'italic', marginTop: 2 },
  txAmount: { fontSize: scaleFont(14), fontWeight: 'bold' },
});
