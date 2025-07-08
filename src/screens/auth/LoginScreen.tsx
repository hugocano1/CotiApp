import React, { useState } from 'react';
import { View, TextInput, StyleSheet, ActivityIndicator, Text, ImageBackground, TouchableOpacity, Image, Alert } from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import Logo from '../../../assets/images/login_logo.png';
import BackgroundImage from '../../../assets/images/login_header_image.jpg'; // Reemplaza con la ruta correcta de tu imagen de encabezado
import { supabase } from '../../services/auth/config/supabaseClient'; // Importa supabase

interface LoginScreenProps {
  navigation: NavigationProp<any>;
}

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor, completa todos los campos.');
      return;
    }

    setIsLoading(true);
    try {
      const { data: { session }, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) {
        Alert.alert('Error', error.message || 'Error al iniciar sesión');
      } else {
        // El inicio de sesión fue exitoso, la sesión se actualizará automáticamente
        // en tu hook useAuth si está configurado correctamente.
        // Aquí puedes navegar a la siguiente pantalla si es necesario,
        // pero MainNavigator debería manejar la redirección basada en la sesión.
        console.log('Inicio de sesión exitoso:', session);
      }
    } catch (error) {
      Alert.alert('Error', (error as Error).message || 'Error inesperado al iniciar sesión');
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
          autoCorrect={false}
        />
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          autoComplete="password"
        />

        {isLoading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <>
            <TouchableOpacity style={styles.signUpButton} onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.signUpButtonText}>Registrarse</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.logInButton} onPress={handleLogin}>
              <Text style={styles.logInButtonText}>Iniciar Sesión</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20, // Añade un poco de padding al contenido
  },
  container: {
    width: '100%', // O un ancho específico si prefieres
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  tagline: {
    fontSize: 16,
    color: 'white', // Ajusta el color según tu imagen de fondo
    marginBottom: 40,
  },
  input: {
    height: 40,
    borderColor: 'white',
    borderWidth: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.7)', // Fondo semi-transparente
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
    width: '100%',
  },
  signUpButton: {
    backgroundColor: '#28a745', // Verde
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginBottom: 10,
    width: '100%',
    alignItems: 'center',
  },
  signUpButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  logInButton: {
    backgroundColor: 'transparent',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'white',
    width: '100%',
    alignItems: 'center',
  },
  logInButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});