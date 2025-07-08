import { useState } from 'react';
import { View, TextInput, Button, Alert, ActivityIndicator, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { NavigationProp } from '@react-navigation/native';
// ✅ PASO 1: Importar nuestro AuthService unificado
import { AuthService } from '../../../src/services/auth/auth.service'; // ¡Asegúrate de que la ruta sea correcta!

interface RegisterScreenProps {
  navigation: NavigationProp<any>;
}

export default function RegisterScreen({ navigation }: RegisterScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  // ✅ PASO 2: Añadir estado para guardar el rol seleccionado
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer'); // Por defecto 'buyer'

  // ✅ PASO 3: Actualizar la función para usar AuthService
  const handleSignUp = async () => {
    if (!email || !password || !role) {
      Alert.alert('Error', 'Completa todos los campos');
      return;
    }

    setLoading(true);
    try {
      Alert.alert('Depurando Registro', `Rol seleccionado: ${role}`);
      // Usamos nuestro servicio, que ya tiene toda la lógica correcta
      const user = await AuthService.signUp(email, password, role);

      if (user) {
        Alert.alert('¡Éxito!', 'Usuario registrado. Por favor, revisa tu email para confirmar la cuenta.');
        // Opcional: Redirigir a la pantalla de login
        // navigation.navigate('Login');
      }

    } catch (error: any) {
      // Nuestro AuthService ya formatea los errores, así que solo los mostramos
      Alert.alert('Error en el Registro', error.message);
    } finally {
      setLoading(false);
    }
  };

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
      
      {/* ✅ PASO 4: Añadir botones para seleccionar el rol */}
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

// Estilos básicos para que se vea bien
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  roleSelector: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  roleButton: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  roleButtonSelected: {
    backgroundColor: '#007BFF',
    borderColor: '#007BFF',
  },
  roleText: {
    color: '#000',
  },
  roleTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
});