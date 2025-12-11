# AGENTS.md para el Proyecto CotiApp

Este documento proporciona instrucciones para que los agentes de IA y los desarrolladores entiendan y trabajen correctamente en el proyecto CotiApp.

## 1. Resumen del Proyecto

CotiApp es una aplicación móvil que conecta compradores con vendedores. Los compradores crean listas de compras y los vendedores realizan ofertas. El proyecto está construido con React Native (Expo) y utiliza Supabase como backend principal (base de datos, autenticación, funciones).

## 2. Configuración de Desarrollo

1.  **Instalar dependencias:**
    ```bash
    npm install
    ```
2.  **Iniciar el servidor de desarrollo:**
    ```bash
    npx expo start
    ```

## 3. Integración de Inteligencia Artificial

Este proyecto utiliza una arquitectura centralizada para orquestar las interacciones con la IA.

### Orquestador de IA (`ai-orchestrator`)

- **Ubicación:** `supabase/functions/ai-orchestrator`
- **Descripción:** Es el "puerto USB" central para todas las interacciones de IA. Es una Supabase Edge Function que actúa como intermediario entre la app móvil y los diferentes modelos o herramientas de IA.
- **Protocolo Futuro:** El objetivo es que este orquestador implemente el **Model Context Protocol (MCP)** para una comunicación estandarizada con las herramientas.
- **Endpoint:** `https://besyjnekyhwawdmocehw.supabase.co/functions/v1/ai-orchestrator`
