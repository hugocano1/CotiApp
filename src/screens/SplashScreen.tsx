import React, { useEffect } from 'react';
import { View, Image, StyleSheet, Animated, Easing } from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';

const SplashScreen = () => {
  const navigation = useNavigation();
  const fadeAnim = new Animated.Value(0); // Opacidad inicial 0
  const scaleAnim = new Animated.Value(0.5); // Escala inicial 0.5

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1500,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Navegar a la pantalla de login después de la animación
      setTimeout(() => {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Main' }],
          })
        ); // Usar reset para evitar volver a la splash screen
      }, 1000); // Esperar 1 segundo antes de navegar
    });
  }, [navigation, fadeAnim, scaleAnim]);

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require('../../assets/splash_logo.png')} // Reemplaza con tu imagen
        style={[
          styles.logo,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2089dc', // Color de fondo de tu app
  },
  logo: {
    width: 250, // Ajusta el tamaño de tu logo
    height: 250, // Ajusta el tamaño de tu logo
    resizeMode: 'contain',
  },
});

export default SplashScreen;
