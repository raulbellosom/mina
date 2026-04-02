# Task 21 — Persistencia offline para operaciones críticas

## 1. Nombre del task

**Task 21 — Implementar persistencia offline para operaciones críticas**

---

## 2. Objetivo

Construir la capa de persistencia local que permita al sistema continuar operando en los módulos más críticos cuando no hay conexión a internet, guardando las operaciones en el navegador y notificando al usuario del estado de conectividad.

Este task es especialmente importante para los módulos operativos de campo (báscula, validación de salida, venta en mostrador) que pueden operar en zonas con conectividad intermitente.

---

## 3. Alcance

Incluye:

- detección de conectividad en tiempo real
- banner/indicador de estado offline visible en toda la aplicación
- cola de operaciones pendientes almacenada en IndexedDB o localStorage
- persistencia offline para las operaciones más críticas:
  - registro de pesos de báscula
  - validaciones de salida
  - creación de venta mostrador (datos mínimos)
- visualización de operaciones pendientes de sincronización
- manejo de errores cuando el usuario intenta hacer algo que no puede hacerse offline

No incluye todavía:

- sincronización automática al reconectar (Task 22)
- persistencia offline de catálogos completos
- resolución de conflictos de datos

---

## 4. Problema que resuelve

En las instalaciones mineras la conectividad puede ser intermitente. Sin persistencia offline:

- las operaciones se pierden si se va el internet en medio de un registro
- los operadores no pueden trabajar durante cortes de red
- hay riesgo de duplicar operaciones al intentar reenviar manualmente

---

## 5. Logro esperado

Al terminar este task debe existir un sistema donde:

1. el usuario ve en todo momento si el sistema está online u offline
2. cuando está offline, puede continuar registrando operaciones en los módulos críticos
3. las operaciones se guardan localmente con estado `sync_pending`
4. el usuario puede ver qué operaciones están pendientes de sincronizar
5. cuando vuelve la conexión, el sistema notifica que hay operaciones pendientes (la sincronización real es Task 22)

---

## 6. Estrategia técnica sugerida

### Cola de sincronización local

Usar IndexedDB (vía `idb` o `localforage`) para almacenar operaciones pendientes:

```js
{
  id: uuid,
  type: 'weight_log' | 'scan_log' | 'counter_sale',
  payload: { ...datosCompletos },
  createdAt: timestamp,
  status: 'pending' | 'syncing' | 'error',
  retries: 0
}
```

### Detección de conectividad

```js
window.addEventListener('online', handler);
window.addEventListener('offline', handler);
navigator.onLine
```

### Módulos con soporte offline en esta fase

| Módulo | Operaciones offline |
|--------|---------------------|
| Báscula | Registro de peso de entrada y salida |
| Validación de salida | Aprobación/rechazo con datos locales del ticket |
| Venta mostrador | Creación con datos mínimos |

---

## 7. Comportamiento esperado por módulo

### 7.1 Báscula offline
- si el ticket fue cargado previamente (está en caché local), permitir el registro de peso
- guardar en cola local con status `sync_pending`
- mostrar indicador visual en la operación

### 7.2 Validación de salida offline
- si el ticket fue cargado previamente, permitir la validación
- la aprobación/rechazo se guarda en cola local
- mostrar indicador de pendiente

### 7.3 Venta mostrador offline
- permitir capturar los datos mínimos de la venta
- guardar en cola local
- notificar que el ticket no se generará hasta sincronizar

---

## 8. UI de estado de sincronización

- banner superior o indicador en sidebar cuando está offline
- sección "Operaciones pendientes" accesible desde el sidebar o settings
- lista de operaciones en cola con estado y tipo
- opción de reintentar manualmente

---

## 9. Criterios de aceptación

1. el usuario ve en todo momento si el sistema está online u offline
2. se puede registrar peso de báscula cuando está offline (con ticket en caché)
3. se puede validar salida cuando está offline (con ticket en caché)
4. las operaciones offline se guardan localmente con estado sync_pending
5. existe vista de operaciones pendientes de sincronizar
6. las operaciones no se pierden al cerrar y reabrir el navegador
7. el sistema notifica cuando vuelve la conexión y hay operaciones pendientes

---

## 10. Dependencias previas

- Task 16: báscula (módulo que se adapta para offline)
- Task 17: validación de salida (módulo que se adapta para offline)
- Task 15: venta mostrador (módulo que se adapta para offline)

---

## 11. Dependencias posteriores

- Task 22: sincronización al reconectar (consume la cola generada en este task)

---

## 12. Entregables esperados

1. utilidad `offlineQueue.js` o hook `useOfflineQueue.jsx`
2. hook `useConnectivity.jsx` para detección de estado de red
3. componente `OfflineBanner.jsx`
4. adaptaciones a hooks de báscula, validación y mostrador para soportar offline
5. vista de operaciones pendientes

---

## 13. Restricciones

- no usar TypeScript
- no implementar sincronización automática en este task (es Task 22)
- no persistir catálogos completos offline en esta fase
- no resolver conflictos de datos en este task

---

## 14. Prompt sugerido para Claude Code

```text
Necesito que ejecutes exclusivamente el Task 21 de este proyecto.

CONTEXTO
Sistema operativo para mina de materiales con Appwrite 1.8.1, React + Vite + JS + TailwindCSS 4.1 + Radix UI.

Ya existen: báscula, validación de salida y venta mostrador como módulos operativos completos.

OBJETIVO
Implementar la capa de persistencia offline: detección de conectividad, cola de operaciones en IndexedDB, adaptación de módulos críticos para operar offline, indicador visual de estado y vista de operaciones pendientes.

No sigas al siguiente task. Quédate solo en Task 21.
```
