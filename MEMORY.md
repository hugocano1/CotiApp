# 🧠 Memoria del Proyecto - CotiApp

## 📅 Registro de Sesión: 9 de Junio, 2026 (Actualizada)

### 🚀 Logros del Día
1.  **⚡ Auditoría y Optimización de DB:**
    - Se crearon **11 índices estratégicos** en claves foráneas para garantizar un rendimiento instantáneo con miles de registros.
    - Se sincronizaron todas las migraciones pendientes en Supabase Cloud.
2.  **🔐 Seguridad e Higiene de Datos:**
    - Se refinaron las políticas **RLS** para proteger datos sensibles de compradores (dirección/cumpleaños), permitiendo visibilidad de perfil solo bajo interacción comercial o listas activas.
    - Se realizó una **limpieza transaccional total** de la base de datos (vaciado de listas, ofertas, pedidos y chats) manteniendo las cuentas de usuario y tiendas para nuevas pruebas de testers.
3.  **💰 Validación Persuasiva de Saldo:**
    - La pantalla de "Crear Oferta" ahora verifica el saldo del vendedor *antes* de enviar.
    - Si el saldo es insuficiente para la comisión (5%), muestra un mensaje amigable con acceso directo a la Billetera para recargar.
4.  **📸 Comparación Visual de Productos (Transparencia):**
    - Se implementó la capacidad de que el vendedor suba su propia foto del producto ofrecido.
    - El comprador ahora puede comparar **Lado a Lado** lo que pidió vs lo que le ofrecen mediante un modal de zoom rediseñado.
5.  **🐞 Correcciones Críticas de Flujo:**
    - Reparado el listado de notificaciones (se restauraron las políticas de SELECT faltantes).
    - Se reconectaron los datos de la lista de compras (Total, Fecha, Método) en los detalles del pedido.
    - Se habilitaron los botones de "Confirmar Pago" y "Calificar" según el estado real del pedido.
6.  **🎨 UX de Opiniones:**
    - Rediseño compacto de las tarjetas de opiniones (`RecentReviews`) alineando el texto a la derecha para optimizar el espacio horizontal.

### 📋 Tareas Pendientes para la Próxima Sesión
1.  **Rediseño de Inicio Vendedor:** Implementar la tarjeta con mini-mapa en la Home del vendedor para visualización rápida de actividad cercana.
2.  **Refactor de Ofertas (Arquitectura):** Considerar mover la URL de imagen del vendedor a una columna dedicada en la tabla `offer_items` para jubilar definitivamente el "Caballo de Troya" (actualmente funciona bien, pero es una mejora de deuda técnica).

### 🛠️ Notas Técnicas
- El formato extendido del "Caballo de Troya" ahora es: `Nombre__ID__uuid__IMG__UrlComprador__SELLERIMG__UrlVendedor`.
- Se han blindado las políticas de inserción de notificaciones para evitar spam entre usuarios.

