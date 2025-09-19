// app/(auth)/signup.tsx

import React, { useState } from 'react';
import { View, TextInput, Alert, ActivityIndicator, Text, TouchableOpacity, StyleSheet, Image, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Link } from 'expo-router';
import { AuthService } from '../../src/services/auth/auth.service';
import { COLORS } from '../../src/constants/colors';
import { scaleFont } from '../../src/utils/responsive'; // Importamos nuestra función de escalado

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Completa todos los campos');
      return;
    }
    setLoading(true);
    try {
      const user = await AuthService.signUp(email, password, role);
      if (user) {
        Alert.alert(
          'Registro Exitoso',
          'Por favor, revisa tu email para confirmar tu cuenta. Serás redirigido al inicio de sesión.'
        );
      }
    } catch (error: unknown) {
      Alert.alert('Error en el Registro', error instanceof Error ? error.message : String(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.keyboardView}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Image source={require('../../assets/images/login_logo_2.png')} style={styles.logo} />
        <Text style={styles.title}>Crear una Cuenta</Text>
        
        <Text style={styles.label}>Correo electrónico</Text>
        <TextInput
          style={styles.input}
          placeholder="tu@email.com"
          placeholderTextColor={COLORS.gray}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <Text style={styles.label}>Contraseña</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor={COLORS.gray}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        
        <Text style={styles.label}>Selecciona tu rol:</Text>
        <View style={styles.roleSelector}>
          <TouchableOpacity
            style={[styles.roleButton, role === 'buyer' && styles.roleButtonSelected]}
            onPress={() => setRole('buyer')}
          >
            <Text style={[styles.roleText, role === 'buyer' && styles.roleTextSelected]}>Comprador</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.roleButton, role === 'seller' && styles.roleButtonSelected]}
            onPress={() => setRole('seller')}
          >
            <Text style={[styles.roleText, role === 'seller' && styles.roleTextSelected]}>Vendedor</Text>
          </TouchableOpacity>
        </View>
        
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginVertical: 20 }}/>
        ) : (
          <TouchableOpacity style={styles.button} onPress={handleSignUp}>
            <Text style={styles.buttonText}>Registrarse</Text>
          </TouchableOpacity>
        )}
        
        <Link href="/(auth)" asChild>
          <TouchableOpacity style={styles.loginLink}>
            <Text style={styles.loginLinkText}>¿Ya tienes una cuenta? Inicia sesión</Text>
          </TouchableOpacity>
        </Link>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: { flex: 1, backgroundColor: COLORS.background },
  container: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  logo: { width: 120, height: 120, alignSelf: 'center', marginBottom: 20 },
  title: { fontSize: scaleFont(28), fontWeight: 'bold', color: COLORS.primary, textAlign: 'center', marginBottom: 25 },
  label: { fontSize: scaleFont(14), color: COLORS.text, marginBottom: 8, marginLeft: 4 },
  input: { 
    height: 50, 
    borderColor: COLORS.gray, 
    borderWidth: 1, 
    marginBottom: 15, 
    paddingHorizontal: 15, 
    borderRadius: 10, 
    backgroundColor: COLORS.white, 
    fontSize: scaleFont(16)
  },
  roleSelector: { flexDirection: 'row', marginBottom: 25, gap: 10 },
  roleButton: { 
    flex: 1, 
    paddingVertical: 12,
    alignItems: 'center', 
    backgroundColor: COLORS.white, 
    borderWidth: 1.5, 
    borderColor: COLORS.gray,
    borderRadius: 10
  },
  roleButtonSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  roleText: { color: COLORS.text, fontWeight: '500', fontSize: scaleFont(14) },
  roleTextSelected: { color: COLORS.white, fontWeight: 'bold' },
  button: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: scaleFont(18),
    fontWeight: 'bold'
  },
  loginLink: { marginTop: 20, alignItems: 'center' },
  loginLinkText: { color: COLORS.primary, fontSize: scaleFont(14), fontWeight: '500' }
});