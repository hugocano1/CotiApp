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
      <Stack.Screen name="create-offer" options={{ title: "Hacer una Oferta" }} />
    </Stack>
  );
}