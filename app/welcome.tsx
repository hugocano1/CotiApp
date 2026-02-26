import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '../constants/Colors';
import { scaleFont } from '../src/utils/responsive';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();

  const handleRoleSelection = (role: 'buyer' | 'seller') => {
    router.push({
      pathname: '/Signup',
      params: { role },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image 
          source={require('../assets/images/login_logo_2.png')} 
          style={styles.logo} 
          resizeMode="contain"
        />
        <Text style={styles.title}>¿Cómo quieres usar Lizi hoy?</Text>
      </View>

      <View style={styles.content}>
        <TouchableOpacity 
          style={styles.card} 
          onPress={() => handleRoleSelection('seller')}
        >
          <View style={[styles.iconContainer, { backgroundColor: '#E8F5E9' }]}>
            <MaterialCommunityIcons name="storefront" size={40} color="#2E7D32" />
          </View>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>Tengo un Negocio</Text>
            <Text style={styles.cardDescription}>Publica ofertas, llega a más vecinos y haz crecer tus ventas.</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.gray} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.card, { marginTop: 20 }]} 
          onPress={() => handleRoleSelection('buyer')}
        >
          <View style={[styles.iconContainer, { backgroundColor: '#E3F2FD' }]}>
            <MaterialCommunityIcons name="cart" size={40} color="#1565C0" />
          </View>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>Quiero Comprar</Text>
            <Text style={styles.cardDescription}>Encuentra los mejores precios de tu zona y ahorra en tu lista.</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.gray} />
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>¿Ya tienes cuenta?</Text>
        <TouchableOpacity onPress={() => router.push('/(auth)')}>
          <Text style={styles.loginText}>Inicia Sesión</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: scaleFont(24),
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: scaleFont(18),
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 5,
  },
  cardDescription: {
    fontSize: scaleFont(14),
    color: COLORS.gray,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  footerText: {
    fontSize: scaleFont(14),
    color: COLORS.text,
    marginRight: 5,
  },
  loginText: {
    fontSize: scaleFont(14),
    color: COLORS.secondary,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});
