# Fix 06 — Vouchers y Tickets: usedQty, debounce, estados y QR

## Origen

- **QA Report:** [test_report_full.md](../qa/test_report_full.md)
- **Bugs:** BUG-12-001, BUG-12-002, BUG-12-003, BUG-13-001, BUG-13-002, BUG-13-003, BUG-14-001
- **Tasks afectados:** 12 (Vouchers), 13 (Tickets con QR), 14 (Impresión y reimpresión)
- **Severidad global:** 🟠 ALTO / 🟡 MEDIO
- **Estado:** ✅ Resuelto

---

## Objetivo

Corregir la lógica de consumo de vouchers, mejorar la experiencia de creación de tickets, completar la cobertura de estados visuales y reforzar la seguridad del QR.

---

## Problemas específicos

### BUG-12-001: usedQty nunca se actualiza en voucher

- **Archivo:** `frontend/src/features/vouchers/hooks/useVouchers.jsx` (o donde se consume el voucher)
- **Descripción:** Cuando un voucher prepago se usa para una venta, el campo `usedQty` del voucher no se incrementa. Esto permite usar un voucher más veces de las pagadas.
- **Impacto:** ALTO — Pérdida económica por sobre-uso de vouchers prepago
- **Fix:** Al crear venta/ticket que consume voucher, ejecutar:
  ```js
  await databases.updateDocument(DATABASE_ID, "vouchers", voucherId, {
    usedQty: currentUsedQty + quantityUsed,
    // Si usedQty >= totalQty: status = "consumed"
  });
  ```
- **Validación adicional:** Antes de permitir uso, verificar que `usedQty + requested <= totalQty`

### BUG-12-002: Sin debounce en botón de crear voucher

- **Archivo:** `frontend/src/features/vouchers/pages/Vouchers.jsx` (o componente de formulario)
- **Descripción:** El botón "Crear Voucher" no tiene protección contra doble-click. Si el usuario hace click rápido dos veces, se crean dos vouchers idénticos.
- **Impacto:** MEDIO — Datos duplicados en el sistema
- **Fix:** Deshabilitar el botón mientras `loading` es true:
  ```jsx
  <button disabled={loading} onClick={handleCreate}>
    {loading ? "Creando..." : "Crear Voucher"}
  </button>
  ```
- **Nota:** Este patrón debe aplicarse a TODOS los botones de acción que crean/modifican datos

### BUG-12-003: Faltan breadcrumbs en página de vouchers

- **Archivo:** `frontend/src/features/vouchers/pages/Vouchers.jsx`
- **Descripción:** La página de vouchers no incluye breadcrumbs en el header, incumpliendo la convención del proyecto.
- **Impacto:** BAJO — Inconsistencia de navegación
- **Fix:** Agregar breadcrumb: `Inicio > Operaciones > Vouchers`

### BUG-13-001: Estados de ticket no tienen colores completos

- **Archivo:** `frontend/src/features/tickets/components/` (componente de badge de estado)
- **Descripción:** Solo algunos estados de ticket tienen badge con color (ej. `completed` = verde, `cancelled` = rojo). Estados intermedios como `generated`, `loading`, `loaded`, `pending_exit_validation` no tienen color definido.
- **Impacto:** MEDIO — El operador no puede distinguir visualmente el estado del ticket
- **Fix:** Mapeo completo de colores:
  | Estado | Color | Badge |
  |--------|-------|-------|
  | draft | gray | Borrador |
  | generated | blue | Generado |
  | issued | indigo | Emitido |
  | printed | purple | Impreso |
  | loading | yellow | En carga |
  | loaded | orange | Cargado |
  | pending_exit_validation | amber | Pendiente salida |
  | completed | green | Completado |
  | cancelled | red | Cancelado |
  | rejected | red | Rechazado |
  | blocked | red/dark | Bloqueado |

### BUG-13-002: Hash QR débil (solo base64 del ticketId)

- **Archivo:** `frontend/src/features/tickets/hooks/useTickets.jsx` (o donde se genera el QR)
- **Descripción:** El contenido del QR es simplemente el ticketId codificado en base64, lo que es trivial de falsificar. Cualquiera que conozca el formato puede generar QRs válidos.
- **Impacto:** ALTO — Riesgo de seguridad: tickets falsos pueden pasar validación de salida
- **Fix:** Usar HMAC-SHA256 con un secreto compartido:
  ```js
  // qrPayload = ticketId + "|" + ticketNumber + "|" + hmac(ticketId+ticketNumber, SECRET)
  ```
  El secreto debe estar en las variables de entorno (`VITE_QR_SECRET`) y la validación debe verificar el HMAC.

### BUG-13-003: Sin indicador visual de ticket ya escaneado

- **Archivo:** `frontend/src/features/validacion/pages/Validacion.jsx`
- **Descripción:** Cuando se escanea un QR de un ticket que ya fue validado (status = `completed`), el mensaje de error no es suficientemente claro. Debería mostrar diferencia visual entre "ticket válido, aprobando salida" vs "ticket ya salió anteriormente".
- **Impacto:** BAJO — Confusión del operador de validación
- **Fix:** Mostrar estados diferenciados con colores e íconos distintos

### BUG-14-001: Botón de reimprimir no se deshabilita durante proceso

- **Archivo:** `frontend/src/features/tickets/pages/` (o componente de detalle de ticket)
- **Descripción:** El botón "Reimprimir" no se deshabilita mientras se registra la auditoría de reimpresión. Double-click puede generar múltiples registros de auditoría.
- **Impacto:** MEDIO — Registros de auditoría duplicados, confusión en bitácora
- **Fix:** Mismo patrón que BUG-12-002: `disabled={loading}`

---

## Acciones requeridas

1. Implementar actualización de `usedQty` al consumir voucher + validación de saldo
2. Agregar `disabled={loading}` a botones de crear voucher y reimprimir ticket
3. Agregar breadcrumbs a página de vouchers
4. Completar mapeo de colores para todos los estados de ticket
5. Reemplazar base64 por HMAC-SHA256 en generación de QR
6. Verificar HMAC en validación de salida
7. Diferenciar visualmente ticket "válido para salida" vs "ya completado"

---

## Archivos involucrados

| Archivo                                                 | Acción                                          |
| ------------------------------------------------------- | ----------------------------------------------- |
| `frontend/src/features/vouchers/hooks/useVouchers.jsx`  | MODIFICAR — actualizar usedQty                  |
| `frontend/src/features/vouchers/pages/Vouchers.jsx`     | MODIFICAR — debounce botón, breadcrumbs         |
| `frontend/src/features/tickets/components/`             | MODIFICAR — mapeo completo de colores de estado |
| `frontend/src/features/tickets/hooks/useTickets.jsx`    | MODIFICAR — HMAC-SHA256 en QR                   |
| `frontend/src/features/validacion/pages/Validacion.jsx` | MODIFICAR — estados visuales diferenciados      |
| `frontend/src/features/tickets/pages/`                  | MODIFICAR — debounce botón reimprimir           |

---

## Criterios de aceptación

- [x] Al usar voucher, `usedQty` se incrementa correctamente
- [x] Voucher con `usedQty >= totalQty` se marca como `consumed` y no permite más uso
- [x] Botones de crear/reimprimir se deshabilitan durante proceso (no double-click) — ya estaban implementados
- [x] Página de vouchers tiene breadcrumbs consistentes
- [x] Todos los estados de ticket tienen badge con color y texto en español — ya estaban implementados
- [x] QR contiene HMAC-SHA256 verificable con Web Crypto API
- [x] Validación de salida muestra diferencia clara entre "aprobado" y "ya completado" (ámbar)
