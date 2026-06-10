/*
 * =========================================================================
 *  CotiApp Colors - MVP Elegante (Refined based on DESIGN.md)
 * =========================================================================
 */

const brandPrimary = '#0ca0c9';   // Indigo Equilibrado
const brandSecondary = '#0F172A'; // Slate Dark (Títulos)
const brandAccent = '#F43F5E';    // Rose (Alertas)

const neutralBackground = '#F8FAFC';
const neutralSurface = '#FFFFFF';
const neutralText = '#334155';
const neutralGray = '#94A3B8';
const neutralBorder = '#E2E8F0';

export const COLORS = {
  // Mapeo Semántico
  primary: brandPrimary,
  secondary: brandSecondary,
  accent: brandAccent,
  text: neutralText,
  background: neutralBackground,
  white: neutralSurface,
  gray: neutralGray,
  
  // Estrellas y Calificaciones
  star: '#FBBF24', // Dorado/Oro

  // UI Component Tokens
  card: neutralSurface,
  border: neutralBorder,
  tabIconDefault: neutralGray,
  tabIconSelected: brandPrimary,
  
  // Convención Internacional de Estados (Semántica)
  success: '#10B981',   // Verde (Completado/Aprobado)
  warning: '#F59E0B',   // Ámbar
  danger: '#EF4444',    // Rojo
  info: '#3B82F6',      // Azul (Aceptado/Confirmado)
  processing: '#0ca0c9', // Violeta (En curso)
};

const themes = {
  light: {
    text: neutralText,
    background: neutralBackground,
    tint: brandPrimary,
    accent: brandAccent,
    card: neutralSurface,
    border: neutralBorder,
    tabIconDefault: neutralGray,
    tabIconSelected: brandPrimary,
  },
  dark: {
    text: '#F8FAFC',
    background: '#0F172A',
    tint: brandPrimary,
    accent: brandAccent,
    card: '#1E293B',
    border: '#334155',
    tabIconDefault: neutralGray,
    tabIconSelected: brandPrimary,
  },
};

export default themes;
