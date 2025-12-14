import { supabase } from '../../services/auth/config/supabaseClient';
import { AuthError, User } from '@supabase/supabase-js'; // ✅ IMPORTAR User
import { Alert } from 'react-native';

export { AuthError } from '@supabase/supabase-js'; // Re-export AuthError

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

  // ✅ MODIFICADO para limpiar el push_token
  static async signOut(user: User | null | undefined) {
    if (user) {
      try {
        const userRole = user.user_metadata.user_type;
        const profileTable = userRole === 'seller' ? 'seller_profiles' : 'buyer_profiles';
        
        // Actualizar el push_token a null
        const { error: updateError } = await supabase
          .from(profileTable)
          .update({ push_token: null })
          .eq('user_id', user.id);

        if (updateError) {
          // Opcional: loguear el error pero no impedir el signOut
          console.error('Error clearing push token:', updateError.message);
        }
      } catch (e) {
         console.error('Failed to clear push token during sign out:', e);
      }
    }
    
    // Proceder con el signOut de todas formas
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