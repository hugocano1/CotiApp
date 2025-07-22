// app/(auth)/signup.tsx

import React, { useState } from 'react';
import { View, TextInput, Button, Alert, ActivityIndicator, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Link } from 'expo-router'; // ✅ 1. Importamos Link de Expo Router
import { AuthService } from '../../src/services/auth/auth.service'; // Asegúrate que la ruta es correcta
import { COLORS } from '../../src/constants/colors'; // Importamos nuestros colores de marca

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
        // La redirección después del login la manejará nuestro layout raíz automáticamente.
      }
    } catch (error: any) {
      Alert.alert('Error en el Registro', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crear una Cuenta</Text>
      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
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
        <ActivityIndicator size="large" color={COLORS.primary} />
      ) : (
        <Button title="Registrarse" onPress={handleSignUp} color={COLORS.secondary} />
      )}
      
      {/* ✅ 2. Añadimos el enlace para volver a Login */}
      <Link href="/(auth)" asChild>
        <TouchableOpacity style={styles.loginLink}>
          <Text style={styles.loginLinkText}>¿Ya tienes una cuenta? Inicia sesión</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

// Estilos usando nuestra paleta de colores de marca
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: COLORS.background },
  title: { fontSize: 24, fontWeight: 'bold', color: COLORS.primary, textAlign: 'center', marginBottom: 30 },
  input: { height: 50, borderColor: COLORS.gray, borderWidth: 1, marginBottom: 15, paddingHorizontal: 10, borderRadius: 8, backgroundColor: COLORS.white },
  label: { fontSize: 16, marginBottom: 10, color: COLORS.text },
  roleSelector: { flexDirection: 'row', marginBottom: 25 },
  roleButton: { flex: 1, padding: 12, alignItems: 'center', backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.gray, borderRadius: 8, marginHorizontal: 5 },
  roleButtonSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  roleText: { color: COLORS.text, fontWeight: '500' },
  roleTextSelected: { color: COLORS.white, fontWeight: 'bold' },
  loginLink: { marginTop: 25, alignItems: 'center' },
  loginLinkText: { color: COLORS.primary, fontSize: 16 }
});