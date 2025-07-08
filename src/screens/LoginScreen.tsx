import React, { useState } from 'react';
const loginLogo = require('../../assets/login_logo.png'); // Importa tu imagen
import { View, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { Text, Input, Button, Icon } from '@rneui/themed';
import { supabase } from '../services/auth/config/supabaseClient'; // Ajusta la ruta si es necesario
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigationTypes'; // Importa el tipo desde la raíz

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<LoginScreenNavigationProp>(); // Especifica el tipo de navegación

  const handleLogin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        Alert.alert('Error', `No se pudo iniciar sesión: ${error.message}`);
        throw error;
      }
      // Navega a la pantalla 'Seller' después de un inicio de sesión exitoso
      navigation.navigate('Seller');
    } catch (error) {
      console.error('Error signing in:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'apple') => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
      });
      if (error) {
        Alert.alert('Error', `No se pudo iniciar sesión con ${provider}: ${error.message}`);
        throw error;
      }
    } catch (error) {
      console.error(`Error signing in with ${provider}:`, error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={loginLogo} // Reemplaza con tu imagen
        style={styles.logo}
      />
      <Text h3 style={styles.title}>
        Bienvenido
      </Text>
      <Input
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        leftIcon={<Icon name="email" type="material" color="#2089dc" />}
        inputStyle={styles.input}
        inputContainerStyle={styles.inputContainer}
      />
      <Input
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        leftIcon={<Icon name="lock" type="material" color="#2089dc" />}
        inputStyle={styles.input}
        inputContainerStyle={styles.inputContainer}
      />
      <Button
        title="Iniciar Sesión"
        onPress={handleLogin}
        loading={loading}
        buttonStyle={styles.loginButton}
      />
      <View style={styles.socialLoginContainer}>
        <TouchableOpacity
          style={styles.socialButton}
          onPress={() => handleSocialLogin('google')}
        >
          <Icon name="google" type="font-awesome" color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.socialButton}
          onPress={() => handleSocialLogin('facebook')}
        >
          <Icon name="facebook" type="font-awesome" color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.socialButton}
          onPress={() => handleSocialLogin('apple')}
        >
          <Icon name="apple" type="font-awesome" color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa', // Color de fondo de tu app
  },
  logo: {
    width: 150, // Ajusta el tamaño de tu logo
    height: 150, // Ajusta el tamaño de tu logo
    marginBottom: 30,
    resizeMode: 'contain',
  },
  title: {
    marginBottom: 30,
    color: '#2089dc',
  },
  input: {
    color: '#212529',
  },
  inputContainer: {
    borderColor: '#2089dc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  loginButton: {
    backgroundColor: '#2089dc',
    width: '100%',
    marginTop: 20,
    borderRadius: 8,
  },
  socialLoginContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  socialButton: {
    backgroundColor: '#2089dc',
    padding: 10,
    borderRadius: 50,
  },
});

export default LoginScreen;