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

## 3. Arquitectura Técnica y Base de Datos

### Sistema de Billetera (Lizi Wallet)
Los vendedores operan bajo un sistema de prepago/comisión:
- **Comisión:** 5% fijo sobre el total de cada oferta aceptada.
- **Saldos:** 
    - `balance`: Saldo real disponible.
    - `frozen_balance`: Saldo retenido por pedidos en curso (comisiones pendientes de cobro).
- **Regla Crítica:** Un vendedor no puede recibir un pedido si su saldo disponible (`balance - frozen_balance`) es menor a la comisión del pedido.

### Flujo de Pedidos (Lifecycle)
1.  **Oferta Aceptada:** El pedido nace como `confirmed`. La comisión se suma al `frozen_balance`.
2.  **Despacho (Seller):** Cambia a `ready_for_pickup` (si es retiro) o `in_transit` (si es delivery).
3.  **Recepción (Buyer):** El comprador marca como recibido -> `delivered_pending_confirmation`.
4.  **Cierre (Seller):** El vendedor confirma el pago -> `completed`. En este punto se descuenta el `balance` y se libera el `frozen_balance`.

### Sistema de Diseño (DESIGN.md)
El proyecto sigue la especificación de **Google Labs (Design.md)**. Toda la identidad visual, tokens de color, espaciado y redondeado están definidos en el archivo `DESIGN.md` de la raíz. Los desarrolladores e IAs deben consultar este archivo antes de proponer cambios en la UI.

### Sistema de Ofertas (Ítems Detallados)
Las ofertas no son solo un precio global; desglosan cada producto de la lista original:
- **Workaround "Caballo de Troya":** Debido a limitaciones actuales en el esquema, el ID del producto original de la lista y las URLs de imagen se empaquetan en el campo `item_name` de la tabla `offer_items`.
- **Formato de Empaquetado:** `NombreProducto__ID__uuid__IMG__UrlComprador__SELLERIMG__UrlVendedor`.
- **Comparación Visual:** El frontend está diseñado para desempaquetar este string y permitir una comparación lado a lado entre lo que el comprador pidió (`IMG`) y lo que el vendedor ofrece entregar (`SELLERIMG`).

### Integración de Inteligencia Artificial


Este proyecto utiliza una arquitectura centralizada para orquestar las interacciones con la IA.

### Orquestador de IA (`ai-orchestrator`)

- **Ubicación:** `supabase/functions/ai-orchestrator`
- **Descripción:** Es el "puerto USB" central para todas las interacciones de IA. Es una Supabase Edge Function que actúa como intermediario entre la app móvil y los diferentes modelos o herramientas de IA.
- **Protocolo Futuro:** El objetivo es que este orquestador implemente el **Model Context Protocol (MCP)** para una comunicación estandarizada con las herramientas.
- **Endpoint:** `https://besyjnekyhwawdmocehw.supabase.co/functions/v1/ai-orchestrator`
