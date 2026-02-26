// app/(auth)/signup.tsx
import React, { useState, useEffect } from 'react';
import { View, TextInput, Alert, ActivityIndicator, Text, TouchableOpacity, StyleSheet, Image, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { AuthService } from '../../src/services/auth/auth.service';
import { COLORS } from '../../constants/Colors';
import { scaleFont } from '../../src/utils/responsive';
import { Ionicons } from '@expo/vector-icons';

// Regex for password strength
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})/;

export default function SignupScreen() {
  const params = useLocalSearchParams<{ role?: 'buyer' | 'seller' }>();
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'buyer' | 'seller'>(params.role || 'buyer');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (params.role) {
      setRole(params.role);
    }
  }, [params.role]);

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
          'Por favor, revisa tu email para confirmar tu cuenta.',
          [{ text: 'OK', onPress: () => router.replace('/(auth)') }]
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
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Image source={require('../../assets/images/login_logo_2.png')} style={styles.logo} />
        <Text style={styles.title}>Crear una Cuenta</Text>
        <Text style={styles.subtitle}>Únete a la comunidad de Lizi</Text>
        
        <Text style={styles.label}>Correo electrónico</Text>
        <View style={[styles.inputContainer, errors.email ? styles.inputError : null]}>
          <Ionicons name="mail-outline" size={20} color={COLORS.gray} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="tu@email.com"
            placeholderTextColor={COLORS.gray}
            value={email}
            onChangeText={(text) => { setEmail(text); if (errors.email) validate(); }}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
        
        <Text style={styles.label}>Contraseña</Text>
        <View style={[styles.inputContainer, errors.password ? styles.inputError : null]}>
          <Ionicons name="lock-closed-outline" size={20} color={COLORS.gray} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor={COLORS.gray}
            value={password}
            onChangeText={(text) => { setPassword(text); if (errors.password) validate(); }}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
            <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={COLORS.gray} />
          </TouchableOpacity>
        </View>
        {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

        <Text style={styles.label}>Confirmar Contraseña</Text>
        <View style={[styles.inputContainer, errors.confirmPassword ? styles.inputError : null]}>
          <Ionicons name="lock-closed-outline" size={20} color={COLORS.gray} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor={COLORS.gray}
            value={confirmPassword}
            onChangeText={(text) => { setConfirmPassword(text); if (errors.confirmPassword) validate(); }}
            secureTextEntry={!showConfirmPassword}
          />
          <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
            <Ionicons name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={20} color={COLORS.gray} />
          </TouchableOpacity>
        </View>
        {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
        
        {!params.role && (
          <>
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
          </>
        )}

        {params.role && (
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>
              Registrándote como: <Text style={{ fontWeight: 'bold' }}>{role === 'seller' ? 'Negocio' : 'Comprador'}</Text>
            </Text>
          </View>
        )}
        
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
            <Text style={styles.loginLinkText}>¿Ya tienes una cuenta? <Text style={{ color: COLORS.secondary, fontWeight: 'bold' }}>Inicia sesión</Text></Text>
          </TouchableOpacity>
        </Link>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: { flex: 1, backgroundColor: COLORS.background },
  container: { flexGrow: 1, justifyContent: 'center', padding: 25 },
  logo: { width: 100, height: 100, alignSelf: 'center', marginBottom: 10 },
  title: { fontSize: scaleFont(28), fontWeight: 'bold', color: COLORS.primary, textAlign: 'center', marginBottom: 5 },
  subtitle: { fontSize: scaleFont(16), color: COLORS.gray, textAlign: 'center', marginBottom: 30 },
  label: { fontSize: scaleFont(14), color: COLORS.text, marginBottom: 8, marginLeft: 4, fontWeight: '600' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 55,
    borderColor: '#E0E0E0',
    borderWidth: 1.5,
    marginBottom: 5,
    paddingHorizontal: 15,
    borderRadius: 12,
    backgroundColor: COLORS.white,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: { 
    flex: 1,
    height: '100%',
    fontSize: scaleFont(16),
    color: COLORS.text,
  },
  eyeIcon: {
    padding: 5,
  },
  inputError: {
    borderColor: '#FF5252',
  },
  errorText: {
    color: '#FF5252',
    fontSize: scaleFont(12),
    marginBottom: 15,
    marginLeft: 4,
  },
  roleSelector: { flexDirection: 'row', marginBottom: 25, gap: 10 },
  roleButton: { 
    flex: 1, 
    paddingVertical: 12,
    alignItems: 'center', 
    backgroundColor: COLORS.white, 
    borderWidth: 1.5, 
    borderColor: '#E0E0E0',
    borderRadius: 12
  },
  roleButtonSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  roleText: { color: COLORS.text, fontWeight: '500', fontSize: scaleFont(14) },
  roleTextSelected: { color: COLORS.white, fontWeight: 'bold' },
  roleBadge: {
    backgroundColor: '#F0F0F0',
    padding: 12,
    borderRadius: 10,
    marginBottom: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  roleBadgeText: {
    color: COLORS.text,
    fontSize: scaleFont(14),
  },
  button: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    elevation: 2,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  buttonDisabled: {
    backgroundColor: COLORS.gray,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: scaleFont(18),
    fontWeight: 'bold'
  },
  loginLink: { marginTop: 25, alignItems: 'center' },
  loginLinkText: { color: COLORS.text, fontSize: scaleFont(14) }
});