// app/(seller)/(pedidos)/_layout.tsx
import { Stack } from 'expo-router';
import { COLORS } from '../../../src/constants/colors'; // Asegúrate que la ruta sea correcta

export default function SellerOrdersLayout() {
  return (
    <Stack
      screenOptions={{
        // Estilos para el encabezado de esta sección
        headerStyle: {
          backgroundColor: COLORS.primary, // Fondo Azul Profundo
        },
        headerTintColor: COLORS.white, // Texto y flecha de atrás en blanco
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      {/* Ocultamos el header en la lista para que use el de la pestaña principal */}
      <Stack.Screen name="index" options={{ headerShown: false }} /> 

      {/* La pantalla de detalles sí tendrá este header */}
      <Stack.Screen 
        name="order-details/[id]" 
        options={{ title: "Detalles del Pedido" }} 
      />
    </Stack>
  );
}