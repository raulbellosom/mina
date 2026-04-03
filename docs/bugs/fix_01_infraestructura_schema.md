# Fix 01 — Infraestructura: Colecciones faltantes y schema desincronizado

## Origen

- **QA Report:** [test_report_full.md](../qa/test_report_full.md)
- **Bugs:** BUG-16-001, BUG-16-002, BUG-15-003
- **Tasks afectados:** 15 (Mostrador), 16 (Báscula), 17 (Validación QR)
- **Severidad global:** 🔴 CRÍTICO — Bloqueante
- **Estado:** ✅ Resuelto

---

## Objetivo

Sincronizar el servidor Appwrite con el schema definido en `appwrite.json`. Actualmente hay 2 colecciones que no existen en el servidor y 1 colección con atributos incompletos, lo que bloquea completamente los flujos de Mostrador, Báscula y Validación de salida.

---

## Problemas específicos

### BUG-16-001: Colección `weight_logs` no existe en servidor

- **appwrite.json línea:** 2335
- **Servidor:** No existe
- **Impacto:** Task 16 (Báscula) completamente bloqueado — `useBascula.jsx` intenta crear documentos y falla con 404
- **Atributos esperados:** ticketId, ticketNumber, type (entry/exit), weight, weightUnit, operatorId, operatorName, notes, metadata, createdBy
- **Permisos esperados:** operativo (read: all roles, create: root/operador/capturista/admin/owner, update: admin/owner)

### BUG-16-002: Colección `scan_logs` no existe en servidor

- **appwrite.json línea:** 2442
- **Servidor:** No existe
- **Impacto:** Task 17 (Validación QR) completamente bloqueado — `useValidacion.jsx` intenta crear scan_logs al aprobar/rechazar
- **Atributos esperados:** ticketId, ticketNumber, validatorId, validatorName, result (approved/rejected), reason, method (qr_scan/manual_entry), metadata, createdBy
- **Permisos esperados:** operativo

### BUG-15-003: Colección `counter_sales` incompleta (4 de 16+ atributos)

- **appwrite.json línea:** 2124
- **Servidor:** Solo tiene 4 atributos (internalNumber, clientId, clientName, driverId)
- **Faltan:** truckId, materialId, plantId, commercialQty, commercialUnit, paymentMethod, paymentReference, status, ticketId, notes, cancelReason, createdBy, updatedBy
- **Índices:** 0 definidos — considerar agregar idx_status, idx_createdAt
- **Impacto:** Task 15 (Mostrador) falla al crear venta — campos required no existen

---

## Observaciones adicionales (INFO)

- **INFO-01:** La colección `tickets` tiene campos duplicados `tare` (double) y `tara` (float) — unificar en uno solo
- **INFO-02:** `counter_sales` no tiene índices definidos en appwrite.json — agregar para performance
- **INFO-03:** Tickets en servidor tiene campo legacy `qrId` sin uso en código actual — evaluar eliminación

---

## Acciones requeridas

1. Ejecutar `node migrate-schema.mjs` para desplegar colecciones faltantes y atributos
2. Verificar que `weight_logs` y `scan_logs` se crearon correctamente con todos sus atributos
3. Verificar que `counter_sales` tiene los 16+ atributos después de migración
4. Verificar permisos de las 3 colecciones contra appwrite.json
5. Evaluar agregar índices a `counter_sales` (idx_status, idx_createdAt) en appwrite.json y re-desplegar
6. Evaluar unificación de `tare`/`tara` en tickets

---

## Archivos involucrados

| Archivo              | Acción                                                  |
| -------------------- | ------------------------------------------------------- |
| `appwrite.json`      | Verificar; posiblemente agregar índices a counter_sales |
| `migrate-schema.mjs` | Ejecutar para sincronizar servidor                      |

---

## Criterios de aceptación

- [x] `weight_logs` existe en servidor con todos los atributos de appwrite.json
- [x] `scan_logs` existe en servidor con todos los atributos de appwrite.json
- [x] `counter_sales` tiene los 16+ atributos en servidor (17 total)
- [x] Permisos de las 3 colecciones coinciden con appwrite.json
- [ ] Flujo Báscula: registrar peso de entrada no produce error 404
- [ ] Flujo Validación: aprobar salida crea scan_log exitosamente
- [ ] Flujo Mostrador: crear venta con todos los campos funciona
