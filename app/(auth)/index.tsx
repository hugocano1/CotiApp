// app/(auth)/index.tsx

import React, { useState } from 'react';
import { View, TextInput, StyleSheet, ActivityIndicator, Text, ImageBackground, TouchableOpacity, Image, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { supabase } from '../../src/services/auth/config/supabaseClient';
import Logo from '../../assets/images/login_logo.png';
import BackgroundImage from '../../assets/images/login_header_image.jpg';
import { COLORS } from '../../constants/Colors';
import { scaleFont } from '../../src/utils/responsive';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor, completa todos los campos.');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) {
        Alert.alert('Error', error.message || 'Error al iniciar sesión');
      }
    } catch (error) {
      Alert.alert('Error', (error as Error).message || 'Error inesperado');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ImageBackground source={BackgroundImage} style={styles.backgroundImage}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.container}>
            <Image source={Logo} style={styles.logo} />
            <Text style={styles.tagline}>El mejor precio para tu lista de compras</Text>

            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="white" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Correo electrónico"
                placeholderTextColor="rgba(255, 255, 255, 0.7)"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="white" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Contraseña"
                placeholderTextColor="rgba(255, 255, 255, 0.7)"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="white" />
              </TouchableOpacity>
            </View>

            {isLoading ? (
              <ActivityIndicator size="large" color="#FFFFFF" style={{ marginTop: 20 }} />
            ) : (
              <>
                <TouchableOpacity style={styles.logInButton} onPress={handleLogin}>
                  <Text style={styles.logInButtonText}>Iniciar Sesión</Text>
                </TouchableOpacity>
                <Link href="/Signup" asChild>
                  <TouchableOpacity style={styles.signUpButton}>
                    <Text style={styles.signUpButtonText}>¿No tienes cuenta? <Text style={{ fontWeight: 'bold', color: COLORS.secondary }}>Regístrate</Text></Text>
                  </TouchableOpacity>
                </Link>
                <Link href="/welcome" asChild>
                  <TouchableOpacity style={[styles.signUpButton, { marginTop: 10 }]}>
                    <Text style={[styles.signUpButtonText, { fontSize: scaleFont(14), opacity: 0.8 }]}>Volver a inicio</Text>
                  </TouchableOpacity>
                </Link>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
    backgroundImage: { flex: 1 },
    keyboardView: { flex: 1 },
    scrollContainer: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 },
    container: { width: '85%', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)', padding: 25, borderRadius: 20 },
    logo: { width: 120, height: 120, resizeMode: 'contain', marginBottom: 10 },
    tagline: { fontSize: scaleFont(16), color: 'white', marginBottom: 35, textAlign: 'center', fontWeight: '500' },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 55,
        borderColor: 'rgba(255, 255, 255, 0.5)',
        borderWidth: 1.5,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 12,
        marginBottom: 15,
        paddingHorizontal: 15,
        width: '100%',
    },
    inputIcon: { marginRight: 10 },
    input: { flex: 1, color: 'white', fontSize: scaleFont(16) },
    eyeIcon: { padding: 5 },
    logInButton: { backgroundColor: '#2a9d8f', paddingVertical: 15, borderRadius: 12, width: '100%', alignItems: 'center', elevation: 4, marginTop: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4 },
    logInButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    signUpButton: { paddingVertical: 10, marginTop: 15 },
    signUpButtonText: { color: 'white', fontSize: 16 }
});