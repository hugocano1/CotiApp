// app/(auth)/signup.tsx
import React, { useState } from 'react';
import { View, TextInput, Alert, ActivityIndicator, Text, TouchableOpacity, StyleSheet, Image, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Link } from 'expo-router';
import { AuthService } from '../../src/services/auth/auth.service';
import { COLORS } from '../../src/constants/colors';
import { scaleFont } from '../../src/utils/responsive';

// Regex for password strength
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})/;

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!email) {
      newErrors.email = 'El correo es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'El formato del correo no es válido';
    }

    if (!password) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (!PASSWORD_REGEX.test(password)) {
      newErrors.password = 'La contraseña debe tener 8+ caracteres, 1 mayúscula y 1 símbolo.';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const user = await AuthService.signUp(email, password, role);
      if (user) {
        Alert.alert(
          'Registro Exitoso',
          'Por favor, revisa tu email para confirmar tu cuenta.'
        );
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setErrors({ general: errorMessage });
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
          style={[styles.input, errors.email ? styles.inputError : null]}
          placeholder="tu@email.com"
          placeholderTextColor={COLORS.gray}
          value={email}
          onChangeText={(text) => { setEmail(text); if (errors.email) validate(); }}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
        
        <Text style={styles.label}>Contraseña</Text>
        <TextInput
          style={[styles.input, errors.password ? styles.inputError : null]}
          placeholder="••••••••"
          placeholderTextColor={COLORS.gray}
          value={password}
          onChangeText={(text) => { setPassword(text); if (errors.password) validate(); }}
          secureTextEntry
        />
        {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

        <Text style={styles.label}>Confirmar Contraseña</Text>
        <TextInput
          style={[styles.input, errors.confirmPassword ? styles.inputError : null]}
          placeholder="••••••••"
          placeholderTextColor={COLORS.gray}
          value={confirmPassword}
          onChangeText={(text) => { setConfirmPassword(text); if (errors.confirmPassword) validate(); }}
          secureTextEntry
        />
        {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
        
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
        
        {errors.general && <Text style={[styles.errorText, { textAlign: 'center', marginBottom: 10 }]}>{errors.general}</Text>}

        <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleSignUp} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Text style={styles.buttonText}>Registrarse</Text>
          )}
        </TouchableOpacity>
        
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
    marginBottom: 5, 
    paddingHorizontal: 15, 
    borderRadius: 10, 
    backgroundColor: COLORS.white, 
    fontSize: scaleFont(16)
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: scaleFont(12),
    marginBottom: 10,
    marginLeft: 4,
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
  buttonDisabled: {
    backgroundColor: COLORS.gray,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: scaleFont(18),
    fontWeight: 'bold'
  },
  loginLink: { marginTop: 20, alignItems: 'center' },
  loginLinkText: { color: COLORS.primary, fontSize: scaleFont(14), fontWeight: '500' }
});