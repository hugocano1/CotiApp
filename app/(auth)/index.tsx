// app/(auth)/index.tsx

import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View, TextInput, StyleSheet, ActivityIndicator, Text, ImageBackground, TouchableOpacity, Image, Alert } from 'react-native';
import { Link } from 'expo-router';
import { supabase } from '../../src/services/auth/config/supabaseClient'; // ✅ Ruta corregida
import Logo from '../../assets/images/login_logo.png';             // ✅ Ruta corregida
import BackgroundImage from '../../assets/images/login_header_image.jpg'; // ✅ Ruta corregida

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
  if (!email || !password) {
    Alert.alert('Error', 'Por favor, completa todos los campos.');
    return;
  }

  setIsLoading(true);
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password.trim(),
    });

    if (error) {
      Alert.alert('Error', error.message);
    } else if (data.session) {
      // ✅ ¡ÉXITO! Si no hay error y tenemos sesión, redirigimos manualmente.
      router.replace('/(main)'); // Redirige a la pantalla principal
    }

  } catch (error) {
    Alert.alert('Error', (error as Error).message || 'Error inesperado');
  } finally {
    setIsLoading(false);
  }
};

  return (
    <ImageBackground source={BackgroundImage} style={styles.backgroundImage}>
      <View style={styles.container}>
        <Image source={Logo} style={styles.logo} />
        <Text style={styles.tagline}>El mejor precio para tu lista de compras</Text>

        <TextInput
          style={styles.input}
          placeholder="Correo electrónico"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {isLoading ? (
          <ActivityIndicator size="large" color="#FFFFFF" />
        ) : (
          <>
            <TouchableOpacity style={styles.logInButton} onPress={handleLogin}>
              <Text style={styles.logInButtonText}>Iniciar Sesión</Text>
            </TouchableOpacity>
            <Link href="/Signup" asChild>
              <TouchableOpacity style={styles.signUpButton}>
                <Text style={styles.signUpButtonText}>¿No tienes cuenta? Regístrate</Text>
              </TouchableOpacity>
            </Link>
          </>
        )}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
    backgroundImage: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    container: { width: '85%', alignItems: 'center' },
    logo: { width: 150, height: 150, resizeMode: 'contain', marginBottom: 20 },
    tagline: { fontSize: 16, color: 'white', marginBottom: 40, textAlign: 'center' },
    input: { height: 50, borderColor: 'white', borderWidth: 1, backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 10, marginBottom: 12, paddingHorizontal: 15, width: '100%', color: 'white' },
    logInButton: { backgroundColor: '#2a9d8f', paddingVertical: 15, borderRadius: 10, width: '100%', alignItems: 'center', elevation: 2, marginBottom: 15 },
    logInButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    signUpButton: { paddingVertical: 10 },
    signUpButtonText: { color: 'white', fontSize: 16 }
});