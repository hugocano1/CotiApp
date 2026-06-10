// app/(seller)/(offers)/_layout.tsx
import { Stack } from 'expo-router';
import { COLORS } from '../../../constants/Colors';

export default function OffersLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: COLORS.white,
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Mis Ofertas' }} />
      <Stack.Screen name="offer-details/[id]" options={{ title: 'Detalles de oferta' }} />
    </Stack>
  );
}