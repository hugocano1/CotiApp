import { supabase } from '../../services/auth/config/supabaseClient';
import { AuthError } from '@supabase/supabase-js';
import { Alert } from 'react-native';

// Expresión regular para validar la fortaleza de la contraseña
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})/;

export class AuthService {
  static async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password: password,
    });

    if (error) throw new Error(error.message);
    return data;
  }

  static async signUp(email: string, password: string, userType: 'buyer' | 'seller') {
    // Se mantiene la validación de la contraseña
    Alert.alert('Dentro de AuthService.signUp', `Rol recibido en el servicio: ${userType}`);
    if (!PASSWORD_REGEX.test(password)) {
      throw new Error('La contraseña debe tener 8+ caracteres, 1 mayúscula y 1 símbolo');
    }

    // --- SE ELIMINÓ LA RESTRICCIÓN DE EMAIL PARA VENDEDORES ---

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { user_type: userType }, // Se sigue enviando el rol correctamente
      },
    });

    if (error) throw this.handleAuthError(error);
    return data.user;
  }

  static async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw this.handleAuthError(error);
  }

  static handleAuthError(error: AuthError) {
    const messages: Record<string, string> = {
      'Invalid login credentials': 'Credenciales incorrectas',
      'Email not confirmed': 'Confirma tu email primero',
      'Weak password': 'Contraseña muy débil',
    };
    return new Error(messages[error.message] || error.message);
  }
}