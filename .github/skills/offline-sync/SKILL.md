---
name: offline-sync
description: "Implementar persistencia offline y sincronización para MinaFlow. Use when: necesitas que una operación funcione sin internet, implementar cola de sincronización, manejar estados sync_pending/sync_error, o detectar conectividad."
argument-hint: "Tipo de operación a soportar offline"
---

# Persistencia Offline y Sincronización para MinaFlow

## Cuándo Usar

- Implementar operación offline para una vista operativa
- Crear la cola de sincronización local
- Manejar detección de conectividad
- Implementar retry y resolución de conflictos

## Contexto del Proyecto

MinaFlow requiere operación continua ante fallos de internet (RF-17, RF-18).

**Alcance offline inicial (Fase 6):**

- Creación de venta en mostrador
- Creación de voucher
- Registro de pesos
- Validación de salida
- Bitácora mínima

**Fuera de alcance offline inicial:**

- Reportes complejos
- Administración de usuarios
- Catálogos avanzados

## Procedimiento

### Paso 1: Crear Servicio de Almacenamiento Local

Archivo: `frontend/src/shared/lib/offlineStorage.js`

Usar IndexedDB (via wrapper ligero) para:

- Cola de operaciones pendientes (`sync_queue`)
- Cache de catálogos para consulta offline
- Estado de sincronización

Esquema sugerido para `sync_queue`:

```js
{
  id: crypto.randomUUID(),
  collection: 'vouchers',      // colección destino
  action: 'create',            // create | update
  data: { ... },               // payload del documento
  status: 'pending',           // pending | syncing | error | synced
  attempts: 0,
  lastError: null,
  createdAt: new Date().toISOString(),
  syncedAt: null
}
```

### Paso 2: Crear Hook de Conectividad

Archivo: `frontend/src/shared/hooks/useOnlineStatus.jsx`

```js
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}
```

### Paso 3: Crear Hook de Sincronización

Archivo: `frontend/src/shared/hooks/useSyncQueue.jsx`

Funcionalidades:

- `pendingCount` — cantidad de operaciones pendientes
- `syncAll()` — intentar sincronizar todo
- `syncOne(id)` — sincronizar una operación
- `getPending()` — listar operaciones pendientes
- Auto-sync cuando vuelve la conexión

### Paso 4: Modificar Hooks de Datos

Para cada hook que necesite soporte offline:

1. Detectar si está online
2. Si online → operación normal contra Appwrite
3. Si offline → guardar en `sync_queue` con status `pending`
4. Mostrar indicador de "pendiente de sincronizar"

### Paso 5: UI de Estado de Sincronización

- Banner o indicador en MainLayout cuando hay operaciones pendientes
- Icono de estado (online/offline) en la barra superior o sidebar
- Lista de operaciones pendientes accesible para el usuario
- Feedback cuando se sincroniza exitosamente

### Paso 6: Manejo de Errores de Sync

- Max 3 intentos automáticos con backoff exponencial
- Después de 3 fallos → status `error`, requiere acción manual
- Log de errores visible para supervisores
- No perder nunca datos del usuario

## Estados de Sincronización

| Estado    | Descripción                                  |
| --------- | -------------------------------------------- |
| `pending` | Guardado localmente, esperando sync          |
| `syncing` | Intento de sincronización en curso           |
| `synced`  | Sincronizado exitosamente con Appwrite       |
| `error`   | Falló después de reintentos, requiere acción |

## Validaciones

- [ ] Operación se guarda localmente si no hay internet
- [ ] La UI muestra indicador de modo offline
- [ ] Al reconectar se intenta sincronizar automáticamente
- [ ] Los datos no se pierden al cerrar el navegador
- [ ] Los errores de sync son visibles y manejables
- [ ] No se crean duplicados al sincronizar
