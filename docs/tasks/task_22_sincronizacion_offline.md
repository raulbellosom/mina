# Task 22 — Sincronización al reconectar

## 1. Nombre del task

**Task 22 — Implementar sincronización de operaciones offline al reconectar**

---

## 2. Objetivo

Construir el mecanismo de sincronización que, al detectar que la conexión a internet regresó, tome las operaciones almacenadas en la cola local (generada en Task 21) e intente sincronizarlas con Appwrite en el orden correcto, mostrando el resultado al usuario y manejando los errores de forma clara.

---

## 3. Alcance

Incluye:

- detección del evento de reconexión
- sincronización automática al reconectar (intento inicial)
- sincronización manual desde la vista de operaciones pendientes
- procesamiento de la cola en orden cronológico
- manejo de errores por operación (reintentos, errores permanentes)
- notificación del resultado de la sincronización
- limpieza de la cola al sincronizar exitosamente
- registro de la sincronización en `audit_logs`

No incluye todavía:

- resolución de conflictos cuando el mismo dato fue modificado online y offline
- sincronización bidireccional (traer cambios del servidor)
- sincronización de catálogos maestros

---

## 4. Problema que resuelve

Sin sincronización:

- las operaciones offline quedan atrapadas en el dispositivo del usuario
- el sistema nunca se reconcilia con Appwrite
- los datos locales y los datos del servidor quedan divergentes indefinidamente
- el usuario no sabe si sus operaciones fueron recibidas

---

## 5. Logro esperado

Al terminar este task debe existir un sistema donde:

1. al reconectar, se dispara automáticamente un intento de sincronización
2. las operaciones se procesan en orden, una por una
3. el usuario ve el progreso en tiempo real
4. las operaciones sincronizadas exitosamente se marcan como completadas y se eliminan de la cola
5. las operaciones con error se marcan como `error` con el mensaje correspondiente
6. el usuario puede reintentar manualmente las que fallaron
7. cada sincronización exitosa queda registrada en `audit_logs`

---

## 6. Estrategia técnica sugerida

### Flujo de sincronización

```
1. Detectar evento 'online'
2. Leer cola de IndexedDB ordenada por createdAt ASC
3. Para cada operación en cola:
   a. Marcar como 'syncing'
   b. Intentar enviar a Appwrite (databases.createDocument, etc.)
   c. Si éxito → marcar como 'synced', eliminar de cola
   d. Si error 409 (duplicado) → marcar como 'synced' (ya existe)
   e. Si otro error → marcar como 'error', incrementar retries
4. Notificar resultado al usuario
5. Si quedan errores → mostrar lista con opción de reintento
```

### Política de reintentos

- máximo 3 reintentos automáticos por operación
- entre reintentos: backoff exponencial simple (1s, 2s, 4s)
- después de 3 fallos → `status: 'error'` permanente hasta reintento manual

---

## 7. Estados de la cola

| Estado | Descripción |
|--------|-------------|
| `pending` | Esperando sincronización |
| `syncing` | En proceso de sincronización |
| `synced` | Sincronizado exitosamente |
| `error` | Falló después de reintentos |

---

## 8. UI de sincronización

- toast o banner de progreso al sincronizar
- contador: "Sincronizando 3 de 7 operaciones..."
- resultado final: "7 operaciones sincronizadas" o "5 sincronizadas, 2 con error"
- en la vista de operaciones pendientes: estado de cada operación visible
- botón de reintento por operación en error

---

## 9. Criterios de aceptación

1. al reconectar, se dispara automáticamente la sincronización
2. las operaciones se procesan en orden cronológico
3. las operaciones exitosas desaparecen de la cola
4. las operaciones con error muestran el mensaje y permiten reintento
5. el usuario ve progreso en tiempo real
6. cada sincronización exitosa se registra en audit_logs
7. el sistema maneja correctamente el caso de duplicados (idempotencia)

---

## 10. Dependencias previas

- Task 21: persistencia offline (genera la cola que este task sincroniza)

---

## 11. Entregables esperados

1. hook o servicio `useSyncQueue.jsx`
2. componente `SyncProgress.jsx`
3. adaptación de la vista de operaciones pendientes con estados de sync
4. lógica de reintento manual
5. registro de sincronizaciones en audit_logs

---

## 12. Restricciones

- no usar TypeScript
- no resolver conflictos de datos en esta fase
- no sincronización bidireccional (solo push al servidor)
- la cola es por dispositivo/sesión, no global

---

## 13. Prompt sugerido para Claude Code

```text
Necesito que ejecutes exclusivamente el Task 22 de este proyecto.

CONTEXTO
Sistema operativo para mina de materiales con Appwrite 1.8.1, React + Vite + JS + TailwindCSS 4.1 + Radix UI.

Ya existe la capa de persistencia offline del Task 21 con cola de operaciones en IndexedDB.

OBJETIVO
Implementar la sincronización al reconectar: procesamiento automático de la cola, manejo de errores y reintentos, notificación de progreso al usuario y registro en audit_logs.

No sigas al siguiente task. Quédate solo en Task 22.
```
