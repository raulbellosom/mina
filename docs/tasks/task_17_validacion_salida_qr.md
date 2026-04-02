# Task 17 — Validación de salida por QR

## 1. Nombre del task

**Task 17 — Implementar la validación de salida por QR o captura manual**

---

## 2. Objetivo

Construir el módulo de validación de salida que permita al guardia o personal autorizado escanear el QR del ticket o capturar manualmente el folio para verificar que la salida del camión es válida, aprobada y no fraudulenta.

Este task cierra el ciclo operativo completo de la operación: el camión entró, compró, fue pesado, cargó el material y ahora debe ser autorizado para salir. La validación de salida es el último punto de control antes de que el camión abandone las instalaciones.

---

## 3. Alcance

Incluye:

- vista de escaneo de QR (usando cámara o lector)
- fallback de captura manual por folio de ticket
- recuperación del ticket y su operación asociada
- validaciones automáticas de estado del ticket
- resumen visual del ticket para confirmación humana
- aprobación de salida
- rechazo de salida con motivo obligatorio
- bloqueo de salida por inconsistencia
- registro en `scan_logs`
- transición del ticket a estado `completed` o `rejected`
- auditoría del evento de validación
- permisos del módulo

No incluye todavía:

- integración con hardware de escáner industrial específico
- reportes finales de validación (Task 19)
- sincronización offline completa (Task 21)

---

## 4. Problema que resuelve

Sin validación de salida:

- cualquier camión podría salir sin verificación
- los tickets podrían reutilizarse fraudulentamente
- no habría punto de control final en el flujo operativo
- la trazabilidad quedaría incompleta

---

## 5. Logro esperado

Al terminar este task debe existir un módulo funcional donde el guardia o validador autorizado pueda:

1. escanear el QR del ticket con la cámara del dispositivo
2. alternativamente, capturar el folio manualmente
3. ver inmediatamente el resumen del ticket recuperado
4. verificar que el camión, material y estado son correctos
5. aprobar la salida con un toque
6. rechazar la salida con motivo obligatorio
7. ver que tickets inválidos, usados, cancelados o bloqueados son rechazados automáticamente
8. dejar el registro del evento en `scan_logs` y `audit_logs`
9. ver historial de validaciones realizadas

---

## 6. Definición de validación válida

Una salida es válida cuando:

- el ticket existe
- el ticket está en estado `pending_exit_validation`
- el ticket no fue usado anteriormente para salida
- el ticket no está cancelado, rechazado ni bloqueado
- el ticket no está vencido (si aplica política de expiración futura)

Si alguna condición falla → salida automáticamente bloqueada o rechazada.

---

## 7. Modelo de datos sugerido

### `scan_logs` — Registro de escaneos y validaciones

| Campo | Tipo | Notas |
|-------|------|-------|
| `ticketId` | string | FK al ticket validado |
| `validatorId` | string | userId del guardia/validador |
| `result` | string | `approved` \| `rejected` \| `blocked` |
| `reason` | string | Motivo si fue rechazado o bloqueado |
| `method` | string | `qr_scan` \| `manual_entry` |
| `createdBy` | string | userId |

Índices: `idx_ticketId` (key), `idx_result` (key), `idx_validatorId` (key)

---

## 8. Estados del ticket en este flujo

```
pending_exit_validation
    → completed   (salida aprobada)
    → rejected    (salida rechazada con motivo)
    → blocked     (inconsistencia detectada)
```

---

## 9. Alcance funcional detallado

### 9.1 Vista de escaneo
- acceso rápido desde el módulo de validación
- activación de cámara del dispositivo para escanear QR
- campo de captura manual como alternativa

### 9.2 Recuperación y validación automática del ticket
- lectura del QR o folio
- búsqueda del ticket en la base de datos
- evaluación automática de todas las condiciones de validez
- resultado inmediato: válido / inválido / bloqueado

### 9.3 Resumen visual del ticket
Cuando el ticket es válido, mostrar de forma clara y compacta:
- número de ticket
- cliente
- chofer y camión (placas)
- material
- planta/origen
- cantidad comercial
- peso neto si fue registrado en báscula
- estado actual

### 9.4 Aprobación de salida
- botón de aprobación claro y visible
- transición del ticket a `completed`
- registro en `scan_logs` con result `approved`
- auditoría del evento

### 9.5 Rechazo de salida
- botón de rechazo con campo de motivo obligatorio
- transición del ticket a `rejected`
- registro en `scan_logs` con result `rejected` y reason
- auditoría del evento

### 9.6 Bloqueo automático
- si el ticket no cumple condiciones de validez, mostrar bloqueo inmediato
- descripción del motivo del bloqueo
- el validador puede opcionalmente registrar observaciones

### 9.7 Historial de validaciones
- tabla de validaciones recientes
- filtros por resultado, fecha, validador

---

## 10. Reglas de negocio específicas

1. Solo tickets en `pending_exit_validation` pueden ser aprobados.
2. Un ticket aprobado no puede ser aprobado nuevamente (anti-reutilización).
3. Un ticket cancelado, rechazado o bloqueado no puede aprobarse.
4. Si el ticket no existe, informar al usuario claramente.
5. El rechazo requiere un motivo escrito obligatorio.
6. Toda validación queda registrada en `scan_logs` y `audit_logs` sin excepción.
7. El guardia no necesita buscar manualmente — el escaneo o captura manual es el flujo principal.
8. La vista debe ser usable desde dispositivos móviles o tablets (guardias en campo).
9. La respuesta visual debe ser inmediata y no ambigua (verde/rojo/naranja).
10. El historial de validaciones es de solo lectura.

---

## 11. Interfaz esperada

- pantalla limpia, optimizada para uso rápido en campo
- cámara activa por defecto al entrar al módulo
- resultado de validación con color claro: verde (válido), rojo (rechazado/inválido), naranja (bloqueado)
- botones grandes y accesibles para operación táctil
- resumen visual compacto del ticket
- feedback inmediato en cada acción

---

## 12. Seguridad del módulo

| Permiso | Acción |
|---------|--------|
| `exit.view` | Ver módulo de validación |
| `exit.validate` | Aprobar salidas |
| `exit.reject` | Rechazar salidas |

---

## 13. Entidades involucradas

- `tickets` — entidad que se valida y transiciona
- `scan_logs` — registro de cada evento de escaneo/validación
- `drivers`, `trucks`, `clients`, `materials`, `plants` — contexto del ticket
- `audit_logs` — auditoría de acciones sensibles

---

## 14. Colecciones a crear/modificar en appwrite.json

1. Crear colección `scan_logs`
2. Agregar campo `validatedAt` y `validatedBy` a `tickets` si no existen

---

## 15. Criterios de aceptación

1. existe módulo de validación accesible solo para usuarios autorizados
2. existe escaneo de QR funcional con cámara
3. existe captura manual de folio como alternativa
4. el sistema recupera el ticket y evalúa automáticamente si es válido
5. el resumen visual del ticket es claro y completo
6. se puede aprobar la salida correctamente con transición a `completed`
7. se puede rechazar la salida con motivo obligatorio
8. tickets inválidos, usados, cancelados o bloqueados son rechazados automáticamente
9. todas las validaciones quedan en `scan_logs` y `audit_logs`
10. la UI es usable en dispositivos móviles y tablets
11. existe historial de validaciones con filtros básicos

---

## 16. Dependencias previas

- Task 13: tickets con QR (base del escaneo)
- Task 14: impresión (los QR ya están impresos)
- Task 15: venta mostrador (genera tickets validables)
- Task 16: báscula (deja tickets en `pending_exit_validation`)

---

## 17. Dependencias posteriores

- Task 19: reportes (consume datos de scan_logs y tickets completados)
- Task 21: persistencia offline (la validación es operación crítica offline)

---

## 18. Entregables esperados

1. colección `scan_logs` en appwrite.json
2. actualizaciones a `tickets` si se requieren campos adicionales
3. hook `useValidacion.jsx`
4. página `Validacion.jsx` funcional (reemplaza placeholder)
5. componente de escaneo QR
6. componente de resumen del ticket
7. historial de validaciones
8. auditoría de eventos
9. nota técnica breve sobre estrategia de escaneo implementada

---

## 19. Restricciones

- no usar TypeScript
- no integrar hardware de escáner industrial
- no implementar reportes en este task
- no implementar sincronización offline en este task
- la aprobación de salida es irreversible salvo intervención de administrador

---

## 20. Prompt sugerido para Claude Code

```text
Necesito que ejecutes exclusivamente el Task 17 de este proyecto. No avances todavía a reportes, persistencia offline ni sincronización.

CONTEXTO
Sistema operativo para mina de materiales con Appwrite 1.8.1, React + Vite + JS + TailwindCSS 4.1 + Radix UI.

Ya existen: auth, usuarios, roles/permisos, catálogos, vouchers, tickets con QR, impresión, venta mostrador y flujo de báscula.

OBJETIVO
Implementar el módulo de validación de salida: escaneo de QR o captura manual de folio, recuperación del ticket, evaluación automática de validez, aprobación, rechazo o bloqueo de la salida, y registro en scan_logs con auditoría.

LO QUE QUIERO QUE HAGAS
1. Crear colección scan_logs en appwrite.json.
2. Agregar campos validatedAt y validatedBy a tickets si no existen.
3. Implementar escaneo de QR con cámara del dispositivo.
4. Implementar captura manual de folio como alternativa.
5. Implementar recuperación y validación automática del ticket.
6. Implementar resumen visual del ticket para confirmación humana.
7. Implementar aprobación de salida con transición a completed.
8. Implementar rechazo de salida con motivo obligatorio y transición a rejected.
9. Implementar bloqueo automático para tickets inválidos.
10. Registrar todos los eventos en scan_logs y audit_logs.
11. Implementar historial de validaciones con filtros básicos.
12. Proteger el módulo con permisos exit.view, exit.validate, exit.reject.
13. Optimizar la UI para uso en dispositivos móviles y tablets.
14. Reemplazar el placeholder de Validacion.jsx con la implementación completa.

REGLAS
- No TypeScript.
- No integrar hardware de escáner industrial.
- No implementar reportes en este task.
- La aprobación de salida es irreversible sin intervención de admin.
- UI debe ser rápida y usable en campo.

No sigas al siguiente task. Quédate solo en Task 17.
```
