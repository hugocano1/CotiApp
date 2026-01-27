// Ruta: app/(buyer)/(mis-listas)/_layout.tsx
import { Stack, useRouter } from 'expo-router';
import { COLORS } from '../../../constants/Colors';
import { TouchableOpacity } from 'react-native';
import { Icon } from '@rneui/themed';

export default function MisListasLayout() {
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
          headerShown: true,
          title: "Mis listas de compras",
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
      <Stack.Screen 
        name="list-details/[id]" 
        options={{ 
          title: "Detalles de Lista",
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.replace('/(buyer)/(mis-listas)/')}
              style={{ marginRight: 15, padding: 5 }}
            >
              <Icon name="arrow-left" type="material-community" color={COLORS.white} />
            </TouchableOpacity>
          ),
        }} 
      />
    </Stack>
  );
}