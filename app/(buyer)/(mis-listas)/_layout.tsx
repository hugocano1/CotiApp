// Ruta: app/(buyer)/(mis-listas)/_layout.tsx
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
      {/* ✅ CORRECCIÓN: Nos aseguramos de que el header de la pantalla de índice sea visible */}
      <Stack.Screen 
        name="index" 
        options={{ 
          title: "Mis listas de compras",
          headerShown: true 
        }} 
      />
      <Stack.Screen name="list-details/[id]" options={{ title: "Detalles de Lista" }} />
    </Stack>
  );
}