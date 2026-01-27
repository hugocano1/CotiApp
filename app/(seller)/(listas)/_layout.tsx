// app/(seller)/(listas)/_layout.tsx
import { Stack } from 'expo-router';
import { COLORS } from '../../../constants/Colors';

export default function ListasStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: COLORS.white,
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Listas Disponibles' }} />
      <Stack.Screen name="list-details/[id]" options={{ title: "Detalles de la Lista" }} />
      {/* ✅ AÑADIMOS LA PANTALLA PARA CREAR OFERTA */}
      <Stack.Screen name="create-offer" options={{ title: "Crear nueva oferta", presentation: 'modal' }} />
    </Stack>
  );
}