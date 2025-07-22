// app/(buyer)/(mis-pedidos)/_layout.tsx
import { Stack } from 'expo-router';
import { COLORS } from '../../../src/constants/colors';

export default function MisPedidosLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: COLORS.white,
      }}
    >
      <Stack.Screen name="index" options={{ title: "Mis Pedidos" }} />
      {/* ✅ AÑADIMOS LA NUEVA PANTALLA DE DETALLES */}
      <Stack.Screen name="pedido-detalle/[id]" options={{ title: "Detalles del Pedido" }} />
    </Stack>
  );
}