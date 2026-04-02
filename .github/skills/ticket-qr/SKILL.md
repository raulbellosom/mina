---
name: ticket-qr
description: "Generar tickets con QR y manejar validación de salida en MinaFlow. Use when: necesitas crear tickets operativos, generar códigos QR, implementar impresión de tickets, validación de salida por escaneo QR, o control de reimpresión."
argument-hint: "Tipo de ticket o flujo a implementar"
---

# Tickets con QR y Validación de Salida para MinaFlow

## Cuándo Usar

- Implementar generación de tickets (RF-11)
- Implementar códigos QR únicos
- Implementar flujo de impresión/reimpresión (RF-16)
- Implementar validación de salida por QR (RF-14)
- Implementar flujo de báscula (RF-12) o mostrador (RF-13)

## Contexto

Cada operación de salida de material genera un ticket con QR único. El ticket se imprime en 3 copias. La validación de salida requiere escanear el QR o capturar el folio manualmente.

## Entidades Involucradas

- `tickets` — documento operativo principal
- `vouchers` — referencia comercial previa
- `weight_logs` — registros de peso (entrada/salida)
- `print_logs` — registro de impresiones/reimpresiones
- `scan_logs` — registro de escaneos en validación
- `audit_logs` — acciones sensibles

## Flujo de Generación de Ticket

### Paso 1: Crear Documento de Ticket

Campos mínimos:

- `ticketNumber` — folio único autogenerado
- `type` — `bascula` | `mostrador`
- `status` — estado operativo
- `clientId`, `driverId`, `truckId`, `materialId`, `plantId`
- `commercialQty`, `commercialUnit`
- `qrData` — string embebido en el QR
- `createdBy`

### Paso 2: Generar QR

Usar librería de QR (ej: `qrcode.react` o `qrcode`):

- El QR debe contener un identificador resolvible (ticket ID o hash)
- NO incluir datos sensibles en el QR; solo referencia al documento
- El QR debe ser escaneable desde la vista de validación

### Paso 3: Implementar Vista de Impresión

- Layout optimizado para impresión (CSS `@media print`)
- 3 copias por ticket (configurable)
- Datos visibles: folio, cliente, chofer, camión, material, planta, cantidad, fecha
- QR prominente y escaneable
- Registrar en `print_logs` cada impresión

### Paso 4: Control de Reimpresión

La reimpresión es acción sensible:

- Requiere permiso `reprint`
- Modal que pida motivo obligatorio
- Registrar en `print_logs` con `isReprint: true`
- Registrar en `audit_logs`
- Contador de reimpresiones en el ticket

## Flujo de Validación de Salida

### Paso 1: Vista de Escaneo

Página: `frontend/src/features/validacion/pages/Validacion.jsx`

- Input de escaneo QR (autofocus, submit on scan)
- Fallback: input manual de folio
- Al escanear → buscar ticket por `qrData` o `ticketNumber`

### Paso 2: Mostrar Resumen

Si el ticket existe:

- Datos del ticket (cliente, chofer, camión, material, cantidad)
- Estado actual del ticket
- Imagen de referencia del material (si existe)
- Historial de escaneos previos

### Paso 3: Validaciones

Antes de aprobar salida, verificar:

- [ ] Ticket existe
- [ ] Ticket no está cancelado
- [ ] Ticket no fue usado previamente (status !== `completed`)
- [ ] Ticket no está bloqueado
- [ ] Ticket está en estado válido para salida (`pending_exit_validation`)

### Paso 4: Acciones

- **Aprobar salida** → status = `completed`, registrar en `scan_logs` y `audit_logs`
- **Rechazar salida** → status = `rejected`, pedir motivo, registrar
- **Bloquear** → status = `blocked`, pedir motivo, registrar

### Paso 5: Registrar

Cada validación registra en `scan_logs`:

- `ticketId`
- `scannedBy` (userId)
- `result` — `approved` | `rejected` | `blocked`
- `reason` (si rechazado/bloqueado)
- `scannedAt`

## Validaciones Finales

- [ ] QR es escaneable y resuelve al ticket correcto
- [ ] No se puede reutilizar un ticket ya completado
- [ ] Reimpresión requiere motivo y queda auditada
- [ ] El guardia ve información suficiente para validar visualmente
- [ ] Los registros de auditoría son completos
