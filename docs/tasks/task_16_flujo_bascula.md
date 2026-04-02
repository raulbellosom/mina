# Task 16 — Flujo de báscula

## 1. Nombre del task

**Task 16 — Implementar el flujo operativo de báscula**

---

## 2. Objetivo

Construir el módulo de báscula que permita registrar operaciones de pesaje asociadas a tickets o vouchers válidos, capturando peso de entrada, peso de salida, tara y peso neto, y cerrando la operación con trazabilidad completa.

Este task representa el flujo operativo central del sistema: es donde el material pasa de ser una operación comercial a ser un movimiento físico registrado con evidencia de peso.

---

## 3. Alcance

Incluye:

- búsqueda de operación/ticket por folio, QR o datos del camión
- registro de peso de entrada (tara del camión vacío)
- registro de peso de salida (camión cargado)
- cálculo automático de tara y peso neto
- cierre operativo de la operación
- transición de estados del ticket (loading → loaded → pending_exit_validation)
- listado de operaciones de báscula activas e históricas
- detalle de operación con historial de pesos
- registro de observaciones del pesador
- permisos y auditoría del módulo

No incluye todavía:

- integración directa con dispositivos físicos de báscula
- validación final de salida por QR (Task 17)
- reportes completos (Task 19)
- sincronización offline (Task 21)

---

## 4. Problema que resuelve

Sin un módulo de báscula, el sistema no puede:

- registrar el peso real del camión en entrada y salida
- calcular el neto real de material trasladado
- cerrar operativamente la fase de carga
- preparar el ticket para validación final de salida
- generar trazabilidad completa de la operación física

---

## 5. Logro esperado

Al terminar este task debe existir un módulo funcional donde un capturista de báscula autorizado pueda:

1. buscar y recuperar una operación activa por folio, número de ticket o placas
2. registrar el peso de entrada del camión
3. registrar el peso de salida del camión
4. ver el cálculo de tara y peso neto
5. registrar observaciones de la operación de pesaje
6. cerrar y completar la fase de báscula
7. transicionar correctamente los estados del ticket
8. consultar el listado de operaciones de báscula
9. ver el detalle de cada operación con su historial de pesos
10. dejar la operación lista para validación de salida

---

## 6. Dependencia arquitectónica obligatoria

- la báscula opera sobre tickets generados por vouchers o venta mostrador
- los estados del ticket deben avanzar según la lógica definida en Task 13 y 15
- las acciones deben quedar auditadas
- el acceso debe respetar permisos del sistema
- la cantidad comercial se mantiene separada del peso físico registrado

---

## 7. Modelo de datos sugerido

### `weight_logs` — Registro de pesos

| Campo | Tipo | Notas |
|-------|------|-------|
| `ticketId` | string | FK al ticket operativo |
| `type` | string | `entry` \| `exit` |
| `weight` | float | Peso en toneladas o kg según configuración |
| `unit` | string | `ton` \| `kg` |
| `operatorId` | string | userId del capturista |
| `notes` | string | Observaciones |
| `createdBy` | string | userId |

Índices: `idx_ticketId` (key), `idx_type` (key)

### Campos adicionales en `tickets` (actualizar si no existen)

| Campo | Tipo | Notas |
|-------|------|-------|
| `entryWeight` | float | Peso de entrada |
| `exitWeight` | float | Peso de salida |
| `tara` | float | Diferencia calculada |
| `netWeight` | float | Peso neto de material |
| `weightUnit` | string | `ton` \| `kg` |
| `scaleOperatorId` | string | userId del operador de báscula |
| `scaleNotes` | string | Observaciones de la operación |

---

## 8. Estados del ticket en este flujo

```
issued / printed
    → loading         (al registrar peso de entrada)
    → loaded          (al registrar peso de salida y cerrar carga)
    → pending_exit_validation  (al completar báscula)
```

---

## 9. Alcance funcional detallado

### 9.1 Buscar operación activa
- búsqueda por folio de ticket
- búsqueda por número de voucher
- búsqueda por placas del camión
- resultado con resumen visible: cliente, chofer, camión, material, cantidad comercial, estado actual

### 9.2 Registrar peso de entrada
- captura del peso de entrada del camión (vacío o con tara conocida)
- registro en `weight_logs` con type `entry`
- actualización del estado del ticket a `loading`
- auditoría del evento

### 9.3 Registrar peso de salida
- captura del peso de salida (camión cargado)
- registro en `weight_logs` con type `exit`
- cálculo automático: tara = exitWeight - entryWeight, netWeight = entryWeight (dependiendo de la estrategia de pesaje definida)
- actualización del ticket con pesos finales
- transición a estado `loaded` y luego `pending_exit_validation`
- auditoría del evento

### 9.4 Listado de operaciones de báscula
- tabla de operaciones activas e históricas
- filtros por estado, fecha, camión, chofer
- acciones rápidas según estado

### 9.5 Detalle de operación
- todos los datos del ticket asociado
- historial de registros de peso
- cálculo de tara y neto visible
- observaciones del operador

### 9.6 Registro de observaciones
- texto libre asociado a la operación de báscula
- auditable

---

## 10. Reglas de negocio específicas

1. Solo tickets en estado válido (issued, printed, loading) pueden recibir registro de peso.
2. El peso de entrada se registra antes que el peso de salida.
3. No se puede registrar salida sin haber registrado entrada.
4. La cantidad comercial del voucher/venta mostrador NO se modifica por el peso registrado — son datos paralelos.
5. El peso neto es informativo y de trazabilidad; la venta ya está definida por cantidad comercial.
6. Toda operación de pesaje queda registrada en `weight_logs`.
7. Al completar la operación de báscula el ticket avanza a `pending_exit_validation`.
8. Un ticket en estado `completed`, `cancelled`, `rejected` o `blocked` no puede recibir nuevos pesos.
9. El sistema debe manejar el caso donde el peso neto sea negativo o inconsistente (alertar, no bloquear).
10. Las acciones sensibles quedan auditadas.

---

## 11. Seguridad del módulo

Permisos esperados:

| Permiso | Acción |
|---------|--------|
| `bascula.view` | Ver módulo y listado |
| `bascula.register_weight` | Registrar pesos de entrada y salida |
| `bascula.close` | Cerrar operación y avanzar estado |

---

## 12. Entidades involucradas

- `tickets` — entidad central sobre la que opera la báscula
- `weight_logs` — registro de cada evento de pesaje
- `vouchers` — origen de la operación (referencia)
- `clients`, `drivers`, `trucks`, `materials`, `plants` — contexto del ticket
- `audit_logs` — auditoría de acciones sensibles

---

## 13. Colecciones a crear/modificar en appwrite.json

1. Crear colección `weight_logs`
2. Agregar campos `entryWeight`, `exitWeight`, `tara`, `netWeight`, `weightUnit`, `scaleOperatorId`, `scaleNotes` a `tickets` si no existen

---

## 14. Criterios de aceptación

1. existe módulo de báscula accesible solo para usuarios autorizados
2. existe búsqueda de operación activa por folio, ticket o placas
3. se puede registrar peso de entrada con transición de estado
4. se puede registrar peso de salida con cálculo automático de tara y neto
5. los estados del ticket avanzan correctamente
6. el listado de operaciones de báscula es funcional con filtros básicos
7. existe detalle de operación con historial de pesos
8. las acciones quedan auditadas en `audit_logs`
9. la cantidad comercial permanece separada del peso físico
10. la operación queda en `pending_exit_validation` al completarse, lista para Task 17

---

## 15. Dependencias previas

- Task 01: arquitectura de identidad y permisos
- Task 02: base técnica
- Task 03: autenticación
- Task 12: vouchers
- Task 13: tickets con QR
- Task 14: impresión (compatibilidad)
- Task 15: venta mostrador (los tickets de mostrador también pasan por báscula)

---

## 16. Dependencias posteriores

- Task 17: validación de salida por QR (consume el estado `pending_exit_validation`)
- Task 19: reportes (consume datos de weight_logs)

---

## 17. Entregables esperados

1. colección `weight_logs` en appwrite.json
2. actualizaciones a `tickets` si se requieren campos adicionales
3. hook `useBascula.jsx`
4. página `Bascula.jsx` funcional (reemplaza placeholder)
5. componente de búsqueda de operación
6. componente de registro de peso
7. listado y detalle de operaciones
8. auditoría básica
9. nota técnica breve sobre estrategia de pesaje implementada

---

## 18. Restricciones

- no usar TypeScript
- no integrar con hardware físico de báscula en esta fase
- no implementar validación de salida en este task
- no borrar físicamente operaciones
- no avanzar a reportes ni sincronización offline en este task

---

## 19. Prompt sugerido para Claude Code

```text
Necesito que ejecutes exclusivamente el Task 16 de este proyecto. No avances todavía a validación de salida, reportes, persistencia offline ni sincronización.

CONTEXTO
Sistema operativo para una mina de materiales usando Appwrite 1.8.1, React + Vite + JS + TailwindCSS 4.1 + Radix UI.

Ya existen: base técnica, auth, usuarios, roles/permisos, catálogos completos (materiales, categorías, clientes, choferes, camiones, plantas), vouchers, tickets con QR, impresión/reimpresión y flujo de venta en mostrador.

OBJETIVO
Implementar el módulo de báscula: búsqueda de operación activa, registro de peso de entrada, peso de salida, cálculo de tara y neto, cierre operativo y transición de estados del ticket.

LO QUE QUIERO QUE HAGAS
1. Crear la colección weight_logs en appwrite.json.
2. Agregar campos de peso a tickets si no existen (entryWeight, exitWeight, tara, netWeight, weightUnit, scaleOperatorId, scaleNotes).
3. Implementar búsqueda de ticket/operación activa.
4. Implementar registro de peso de entrada con transición a estado loading.
5. Implementar registro de peso de salida con cálculo automático de tara y neto.
6. Implementar transición final del ticket a pending_exit_validation.
7. Implementar listado de operaciones de báscula con filtros básicos.
8. Implementar vista de detalle de operación con historial de pesos.
9. Proteger el módulo con permisos bascula.view, bascula.register_weight, bascula.close.
10. Registrar auditoría de acciones sensibles.
11. Reemplazar el placeholder de Bascula.jsx con la implementación completa.

REGLAS
- No TypeScript.
- No integrar hardware físico de báscula.
- No implementar validación de salida.
- No borrar operaciones físicamente.
- La cantidad comercial no se modifica por el peso.

No sigas al siguiente task. Quédate solo en Task 16.
```
