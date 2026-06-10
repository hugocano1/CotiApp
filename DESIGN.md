---
name: CotiApp Design System
version: 1.1.0
author: Gemini CLI
tokens:
  colors:
    brand:
      primary: "#4F46E5"   # Indigo (Más equilibrado)
      secondary: "#0F172A" # Slate Dark (Para títulos y texto principal)
      accent: "#F43F5E"    # Rose (Para alertas reales)
    neutral:
      background: "#F8FAFC"
      surface: "#FFFFFF"
      text: "#334155"       # Slate 700 (Menos agresivo que negro puro)
      gray: "#94A3B8"
      border: "#E2E8F0"
    semantic:
      star: "#FBBF24"      # Gold (Para estrellas de calificación)
      confirmed: "#3B82F6" # Blue (Convención internacional: Información/Aceptado)
      processing: "#8B5CF6" # Violet (En curso)
      success: "#10B981"    # Green (Completado/Aprobado)
      danger: "#EF4444"     # Red (Cancelado/Error)
  spacing:
    xs: 4
    sm: 8
    md: 16
    lg: 24
    xl: 32
  rounding:
    sm: 4
    md: 8
    lg: 12
    xl: 20
    full: 9999
---

# 🎨 CotiApp Design System (MVP Elegante)

## 🌈 Racional de Color

- **Títulos y Jerarquía:** Se usa `brand.secondary` (Slate Dark) para dar sobriedad y elegancia. El Indigo queda relegado a acentos de marca y botones de acción.
- **Calificaciones:** Se usa el token `semantic.star` (Dorado) para total coherencia visual.
- **Estados de Pedido:**
  - **Azul (`confirmed`):** Pedido aceptado, información clara.
  - **Violeta (`processing`):** En camino o listo para recoger.
  - **Verde (`success`):** Finalizado exitosamente.
- **Login:** Reducción de la opacidad del overlay para apreciar el diseño de fondo sin oscurecerlo demasiado.

## 🔘 Botones y Contraste

- **Botón Primario:** Fondo Indigo, texto Blanco (Legibilidad AA).
- **Botón de Acción:** Evitar fondos saturados con textos oscuros. Fondo suave + Borde + Icono de color.
