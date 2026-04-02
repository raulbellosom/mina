# Task 18 — Auditoría y bitácoras

## 1. Nombre del task

**Task 18 — Implementar el módulo de auditoría y bitácoras**

---

## 2. Objetivo

Construir el módulo de auditoría que permita a administradores y supervisores consultar el historial completo de eventos sensibles registrados en el sistema: creación y modificación de usuarios, cambios en catálogos, emisión de tickets, registros de peso, validaciones de salida, impresiones, reimpresiones y cualquier acción crítica capturada en `audit_logs`.

La colección `audit_logs` ya existe y está siendo alimentada por todos los módulos previos. Este task construye la interfaz de consulta y análisis de esa información.

---

## 3. Alcance

Incluye:

- listado completo de eventos de auditoría con filtros
- búsqueda por acción, colección, usuario, fecha y rango de fechas
- vista de detalle de cada evento
- paginación de resultados
- badges de color por tipo de acción
- exportación básica de auditoría si el permiso lo permite
- acceso restringido a admin y owner únicamente

No incluye todavía:

- exportación avanzada con formatos múltiples (Task 20)
- reportes operativos y comerciales (Task 19)
- alertas automáticas por eventos sensibles

---

## 4. Problema que resuelve

Los módulos anteriores ya registran eventos en `audit_logs`, pero sin una interfaz de consulta esa información no es accesible ni útil para auditar operaciones, detectar anomalías o investigar incidencias.

---

## 5. Logro esperado

Al terminar este task debe existir un módulo funcional donde un administrador o auditor pueda:

1. ver el listado completo de eventos registrados en el sistema
2. filtrar por tipo de acción, módulo/colección, usuario y rango de fechas
3. buscar eventos específicos
4. ver el detalle completo de cada evento incluyendo el JSON de detalles
5. identificar visualmente el tipo de acción por color y categoría
6. exportar un subconjunto de eventos si tiene permiso

---

## 6. Categorías de acciones registradas

| Prefijo | Módulo |
|---------|--------|
| `user.*` | Usuarios (user.create, user.update, user.disable, user.activate) |
| `role.*` | Roles y permisos |
| `ticket.*` | Tickets (ticket.create, ticket.cancel) |
| `print.*` | Impresión y reimpresión (print.original, print.reprint) |
| `bascula.*` | Báscula (bascula.weight_entry, bascula.weight_exit, bascula.close) |
| `exit.*` | Validación de salida (exit.approved, exit.rejected, exit.blocked) |
| `voucher.*` | Vouchers |
| `catalog.*` | Catálogos maestros |
| `counter_sales.*` | Venta mostrador |

---

## 7. Alcance funcional detallado

### 7.1 Listado de eventos
- tabla con: fecha/hora, acción, módulo/colección, ID del documento afectado, usuario que ejecutó la acción
- paginación (25/50 por página)
- ordenado por fecha desc por defecto

### 7.2 Filtros
- por acción (dropdown con acciones conocidas o texto libre)
- por colección/módulo
- por userId (usuario que ejecutó)
- por rango de fechas (desde - hasta)
- limpiar filtros con un botón

### 7.3 Detalle de evento
- slide-over o modal con todos los campos del documento `audit_logs`
- renderizado del campo `details` como JSON formateado
- datos del usuario que ejecutó la acción (nombre, email si está disponible)

### 7.4 Exportación básica
- exportar los resultados actuales como CSV (opcional, controlado por permiso `audit.export`)

---

## 8. Seguridad del módulo

| Permiso | Acción |
|---------|--------|
| `audit.view` | Ver listado y detalle de auditoría |
| `audit.export` | Exportar registros de auditoría |

Solo usuarios con label `admin` u `owner` deben poder acceder a este módulo.

---

## 9. Entidades involucradas

- `audit_logs` — fuente de datos de todo el módulo
- `users_profile` — para enriquecer el userId con nombre visible

---

## 10. Criterios de aceptación

1. existe módulo de auditoría accesible solo para admin y owner
2. listado funcional con paginación
3. filtros por acción, colección, usuario y rango de fechas funcionan correctamente
4. existe vista de detalle de cada evento con JSON renderizado
5. existe badge de color por categoría de acción
6. la exportación básica a CSV funciona si el usuario tiene permiso
7. la UI es clara, rápida y sin ambigüedades

---

## 11. Dependencias previas

- Todos los tasks del 01 al 17 (alimentan audit_logs)
- Task 04: usuarios (para enriquecer userId con nombre)

---

## 12. Dependencias posteriores

- Task 20: exportación controlada (puede extender la exportación básica de este task)

---

## 13. Entregables esperados

1. hook `useAuditoria.jsx`
2. página `Auditoria.jsx` funcional (reemplaza placeholder)
3. componente de detalle de evento
4. exportación básica a CSV
5. filtros y paginación

---

## 14. Restricciones

- no usar TypeScript
- acceso solo para admin y owner
- no implementar reportes operativos en este task (son Task 19)
- no modificar la estructura de `audit_logs`

---

## 15. Prompt sugerido para Claude Code

```text
Necesito que ejecutes exclusivamente el Task 18 de este proyecto.

CONTEXTO
Sistema operativo para mina de materiales con Appwrite 1.8.1, React + Vite + JS + TailwindCSS 4.1 + Radix UI.

Ya existen: auth, usuarios, roles/permisos, catálogos, vouchers, tickets, impresión, venta mostrador, báscula y validación de salida. Todos estos módulos ya registran eventos en audit_logs.

OBJETIVO
Construir la interfaz de consulta del módulo de auditoría: listado filtrable de eventos, detalle de cada evento con JSON renderizado, exportación básica y acceso restringido a admin/owner.

LO QUE QUIERO QUE HAGAS
1. Implementar listado paginado de audit_logs con filtros por acción, colección, usuario y rango de fechas.
2. Implementar detalle de evento con JSON formateado.
3. Implementar badges de color por categoría de acción.
4. Implementar exportación básica a CSV controlada por permiso audit.export.
5. Proteger el módulo para acceso solo de admin y owner.
6. Reemplazar el placeholder de Auditoria.jsx con la implementación completa.

REGLAS
- No TypeScript.
- No modificar estructura de audit_logs.
- No implementar reportes operativos en este task.
- Acceso solo para admin y owner.

No sigas al siguiente task. Quédate solo en Task 18.
```
