// app/(buyer)/(mis-pedidos)/_layout.tsx
import { Stack, useRouter } from 'expo-router';
import { COLORS } from '../../../constants/Colors';
import { TouchableOpacity } from 'react-native';
import { Icon } from '@rneui/themed';

export default function MisPedidosLayout() {
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: COLORS.white,
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ 
          title: "Mis Pedidos",
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push('/(buyer)/notifications')}
              style={{ marginRight: 15 }}
            >
              <Icon name="bell-outline" type="material-community" color={COLORS.white} />
            </TouchableOpacity>
          ),
        }} 
      />
      {/* ✅ AÑADIMOS LA NUEVA PANTALLA DE DETALLES */}
      <Stack.Screen name="order-details/[id]" options={{ title: "Detalles de la Oferta" }} />
      <Stack.Screen name="pedido-detalle/[id]" options={{ title: "Detalles del Pedido" }} />
    </Stack>
  );
}