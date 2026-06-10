# 🛡️ Informe de Auditoría: CotiApp
**Fecha:** Domingo, 15 de marzo de 2026  
**Hora:** 14:30 (Aprox)  
**Estado:** Finalizado

## 1. 🚨 Seguridad y Privacidad (Hallazgos Críticos)

### A. Exposición de Notificaciones (RLS Permisivo)
*   **Hallazgo:** La tabla `notifications` permite inserciones directas de cualquier usuario autenticado (`FOR INSERT TO authenticated WITH CHECK (true)`).
*   **Riesgo:** Vulnerabilidad a ataques de spam o phishing interno.
*   **Recomendación:** Restringir inserciones a funciones del lado del servidor (RPC/Triggers).

### B. Gestión de `push_token`
*   **Hallazgo:** El token de notificaciones depende de un cierre de sesión manual para ser eliminado.
*   **Riesgo:** Persistencia de notificaciones en dispositivos compartidos o antiguos.

### C. Privacidad de Ubicación
*   **Hallazgo:** Visibilidad global de todas las listas activas para cualquier vendedor.
*   **Riesgo:** Exposición innecesaria de la ubicación exacta de los compradores a gran escala.

## 2. ⚙️ Robustez Funcional (Riesgos de Producción)

### A. Dependencia de Transacción Push
*   **Hallazgo:** El envío de la notificación push (`net.http_post`) está dentro de la transacción de base de datos de "Aceptar Oferta".
*   **Riesgo:** Si el servicio de Expo falla, la transacción de la base de datos falla y el pedido **no se crea**.
*   **Recomendación:** Desacoplar el envío de push de la lógica de negocio crítica.

### B. Fragilidad del "Caballo de Troya" (Items)
*   **Hallazgo:** La vinculación de ítems depende de una cadena de texto formateada.
*   **Riesgo:** Alta probabilidad de errores si el usuario edita el nombre del ítem manualmente.

### C. Consistencia de Billetera (Saldos Congelados)
*   **Hallazgo:** El saldo congelado puede quedar bloqueado por pedidos abandonados.
*   **Riesgo:** Malestar financiero para el vendedor.

---
*Este informe fue generado automáticamente por Gemini CLI en modo Tester.*
