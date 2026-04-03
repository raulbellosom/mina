# Fix 04 — Sincronización Offline: Race conditions, timeouts y validación

## Origen

- **QA Report:** [test_report_full.md](../qa/test_report_full.md)
- **Bugs:** BUG-22-001, BUG-22-002, BUG-22-003, BUG-21-001, BUG-21-002, BUG-15-002
- **Tasks afectados:** 21 (Persistencia offline), 22 (Sincronización), 15 (Mostrador)
- **Severidad global:** 🟠 ALTO
- **Estado:** ✅ Resuelto

---

## Objetivo

Reforzar la capa de persistencia offline y sincronización para evitar pérdida o corrupción de datos cuando la aplicación opera sin conexión, especialmente en los flujos de Mostrador y Tickets.

---

## Problemas específicos

### BUG-22-001: Race condition entre syncAll y syncOne

- **Archivo:** `frontend/src/shared/hooks/useSyncQueue.jsx`
- **Descripción:** `syncAll()` itera sobre la cola de operaciones pendientes y llama a `syncOne()` para cada una. Si el usuario ejecuta una acción que dispara `syncOne()` mientras `syncAll()` está en progreso, la misma operación puede sincronizarse dos veces.
- **Impacto:** ALTO — Documentos duplicados en Appwrite (ventas duplicadas, tickets duplicados)
- **Fix:** Agregar un mutex/flag `isSyncing` que prevenga ejecuciones concurrentes:
  ```js
  const syncingRef = useRef(false);
  const syncAll = async () => {
    if (syncingRef.current) return;
    syncingRef.current = true;
    try {
      /* ... */
    } finally {
      syncingRef.current = false;
    }
  };
  ```

### BUG-22-002: Sin timeout en operaciones de sincronización

- **Archivo:** `frontend/src/shared/hooks/useSyncQueue.jsx`
- **Descripción:** Las llamadas a la API de Appwrite durante sincronización no tienen timeout. Si el servidor está lento o la conexión es intermitente, la operación queda colgada indefinidamente.
- **Impacto:** ALTO — La cola de sincronización se bloquea; el usuario ve "Sincronizando..." eternamente
- **Fix:** Envolver cada operación de sync con `AbortController` + timeout:
  ```js
  const withTimeout = (promise, ms = 15000) => {
    return Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("SYNC_TIMEOUT")), ms),
      ),
    ]);
  };
  ```

### BUG-22-003: No diferencia códigos de error HTTP

- **Archivo:** `frontend/src/shared/hooks/useSyncQueue.jsx`
- **Descripción:** Cuando una operación de sync falla, el catch genérico la reintenta sin importar si el error es recuperable (503 timeout) o permanente (400 bad request, 409 conflict).
- **Impacto:** MEDIO — Operaciones con datos inválidos se reintentan infinitamente, bloqueando la cola
- **Fix:** Clasificar errores:
  - `4xx` (excepto 429) → marcar como `sync_error`, no reintentar automáticamente
  - `429`, `5xx` → reintentar con backoff exponencial
  - Network error → reintentar cuando vuelva conexión

### BUG-21-001: No valida datos antes de guardar en IndexedDB

- **Archivo:** `frontend/src/shared/lib/offlineStorage.js`
- **Descripción:** Los datos se guardan en IndexedDB sin validación. Si un formulario envía campos vacíos o tipos incorrectos, se persisten datos corruptos que luego fallan al sincronizar.
- **Impacto:** MEDIO — El usuario cree que su operación se guardó correctamente, pero al sincronizar falla y no se explica por qué
- **Fix:** Agregar validación mínima antes de escribir en IndexedDB:
  - Campos `required` no pueden ser null/undefined/""
  - Tipos básicos deben coincidir (string, number, boolean)

### BUG-21-002: No maneja QuotaExceededError de IndexedDB

- **Archivo:** `frontend/src/shared/lib/offlineStorage.js`
- **Descripción:** Si IndexedDB se llena (común en dispositivos móviles con poco almacenamiento), las escrituras fallan silenciosamente.
- **Impacto:** MEDIO — Operaciones offline se pierden sin aviso
- **Fix:** Capturar `QuotaExceededError` y mostrar alerta al usuario: "Almacenamiento local lleno. Conecte a internet para sincronizar datos pendientes antes de continuar."

### BUG-15-002: ticketId puede ser null en venta offline

- **Archivo:** `frontend/src/features/mostrador/hooks/useMostrador.jsx`
- **Descripción:** Cuando se crea una venta en mostrador sin conexión, la función genera un `ticketId` temporal o lo deja null. Al sincronizar, el campo `ticketId` requerido falla.
- **Impacto:** ALTO — Ventas offline no pueden sincronizarse si no tienen ticketId
- **Fix:** Generar un ticketId temporal con prefijo `offline_` + UUID local. Al sincronizar, crear primero el ticket real y luego actualizar la referencia.

---

## Acciones requeridas

1. Agregar mutex `isSyncing` a `syncAll` en `useSyncQueue.jsx`
2. Implementar timeout con AbortController en operaciones de sync
3. Clasificar errores HTTP y definir estrategia por código
4. Agregar validación mínima en `offlineStorage.js` antes de escritura
5. Manejar `QuotaExceededError` con feedback al usuario
6. Generar ticketId temporal para ventas offline en `useMostrador.jsx`
7. Implementar lógica de resolución de IDs temporales al sincronizar

---

## Archivos involucrados

| Archivo                                                  | Acción                                               |
| -------------------------------------------------------- | ---------------------------------------------------- |
| `frontend/src/shared/hooks/useSyncQueue.jsx`             | MODIFICAR — mutex, timeout, clasificación de errores |
| `frontend/src/shared/lib/offlineStorage.js`              | MODIFICAR — validación, QuotaExceeded                |
| `frontend/src/features/mostrador/hooks/useMostrador.jsx` | MODIFICAR — ticketId temporal offline                |

---

## Criterios de aceptación

- [x] No se producen documentos duplicados al sincronizar con syncAll
- [x] Operaciones de sync que tardan >15s se cancelan y se marcan para retry
- [x] Errores 4xx (excepto 429) marcan la operación como `sync_error` sin retry automático
- [x] Datos inválidos (campos vacíos required) se rechazan antes de guardar en IndexedDB
- [x] QuotaExceededError muestra alerta clara al usuario
- [x] Ventas creadas offline generan ticketId temporal y se sincronizan correctamente
- [x] La cola de sync no se bloquea bajo ninguna condición de error
