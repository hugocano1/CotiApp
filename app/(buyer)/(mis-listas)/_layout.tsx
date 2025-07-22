// app/(buyer)/(mis-listas)/_layout.tsx
import { Stack } from 'expo-router';
import { COLORS } from '../../../src/constants/colors';
export default function MisListasLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: COLORS.white,
      }}
    >
      <Stack.Screen name="index" options={{ title: "Mis listas de compras" }} />
      <Stack.Screen name="list-details/[id]" options={{ title: "Detalles de Lista" }} />
      <Stack.Screen name="order-details/[id]" options={{ title: "Ofertas Recibidas" }} />
    </Stack>
  );
}