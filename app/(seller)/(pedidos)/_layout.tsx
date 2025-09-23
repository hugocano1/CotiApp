// Ruta: app/(seller)/(pedidos)/_layout.tsx
import { Stack } from 'expo-router';
import { COLORS } from '../../../src/constants/colors';

export default function SellerOrdersLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      {/* ✅ CORRECCIÓN: Ahora mostramos el header y le ponemos el título aquí */}
      <Stack.Screen 
        name="index" 
        options={{ 
          title: "Mis Pedidos",
          headerShown: true 
        }} 
      /> 

      <Stack.Screen 
        name="order-details/[id]" 
        options={{ 
          title: "Detalles del Pedido",
          headerShown: true,
          headerBackTitle: 'Volver'
        }} 
      />
    </Stack>
  );
}