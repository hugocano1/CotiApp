// Asegúrate de que todas las importaciones necesarias estén aquí
import { useState } from 'react';
import { View, TextInput, Button, Alert, ActivityIndicator, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { AuthService } from '../../../src/services/auth/auth.service'; // Asegúrate que la ruta es correcta

interface SignupScreenProps {
  navigation: NavigationProp<any>;
}

export default function SignupScreen({ navigation }: SignupScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');
  const [loading, setLoading] = useState(false);

  // --- Función de Registro Corregida ---
  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Completa todos los campos');
      return;
    }

    setLoading(true);

    try {
      // 1. La única responsabilidad del cliente es llamar a signUp
      Alert.alert('Enviando Datos a Supabase', `Email: ${email}\nPassword: [oculto]\nRol Seleccionado: ${role}`);
      const user = await AuthService.signUp(email, password, role);
      
      // 2. Si tiene éxito, informa al usuario. El Auth Hook hará el resto en el backend.
      if (user) {
        Alert.alert(
          'Registro Exitoso',
          'Por favor, revisa tu email para confirmar tu cuenta.'
        );
        // Aquí puedes navegar a la pantalla de Login o a una de espera
        // navigation.navigate('Login');
      }

    } catch (error: any) {
      // Muestra cualquier error que nuestro AuthService haya detectado (ej: contraseña débil)
      Alert.alert('Error en el Registro', error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- El resto de tu componente (la parte visual) ---
  return (
    <View style={styles.container}>
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
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <Button title="Registrarse" onPress={handleSignUp} />
      )}
    </View>
  );
}

// Estilos (los mismos que te pasé para RegisterScreen)
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  input: { height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 12, paddingHorizontal: 8 },
  label: { fontSize: 16, marginBottom: 8 },
  roleSelector: { flexDirection: 'row', marginBottom: 20 },
  roleButton: { flex: 1, padding: 10, alignItems: 'center', backgroundColor: '#f0f0f0', borderWidth: 1, borderColor: '#ccc' },
  roleButtonSelected: { backgroundColor: '#007BFF', borderColor: '#007BFF' },
  roleText: { color: '#000' },
  roleTextSelected: { color: '#fff', fontWeight: 'bold' },
});