/*
 * =========================================================================
 *  Paleta de Colores "Fresh Tech"
 * =========================================================================
 *  Definida para unificar el sistema de diseño de la aplicación,
 *  basada en una psicología de color clara para una UX persuasiva.
 *
 *  - LiziBrand (Primary Mint): #00D2A0
 *    Psicología: Éxito, Dinero, Acción Positiva.
 *    Uso: CTAs principales (ej. "Aceptar Oferta"), indicadores de éxito.
 *
 *  - LiziDark (Secondary Navy): #1A1D2B
 *    Psicología: Tecnología, Seguridad, Soporte, Elegancia.
 *    Uso: Texto principal, títulos, barras de navegación, fondos oscuros.
 *
 *  - LiziAlert (Accent Pop): #FF4B6E
 *    Psicología: Urgencia, Atención, Oportunidad.
 *    Uso: Badges de notificación, alertas, acciones destructivas (Cancelar).
 *
 *  - LiziSurface (BG Cloud): #F4F7F9
 *    Psicología: Limpieza, Espacio, Calma.
 *    Uso: Fondo general de pantallas (modo claro) para reducir fatiga visual.
 *
 *  - White: #FFFFFF
 *    Psicología: Simplicidad, Contraste.
 *    Uso: Texto sobre fondos de color, superficies de tarjetas en modo claro.
 * =========================================================================
 */

/*
 * =========================================================================
 *  Paleta de Colores "Fresh Tech"
 * =========================================================================
 *  Definida para unificar el sistema de diseño de la aplicación,
 *  basada en una psicología de color clara para una UX persuasiva.
 *
 *  - LiziBrand (Primary Mint): #00D2A0
 *    Psicología: Éxito, Dinero, Acción Positiva.
 *    Uso: CTAs principales (ej. "Aceptar Oferta"), indicadores de éxito.
 *
 *  - LiziDark (Secondary Navy): #1A1D2B
 *    Psicología: Tecnología, Seguridad, Soporte, Elegancia.
 *    Uso: Texto principal, títulos, barras de navegación, fondos oscuros.
 *
 *  - LiziAlert (Accent Pop): #FF4B6E
 *    Psicología: Urgencia, Atención, Oportunidad.
 *    Uso: Badges de notificación, alertas, acciones destructivas (Cancelar).
 *
 *  - LiziSurface (BG Cloud): #F4F7F9
 *    Psicología: Limpieza, Espacio, Calma.
 *    Uso: Fondo general de pantallas (modo claro) para reducir fatiga visual.
 *
 *  - White: #FFFFFF
 *    Psicología: Simplicidad, Contraste.
 *    Uso: Texto sobre fondos de color, superficies de tarjetas en modo claro.
 * =========================================================================
 */

const liziBrand = '#00D2A0';
const liziDark = '#1A1D2B';
const liziAlert = '#FF4B6E';
const liziSurface = '#F4F7F9';
const white = '#FFFFFF';
const lightGrey = '#AAB8C2'; // Un gris más suave y alineado a la paleta

/*
 * =========================================================================
 *  Objeto de Colores para la Aplicación
 * =========================================================================
 *  NOTA: Este objeto actúa como un "adaptador" para mantener la compatibilidad
 *  con los componentes existentes que usan nombres de colores antiguos
 *  (ej. 'primary', 'secondary'). Mapea esos nombres a la nueva paleta
 *  "Fresh Tech". Esto permite que la app funcione sin tener que refactorizar
 *  todos los componentes inmediatamente.
 * =========================================================================
 */
export const COLORS = {
  // Nombres semánticos compatibles con el código antiguo
  primary: liziBrand,
  secondary: liziDark,
  accent: liziAlert,
  text: liziDark,
  background: liziSurface,
  white: white,
  gray: lightGrey,
  
  // Colores de la paleta original para acceso directo si es necesario
  liziBrand,
  liziDark,
  liziAlert,
  liziSurface,

  // UI específica
  card: white,
  border: '#E1E8ED',
  tabIconDefault: lightGrey,
  tabIconSelected: liziBrand,
  
  // Colores para estados
  success: '#28a745',
  warning: '#ffc107',
  danger: liziAlert,
  info: '#17a2b8',
};

// Se mantiene la estructura para futura implementación de temas, pero no se exporta por defecto
const themes = {
  light: {
    text: liziDark,
    background: liziSurface,
    tint: liziBrand,
    accent: liziAlert,
    card: white,
    border: '#E1E8ED',
    tabIconDefault: lightGrey,
    tabIconSelected: liziBrand,
  },
  dark: {
    text: white,
    background: liziDark,
    tint: liziBrand,
    accent: liziAlert,
    card: '#252938',
    border: '#38444D',
    tabIconDefault: lightGrey,
    tabIconSelected: liziBrand,
  },
};

export default themes;
