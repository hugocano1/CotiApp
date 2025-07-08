import { AuthService, AuthError } from "../auth/auth.service";

export {};

(async () => {
  try {
    const session = await AuthService.signIn('usuario@ejemplo.com', 'password123');
    console.log('Sesión iniciada:', session);
  } catch (error) {
    if (error instanceof Error) {
      const friendlyMessage = AuthService.handleAuthError(error as AuthError);
      console.error('Error:', friendlyMessage);
    }
  }
})();